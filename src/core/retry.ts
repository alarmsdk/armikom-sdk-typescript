/**
 * §01 §6 — retry.
 *
 * The rule that matters most here is RT-2: `POST` is never retried by default.
 * Re-sending `BatchCompleteAlarmEvents` completes a second batch of alarms;
 * re-sending `GenerateInvoices` bills twice. The API has no `Idempotency-Key`
 * support (14-api-gaps G-09), so refusing to retry is the only protection there
 * is — which is also why `idempotencyKey` on a request is an explicit opt-in
 * per call rather than something the SDK invents.
 */

export type HttpMethod = 'GET' | 'HEAD' | 'OPTIONS' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export interface RetryPolicy {
  /** Total attempts including the first. 3 means at most two retries. */
  maxAttempts: number;
  baseDelayMs: number;
  factor: number;
  maxDelayMs: number;
  /** Full jitter (AWS' "Exponential Backoff and Jitter"). 'none' only for tests. */
  jitter: 'full' | 'none';
  /**
   * §01 RT-5 / C-12 — bounds *all* attempts together, not each one. A 2 s
   * deadline with three 1 s attempts must give up at ~2 s, not run for 3 s.
   */
  deadlineMs?: number;
}

export const defaultRetryPolicy: RetryPolicy = {
  maxAttempts: 3,
  baseDelayMs: 250,
  factor: 2,
  maxDelayMs: 8_000,
  jitter: 'full',
};

/** §01 RT-2 — `PUT` and `DELETE` are idempotent by contract; `POST`/`PATCH` are not. */
export function isIdempotent(method: HttpMethod): boolean {
  return method === 'GET' || method === 'HEAD' || method === 'OPTIONS' || method === 'PUT' || method === 'DELETE';
}

export interface DelayInput {
  /** 1-based: the attempt that just failed. */
  attempt: number;
  policy: RetryPolicy;
  /** §01 RT-4 — overrides the computed delay outright when the server sent one. */
  retryAfterMs?: number | null;
  random?: () => number;
}

export function backoffDelay({ attempt, policy, retryAfterMs, random = Math.random }: DelayInput): number {
  if (retryAfterMs !== null && retryAfterMs !== undefined) return retryAfterMs;
  const exponential = Math.min(policy.maxDelayMs, policy.baseDelayMs * Math.pow(policy.factor, attempt - 1));
  return policy.jitter === 'full' ? random() * exponential : exponential;
}

/**
 * Reconnect backoff for the SSE stream (§01 S-5): same curve, different
 * constants, and unbounded attempts while the session is valid.
 */
export const defaultStreamBackoff: RetryPolicy = {
  maxAttempts: Number.POSITIVE_INFINITY,
  baseDelayMs: 1_000,
  factor: 2,
  maxDelayMs: 30_000,
  jitter: 'full',
};
