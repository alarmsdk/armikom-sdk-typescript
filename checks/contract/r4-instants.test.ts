// §01 R-4 — all wire timestamps are UTC ISO-8601 and MUST parse to an absolute
// instant, never a naive local datetime (C-09). typescript-fetch's deserialiser
// is `new Date(json[...])`, which is lenient: an offset-less string is parsed in
// the *host* zone. This suite runs under TZ=Europe/Istanbul (see `make test`)
// precisely so that leniency is observable — under TZ=UTC the bug is invisible,
// which is how this class of mistake bit the API three times (G-50, G-52, G-53).
import test from 'node:test';
import assert from 'node:assert/strict';

import { LiveSignalItemFromJSON, LiveSignalItemToJSON } from '../../generated/index';

const WIRE = '2026-08-19T07:00:00Z';
const INSTANT = Date.UTC(2026, 7, 19, 7, 0, 0);

test('R-4 guard: the suite runs in a non-UTC zone', () => {
  const offset = new Date(INSTANT).getTimezoneOffset();
  assert.notEqual(
    offset,
    0,
    'TZ is UTC — this suite proves nothing. Run it via `make test` (TZ=Europe/Istanbul).',
  );
});

test('R-4: a UTC wire timestamp deserialises to the correct absolute instant', () => {
  const model = LiveSignalItemFromJSON({ signalDateTime: WIRE });
  assert.ok(model.signalDateTime instanceof Date);
  assert.equal(model.signalDateTime!.getTime(), INSTANT);
  assert.equal(model.signalDateTime!.toISOString(), '2026-08-19T07:00:00.000Z');
});

test('R-4: round-trip through ToJSON preserves the instant and re-emits UTC', () => {
  const once = LiveSignalItemFromJSON({ signalDateTime: WIRE });
  const json = LiveSignalItemToJSON(once) as unknown as { signalDateTime: string };
  assert.equal(json.signalDateTime, '2026-08-19T07:00:00.000Z');
  assert.match(json.signalDateTime, /Z$/, 'serialisation must stay UTC (TZ-1)');

  const twice = LiveSignalItemFromJSON(json);
  assert.equal(twice.signalDateTime!.getTime(), INSTANT, 'round-trip shifted the instant');
});

test('R-4: an explicit +03:00 offset is the same instant, not a different one', () => {
  const model = LiveSignalItemFromJSON({ signalDateTime: '2026-08-19T10:00:00+03:00' });
  assert.equal(model.signalDateTime!.getTime(), INSTANT);
});

// KNOWN DEFECT of the generated layer, pinned here so W-11 cannot forget it.
// `new Date('2026-08-19T07:00:00')` (no offset) is parsed in the host zone by
// ECMA-262. The frozen contract never emits offset-less timestamps, so this is
// not a live bug today — but the generated deserialiser gives no protection if
// one ever appears, and the hand-written transport layer (W-11) must reject or
// normalise offset-less values rather than trusting `new Date`.
test('R-4 hazard: offset-less strings ARE silently read as local time (generated layer)', () => {
  const naive = LiveSignalItemFromJSON({ signalDateTime: '2026-08-19T07:00:00' });
  assert.notEqual(
    naive.signalDateTime!.getTime(),
    INSTANT,
    'host zone is UTC or the generator changed — re-derive this hazard before deleting the test',
  );
  // Europe/Istanbul is permanent UTC+3 (TZ-4): 07:00 local == 04:00Z.
  assert.equal(naive.signalDateTime!.toISOString(), '2026-08-19T04:00:00.000Z');
  assert.equal(
    (INSTANT - naive.signalDateTime!.getTime()) / 3_600_000,
    3,
    'the silent shift is exactly the host UTC offset — this is what W-11 must guard',
  );
});
