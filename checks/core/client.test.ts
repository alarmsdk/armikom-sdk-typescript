/**
 * Layer 3 — `ArmikomClient` as the composition root.
 *
 * §01 L-3 is what these assert: a caller talks to layer 2's model and never
 * sees layer 1. The generated transport's own error types (`ResponseError`,
 * `FetchError`) must not reach a call site, and the generated operations must
 * pick up auth, retry and deadlines without a line of generated code knowing.
 */
import assert from 'node:assert/strict';
import test from 'node:test';

import { ArmikomClient, CONTRACT_VERSION } from '../../src/armikom/client.js';
import { toApiError } from '../../src/armikom/errors.js';
import { ArmikomEvents } from '../../src/armikom/stream.js';
import { ConflictError, NotFoundError, isApiError } from '../../src/core/errors.js';
import { MemoryTokenStore } from '../../src/core/tokens.js';
import { AlarmEventsApi } from '../../generated/apis/AlarmEventsApi.js';
import { ReferenceDataApi } from '../../generated/apis/ReferenceDataApi.js';
import { FetchError, ResponseError } from '../../generated/runtime.js';
import { MockTransport } from './_harness.js';

function makeClient(transport: MockTransport, accessToken = 'live-token') {
  return new ArmikomClient({
    baseUrl: 'https://api.test',
    transport: transport.transport,
    tokenStore: new MemoryTokenStore({ accessToken, refreshToken: 'r', expiresAt: 9e15 }),
    userAgent: 'armikom-sdk-ts/test (checks/1.0.0)',
  });
}

test('a generated operation goes through the core pipeline', async () => {
  const transport = new MockTransport().always({ status: 200, body: [] });
  const client = makeClient(transport);

  await client.api(AlarmEventsApi).getAlarmEvents({});

  const request = transport.lastRequest();
  assert.ok(request?.url.startsWith('https://api.test/v1/alarm-events'));
  assert.equal(request?.headers['Authorization'], 'Bearer live-token');
  // Browsers forbid setting `User-Agent`, so §01 R-3 also rides on a header
  // they allow. Under Node both are set.
  assert.equal(request?.headers['X-Armikom-Client'], 'armikom-sdk-ts/test (checks/1.0.0)');
  assert.equal(request?.headers['X-Armikom-Contract'], CONTRACT_VERSION);
});

test('L-3 a generated failure surfaces as a layer 2 error, not FetchError', async () => {
  const transport = new MockTransport().always({
    status: 409,
    body: { code: 'ALARM.LOCKED_BY_OTHER_USER', title: 'Locked', params: { lockedByUserName: 'Ayşe' } },
  });
  const client = makeClient(transport);

  await assert.rejects(
    () => client.api(AlarmEventsApi).getAlarmEvents({}),
    (error: unknown) => {
      assert.ok(!(error instanceof FetchError), 'the generator error types must not escape');
      assert.ok(!(error instanceof ResponseError));
      assert.ok(error instanceof ConflictError);
      assert.equal((error as ConflictError).params?.['lockedByUserName'], 'Ayşe');
      return true;
    },
  );
});

test('toApiError unwraps a bare ResponseError too', async () => {
  const response = new Response(JSON.stringify({ code: 'SIDE.NOT_FOUND', title: 'Gone' }), {
    status: 404,
    headers: { 'content-type': 'application/json' },
  });
  const mapped = await toApiError(new ResponseError(response, 'boom'));
  assert.ok(mapped instanceof NotFoundError);
  assert.equal(mapped.code, 'SIDE.NOT_FOUND');
});

test('api() memoises, so a screen does not build a client per render', () => {
  const client = makeClient(new MockTransport());
  assert.equal(client.api(AlarmEventsApi), client.api(AlarmEventsApi));
  assert.notEqual(client.api(AlarmEventsApi) as unknown, client.api(ReferenceDataApi) as unknown);
});

test('the reference bundle is cached, revalidated and indexed', async () => {
  const transport = new MockTransport().push(
    {
      status: 200,
      headers: { etag: 'W/"ref-1"' },
      body: {
        signalTypes: [{ id: 's1', name: 'Burglary' }],
        brands: [{ id: 'b1', name: 'Paradox' }],
      },
    },
    { status: 304, headers: { etag: 'W/"ref-1"' } },
  );
  const client = makeClient(transport);

  const first = await client.reference.indexed();
  assert.equal(first.signalType('s1')?.name, 'Burglary');
  assert.equal(first.brandsById.get('b1')?.name, 'Paradox');

  const second = await client.reference.indexed();
  assert.equal(second, first, 'the index is not rebuilt when the bundle has not changed');
  assert.equal(transport.requests[1]?.headers['If-None-Match'], 'W/"ref-1"');
});

test('the localisation bundle feeds the i18n catalogue', async () => {
  const transport = new MockTransport().always({
    status: 200,
    headers: { etag: 'W/"i18n-tr"' },
    body: { culture: 'tr', keys: { 'UI.Save': 'Kaydet' } },
  });
  const client = makeClient(transport);

  await client.useCulture('tr');
  assert.equal(client.i18n.t('UI.Save'), 'Kaydet');
  // §01 A-1 — the bundle is one of the four anonymous operations.
  assert.equal(transport.lastRequest()?.headers['Authorization'], undefined);
  assert.equal(client.http.getCulture(), 'tr');
});

test('V-4 the contract version is reported at runtime', () => {
  assert.equal(makeClient(new MockTransport()).contractVersion, CONTRACT_VERSION);
  assert.match(CONTRACT_VERSION, /^api-v\d+\.\d+$/);
});

test('S-6 the end of a session stops the stream', async () => {
  const client = makeClient(new MockTransport());
  client.stream.start();
  await client.session.logout();
  assert.equal(client.stream.status.get(), 'closed');
  await client.dispose();
});

test('the eight stream event names are the ones the API publishes', () => {
  assert.deepEqual(Object.values(ArmikomEvents), [
    'alarm-list-updated',
    'signal-events',
    'pbx-ringing',
    'side-lock-changed',
    'side-status-changed',
    'side-approval-changed',
    'reference-bundle-changed',
    'localization-bundle-changed',
  ]);
});

test('an aborted generated call rejects with the typed cancellation', async () => {
  const controller = new AbortController();
  controller.abort();
  const client = makeClient(new MockTransport());

  await assert.rejects(
    () => client.api(AlarmEventsApi).getAlarmEvents({}, { signal: controller.signal }),
    (error: unknown) => isApiError(error) && error.code === 'CLIENT.ABORTED',
  );
});
