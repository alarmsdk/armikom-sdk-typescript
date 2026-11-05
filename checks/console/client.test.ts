/**
 * The console facade on `ArmikomClient`: what the Vue console's own middleware and session
 * store used to do, now asserted against the SDK pipeline through a scripted transport.
 */
import assert from 'node:assert/strict';
import test from 'node:test';

import { ManualClock } from '../../src/core/clock.js';
import { MemoryTokenStore } from '../../src/core/tokens.js';
import { createConsoleClient, type ExplanationCache } from '../../src/console/client.js';
import { MockTransport } from '../core/_harness.js';

/** Far enough out that no fixture triggers a proactive refresh, and still a valid `Date`. */
const FAR_FUTURE = 4e15;
const ME = { id: 'u1', name: 'op', type: 'operator', scopes: ['alarms:read'], hiddenFields: ['side.address'] };

function make(options: Partial<Parameters<typeof createConsoleClient>[0]> = {}) {
  const transport = new MockTransport();
  const clock = new ManualClock(1_000);
  const facade = createConsoleClient({
    baseUrl: 'http://api.test/',
    transport: transport.transport,
    clock,
    random: () => 0,
    retryPolicy: { maxAttempts: 1, baseDelayMs: 0, factor: 1, maxDelayMs: 0, jitter: 'none' },
    ...options,
  });
  return { facade, transport, clock };
}

test('login adopts the tokens, reports shiftRestricted, and the next request carries the bearer', async () => {
  const { facade, transport } = make();
  transport.push(
    { body: { accessToken: 'acc', refreshToken: 'ref', expiresAt: new Date(FAR_FUTURE).toISOString(), shiftRestricted: true, user: { id: 'u1', name: 'op', type: 'operator', scopes: ['alarms:read'] } } },
    { body: ME },
  );

  const result = await facade.session.login!('op', 'pw', 'operator');
  assert.equal(result.shiftRestricted, true);
  assert.equal(result.user?.userName, 'op');
  assert.equal(result.accessToken, 'acc');
  assert.equal(facade.session.can('alarms:read'), true);
  assert.deepEqual(await facade.session.getTokens!(), { accessToken: 'acc', refreshToken: 'ref', expiresAt: FAR_FUTURE });

  const me = await facade.session.getCurrentUser();
  assert.equal(me.userName, 'op');
  assert.deepEqual(me.hiddenFields, ['side.address']);
  assert.equal(transport.lastRequest()?.headers['Authorization'], 'Bearer acc');
});

test('a refresh re-reads the user (A-10) and tells the host about shiftRestricted (D42)', async () => {
  const store = new MemoryTokenStore({ accessToken: 'old', refreshToken: 'r1', expiresAt: 1_000 + 10_000 });
  const { facade, transport } = make({ tokenStore: store });
  const snapshots: string[] = [];
  const refreshes: boolean[] = [];
  facade.session.onChanged!((s) => snapshots.push(`${s.status}:${s.user?.userName ?? '-'}:${s.scopes.join(',')}`));
  facade.session.onRefreshed!((r) => refreshes.push(r.shiftRestricted));
  transport.push(
    { body: { accessToken: 'new', refreshToken: 'r2', expiresAt: new Date(FAR_FUTURE).toISOString(), shiftRestricted: true } },
    { body: { ...ME, scopes: ['alarms:read', 'sides:write'] } },
    { body: { forceUppercase: true, defaultLanguage: 'tr' } },
  );

  // The access token is inside the skew window, so the first request refreshes first.
  await facade.config.get();

  assert.equal(transport.requests[0]?.url, 'http://api.test/v1/auth/refresh');
  assert.equal(transport.requests[1]?.url, 'http://api.test/v1/auth/me');
  assert.equal(transport.requests[2]?.headers['Authorization'], 'Bearer new');
  assert.deepEqual(refreshes, [true]);
  assert.ok(snapshots.includes('authenticated:op:alarms:read,sides:write'));
  assert.equal(facade.session.can('sides:write'), true);
});

test('logout revokes the stored refresh token server-side and clears the store even when the server fails (A-7)', async () => {
  const store = new MemoryTokenStore({ accessToken: 'acc', refreshToken: 'refresh-123', expiresAt: FAR_FUTURE });
  const { facade, transport } = make({ tokenStore: store });
  const ended: string[] = [];
  facade.session.onEnded!((reason) => ended.push(reason));
  transport.push({ status: 500, body: { code: 'SERVER.DOWN' } });

  await facade.session.logout();

  assert.equal(transport.requests[0]?.url, 'http://api.test/v1/auth/logout');
  assert.deepEqual(JSON.parse(String(transport.requests[0]?.body)), { refreshToken: 'refresh-123' });
  assert.equal(store.read(), null);
  assert.deepEqual(ended, ['logout']);
});

test('logout revokes an explicitly given refresh token', async () => {
  const { facade, transport } = make({ tokenStore: new MemoryTokenStore({ accessToken: 'acc' }) });
  transport.push({ status: 204 });
  await facade.session.logout('given');
  assert.deepEqual(JSON.parse(String(transport.requests[0]?.body)), { refreshToken: 'given' });
});

test('restore refreshes an expiring token and resolves to the user; no tokens resolves to null', async () => {
  const empty = make();
  assert.equal(await empty.facade.session.restore!(), null);

  const store = new MemoryTokenStore({ accessToken: 'acc', refreshToken: 'r', expiresAt: FAR_FUTURE });
  const { facade, transport } = make({ tokenStore: store });
  transport.push({ body: ME });
  const user = await facade.session.restore!();
  assert.equal(user?.userName, 'op');
  assert.equal(transport.requests.length, 1);
});

test('a terminal auth code ends the session with its reason (A-5); the host is told once', async () => {
  const store = new MemoryTokenStore({ accessToken: 'acc', refreshToken: 'r', expiresAt: FAR_FUTURE });
  const { facade, transport } = make({ tokenStore: store });
  const ended: string[] = [];
  facade.session.onEnded!((reason) => ended.push(reason));
  transport.push({ status: 401, body: { code: 'AUTH.TOKEN_INVALID' } });

  await assert.rejects(facade.config.get());
  assert.deepEqual(ended, ['token-invalid']);
  assert.equal(store.read(), null);
});

test('API D83: the network zone is reported, and AUTH.REMOTE_ACCESS_DENIED ends the session while any other 403 does not (A-6)', async () => {
  const zones: string[] = [];
  const store = new MemoryTokenStore({ accessToken: 'acc', refreshToken: 'r', expiresAt: FAR_FUTURE });
  const { facade, transport } = make({ tokenStore: store, onNetworkZone: (z) => zones.push(z) });
  const ended: string[] = [];
  facade.session.onEnded!((reason) => ended.push(reason));

  transport.push({ body: ME, headers: { 'x-armikom-network-zone': 'external' } });
  await facade.session.getCurrentUser();
  assert.deepEqual(zones, ['external']);

  transport.push({ status: 403, body: { status: 403, code: 'AUTH.INSUFFICIENT_SCOPE' } });
  await assert.rejects(facade.session.getCurrentUser());
  assert.deepEqual(ended, []);
  assert.notEqual(store.read(), null);

  transport.push({ status: 403, body: { status: 403, code: 'AUTH.REMOTE_ACCESS_DENIED' } });
  await assert.rejects(facade.session.getCurrentUser());
  await new Promise((r) => setTimeout(r, 0));
  assert.deepEqual(ended, ['remote-access-denied']);
  assert.equal(store.read(), null);
});

test('the reference bundle asks the browser to revalidate rather than trust a fresh copy', async () => {
  const seen: RequestCache[] = [];
  const { facade } = make({
    tokenStore: new MemoryTokenStore({ accessToken: 'acc' }),
    transport: async (request) => {
      seen.push(request.cache ?? 'default');
      return new Response(JSON.stringify({ monitoringCenters: [] }), { status: 200, headers: { 'content-type': 'application/json' } });
    },
  });
  await facade.reference.bundle();
  assert.deepEqual(seen, ['no-cache']);
});

test('uiLayouts: a 404 is "nothing stored" and a write goes through the pipeline with the bearer', async () => {
  const { facade, transport } = make({ tokenStore: new MemoryTokenStore({ accessToken: 'acc' }) });
  transport.push({ status: 404, body: { status: 404, code: 'UI_LAYOUT.NOT_FOUND' } });
  assert.deepEqual(await facade.uiLayouts!.listTemplates('alarm-workspace'), []);

  transport.push({ status: 404, body: {} });
  assert.equal(await facade.uiLayouts!.getUserLayout!('alarm-workspace'), null);

  transport.push({ status: 204 });
  await facade.uiLayouts!.saveUserLayout!('alarm-workspace', '{"v":1}');
  const last = transport.lastRequest()!;
  assert.equal(last.method, 'PUT');
  assert.equal(last.url, 'http://api.test/v1/ui-layouts/alarm-workspace');
  assert.equal(last.headers['Authorization'], 'Bearer acc');
  assert.deepEqual(JSON.parse(String(last.body)), { contentJson: '{"v":1}' });
});

test('explanation lists go through the host cache and admin writes invalidate it', async () => {
  const reads: string[] = [];
  const invalidated: string[] = [];
  const explanations: ExplanationCache = {
    async read(kind, fetcher) {
      reads.push(kind);
      return fetcher();
    },
    invalidate(kind) {
      invalidated.push(kind);
    },
  };
  const { facade, transport } = make({ tokenStore: new MemoryTokenStore({ accessToken: 'acc' }), explanations });
  transport.push({ body: [{ id: 'n1', name: 'Tatilde', priority: 1 }] }, { status: 204 });

  assert.deepEqual(await facade.sides!.listNoteExplanations!(), [{ id: 'n1', name: 'Tatilde', priority: 1 }]);
  await facade.referenceAdmin!.deleteNoteExplanation('n1');
  assert.deepEqual(reads, ['note']);
  assert.deepEqual(invalidated, ['note']);
});

test('the hand-written endpoints carry the bearer and the pipeline headers like any generated one', async () => {
  const { facade, transport } = make({ tokenStore: new MemoryTokenStore({ accessToken: 'acc' }) });
  transport.push({ body: { id: 'c1' } });
  await facade.referenceAdmin!.createCityEmergencyContact('city-1', { name: 'Polis', phone: '155' });
  const req = transport.lastRequest()!;
  assert.equal(req.method, 'POST');
  assert.equal(req.url, 'http://api.test/v1/reference/cities/city-1/emergency-contacts');
  assert.equal(req.headers['Authorization'], 'Bearer acc');
  assert.equal(req.headers['Content-Type'], 'application/json');
  assert.deepEqual(JSON.parse(String(req.body)), { name: 'Polis', phone: '155' });
});
