/**
 * §01 §4 — error conformance: C-06, C-07, C-08, C-25, plus the two wire shapes.
 */
import assert from 'node:assert/strict';
import test from 'node:test';

import {
  ApiError,
  AuthCodes,
  ConflictError,
  ForbiddenError,
  NOT_MODIFIED_ACTION_CODE,
  NotFoundError,
  PreconditionFailedError,
  RateLimitedError,
  ServerError,
  SessionExpiredError,
  ValidationError,
  errorForStatus,
  isNoopOutcome,
  parseProblem,
  parseRetryAfter,
} from '../../src/core/errors.js';
import { HttpClient } from '../../src/core/http-client.js';
import { describeError } from '../../src/core/messages.js';
import { I18n } from '../../src/core/i18n.js';
import { MockTransport } from './_harness.js';

test('C-06 a typed error carries code, params, correlationId and field errors', async () => {
  const transport = new MockTransport().push({
    status: 409,
    body: {
      type: 'https://docs.armikom.net/errors/alarm/locked',
      title: 'Alarm is locked',
      status: 409,
      code: 'ALARM.LOCKED_BY_OTHER_USER',
      correlationId: '0HN9ABC',
      params: { lockedByUserName: 'Ayşe', lockedAt: '2026-08-16T11:22:33Z' },
    },
  });
  const http = new HttpClient({ baseUrl: 'https://api.test', transport: transport.transport });

  await assert.rejects(
    () => http.json({ method: 'POST', path: '/v1/alarm-events/1/lock' }),
    (error: ApiError) => {
      assert.ok(error instanceof ConflictError);
      assert.equal(error.code, 'ALARM.LOCKED_BY_OTHER_USER');
      assert.equal(error.correlationId, '0HN9ABC');
      // The dialog offering force-take needs the holder's name out of `params`.
      assert.equal(error.params?.['lockedByUserName'], 'Ayşe');
      return true;
    },
  );
});

test('C-07 error codes are symbols, not literals scattered through call sites', () => {
  assert.equal(AuthCodes.TOKEN_EXPIRED, 'AUTH.TOKEN_EXPIRED');
  assert.equal(NOT_MODIFIED_ACTION_CODE, 'SIGNAL_EVENT.ACTION_NOT_MODIFIED');
});

test('C-08 an HTML 502 from an ingress produces a typed error, not a parse crash', async () => {
  const transport = new MockTransport().push({
    status: 502,
    text: '<html><head><title>502 Bad Gateway</title></head><body>nginx</body></html>',
    headers: { 'content-type': 'text/html' },
  });
  const http = new HttpClient({ baseUrl: 'https://api.test', transport: transport.transport, retryPolicy: { maxAttempts: 1, baseDelayMs: 1, factor: 2, maxDelayMs: 1, jitter: 'none' } });

  await assert.rejects(
    () => http.json({ method: 'GET', path: '/v1/sides' }),
    (error: ApiError) => {
      assert.ok(error instanceof ServerError);
      assert.equal(error.status, 502);
      assert.ok(error.problem.detail?.includes('502 Bad Gateway'));
      return true;
    },
  );
});

test('C-08 a truncated JSON body does not throw out of the error path', () => {
  const problem = parseProblem(500, '{"code":"X.Y","tit');
  assert.equal(problem.status, 500);
  assert.ok(problem.detail?.startsWith('{"code"'));
});

test('C-25 a no-op action is not surfaced as a hard error', () => {
  const error = errorForStatus(422, { code: NOT_MODIFIED_ACTION_CODE, title: 'Nothing changed' });
  assert.equal(isNoopOutcome(error), true);
  assert.equal(describeError(error).kind, 'info', 'a red toast for "nothing changed" trains people to ignore red');
});

test('E-3 status maps to the documented class hierarchy', () => {
  const cases: Array<[number, unknown]> = [
    [400, ValidationError],
    [422, ValidationError],
    [403, ForbiddenError],
    [404, NotFoundError],
    [409, ConflictError],
    [412, PreconditionFailedError],
    [428, PreconditionFailedError],
    [429, RateLimitedError],
    [503, ServerError],
  ];
  for (const [status, type] of cases) {
    assert.ok(
      errorForStatus(status, { status }) instanceof (type as new () => Error),
      `${status} should map to ${(type as { name: string }).name}`,
    );
  }
  // A terminal auth code is a dead session, not a refreshable 401.
  assert.ok(errorForStatus(401, { code: AuthCodes.ACCOUNT_LOCKED }) instanceof SessionExpiredError);
});

test('E-3 only 429, 5xx and transport failures are retryable by class', () => {
  assert.equal(errorForStatus(429, {}).retryable, true);
  assert.equal(errorForStatus(503, {}).retryable, true);
  assert.equal(errorForStatus(409, {}).retryable, false);
  assert.equal(errorForStatus(400, {}).retryable, false);
});

test("the Voice.Cloud flat envelope folds onto the same shape", () => {
  // `{ "error": "insufficient_credits" }` and RFC 7807 must both give `code`.
  const problem = parseProblem(402, { error: 'insufficient_credits', message: 'Not enough credits' });
  assert.equal(problem.code, 'insufficient_credits');
  assert.equal(problem.title, 'Not enough credits');
});

test('parseRetryAfter reads both seconds and an HTTP date', () => {
  const now = Date.parse('2026-08-16T12:00:00Z');
  assert.equal(parseRetryAfter('5', now), 5_000);
  assert.equal(parseRetryAfter('Sun, 16 Aug 2026 12:00:30 GMT', now), 30_000);
  assert.equal(parseRetryAfter(null, now), null);
  assert.equal(parseRetryAfter('nonsense', now), null);
});

test('LO-5 error rendering is t("ERROR." + code) with params, falling back to the title', () => {
  const i18n = new I18n({
    culture: 'tr',
    bundles: { tr: { 'ERROR.ALARM.LOCKED_BY_OTHER_USER': '{{lockedByUserName}} bu alarmı kilitledi' } },
  });
  const locked = errorForStatus(409, {
    code: 'ALARM.LOCKED_BY_OTHER_USER',
    title: 'Alarm is locked',
    correlationId: '0HN1',
    params: { lockedByUserName: 'Ayşe' },
  });

  const described = describeError(locked, { t: i18n.t });
  assert.equal(described.message, 'Ayşe bu alarmı kilitledi');
  assert.equal(described.correlationId, '0HN1');

  // No catalogue entry: the server's own title, never the raw key.
  const unknown = errorForStatus(404, { code: 'SIDE.NOT_FOUND', title: 'Subscriber not found' });
  assert.equal(describeError(unknown, { t: i18n.t }).message, 'Subscriber not found');
});

test('a 403 reads as a capability problem, not a failure', () => {
  const described = describeError(errorForStatus(403, { code: AuthCodes.INSUFFICIENT_SCOPE, title: 'Forbidden' }));
  assert.equal(described.kind, 'warning');
  assert.equal(described.sessionEnded, false);
});

test('V-2 / C-20 an unknown response property deserialises and is ignored', async () => {
  const transport = new MockTransport().push({
    status: 200,
    body: { id: '1', name: 'Side', somethingAddedNextRelease: 42 },
  });
  const http = new HttpClient({ baseUrl: 'https://api.test', transport: transport.transport });
  const body = await http.json<Record<string, unknown>>({ method: 'GET', path: '/v1/sides/1' });
  assert.equal(body['name'], 'Side');
  assert.equal(body['somethingAddedNextRelease'], 42);
});
