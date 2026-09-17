// The signal explorer's advanced search mixes include and exclude criteria, and the
// exclusions only exist as query parameters — there is no request body to inspect and
// no model to type-check. If the generator ever drops them, nothing fails to compile
// in the host application: the filter silently stops being sent and the operator gets
// back rows they asked to have hidden. So this check reads the wire.
import test from 'node:test';
import assert from 'node:assert/strict';

import { Configuration, SignalEventsApi } from '../../generated/index';
import type { SignalEventsApiGetSignalEventsRequest } from '../../generated/index';
import type { Expect, Has } from './_helpers';

type _hasSideIdNot = Expect<Has<SignalEventsApiGetSignalEventsRequest, 'sideIdNot'>>;
type _hasReceiverIdNot = Expect<Has<SignalEventsApiGetSignalEventsRequest, 'receiverIdNot'>>;
type _hasMcIdNot = Expect<Has<SignalEventsApiGetSignalEventsRequest, 'monitoringCenterIdNot'>>;
type _hasDealerIdNot = Expect<Has<SignalEventsApiGetSignalEventsRequest, 'dealerIdNot'>>;
type _hasCategoryIdNot = Expect<Has<SignalEventsApiGetSignalEventsRequest, 'alarmCategoryIdNot'>>;
type _hasEventCodeNot = Expect<Has<SignalEventsApiGetSignalEventsRequest, 'eventCodeNot'>>;
type _hasActionNot = Expect<Has<SignalEventsApiGetSignalEventsRequest, 'actionNot'>>;
type _hasSignalName = Expect<Has<SignalEventsApiGetSignalEventsRequest, 'signalName'>>;
type _hasSignalNameNot = Expect<Has<SignalEventsApiGetSignalEventsRequest, 'signalNameNot'>>;

/** A fetch that records the URL it was called with and answers with an empty page. */
function recordingFetch(): { calls: string[]; fetch: typeof fetch } {
  const calls: string[] = [];
  const fetchApi = (async (input: RequestInfo | URL) => {
    calls.push(typeof input === 'string' ? input : input.toString());
    return new Response(JSON.stringify({ items: [], totalCount: 0, hasMore: false }), {
      status: 200,
      headers: { 'content-type': 'application/json' },
    });
  }) as unknown as typeof fetch;
  return { calls, fetch: fetchApi };
}

test('every exclusion filter reaches the wire as its own query parameter', async () => {
  const { calls, fetch: fetchApi } = recordingFetch();
  const api = new SignalEventsApi(new Configuration({ fetchApi }));

  await api.getSignalEvents({
    alarmCategoryId: 'cat-include',
    sideIdNot: 'side-a,side-b',
    receiverIdNot: 'receiver-a',
    monitoringCenterIdNot: 'mc-a',
    dealerIdNot: 'dealer-a',
    alarmCategoryIdNot: 'cat-test',
    eventCodeNot: 'E602',
    actionNot: 'auto-closed',
    signalName: 'Hırsız Alarmı,*hirsiz*',
    signalNameNot: 'TST',
  });

  assert.equal(calls.length, 1);
  const query = new URL(calls[0]!, 'http://localhost').searchParams;

  // Include and exclude travel together: mixing them is the whole point.
  assert.equal(query.get('alarmCategoryId'), 'cat-include');
  assert.equal(query.get('alarmCategoryIdNot'), 'cat-test');
  assert.equal(query.get('sideIdNot'), 'side-a,side-b');
  assert.equal(query.get('receiverIdNot'), 'receiver-a');
  assert.equal(query.get('monitoringCenterIdNot'), 'mc-a');
  assert.equal(query.get('dealerIdNot'), 'dealer-a');
  assert.equal(query.get('eventCodeNot'), 'E602');
  assert.equal(query.get('actionNot'), 'auto-closed');

  // signalName carries a list. It goes out as one comma-separated value, the way
  // the id filters do; the non-ASCII names survive the encoding intact, and so does
  // the `*` that marks a value as a pattern rather than an exact name — percent-encoded
  // to %2A by URLSearchParams, it must still reach the server as a star.
  assert.equal(query.get('signalName'), 'Hırsız Alarmı,*hirsiz*');
  assert.equal(query.get('signalNameNot'), 'TST');
});

test('omitted exclusions are not sent as empty parameters', async () => {
  const { calls, fetch: fetchApi } = recordingFetch();
  const api = new SignalEventsApi(new Configuration({ fetchApi }));

  await api.getSignalEvents({ q: 'E130' });

  const query = new URL(calls[0]!, 'http://localhost').searchParams;
  for (const key of [
    'sideIdNot',
    'receiverIdNot',
    'monitoringCenterIdNot',
    'dealerIdNot',
    'alarmCategoryIdNot',
    'eventCodeNot',
    'actionNot',
    'signalNameNot',
  ]) {
    assert.equal(query.has(key), false, `${key} must not be sent when it is not set`);
  }
});
