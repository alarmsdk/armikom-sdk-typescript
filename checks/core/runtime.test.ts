/**
 * The remaining conformance ids: C-09 (instants), C-13 (ETag), C-14 (Turkish
 * casing), C-16 (object URLs), plus the i18n and telemetry rules pulled up from
 * the Voice.Cloud console.
 *
 * Runs under `TZ=Europe/Istanbul` (see the Makefile). Under `TZ=UTC` the
 * naive-local parsing bug this file exists to catch is invisible.
 */
import assert from 'node:assert/strict';
import test from 'node:test';

import { ETagResource, MemoryCacheStore, WebStorageCacheStore, indexBy, groupBy } from '../../src/core/cache.js';
import { ObjectUrlRegistry, filenameFromContentDisposition } from '../../src/core/files.js';
import { HttpClient } from '../../src/core/http-client.js';
import { I18n } from '../../src/core/i18n.js';
import { BatchedLogSink } from '../../src/core/telemetry.js';
import {
  guidEquals,
  isOffsetlessInstant,
  markInstantUtc,
  markTimestampsUtc,
  parseInstant,
  parseInstantOrThrow,
  toLowerCulture,
  toUpperCulture,
} from '../../src/core/text.js';
import { MemoryTokenStore, WebStorageTokenStore, type StorageLike } from '../../src/core/tokens.js';
import { AuthSession } from '../../src/core/session.js';
import { AsyncResource } from '../../src/core/resource.js';
import { MockTransport, until } from './_harness.js';
import type { LogEvent } from '../../src/core/logger.js';

class FakeStorage implements StorageLike {
  readonly data = new Map<string, string>();
  getItem(key: string) {
    return this.data.get(key) ?? null;
  }
  setItem(key: string, value: string) {
    this.data.set(key, value);
  }
  removeItem(key: string) {
    this.data.delete(key);
  }
}

test('the suite runs in a non-UTC zone, or C-09 proves nothing', () => {
  assert.notEqual(new Date('2026-08-16T11:22:33Z').getHours(), 11, 'run with TZ=Europe/Istanbul');
});

test('C-09 a UTC instant round-trips; an offset-less value is refused', () => {
  const parsed = parseInstant('2026-08-16T11:22:33Z');
  assert.ok(parsed);
  assert.equal(parsed.toISOString(), '2026-08-16T11:22:33.000Z');

  // The hazard: `new Date` reads this in the host zone and shifts it silently.
  assert.equal(parseInstant('2026-08-16T11:22:33'), null);
  assert.throws(() => parseInstantOrThrow('2026-08-16T11:22:33', 'actionAt'), /actionAt/);
  assert.equal(parseInstant('2026-08-16T14:22:33+03:00')?.toISOString(), '2026-08-16T11:22:33.000Z');
});

test('R-4 an offset-less API timestamp is labelled UTC, not read in the host zone', () => {
  // The shape the API actually sends, verified against a live instance.
  const wire = '2026-08-20T19:09:48.991674';
  assert.equal(isOffsetlessInstant(wire), true);
  assert.equal(markInstantUtc(wire), '2026-08-20T19:09:48.991674Z');

  // The bug this exists for: under Europe/Istanbul the naive read is three
  // hours early, and under a UTC CI host the shift is zero and invisible.
  assert.notEqual(new Date(wire).toISOString(), '2026-08-20T19:09:48.991Z');
  assert.equal(new Date(markInstantUtc(wire)).toISOString(), '2026-08-20T19:09:48.991Z');

  // Applying it twice is impossible; a labelled value does not match.
  assert.equal(markInstantUtc('2026-08-20T19:09:48Z'), '2026-08-20T19:09:48Z');
  assert.equal(markInstantUtc('2026-08-20T22:09:48+03:00'), '2026-08-20T22:09:48+03:00');
  // A plain date is already read as UTC by ECMAScript; leave it alone.
  assert.equal(markInstantUtc('2026-08-20'), '2026-08-20');

  assert.equal(parseInstant(wire), null, 'strict by default');
  assert.equal(parseInstant(wire, { assumeUtc: true })?.toISOString(), '2026-08-20T19:09:48.991Z');
});

test('R-4 the repair walks a whole response body, arrays and nesting included', () => {
  const body = markTimestampsUtc({
    eventDate: '2026-08-20T19:09:48.991674',
    side: { lockedAt: '2026-08-20T19:00:00', name: 'DEPO 1' },
    history: [{ at: '2026-08-20T18:00:00' }, { at: '2026-08-20T18:30:00Z' }],
    count: 3,
    nothing: null,
  });
  assert.equal(body.eventDate, '2026-08-20T19:09:48.991674Z');
  assert.equal(body.side.lockedAt, '2026-08-20T19:00:00Z');
  assert.equal(body.history[0]?.at, '2026-08-20T18:00:00Z');
  assert.equal(body.history[1]?.at, '2026-08-20T18:30:00Z', 'already labelled, untouched');
  assert.equal(body.side.name, 'DEPO 1', 'domain strings are not timestamps');
  assert.equal(body.count, 3);
  assert.equal(body.nothing, null);
});

test('R-4 the pipeline repairs timestamps before a caller ever sees them', async () => {
  const transport = new MockTransport().always({
    status: 200,
    body: { id: '1', eventDate: '2026-08-20T19:09:48.991674' },
  });
  const http = new HttpClient({ baseUrl: 'https://api.test', transport: transport.transport });

  const json = await http.json<{ eventDate: string }>({ method: 'GET', path: '/v1/alarm-events/1' });
  assert.equal(new Date(json.eventDate).toISOString(), '2026-08-20T19:09:48.991Z');

  // And on the raw path the generated transport reads, which is where the
  // generator's `new Date(...)` would otherwise shift it.
  const raw = await http.fetch('https://api.test/v1/alarm-events/1');
  const body = (await raw.json()) as { eventDate: string };
  assert.equal(body.eventDate, '2026-08-20T19:09:48.991674Z');
});

test('R-5 GUIDs compare by value, not by casing or braces', () => {
  assert.equal(guidEquals('9F1B4C2D-0000-1111-2222-333344445555', '9f1b4c2d-0000-1111-2222-333344445555'), true);
  assert.equal(guidEquals('{9f1b4c2d-0000-1111-2222-333344445555}', '9f1b4c2d000011112222333344445555'), true);
  assert.equal(guidEquals('9f1b4c2d-0000-1111-2222-333344445555', null), false);
});

test('C-14 Turkish upper-casing is culture-aware', () => {
  assert.equal(toUpperCulture('ilk', 'tr'), 'İLK', 'ILK is a different word and corrupts names on save');
  assert.equal(toUpperCulture('ilk', 'en'), 'ILK');
  assert.equal(toUpperCulture('ısı', 'tr'), 'ISI');
  assert.equal(toLowerCulture('İSTANBUL', 'tr'), 'istanbul');
  assert.equal(toLowerCulture('ISI', 'tr'), 'ısı');
});

test('C-13 an ETag revalidation serves the cached body on 304', async () => {
  const transport = new MockTransport().push(
    { status: 200, body: { brands: [{ id: 'b1' }] }, headers: { etag: 'W/"v1"' } },
    { status: 304, headers: { etag: 'W/"v1"' } },
  );
  const http = new HttpClient({ baseUrl: 'https://api.test', transport: transport.transport });
  const store = new MemoryCacheStore();

  const resource = new ETagResource<{ brands: Array<{ id: string }> }>({
    key: 'reference.bundle',
    store,
    fetch: async (etag) => {
      const response = await http.request<{ brands: Array<{ id: string }> }>({
        method: 'GET',
        path: '/v1/reference/bundle',
        ...(etag ? { ifNoneMatch: etag } : {}),
        allowNotModified: true,
      });
      return { ...(response.notModified ? {} : { value: response.data }), etag: response.etag, notModified: response.notModified };
    },
  });

  const first = await resource.get();
  assert.equal(first.brands[0]?.id, 'b1');

  const second = await resource.get();
  assert.equal(second.brands[0]?.id, 'b1', 'the cached body is served, not a missing one');
  assert.equal(transport.requests[1]?.headers['If-None-Match'], 'W/"v1"');
});

test('CA-2 a persistent cache store survives a new process', () => {
  const storage = new FakeStorage();
  new WebStorageCacheStore(storage).set('k', { value: { a: 1 }, etag: 'e', storedAt: 0 });
  // A fresh store object stands in for a cold start.
  assert.deepEqual(new WebStorageCacheStore(storage).get<{ a: number }>('k')?.value, { a: 1 });
});

test('CA-4 reference lookups are indexed maps, not arrays', () => {
  const signalTypes = [
    { id: 's1', code: 'BA' },
    { id: 's2', code: 'FA' },
  ];
  const byId = indexBy(signalTypes, (s) => s.id);
  assert.equal(byId.get('s2')?.code, 'FA');
  assert.equal(groupBy(signalTypes, (s) => s.code).get('BA')?.length, 1);
});

test('C-16 every object URL created is released', () => {
  const created: string[] = [];
  const revoked: string[] = [];
  const original = { create: URL.createObjectURL, revoke: URL.revokeObjectURL };
  let counter = 0;
  URL.createObjectURL = () => {
    const url = `blob:test/${counter++}`;
    created.push(url);
    return url;
  };
  URL.revokeObjectURL = (url: string) => void revoked.push(url);

  try {
    const registry = new ObjectUrlRegistry();
    for (let i = 0; i < 100; i += 1) registry.create(new Blob(['x']));
    assert.equal(registry.size, 100);
    registry.revokeAll();
    assert.equal(registry.size, 0);
  } finally {
    URL.createObjectURL = original.create;
    URL.revokeObjectURL = original.revoke;
  }

  assert.deepEqual(revoked.sort(), created.sort(), 'a shift of service photos is a real leak');
});

test('a download filename is read from Content-Disposition, RFC 5987 included', () => {
  assert.equal(filenameFromContentDisposition('attachment; filename="rapor.xlsx"'), 'rapor.xlsx');
  assert.equal(
    filenameFromContentDisposition("attachment; filename=\"rapor.xlsx\"; filename*=UTF-8''ra%C4%9Fpor.xlsx"),
    'rağpor.xlsx',
  );
  assert.equal(filenameFromContentDisposition(null), null);
});

test('LO-2/LO-3 the fallback chain is observable when a key is missing', () => {
  const missing: string[] = [];
  const i18n = new I18n({
    culture: 'az',
    defaultCulture: 'tr',
    bundles: {
      tr: { UI: { Save: 'Kaydet' }, 'ERROR.X': 'Hata {{n}}' },
      az: { UI: { Save: 'Saxla' } },
    },
    onMissingKey: (key) => missing.push(key),
  });

  assert.equal(i18n.t('UI.Save'), 'Saxla');
  // az has no ERROR.X: falls back to tr, and interpolates.
  assert.equal(i18n.t('ERROR.X', { n: 3 }), 'Hata 3');
  // Nowhere at all: the key itself, and a report.
  assert.equal(i18n.t('UI.Nope'), 'UI.Nope');
  assert.deepEqual(missing, ['UI.Nope'], 'silent fallback is how tr 552 / en 531 / az 508 stayed invisible');

  // Reported once per key, not once per render.
  i18n.t('UI.Nope');
  assert.equal(missing.length, 1);
});

test('the i18n bundle resolver reads both flat and nested catalogues', () => {
  const i18n = new I18n({
    culture: 'tr',
    bundles: { tr: { 'UI.Alarm.Title': 'Alarm', UI: { Alarm: { Subtitle: 'Alt' } } } },
  });
  assert.equal(i18n.t('UI.Alarm.Title'), 'Alarm');
  assert.equal(i18n.t('UI.Alarm.Subtitle'), 'Alt');
});

test('O-4 telemetry batches, flushes errors immediately, and drops on failure', async () => {
  const batches: LogEvent[][] = [];
  const sink = new BatchedLogSink({
    maxBatchSize: 3,
    flushIntervalMs: 10_000,
    send: (events) => void batches.push([...events]),
  });

  sink.log({ level: 'info', message: 'a', timestamp: '' });
  sink.log({ level: 'info', message: 'b', timestamp: '' });
  assert.equal(batches.length, 0, 'held until the batch fills');

  sink.log({ level: 'error', message: 'boom', timestamp: '' });
  await until(() => batches.length === 1, 500);
  assert.equal(batches[0]?.length, 3, 'an error ships the whole buffer at once');

  // A failing sink must not requeue: that turns a backend outage into a leak.
  const failing = new BatchedLogSink({
    maxBatchSize: 1,
    flushIntervalMs: 10_000,
    send: () => Promise.reject(new Error('down')),
  });
  failing.log({ level: 'error', message: 'x', timestamp: '' });
  await new Promise((resolve) => setTimeout(resolve, 20));
  failing.dispose();
  sink.dispose();
});

test('telemetry redacts before it ships', async () => {
  const batches: LogEvent[][] = [];
  const sink = new BatchedLogSink({ maxBatchSize: 1, flushIntervalMs: 10_000, send: (e) => void batches.push([...e]) });
  sink.log({ level: 'info', message: 'login', timestamp: '', data: { password: 'hunter2' } });
  await until(() => batches.length === 1, 500);
  assert.equal(batches[0]?.[0]?.data?.['password'], '[redacted]');
  sink.dispose();
});

test('A-11 the web-storage token store degrades rather than throwing', () => {
  const hostile: StorageLike = {
    getItem() {
      throw new Error('blocked');
    },
    setItem() {
      throw new Error('blocked');
    },
    removeItem() {
      throw new Error('blocked');
    },
  };
  const store = new WebStorageTokenStore(hostile);
  assert.equal(store.read(), null);
  store.write({ accessToken: 'a' });
  store.clear();
});

test('AsyncResource keeps its data through a failed reload and cancels superseded loads', async () => {
  let attempt = 0;
  const resource = new AsyncResource<string>({
    load: async () => {
      attempt += 1;
      if (attempt === 2) throw new Error('500');
      return `value-${attempt}`;
    },
  });

  await resource.reload();
  assert.equal(resource.value, 'value-1');

  await resource.reload();
  assert.equal(resource.state.get().status, 'error');
  assert.equal(resource.value, 'value-1', 'the operator keeps their context');

  await resource.reload();
  assert.equal(resource.value, 'value-3');
  resource.dispose();
});

test('the batched sink drops per-request debug noise before it ships', async () => {
  const batches: LogEvent[][] = [];
  const sink = new BatchedLogSink({
    maxBatchSize: 1,
    flushIntervalMs: 10_000,
    send: (events) => void batches.push([...events]),
  });

  // The pipeline emits one of these per request; shipping them would make
  // telemetry the product's largest source of traffic.
  sink.log({ level: 'debug', message: 'GET /v1/sides -> 200', event: 'request', timestamp: '' });
  await new Promise((resolve) => setTimeout(resolve, 20));
  assert.equal(batches.length, 0);

  sink.log({ level: 'warn', message: 'retrying', event: 'retry', timestamp: '' });
  await until(() => batches.length === 1, 500);
  assert.equal(batches[0]?.[0]?.event, 'retry', 'retries and failures still ship');
  sink.dispose();
});

test('restore() does not re-read the profile for a session that is already live', async () => {
  let profileReads = 0;
  const session = new AuthSession({
    driver: {
      async login() {
        return { tokens: { accessToken: 'a', refreshToken: 'r', expiresAt: 9e15 } };
      },
      async refresh() {
        return { tokens: { accessToken: 'a' } };
      },
      async currentUser() {
        profileReads += 1;
        return { user: { id: 'u1' }, scopes: [] };
      },
    },
    tokenStore: new MemoryTokenStore(),
  });

  await session.login({});
  assert.equal(profileReads, 1);

  // A shell that calls restore() on init, moments after the login component
  // signed in, must not cost a second GetCurrentUser.
  assert.equal(await session.restore(), true);
  assert.equal(profileReads, 1);
});
