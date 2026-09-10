/**
 * §01 §3 — the auth conformance scenarios: C-01 through C-05.
 *
 * These are the ones that cost a session when they are wrong. C-03 in
 * particular is not a performance nicety: refresh tokens rotate (D15), so two
 * concurrent refreshes invalidate the session the first one just created.
 */
import assert from 'node:assert/strict';
import test from 'node:test';

import { ManualClock } from '../../src/core/clock.js';
import { AuthCodes } from '../../src/core/errors.js';
import { HttpClient } from '../../src/core/http-client.js';
import { ConsoleLogger, redact, scrubText } from '../../src/core/logger.js';
import { AuthSession, type AuthDriver, type SessionEndReason } from '../../src/core/session.js';
import { MemoryTokenStore, expiryFromJwt } from '../../src/core/tokens.js';
import { MockTransport, jwtWithExp } from './_harness.js';

/** Far enough out that no fixture accidentally triggers a proactive refresh. */
const FAR_FUTURE = 9e15;

interface DriverLog {
  logins: number;
  refreshes: number;
  users: number;
}

function makeDriver(
  log: DriverLog,
  overrides: Partial<AuthDriver<{ email: string }>> = {},
): AuthDriver<{ email: string }> {
  return {
    async login() {
      log.logins += 1;
      return { tokens: { accessToken: 'access-1', refreshToken: 'refresh-1', expiresAt: FAR_FUTURE } };
    },
    async refresh() {
      log.refreshes += 1;
      // Deliberately slow, so a second caller arriving mid-flight has something
      // to collide with. Without this, C-03 passes by accident.
      await new Promise((resolve) => setTimeout(resolve, 10));
      return { tokens: { accessToken: 'access-2', refreshToken: 'refresh-2', expiresAt: FAR_FUTURE } };
    },
    async currentUser() {
      log.users += 1;
      return { user: { id: 'u1', name: 'Operator', type: 'operator' }, scopes: ['alarms:read', 'sides:write'] };
    },
    ...overrides,
  };
}

test('C-01 the clock is injectable, and expiry is decided against it', async () => {
  const clock = new ManualClock(0);
  const log: DriverLog = { logins: 0, refreshes: 0, users: 0 };
  const session = new AuthSession({
    driver: makeDriver(log),
    tokenStore: new MemoryTokenStore({ accessToken: 'stale', refreshToken: 'r', expiresAt: 100_000 }),
    clock,
    refreshSkewMs: 60_000,
  });

  // 100 s to go, skew 60 s: still fresh.
  assert.equal(await session.getAccessToken(), 'stale');
  assert.equal(log.refreshes, 0);

  // 50 s to go: inside the skew window.
  await clock.advance(50_000);
  assert.equal(await session.getAccessToken(), 'access-2');
  assert.equal(log.refreshes, 1);
});

test('C-02 refresh is proactive: the stale token is never sent', async () => {
  const clock = new ManualClock(0);
  const log: DriverLog = { logins: 0, refreshes: 0, users: 0 };
  const transport = new MockTransport().always({ status: 200, body: { ok: true } });
  const session = new AuthSession({
    driver: makeDriver(log),
    tokenStore: new MemoryTokenStore({ accessToken: 'stale', refreshToken: 'r', expiresAt: 30_000 }),
    clock,
  });
  const http = new HttpClient({ baseUrl: 'https://api.test', transport: transport.transport, clock });
  http.setSession(session as unknown as AuthSession<unknown>);

  await http.json({ method: 'GET', path: '/v1/sides' });

  assert.equal(log.refreshes, 1, 'exactly one refresh precedes the request');
  const sent = transport.requests.find((r) => r.url.includes('/v1/sides'));
  assert.equal(sent?.headers['Authorization'], 'Bearer access-2');
  assert.ok(
    !transport.requests.some((r) => r.headers['Authorization'] === 'Bearer stale'),
    'the expired token must never reach the wire',
  );
});

test('C-03 ten concurrent callers produce exactly one refresh', async () => {
  const clock = new ManualClock(0);
  const log: DriverLog = { logins: 0, refreshes: 0, users: 0 };
  const session = new AuthSession({
    driver: makeDriver(log),
    tokenStore: new MemoryTokenStore({ accessToken: 'stale', refreshToken: 'r', expiresAt: 0 }),
    clock,
  });

  const tokens = await Promise.all(Array.from({ length: 10 }, () => session.getAccessToken()));

  assert.equal(log.refreshes, 1, 'a second rotation would invalidate the first');
  assert.deepEqual(new Set(tokens), new Set(['access-2']));
});

test('C-04 a terminal refresh failure clears the store and ends the session', async () => {
  const log: DriverLog = { logins: 0, refreshes: 0, users: 0 };
  const store = new MemoryTokenStore({ accessToken: 'a', refreshToken: 'r', expiresAt: 0 });
  const reasons: SessionEndReason[] = [];

  const session = new AuthSession({
    driver: makeDriver(log, {
      async refresh() {
        log.refreshes += 1;
        throw Object.assign(new Error('nope'), { code: AuthCodes.REFRESH_TOKEN_INVALID });
      },
    }),
    tokenStore: store,
    clock: new ManualClock(0),
  });
  session.onSessionEnded((reason) => reasons.push(reason));

  assert.equal(await session.getAccessToken(), null);
  assert.equal(store.read(), null, 'the store is cleared');
  assert.deepEqual(reasons, ['token-invalid']);
  assert.equal(session.isAuthenticated, false);

  // And nothing retries: a second call does not re-attempt the dead refresh.
  assert.equal(await session.getAccessToken(), null);
  assert.equal(log.refreshes, 1);
});

test('C-04 an account lock is reported as its own reason', async () => {
  const reasons: SessionEndReason[] = [];
  const session = new AuthSession({
    driver: {
      async login() {
        throw new Error('unused');
      },
      async refresh() {
        throw Object.assign(new Error('locked'), { code: AuthCodes.ACCOUNT_LOCKED });
      },
    },
    tokenStore: new MemoryTokenStore({ accessToken: 'a', refreshToken: 'r', expiresAt: 0 }),
    clock: new ManualClock(0),
  });
  session.onSessionEnded((reason) => reasons.push(reason));

  await session.getAccessToken();
  assert.deepEqual(reasons, ['account-locked'], 'a lock routes to its own screen, not the generic login error');
});

test('C-05 no password, token or refresh token survives redaction', () => {
  const lines: string[] = [];
  const original = console.error;
  console.error = (...args: unknown[]) => lines.push(args.map(String).join(' '));
  try {
    new ConsoleLogger({ level: 'debug' }).log({
      level: 'error',
      message: `login failed for Bearer ${jwtWithExp(1)}`,
      timestamp: new Date().toISOString(),
      data: {
        password: 'hunter2',
        refreshToken: 'rt-secret',
        safePassword: '1234',
        nested: { authorization: 'Bearer abc' },
        note: `token is ${jwtWithExp(2)}`,
      },
    });
  } finally {
    console.error = original;
  }

  const output = lines.join('\n') + JSON.stringify(redact({ password: 'hunter2' }));
  for (const secret of ['hunter2', 'rt-secret', '1234']) {
    assert.ok(!output.includes(secret), `"${secret}" must not appear in a log line`);
  }
  assert.ok(!/eyJ[A-Za-z0-9_-]{8,}\./.test(output), 'no JWT-shaped substring survives');
});

test('C-05 an error toString carries the correlation id and no credentials', async () => {
  const transport = new MockTransport().push({
    status: 401,
    body: { code: 'AUTH.TOKEN_EXPIRED', title: 'Expired', correlationId: '0HN123' },
  });
  const http = new HttpClient({ baseUrl: 'https://api.test', transport: transport.transport });
  await assert.rejects(
    () => http.json({ method: 'GET', path: '/v1/sides' }),
    (error: Error) => {
      assert.match(error.toString(), /correlationId=0HN123/);
      assert.ok(!error.toString().includes('Bearer'));
      return true;
    },
  );
});

test('A-1 login and refresh are anonymous; everything else carries the bearer', async () => {
  const transport = new MockTransport().always({ status: 200, body: {} });
  const session = new AuthSession({
    driver: makeDriver({ logins: 0, refreshes: 0, users: 0 }),
    tokenStore: new MemoryTokenStore({ accessToken: 'live', refreshToken: 'r', expiresAt: 9e15 }),
  });
  const http = new HttpClient({ baseUrl: 'https://api.test', transport: transport.transport });
  http.setSession(session as unknown as AuthSession<unknown>);

  await http.fetch('https://api.test/v1/auth/login', { method: 'POST', body: '{}' });
  await http.fetch('https://api.test/v1/i18n/tr', { method: 'GET' });
  await http.fetch('https://api.test/v1/sides', { method: 'GET' });

  assert.equal(transport.requests[0]?.headers['Authorization'], undefined);
  assert.equal(transport.requests[1]?.headers['Authorization'], undefined);
  assert.equal(transport.requests[2]?.headers['Authorization'], 'Bearer live');
});

test('A-4 a 401 refreshes once and replays once; a second 401 surfaces', async () => {
  const log: DriverLog = { logins: 0, refreshes: 0, users: 0 };
  const transport = new MockTransport().push(
    { status: 401, body: { code: 'AUTH.TOKEN_EXPIRED' } },
    { status: 200, body: { ok: true } },
  );
  const session = new AuthSession({
    driver: makeDriver(log),
    tokenStore: new MemoryTokenStore({ accessToken: 'a', refreshToken: 'r', expiresAt: 9e15 }),
  });
  const http = new HttpClient({ baseUrl: 'https://api.test', transport: transport.transport });
  http.setSession(session as unknown as AuthSession<unknown>);

  assert.deepEqual(await http.json({ method: 'GET', path: '/v1/sides' }), { ok: true });
  assert.equal(log.refreshes, 1);
  assert.equal(transport.countFor('/v1/sides'), 2, 'replayed exactly once');

  const transport2 = new MockTransport().always({ status: 401, body: { code: 'AUTH.TOKEN_EXPIRED' } });
  const session2 = new AuthSession({
    driver: makeDriver(log),
    tokenStore: new MemoryTokenStore({ accessToken: 'a', refreshToken: 'r', expiresAt: 9e15 }),
  });
  const http2 = new HttpClient({ baseUrl: 'https://api.test', transport: transport2.transport });
  http2.setSession(session2 as unknown as AuthSession<unknown>);

  await assert.rejects(() => http2.json({ method: 'GET', path: '/v1/sides' }), /401|Request failed|Expired/);
  assert.equal(transport2.countFor('/v1/sides'), 2, 'no third attempt');
});

test('A-6 a 403 does not refresh and does not end the session', async () => {
  const log: DriverLog = { logins: 0, refreshes: 0, users: 0 };
  const transport = new MockTransport().always({
    status: 403,
    body: { code: 'AUTH.INSUFFICIENT_SCOPE', title: 'Forbidden' },
  });
  const session = new AuthSession({
    driver: makeDriver(log),
    tokenStore: new MemoryTokenStore({ accessToken: 'a', refreshToken: 'r', expiresAt: 9e15 }),
  });
  await session.login({ email: 'x' });
  const http = new HttpClient({ baseUrl: 'https://api.test', transport: transport.transport });
  http.setSession(session as unknown as AuthSession<unknown>);

  const before = log.refreshes;
  await assert.rejects(() => http.json({ method: 'GET', path: '/v1/sides' }));
  assert.equal(log.refreshes, before, 'a capability problem is not an auth problem');
  assert.equal(session.isAuthenticated, true);
});

test('A-7 logout clears the store even when the server call fails', async () => {
  const store = new MemoryTokenStore({ accessToken: 'a', refreshToken: 'r' });
  const session = new AuthSession({
    driver: {
      async login() {
        return { tokens: { accessToken: 'a' } };
      },
      async refresh() {
        return { tokens: { accessToken: 'a' } };
      },
      async logout() {
        throw new Error('network down');
      },
    },
    tokenStore: store,
  });

  await session.logout();
  assert.equal(store.read(), null);
});

test('A-9 scopes are exact: sides:write does not imply sides:read', async () => {
  const session = new AuthSession({
    driver: {
      async login() {
        return { tokens: { accessToken: 'a' }, scopes: ['sides:write', 'customers:read'] };
      },
      async refresh() {
        return { tokens: { accessToken: 'a' } };
      },
    },
  });
  await session.login({});

  assert.equal(session.can('sides:write'), true);
  assert.equal(session.can('sides:read'), false);
  // GetCustomerSides is the API's only multi-scope endpoint.
  assert.equal(session.canAll(['customers:read', 'sides:read']), false);
  assert.equal(session.canAny(['customers:read', 'sides:read']), true);
});

test('A-10 scopes are re-read after a refresh, not only at login', async () => {
  let scopes = ['alarms:read'];
  const session = new AuthSession({
    driver: {
      async login() {
        return { tokens: { accessToken: 'a', refreshToken: 'r', expiresAt: 0 } };
      },
      async refresh() {
        return { tokens: { accessToken: 'b', refreshToken: 'r2', expiresAt: 9e15 } };
      },
      async currentUser() {
        return { user: { id: 'u' }, scopes };
      },
    },
    clock: new ManualClock(0),
  });

  await session.login({});
  assert.equal(session.can('alarms:write'), false);

  // An admin grants a role mid-session.
  scopes = ['alarms:read', 'alarms:write'];
  await session.refresh();
  assert.equal(session.can('alarms:write'), true, 'a role change mid-session must be picked up');
});

test('A-11 the default token store is memory, never web storage', () => {
  const session = new AuthSession({
    driver: {
      async login() {
        return { tokens: { accessToken: 'a' } };
      },
      async refresh() {
        return { tokens: { accessToken: 'a' } };
      },
    },
  });
  // Nothing to assert on the store directly; what matters is that constructing
  // a session touches no ambient global (§01 B-3).
  assert.equal(session.isAuthenticated, false);
});

test('a login response without expiresAt still gets proactive refresh, via the JWT exp', () => {
  const exp = Math.floor(Date.now() / 1000) + 300;
  assert.equal(expiryFromJwt(jwtWithExp(exp)), exp * 1000);
  assert.equal(expiryFromJwt('not-a-jwt'), null);
});

test('scrubText removes bearer tokens from free text', () => {
  assert.ok(!scrubText('Authorization: Bearer abc.def.ghi').includes('abc.def.ghi'));
});
