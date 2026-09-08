/**
 * §01 §4 — errors.
 *
 * Two wire shapes are handled, because two Armikom services speak them:
 *
 *   RFC 7807 + `code`   Armikom.Api   `{ "code": "SIDE.NOT_FOUND", "correlationId": "…", … }`
 *   flat code envelope  Voice.Cloud   `{ "error": "insufficient_credits" }`
 *
 * Both collapse to the same typed error, so a screen branches on `err.code`
 * without knowing which service answered. §01 E-6 / C-08: a body that is
 * neither — an ingress' HTML 502, a truncated response — must still produce a
 * typed error rather than a parse crash.
 */

/** RFC 7807 as the API extends it. Unknown members are preserved (§01 V-2). */
export interface ProblemDetails {
  type?: string;
  title?: string;
  status?: number;
  detail?: string;
  instance?: string;
  /** The stable identifier. `type`/`title` may change; this may not (§01 4.1). */
  code?: string;
  correlationId?: string;
  /** Machine-readable context — limits, the user holding a lock, … (§01 4.3). */
  params?: Record<string, unknown>;
  /** Per-field validation messages. */
  errors?: Record<string, string[]>;
  [key: string]: unknown;
}

export interface ApiErrorInit {
  status: number;
  problem: ProblemDetails;
  /** The failing request, for logs. Never carries headers — see `redact`. */
  method?: string;
  url?: string;
  operationId?: string;
  retryAfterMs?: number;
  cause?: unknown;
}

/** Base of the hierarchy in §01 E-3. Most callers branch on class, some on `code`. */
export class ApiError extends Error {
  readonly status: number;
  readonly problem: ProblemDetails;
  readonly code: string | undefined;
  readonly correlationId: string | undefined;
  readonly params: Record<string, unknown> | undefined;
  readonly validationErrors: Record<string, string[]> | undefined;
  readonly method: string | undefined;
  readonly url: string | undefined;
  readonly operationId: string | undefined;
  readonly retryAfterMs: number | undefined;

  constructor(message: string, init: ApiErrorInit) {
    super(message);
    this.name = new.target.name;
    this.status = init.status;
    this.problem = init.problem;
    this.code = init.problem.code;
    this.correlationId = init.problem.correlationId;
    this.params = init.problem.params;
    this.validationErrors = init.problem.errors;
    this.method = init.method;
    this.url = init.url;
    this.operationId = init.operationId;
    this.retryAfterMs = init.retryAfterMs;
    if (init.cause !== undefined) (this as { cause?: unknown }).cause = init.cause;
    Object.setPrototypeOf(this, new.target.prototype);
  }

  /** §01 RT-1 — whether the *class* permits a retry. Method idempotency is checked separately. */
  get retryable(): boolean {
    return false;
  }

  /**
   * §01 A-12 / C-05. `toString()` reaches logs, crash reporters and support
   * tickets, so it carries the correlation id and nothing that could be a
   * credential.
   */
  override toString(): string {
    const parts = [`${this.name}: ${this.message}`];
    if (this.code) parts.push(`code=${this.code}`);
    parts.push(`status=${this.status}`);
    if (this.correlationId) parts.push(`correlationId=${this.correlationId}`);
    return parts.join(' ');
  }
}

/** 400, 422 — the request was understood and rejected. `validationErrors` is the detail. */
export class ValidationError extends ApiError {}

/** 401. Recovery is §3's business (refresh + replay), never a blind retry. */
export class AuthError extends ApiError {}

/**
 * The session is over: refresh failed, the token was revoked, the account is
 * locked. §01 A-5 — the store is cleared and nothing is retried.
 */
export class SessionExpiredError extends AuthError {}

/**
 * 403. §01 A-6 — *not* an auth failure. It must not trigger refresh or logout;
 * the UI treats it as a missing capability.
 */
export class ForbiddenError extends ApiError {}

export class NotFoundError extends ApiError {}

/** 409. Never auto-retried: the caller decides (lock take-over, duplicate). */
export class ConflictError extends ApiError {}

/** 412, 428. */
export class PreconditionFailedError extends ApiError {}

/** 429. §01 RT-4 — `Retry-After` overrides the computed backoff. */
export class RateLimitedError extends ApiError {
  override get retryable(): boolean {
    return true;
  }
}

/** 5xx. Retryable, but only for idempotent methods (§01 RT-2). */
export class ServerError extends ApiError {
  override get retryable(): boolean {
    return true;
  }
}

/** No response at all: DNS, TLS, connection reset, CORS. */
export class TransportError extends ApiError {
  override get retryable(): boolean {
    return true;
  }
}

/** 304 on a conditional request. Handled by the cache (§01 §7), not an error path. */
export class NotModifiedError extends ApiError {}

/** §01 RT-5 / C-12 — the per-call deadline bounds all attempts together. */
export class DeadlineExceededError extends ApiError {
  override get retryable(): boolean {
    return false;
  }
}

/** The caller's `AbortSignal` fired — a navigation cancelled its in-flight reads. */
export class RequestAbortedError extends ApiError {}

/** §01 OF-2 — writes are refused offline rather than queued. */
export class OfflineError extends ApiError {}

/** Codes the core runtime itself must recognise. Everything else is data. */
export const AuthCodes = {
  TOKEN_EXPIRED: 'AUTH.TOKEN_EXPIRED',
  TOKEN_INVALID: 'AUTH.TOKEN_INVALID',
  REFRESH_TOKEN_INVALID: 'AUTH.REFRESH_TOKEN_INVALID',
  ACCOUNT_LOCKED: 'AUTH.ACCOUNT_LOCKED',
  INSUFFICIENT_SCOPE: 'AUTH.INSUFFICIENT_SCOPE',
  PRINCIPAL_TYPE_NOT_ALLOWED: 'AUTH.PRINCIPAL_TYPE_NOT_ALLOWED',
} as const;

export const StreamCodes = {
  MOBILE_NOT_ALLOWED: 'STREAM.MOBILE_NOT_ALLOWED',
  TOO_MANY_CONNECTIONS: 'STREAM.TOO_MANY_CONNECTIONS',
} as const;

/**
 * §01 4.3 — a no-op reported as a failure. `AppendActionText` returning this
 * means the text was already there; a red toast for it trains operators to
 * ignore red toasts.
 */
export const NOT_MODIFIED_ACTION_CODE = 'SIGNAL_EVENT.ACTION_NOT_MODIFIED';

/** §01 A-5 — terminal. Clear the store, end the session, retry nothing. */
export function isTerminalAuthCode(code: string | undefined): boolean {
  return (
    code === AuthCodes.REFRESH_TOKEN_INVALID ||
    code === AuthCodes.TOKEN_INVALID ||
    code === AuthCodes.ACCOUNT_LOCKED
  );
}

/**
 * Parses whatever the server sent into a ProblemDetails. Never throws: a
 * non-JSON body becomes a problem whose `detail` is the (truncated) text.
 */
export function parseProblem(status: number, body: unknown, fallbackTitle?: string): ProblemDetails {
  if (typeof body === 'string') {
    const trimmed = body.trim();
    if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
      try {
        return parseProblem(status, JSON.parse(trimmed), fallbackTitle);
      } catch {
        // Fall through: a body that looks like JSON but is not is still a body.
      }
    }
    return {
      status,
      title: fallbackTitle ?? httpReason(status),
      ...(trimmed ? { detail: trimmed.slice(0, 2000) } : {}),
    };
  }

  if (!body || typeof body !== 'object') {
    return { status, title: fallbackTitle ?? httpReason(status) };
  }

  const raw = body as Record<string, unknown>;
  const problem: ProblemDetails = { ...raw, status: typeof raw['status'] === 'number' ? (raw['status'] as number) : status };

  // Voice.Cloud answers `{ "error": "code" }` (sometimes with a `message`).
  // Fold it onto the same shape so callers branch on `code` either way.
  if (problem.code === undefined) {
    const flat = raw['error'] ?? raw['errorCode'] ?? raw['error_code'];
    if (typeof flat === 'string') problem.code = flat;
  }
  if (problem.title === undefined) {
    const message = raw['message'] ?? raw['error_description'];
    if (typeof message === 'string') problem.title = message;
  }
  if (problem.correlationId === undefined) {
    const cid = raw['correlation_id'] ?? raw['traceId'] ?? raw['trace_id'];
    if (typeof cid === 'string') problem.correlationId = cid;
  }
  // `errors` is a field-map in RFC 7807, but a bare string when Voice.Cloud
  // uses it as the code. Only the map shape is kept as validation detail.
  if (problem.errors !== undefined && !isFieldMap(problem.errors)) delete problem.errors;
  if (problem.title === undefined) problem.title = fallbackTitle ?? httpReason(status);
  return problem;
}

function isFieldMap(value: unknown): value is Record<string, string[]> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  return Object.values(value as Record<string, unknown>).every(
    (v) => Array.isArray(v) && v.every((s) => typeof s === 'string'),
  );
}

export interface ErrorContext {
  method?: string;
  url?: string;
  operationId?: string;
  retryAfterMs?: number;
  cause?: unknown;
}

/** §01 E-3 — status to class. The single place that mapping is written down. */
export function errorForStatus(status: number, problem: ProblemDetails, context: ErrorContext = {}): ApiError {
  const message = problem.title || problem.detail || httpReason(status);
  const init: ApiErrorInit = { status, problem, ...context };

  if (status === 304) return new NotModifiedError(message, init);
  if (status === 400 || status === 422) return new ValidationError(message, init);
  if (status === 401) {
    return isTerminalAuthCode(problem.code)
      ? new SessionExpiredError(message, init)
      : new AuthError(message, init);
  }
  if (status === 403) return new ForbiddenError(message, init);
  if (status === 404) return new NotFoundError(message, init);
  if (status === 409) return new ConflictError(message, init);
  if (status === 412 || status === 428) return new PreconditionFailedError(message, init);
  if (status === 429) return new RateLimitedError(message, init);
  if (status >= 500) return new ServerError(message, init);
  return new ApiError(message, init);
}

/** Anything thrown by `fetch` itself: there is no response to classify. */
export function transportError(cause: unknown, context: ErrorContext = {}): TransportError {
  const message = cause instanceof Error ? cause.message : 'The request could not be sent';
  return new TransportError(message, {
    status: 0,
    problem: { status: 0, title: message, code: 'TRANSPORT.FAILED' },
    ...context,
    cause,
  });
}

export function isApiError(value: unknown): value is ApiError {
  return value instanceof ApiError;
}

/** True when the error is one the caller should treat as "nothing changed", not a failure. */
export function isNoopOutcome(error: unknown): boolean {
  return isApiError(error) && (error.code === NOT_MODIFIED_ACTION_CODE || error instanceof NotModifiedError);
}

function httpReason(status: number): string {
  if (status === 0) return 'Network error';
  if (status >= 500) return 'Server error';
  if (status >= 400) return 'Request failed';
  return `HTTP ${status}`;
}

/** `Retry-After` in seconds or as an HTTP date; null when absent or unparseable. */
export function parseRetryAfter(header: string | null | undefined, nowMs: number): number | null {
  if (!header) return null;
  const seconds = Number(header);
  if (Number.isFinite(seconds)) return Math.max(0, seconds * 1000);
  const at = Date.parse(header);
  if (Number.isNaN(at)) return null;
  return Math.max(0, at - nowMs);
}
