/**
 * §01 §6 — retry conformance: C-11, C-12, C-23.
 *
 * C-11 is the one with teeth. The API has no `Idempotency-Key` support
 * (14-api-gaps G-09), so "do not retry a POST" is the only thing standing
 * between a 503 and a second batch of completed alarms.
 */
import assert from 'node:assert/strict';
import test from 'node:test';

import { ManualClock, systemClock } from '../../src/core/clock.js';
import { DeadlineExceededError, OfflineError, RequestAbortedError } from '../../src/core/errors.js';
import { HttpClient } from '../../src/core/http-client.js';
import { Connectivity } from '../../src/core/connectivity.js';
import { backoffDelay, defaultRetryPolicy, isIdempotent } from '../../src/core/retry.js';
import { MockTransport } from './_harness.js';

const noJitter = { ...defaultRetryPolicy, jitter: 'none' as const, baseDelayMs: 1, maxDelayMs: 4 };

test('C-11 a POST returning 503 is not retried, ever', async () => {
  const transport = new MockTransport().always({ status: 503, body: { code: 'SERVER.ERROR' } });
  const http = new HttpClient({
    baseUrl: 'https://api.test',
    transport: transport.transport,
    retryPolicy: noJitter,
  });

  await assert.rejects(() => http.json({ method: 'POST', path: '/v1/alarm-events/batch-complete' }));
  assert.equal(transport.countFor('batch-complete'), 1, 'a second attempt completes a second batch of alarms');
});

test('RT-2 GET, PUT and DELETE are retried; POST and PATCH are not', async () => {
  assert.deepEqual(
    (['GET', 'HEAD', 'OPTIONS', 'PUT', 'DELETE', 'POST', 'PATCH'] as const).map(isIdempotent),
    [true, true, true, true, true, false, false],
  );

  const transport = new MockTransport().always({ status: 503, body: {} });
  const http = new HttpClient({ baseUrl: 'https://api.test', transport: transport.transport, retryPolicy: noJitter });
  await assert.rejects(() => http.json({ method: 'GET', path: '/v1/sides' }));
  assert.equal(transport.countFor('/v1/sides'), 3, 'maxAttempts is 3 in total, not 3 retries');
});

test('C-12 the deadline bounds all attempts together, not each one', async () => {
  const transport = new MockTransport().always({ status: 503, body: {} });
  const http = new HttpClient({
    baseUrl: 'https://api.test',
    transport: transport.transport,
    clock: systemClock,
    retryPolicy: { maxAttempts: 5, baseDelayMs: 40, factor: 2, maxDelayMs: 200, jitter: 'none' },
  });

  const startedAt = Date.now();
  await assert.rejects(
    () => http.json({ method: 'GET', path: '/v1/sides', deadlineMs: 120 }),
    (error: Error) => error instanceof DeadlineExceededError || /503|Server error/.test(error.message),
  );
  const elapsed = Date.now() - startedAt;
  assert.ok(elapsed < 400, `expected the call to give up near its 120 ms deadline, took ${elapsed} ms`);
});

test('C-23 Retry-After overrides the computed backoff', async () => {
  const clock = new ManualClock(0);
  const slept: number[] = [];
  const instrumented = {
    now: () => clock.now(),
    sleep: async (ms: number) => {
      slept.push(ms);
      await clock.advance(ms);
    },
  };
  const transport = new MockTransport().push(
    { status: 429, body: { code: 'RATE.LIMITED' }, headers: { 'retry-after': '5' } },
    { status: 200, body: { ok: true } },
  );
  const http = new HttpClient({
    baseUrl: 'https://api.test',
    transport: transport.transport,
    clock: instrumented,
    retryPolicy: { ...noJitter, maxAttempts: 3 },
  });

  await http.json({ method: 'GET', path: '/v1/sides' });
  assert.deepEqual(slept, [5_000], 'the server said five seconds; the curve does not get a vote');
});

test('RT-3 backoff is exponential, capped, and jittered', () => {
  const policy = { ...defaultRetryPolicy, jitter: 'none' as const };
  assert.equal(backoffDelay({ attempt: 1, policy }), 250);
  assert.equal(backoffDelay({ attempt: 2, policy }), 500);
  assert.equal(backoffDelay({ attempt: 9, policy }), 8_000, 'capped at 8 s');

  // Full jitter: the delay is uniform over [0, exponential).
  const jittered = backoffDelay({ attempt: 3, policy: defaultRetryPolicy, random: () => 0.5 });
  assert.equal(jittered, 500);
});

test('RT-1 a transport failure is retried; a 404 is not', async () => {
  const transportFailure = new MockTransport()
    .push({ throws: new TypeError('Network request failed') })
    .push({ status: 200, body: { ok: true } });
  const http = new HttpClient({
    baseUrl: 'https://api.test',
    transport: transportFailure.transport,
    retryPolicy: noJitter,
  });
  assert.deepEqual(await http.json({ method: 'GET', path: '/v1/sides' }), { ok: true });

  const notFound = new MockTransport().always({ status: 404, body: { code: 'SIDE.NOT_FOUND' } });
  const http2 = new HttpClient({ baseUrl: 'https://api.test', transport: notFound.transport, retryPolicy: noJitter });
  await assert.rejects(() => http2.json({ method: 'GET', path: '/v1/sides/1' }));
  assert.equal(notFound.countFor('/v1/sides/1'), 1);
});

test('RT-6 an aborted signal cancels the call and does not report a failure', async () => {
  const controller = new AbortController();
  const transport = new MockTransport().always({ status: 200, body: {} });
  const http = new HttpClient({ baseUrl: 'https://api.test', transport: transport.transport });
  controller.abort();

  await assert.rejects(
    () => http.json({ method: 'GET', path: '/v1/sides', signal: controller.signal }),
    (error: Error) => error instanceof RequestAbortedError,
  );
});

test('OF-2 a write is refused while offline rather than queued', async () => {
  const connectivity = new Connectivity({ failuresToOffline: 1 });
  connectivity.reportTransportFailure();
  assert.equal(connectivity.isOffline, true);

  const transport = new MockTransport().always({ status: 200, body: {} });
  const http = new HttpClient({ baseUrl: 'https://api.test', transport: transport.transport, connectivity });

  await assert.rejects(
    () => http.json({ method: 'POST', path: '/v1/alarm-events/1/complete', requiresOnline: true }),
    (error: Error) => error instanceof OfflineError,
  );
  assert.equal(transport.requests.length, 0, 'nothing left the browser');
});

test('OF-3 connectivity is derived from request outcomes, not navigator.onLine', () => {
  const connectivity = new Connectivity({ failuresToDegraded: 1, failuresToOffline: 3 });
  assert.equal(connectivity.status.get(), 'online');
  connectivity.reportTransportFailure();
  assert.equal(connectivity.status.get(), 'degraded');
  connectivity.reportTransportFailure();
  connectivity.reportTransportFailure();
  assert.equal(connectivity.status.get(), 'offline');
  connectivity.reportSuccess();
  assert.equal(connectivity.status.get(), 'online');

  // A dead stream while requests succeed is degraded, not offline.
  connectivity.reportStream(false);
  assert.equal(connectivity.status.get(), 'degraded');
});

test('an idempotency key is sent when supplied, and only then', async () => {
  const transport = new MockTransport().always({ status: 200, body: {} });
  const http = new HttpClient({ baseUrl: 'https://api.test', transport: transport.transport });

  await http.json({ method: 'POST', path: '/v1/wallet/topups', body: {}, idempotencyKey: 'purchase-1' });
  assert.equal(transport.lastRequest()?.headers['Idempotency-Key'], 'purchase-1');

  await http.json({ method: 'POST', path: '/v1/wallet/topups', body: {} });
  assert.equal(transport.lastRequest()?.headers['Idempotency-Key'], undefined);
});

test('A-8 the body is encoded once, so a replay re-sends bytes', async () => {
  const transport = new MockTransport().push(
    { status: 503, body: {} },
    { status: 200, body: { ok: true } },
  );
  const http = new HttpClient({ baseUrl: 'https://api.test', transport: transport.transport, retryPolicy: noJitter });

  await http.json({ method: 'PUT', path: '/v1/sides/1', body: { name: 'Depo' } });
  assert.equal(transport.requests.length, 2);
  assert.equal(transport.requests[0]?.body, transport.requests[1]?.body);
  assert.equal(transport.requests[0]?.headers['Content-Type'], 'application/json');
});
