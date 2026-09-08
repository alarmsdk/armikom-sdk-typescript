/**
 * Layer 2's request pipeline: §01 §3 (auth), §4 (errors), §5 (headers),
 * §6 (retry and deadline), §14 (offline).
 *
 * Everything that used to be an Angular `HttpInterceptor` in the Voice.Cloud
 * console lives here instead, because none of it is Angular-shaped: attaching a
 * bearer token, refreshing once on 401 and replaying, not retrying a POST,
 * bounding a call by a deadline. An interceptor was simply the only place the
 * console had to put it.
 */
import type { Clock } from './clock.js';
import { systemClock } from './clock.js';
import { Connectivity } from './connectivity.js';
import {
  ApiError,
  DeadlineExceededError,
  NotModifiedError,
  OfflineError,
  parseProblem,
  parseRetryAfter,
  RequestAbortedError,
  errorForStatus,
  transportError,
} from './errors.js';
import { logEvent, noopLogger, type Logger } from './logger.js';
import { backoffDelay, defaultRetryPolicy, isIdempotent, type HttpMethod, type RetryPolicy } from './retry.js';
import type { AuthSession } from './session.js';
import { markTimestampsUtc } from './text.js';
import {
  buildQuery,
  combineSignals,
  fetchTransport,
  isAbortError,
  joinUrl,
  xhrTransport,
  type Progress,
  type QueryParams,
  type Transport,
} from './transport.js';

/**
 * `raw` hands back the untouched `Response`. It exists for the generated
 * transport layer, which does its own deserialisation and must be given a body
 * nobody has already read.
 */
export type ResponseKind = 'json' | 'text' | 'blob' | 'stream' | 'void' | 'raw';

export interface RequestSpec {
  method: HttpMethod;
  /** Relative to `baseUrl`, or an absolute URL (which bypasses the base). */
  path: string;
  query?: QueryParams;
  headers?: Record<string, string | undefined>;
  /**
   * A plain object is JSON-encoded; `FormData`, `Blob`, `URLSearchParams`,
   * `ArrayBuffer` and `string` are passed through. §01 A-8: the encoded body is
   * produced once and reused, so a replay after refresh cannot consume a
   * one-shot stream.
   */
  body?: unknown;
  contentType?: string;
  accept?: string;
  responseType?: ResponseKind;
  /** §01 A-1 — the four operations that must not carry `Authorization`. */
  anonymous?: boolean;
  /** Overrides the method-derived idempotency (§01 RT-2). Use with care. */
  idempotent?: boolean;
  /**
   * Sent as `Idempotency-Key`. Caller-supplied on purpose: generating one per
   * attempt would make every retry a fresh operation, which for a wallet top-up
   * is a second charge.
   */
  idempotencyKey?: string;
  /** §01 RT-5 — bounds all attempts together. */
  deadlineMs?: number;
  retry?: Partial<RetryPolicy> | false;
  signal?: AbortSignal;
  operationId?: string;
  culture?: string;
  timeZone?: string;
  /** §01 CA-1 — conditional request; pair with `allowNotModified`. */
  ifNoneMatch?: string;
  /** Returns a 304 as a response with `notModified: true` instead of throwing. */
  allowNotModified?: boolean;
  onUploadProgress?: (progress: Progress) => void;
  /** §01 OF-2 — refuse this request while offline instead of attempting it. */
  requiresOnline?: boolean;
}

export interface HttpResponse<T> {
  data: T;
  status: number;
  headers: Headers;
  etag: string | null;
  notModified: boolean;
  correlationId: string | null;
}

export interface HttpClientOptions {
  baseUrl: string;
  session?: AuthSession<unknown>;
  transport?: Transport;
  clock?: Clock;
  logger?: Logger;
  retryPolicy?: RetryPolicy;
  /** §01 R-2 — sent as `Accept-Language`. */
  culture?: string;
  /** §01 §8 — IANA id used as the default for operations that take one. */
  timeZone?: string;
  /** §01 R-3. Browsers forbid setting `User-Agent`, so it also goes out as `X-Armikom-Client`. */
  userAgent?: string;
  defaultHeaders?: Record<string, string>;
  connectivity?: Connectivity;
  credentials?: RequestCredentials;
  /** Injectable for deterministic jitter in tests. */
  random?: () => number;
  /** §01 V-4 — reported to support so they know which client is talking. */
  contractVersion?: string;
  /**
   * §01 R-4 — label offset-less response timestamps as the UTC they are.
   * On by default, because the API sends them: see `markInstantUtc`. Turn it
   * off only against a service that genuinely means local time.
   */
  repairTimestamps?: boolean;
}

const CORRELATION_HEADER = 'x-correlation-id';

export class HttpClient {
  readonly connectivity: Connectivity;
  readonly contractVersion: string | undefined;
  private readonly options: HttpClientOptions;
  private readonly transport: Transport;
  private readonly clock: Clock;
  private readonly logger: Logger;
  private readonly policy: RetryPolicy;
  private readonly random: () => number;
  private culture: string | undefined;
  private timeZone: string | undefined;
  private readonly repairTimestamps: boolean;

  constructor(options: HttpClientOptions) {
    this.options = options;
    this.transport = options.transport ?? fetchTransport;
    this.clock = options.clock ?? systemClock;
    this.logger = options.logger ?? noopLogger;
    this.policy = options.retryPolicy ?? defaultRetryPolicy;
    this.random = options.random ?? Math.random;
    this.connectivity = options.connectivity ?? new Connectivity();
    this.contractVersion = options.contractVersion;
    this.culture = options.culture;
    this.timeZone = options.timeZone;
    this.repairTimestamps = options.repairTimestamps ?? true;
  }

  get baseUrl(): string {
    return this.options.baseUrl;
  }

  /**
   * The session and the pipeline each need the other — the pipeline asks for a
   * token, the session sends its login and refresh requests through the
   * pipeline — so one of them is wired up after construction. It is this one,
   * because a client with no session at all is a legitimate configuration
   * (a public health endpoint, a conformance fixture).
   */
  setSession(session: AuthSession<unknown> | undefined): void {
    this.options.session = session;
  }

  setCulture(culture: string | undefined): void {
    this.culture = culture;
  }

  getCulture(): string | undefined {
    return this.culture;
  }

  setTimeZone(timeZone: string | undefined): void {
    this.timeZone = timeZone;
  }

  getTimeZone(): string | undefined {
    return this.timeZone;
  }

  async request<T = unknown>(spec: RequestSpec): Promise<HttpResponse<T>> {
    const url = joinUrl(this.options.baseUrl, spec.path) + buildQuery(spec.query);
    const encoded = encodeBody(spec);
    const policy: RetryPolicy | null =
      spec.retry === false ? null : { ...this.policy, ...(spec.retry ?? {}) };
    const deadlineMs = spec.deadlineMs ?? policy?.deadlineMs;
    const startedAt = this.clock.now();
    const deadlineAt = deadlineMs === undefined ? null : startedAt + deadlineMs;

    if (spec.requiresOnline && this.connectivity.isOffline) {
      // §01 OF-2 — no write queue. An operator who believes they completed an
      // alarm that never left the browser is a worse failure than one who is
      // told to wait.
      throw new OfflineError('The request was not sent: this client is offline', {
        status: 0,
        problem: { status: 0, code: 'CLIENT.OFFLINE', title: 'Offline' },
        method: spec.method,
        url,
        ...(spec.operationId ? { operationId: spec.operationId } : {}),
      });
    }

    const retryable = spec.idempotent ?? isIdempotent(spec.method);
    let attempt = 0;
    let authReplayed = false;

    for (;;) {
      attempt += 1;
      // A screen that navigated away before the first attempt should cost
      // nothing at all (§01 RT-6).
      if (spec.signal?.aborted) throw this.abortedError(spec, url, spec.signal.reason);

      const remaining = deadlineAt === null ? null : deadlineAt - this.clock.now();
      if (remaining !== null && remaining <= 0) throw this.deadlineError(spec, url, deadlineMs!);

      const accessToken = spec.anonymous ? null : ((await this.options.session?.getAccessToken()) ?? null);
      const headers = await this.buildHeaders(spec, encoded, accessToken);

      const deadlineController = new AbortController();
      const timer =
        remaining === null
          ? null
          : setTimeout(() => deadlineController.abort(this.deadlineError(spec, url, deadlineMs!)), remaining);
      const combined = combineSignals([spec.signal, deadlineController.signal]);
      const attemptStartedAt = this.clock.now();

      let response: Response;
      try {
        response = await this.send({ url, spec, headers, body: encoded.body, signal: combined.signal });
        this.connectivity.reportSuccess();
      } catch (error) {
        if (timer !== null) clearTimeout(timer);
        combined.dispose();

        if (deadlineController.signal.aborted && !spec.signal?.aborted) {
          throw deadlineController.signal.reason ?? this.deadlineError(spec, url, deadlineMs ?? 0);
        }
        if (isAbortError(error) || spec.signal?.aborted) throw this.abortedError(spec, url, error);

        this.connectivity.reportTransportFailure();
        const failure = transportError(error, {
          method: spec.method,
          url,
          ...(spec.operationId ? { operationId: spec.operationId } : {}),
        });
        const delay = this.nextDelay(policy, attempt, retryable, null, deadlineAt);
        if (delay === null) throw failure;
        this.logRetry(spec, url, attempt, delay, failure);
        await this.clock.sleep(delay, spec.signal);
        continue;
      }

      if (timer !== null) clearTimeout(timer);
      combined.dispose();
      const durationMs = this.clock.now() - attemptStartedAt;

      if (response.status === 304 && spec.allowNotModified) {
        this.logDone(spec, url, response.status, durationMs);
        return this.emptyResponse<T>(response, true);
      }

      if (response.ok) {
        this.logDone(spec, url, response.status, durationMs);
        return await this.readSuccess<T>(response, spec);
      }

      // In raw mode the caller may still want the body; read the error out of a
      // clone so the original stays intact.
      const problemBody = await readBodyText(spec.responseType === 'raw' ? response.clone() : response);
      const problem = parseProblem(response.status, problemBody, response.statusText);
      if (!problem.correlationId) {
        const header = response.headers.get(CORRELATION_HEADER);
        if (header) problem.correlationId = header;
      }
      const retryAfterMs = parseRetryAfter(response.headers.get('retry-after'), this.clock.now());
      const error = errorForStatus(response.status, problem, {
        method: spec.method,
        url,
        ...(spec.operationId ? { operationId: spec.operationId } : {}),
        ...(retryAfterMs !== null ? { retryAfterMs } : {}),
      });

      // §01 A-4 — refresh once, replay once. The replay is not a retry: it does
      // not consume a retry attempt and does not require idempotency, because
      // the original request never reached the handler.
      if (
        response.status === 401 &&
        !spec.anonymous &&
        !authReplayed &&
        this.options.session &&
        (await this.options.session.handleUnauthorized(problem, accessToken))
      ) {
        authReplayed = true;
        attempt -= 1;
        this.logger.log(
          logEvent('info', 'replaying request after token refresh', {
            event: 'token.replay',
            ...(spec.operationId ? { operationId: spec.operationId } : {}),
            url,
          }),
        );
        continue;
      }

      const delay = this.nextDelay(policy, attempt, retryable, error, deadlineAt);
      if (delay === null) {
        this.logFailure(spec, url, error, durationMs);
        throw error;
      }
      this.logRetry(spec, url, attempt, delay, error);
      await this.clock.sleep(delay, spec.signal);
    }
  }

  /**
   * A `fetch`-shaped entry point, so a generated transport layer can be routed
   * through this pipeline without knowing it exists. `openapi-generator`'s
   * `Configuration.fetchApi` takes exactly this signature.
   *
   * Non-2xx still throws a typed `ApiError`; the generated `BaseAPI` wraps it
   * in its own `FetchError`, and `unwrapApiError` in `src/armikom` unwraps it
   * again so callers never see the generator's error types.
   */
  fetch = async (url: string, init: RequestInit = {}): Promise<Response> => {
    const method = ((init.method ?? 'GET').toUpperCase() as HttpMethod);
    const headers: Record<string, string | undefined> = {};
    new Headers(init.headers ?? {}).forEach((value, key) => {
      headers[key] = value;
    });
    const response = await this.request<Response>({
      method,
      path: url,
      headers,
      ...(init.body !== undefined && init.body !== null ? { body: init.body } : {}),
      ...(init.signal ? { signal: init.signal } : {}),
      responseType: 'raw',
      anonymous: isAnonymousPath(url),
    });
    return this.repairTimestamps ? await repairResponseTimestamps(response.data) : response.data;
  };

  /** Convenience wrapper for the common case: a JSON response you just want the body of. */
  async json<T = unknown>(spec: RequestSpec): Promise<T> {
    const response = await this.request<T>({ ...spec, responseType: spec.responseType ?? 'json' });
    return response.data;
  }

  private send(input: {
    url: string;
    spec: RequestSpec;
    headers: Record<string, string>;
    body: BodyInit | null | undefined;
    signal: AbortSignal;
  }): Promise<Response> {
    // `fetch` still cannot report upload progress; only ask for the XHR
    // transport when a caller actually wants it (§01 F-1).
    const transport = input.spec.onUploadProgress ? xhrTransport : this.transport;
    return transport({
      url: input.url,
      method: input.spec.method,
      headers: input.headers,
      ...(input.body !== undefined ? { body: input.body } : {}),
      signal: input.signal,
      ...(input.spec.onUploadProgress ? { onUploadProgress: input.spec.onUploadProgress } : {}),
      ...(this.options.credentials ? { credentials: this.options.credentials } : {}),
    });
  }

  private async buildHeaders(
    spec: RequestSpec,
    encoded: EncodedBody,
    accessToken: string | null,
  ): Promise<Record<string, string>> {
    const headers: Record<string, string> = { ...this.options.defaultHeaders };

    headers['Accept'] = spec.accept ?? defaultAccept(spec.responseType);
    // §01 R-2. Never sent as `*` — an absent culture means "server default",
    // which is not the same request.
    const culture = spec.culture ?? this.culture;
    if (culture) headers['Accept-Language'] = culture;

    if (this.options.userAgent) {
      // Browsers refuse `User-Agent` as a forbidden header name; the fetch call
      // would throw rather than drop it, so the browser-safe header carries it.
      if (!isBrowser()) headers['User-Agent'] = this.options.userAgent;
      headers['X-Armikom-Client'] = this.options.userAgent;
    }
    if (this.contractVersion) headers['X-Armikom-Contract'] = this.contractVersion;
    if (encoded.contentType) headers['Content-Type'] = encoded.contentType;
    if (spec.idempotencyKey) headers['Idempotency-Key'] = spec.idempotencyKey;
    if (spec.ifNoneMatch) headers['If-None-Match'] = spec.ifNoneMatch;
    if (accessToken) headers['Authorization'] = `Bearer ${accessToken}`;

    for (const [key, value] of Object.entries(spec.headers ?? {})) {
      if (value === undefined) delete headers[key];
      else headers[key] = value;
    }
    return headers;
  }

  /** Returns the delay to wait, or null when this attempt is the last. */
  private nextDelay(
    policy: RetryPolicy | null,
    attempt: number,
    methodIsRetryable: boolean,
    error: ApiError | null,
    deadlineAt: number | null,
  ): number | null {
    if (!policy) return null;
    if (attempt >= policy.maxAttempts) return null;
    // §01 RT-1/RT-2 — retryable *class* and retryable *method*, both required.
    if (error && !error.retryable) return null;
    if (!methodIsRetryable) return null;

    const delay = backoffDelay({
      attempt,
      policy,
      retryAfterMs: error?.retryAfterMs ?? null,
      random: this.random,
    });
    // §01 RT-5 — never sleep past the deadline just to fail on the other side of it.
    if (deadlineAt !== null && this.clock.now() + delay >= deadlineAt) return null;
    return delay;
  }

  private async readSuccess<T>(response: Response, spec: RequestSpec): Promise<HttpResponse<T>> {
    const kind = spec.responseType ?? 'json';
    const etag = response.headers.get('etag');
    const correlationId = response.headers.get(CORRELATION_HEADER);
    const base = {
      status: response.status,
      headers: response.headers,
      etag,
      notModified: false,
      correlationId,
    };

    if (kind === 'raw') return { ...base, data: response as T };
    if (kind === 'void' || response.status === 204 || response.status === 205) {
      return { ...base, data: undefined as T };
    }
    if (kind === 'stream') return { ...base, data: response.body as T };
    if (kind === 'blob') return { ...base, data: (await response.blob()) as T };
    if (kind === 'text') return { ...base, data: (await response.text()) as T };

    const text = await response.text();
    if (!text) return { ...base, data: undefined as T };
    try {
      const parsed = JSON.parse(text) as T;
      return { ...base, data: this.repairTimestamps ? markTimestampsUtc(parsed) : parsed };
    } catch (error) {
      // §01 E-6 / C-08 — a success status with a body that is not JSON is still
      // a failure the caller can act on, not a parse crash.
      throw new ApiError('The response body was not valid JSON', {
        status: response.status,
        problem: parseProblem(response.status, text, 'Malformed response'),
        method: spec.method,
        url: response.url,
        ...(spec.operationId ? { operationId: spec.operationId } : {}),
        cause: error,
      });
    }
  }

  private emptyResponse<T>(response: Response, notModified: boolean): HttpResponse<T> {
    return {
      data: undefined as T,
      status: response.status,
      headers: response.headers,
      etag: response.headers.get('etag'),
      notModified,
      correlationId: response.headers.get(CORRELATION_HEADER),
    };
  }

  private abortedError(spec: RequestSpec, url: string, cause: unknown): RequestAbortedError {
    return new RequestAbortedError('The request was cancelled', {
      status: 0,
      problem: { status: 0, code: 'CLIENT.ABORTED', title: 'Cancelled' },
      method: spec.method,
      url,
      ...(spec.operationId ? { operationId: spec.operationId } : {}),
      cause,
    });
  }

  private deadlineError(spec: RequestSpec, url: string, deadlineMs: number): DeadlineExceededError {
    return new DeadlineExceededError(`The call exceeded its ${deadlineMs} ms deadline`, {
      status: 0,
      problem: { status: 0, code: 'CLIENT.DEADLINE_EXCEEDED', title: 'Deadline exceeded' },
      method: spec.method,
      url,
      ...(spec.operationId ? { operationId: spec.operationId } : {}),
    });
  }

  private logDone(spec: RequestSpec, url: string, status: number, durationMs: number): void {
    this.logger.log(
      logEvent('debug', `${spec.method} ${url} -> ${status}`, {
        event: 'request',
        ...(spec.operationId ? { operationId: spec.operationId } : {}),
        status,
        durationMs,
        url,
      }),
    );
  }

  private logFailure(spec: RequestSpec, url: string, error: ApiError, durationMs: number): void {
    // §01 O-2 — every failed request carries the correlation id, or support
    // cannot trace the incident.
    this.logger.log(
      logEvent('error', error.toString(), {
        event: 'request',
        ...(spec.operationId ? { operationId: spec.operationId } : {}),
        ...(error.correlationId ? { correlationId: error.correlationId } : {}),
        status: error.status,
        durationMs,
        url,
        data: { code: error.code },
      }),
    );
  }

  private logRetry(spec: RequestSpec, url: string, attempt: number, delayMs: number, error: ApiError): void {
    this.logger.log(
      logEvent('warn', `retrying after ${error.status || 'transport failure'}`, {
        event: 'retry',
        ...(spec.operationId ? { operationId: spec.operationId } : {}),
        ...(error.correlationId ? { correlationId: error.correlationId } : {}),
        status: error.status,
        url,
        data: { attempt, delayMs, code: error.code },
      }),
    );
  }
}

interface EncodedBody {
  body: BodyInit | null | undefined;
  contentType: string | undefined;
}

/**
 * §01 A-8 — the body is encoded once, before the attempt loop, so a replay
 * after refresh re-sends bytes rather than re-consuming a stream.
 *
 * §01 F-2 — `FormData` deliberately carries no explicit `Content-Type`: the
 * boundary is the transport's to set, and the server detects the *file's* type
 * from magic bytes rather than trusting the client.
 */
function encodeBody(spec: RequestSpec): EncodedBody {
  const body = spec.body;
  if (body === undefined || body === null) return { body: undefined, contentType: undefined };
  if (typeof FormData !== 'undefined' && body instanceof FormData) return { body, contentType: undefined };
  if (typeof Blob !== 'undefined' && body instanceof Blob) {
    return { body, contentType: spec.contentType ?? undefined };
  }
  if (body instanceof URLSearchParams) {
    return { body, contentType: spec.contentType ?? 'application/x-www-form-urlencoded;charset=UTF-8' };
  }
  if (body instanceof ArrayBuffer || ArrayBuffer.isView(body)) {
    return { body: body as BodyInit, contentType: spec.contentType ?? 'application/octet-stream' };
  }
  if (typeof body === 'string') return { body, contentType: spec.contentType ?? 'text/plain;charset=UTF-8' };
  return { body: JSON.stringify(body), contentType: spec.contentType ?? 'application/json' };
}

function defaultAccept(kind: ResponseKind | undefined): string {
  // §01 R-1.
  if (kind === 'blob' || kind === 'stream') return '*/*';
  if (kind === 'text') return 'text/plain, application/json;q=0.9, */*;q=0.8';
  return 'application/json';
}

async function readBodyText(response: Response): Promise<string> {
  try {
    return await response.text();
  } catch {
    // A truncated or already-consumed error body must not mask the status.
    return '';
  }
}

/**
 * §01 A-1 — the four operations that must not carry `Authorization`.
 * Matched on the path because the generated transport has no operationId by
 * the time it reaches `fetch`.
 */
const ANONYMOUS_PATHS = [/\/v1\/auth\/login$/, /\/v1\/auth\/refresh$/, /\/v1\/i18n(\/|$)/];

export function isAnonymousPath(url: string): boolean {
  const path = url.split('?')[0] ?? url;
  return ANONYMOUS_PATHS.some((re) => re.test(path));
}

/**
 * Rewrites a JSON response body so offset-less timestamps carry their `Z`.
 *
 * A new `Response` rather than an in-place edit, because the generated
 * transport reads the body itself and a stream can only be consumed once. Only
 * JSON is touched: a blob download must reach the caller byte-identical.
 */
async function repairResponseTimestamps(response: Response): Promise<Response> {
  const contentType = response.headers.get('content-type') ?? '';
  if (!/\bjson\b/i.test(contentType) || response.status === 204 || response.status === 304) return response;

  const text = await response.clone().text();
  if (!text) return response;
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    // Not JSON despite the header. Hand back the original; the error path
    // upstream is what turns a malformed body into a typed failure.
    return response;
  }
  const repaired = JSON.stringify(markTimestampsUtc(parsed));
  if (repaired === text) return response;
  return new Response(repaired, {
    status: response.status,
    statusText: response.statusText,
    headers: response.headers,
  });
}

function isBrowser(): boolean {
  return typeof (globalThis as { document?: unknown }).document !== 'undefined';
}

