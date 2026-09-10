/**
 * §01 §12 — realtime over Server-Sent Events.
 *
 * Three of these rules are the ones that make the difference between a stream
 * that looks like it works and one that does:
 *
 *   S-9  a `resync` on *every* open, including the first. The endpoint has no
 *        event ids and no replay, so anything published while the connection
 *        was down is simply gone. Consumers re-read their working set.
 *   S-8  a keep-alive watchdog. Silent half-open TCP behind an ingress is the
 *        normal failure mode, not an exotic one; without the watchdog the
 *        client sits on a dead socket indefinitely believing it is live.
 *   S-10 the polling fallback must announce itself. During finding F16 the
 *        stream delivered nothing to any scoped principal for weeks and the
 *        fallback masked it completely. Silent fallback is forbidden.
 */
import type { Clock } from './clock.js';
import { systemClock } from './clock.js';
import type { Connectivity } from './connectivity.js';
import { parseProblem, StreamCodes } from './errors.js';
import { logEvent, noopLogger, type Logger } from './logger.js';
import { Emitter, Store, coalesce, type Unsubscribe } from './observable.js';
import { backoffDelay, defaultStreamBackoff, type RetryPolicy } from './retry.js';
import { SseParser, type SseFrame } from './sse.js';
import { combineSignals, fetchTransport, isAbortError, joinUrl, type QueryParams, type Transport } from './transport.js';
import { buildQuery } from './transport.js';

export type StreamStatus =
  | 'idle'
  | 'connecting'
  | 'open'
  | 'reconnecting'
  /** §01 S-6 — terminal. Mobile principals and scope-less users must not loop. */
  | 'forbidden'
  /** §01 S-7 — too many tabs. The fix is a user action, not a retry. */
  | 'rate-limited'
  | 'closed';

export interface StreamEvent<T = unknown> {
  name: string;
  /** Parsed JSON, or the raw string when the payload was not JSON. */
  data: T;
  raw: string;
  id: string | null;
}

export interface EventStreamOptions {
  /** Absolute, or relative to `baseUrl`. */
  path: string;
  baseUrl?: string;
  query?: QueryParams;
  /** §01 S-11 — called per connect, so a reconnect after refresh carries a fresh token. */
  getAccessToken?: () => Promise<string | null> | string | null;
  transport?: Transport;
  clock?: Clock;
  logger?: Logger;
  backoff?: RetryPolicy;
  /** §01 S-8 — 2.5 × the 25 s server heartbeat. */
  keepAliveTimeoutMs?: number;
  /** §01 S-7 — the floor applied after `STREAM.TOO_MANY_CONNECTIONS`. */
  rateLimitBackoffMs?: number;
  connectivity?: Connectivity;
  culture?: string;
  random?: () => number;
  headers?: Record<string, string>;
}

export class EventStream {
  readonly status = new Store<StreamStatus>('idle');
  /** §01 S-9 / C-19 — fires on every successful open. */
  readonly resync = new Emitter<void>();
  readonly errors = new Emitter<Error>();

  private readonly listeners = new Map<string, Set<(event: StreamEvent) => void>>();
  private readonly anyListeners = new Set<(event: StreamEvent) => void>();
  private readonly options: EventStreamOptions;
  private readonly clock: Clock;
  private readonly logger: Logger;
  private readonly backoff: RetryPolicy;
  private readonly keepAliveMs: number;
  private readonly random: () => number;

  private controller: AbortController | null = null;
  private running = false;
  private attempt = 0;
  private loop: Promise<void> | null = null;

  constructor(options: EventStreamOptions) {
    this.options = options;
    this.clock = options.clock ?? systemClock;
    this.logger = options.logger ?? noopLogger;
    this.backoff = options.backoff ?? defaultStreamBackoff;
    this.keepAliveMs = options.keepAliveTimeoutMs ?? 62_000;
    this.random = options.random ?? Math.random;
  }

  get isOpen(): boolean {
    return this.status.get() === 'open';
  }

  /** §01 S-1 — one callback per event name. Returns an unsubscribe. */
  on<T = unknown>(name: string, listener: (event: StreamEvent<T>) => void): Unsubscribe {
    let set = this.listeners.get(name);
    if (!set) {
      set = new Set();
      this.listeners.set(name, set);
    }
    const typed = listener as (event: StreamEvent) => void;
    set.add(typed);
    return () => {
      set?.delete(typed);
    };
  }

  onAny(listener: (event: StreamEvent) => void): Unsubscribe {
    this.anyListeners.add(listener);
    return () => {
      this.anyListeners.delete(listener);
    };
  }

  onStatusChanged(listener: (status: StreamStatus) => void): Unsubscribe {
    return this.status.subscribe(listener);
  }

  onResync(listener: () => void): Unsubscribe {
    return this.resync.on(listener);
  }

  /**
   * §01 S-3 / C-17 — subscribe to a nudge and get one coalesced re-read per
   * burst. `alarm-list-updated` arrives per event; during a storm that is
   * dozens a second, and a re-read each would have the client DOS itself.
   *
   * The re-read also fires on `resync`, because a reconnect means the nudges
   * that arrived while the socket was down were never delivered at all.
   */
  onNudge(name: string, reread: () => void, debounceMs = 300): Unsubscribe {
    const trigger = coalesce(reread, debounceMs);
    const offEvent = this.on(name, () => trigger());
    const offResync = this.resync.on(() => trigger());
    return () => {
      trigger.cancel();
      offEvent();
      offResync();
    };
  }

  start(): void {
    if (this.running) return;
    this.running = true;
    this.attempt = 0;
    this.loop = this.run();
  }

  stop(): void {
    this.running = false;
    this.controller?.abort();
    this.controller = null;
    this.status.set('closed');
  }

  /** Resolves once the connection loop has actually finished. For tests and teardown. */
  async dispose(): Promise<void> {
    this.stop();
    await this.loop?.catch(() => undefined);
  }

  private async run(): Promise<void> {
    while (this.running) {
      this.status.set(this.attempt === 0 ? 'connecting' : 'reconnecting');
      let terminal = false;
      let rateLimited = false;

      try {
        await this.connect();
        // A clean end of stream is still a disconnect: reconnect, and resync.
        this.attempt = 0;
      } catch (error) {
        if (!this.running) break;
        if (error instanceof StreamForbidden) {
          // §01 S-6 / C-21 — stop permanently.
          this.status.set('forbidden');
          this.logger.log(logEvent('warn', 'stream forbidden; not reconnecting', { event: 'sse.forbidden' }));
          terminal = true;
        } else if (error instanceof StreamRateLimited) {
          rateLimited = true;
          this.status.set('rate-limited');
        } else {
          this.attempt += 1;
          this.errors.emit(error instanceof Error ? error : new Error(String(error)));
        }
      }

      this.options.connectivity?.reportStream(false);
      if (terminal) {
        this.running = false;
        return;
      }
      if (!this.running) break;

      const delay = rateLimited
        ? Math.max(
            this.options.rateLimitBackoffMs ?? 30_000,
            backoffDelay({ attempt: Math.max(1, this.attempt), policy: this.backoff, random: this.random }),
          )
        : backoffDelay({ attempt: Math.max(1, this.attempt), policy: this.backoff, random: this.random });

      try {
        await this.clock.sleep(delay);
      } catch {
        return;
      }
    }
    this.status.set('closed');
  }

  private async connect(): Promise<void> {
    const controller = new AbortController();
    this.controller = controller;

    const token = await this.options.getAccessToken?.();
    const headers: Record<string, string> = {
      Accept: 'text/event-stream',
      'Cache-Control': 'no-cache',
      ...this.options.headers,
    };
    if (this.options.culture) headers['Accept-Language'] = this.options.culture;
    // The whole reason this is not an `EventSource` (§01 12.3).
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const url = joinUrl(this.options.baseUrl ?? '', this.options.path) + buildQuery(this.options.query);
    const transport = this.options.transport ?? fetchTransport;
    const response = await transport({ url, method: 'GET', headers, signal: controller.signal });

    if (!response.ok) {
      const body = await safeText(response);
      const problem = parseProblem(response.status, body, response.statusText);
      if (response.status === 403) throw new StreamForbidden(problem.code ?? StreamCodes.MOBILE_NOT_ALLOWED);
      if (response.status === 429) throw new StreamRateLimited(problem.code ?? StreamCodes.TOO_MANY_CONNECTIONS);
      throw new Error(`stream failed: ${response.status} ${problem.title ?? ''}`.trim());
    }
    if (!response.body) throw new Error('stream response carried no body');

    this.attempt = 0;
    this.status.set('open');
    this.options.connectivity?.reportStream(true);
    this.logger.log(logEvent('info', 'stream open', { event: 'sse.open', url }));
    // §01 S-9 / C-19 — before any event is delivered, because the consumer's
    // working set is stale the moment the socket was down.
    this.resync.emit();

    await this.readFrames(response.body, controller);
  }

  private async readFrames(body: ReadableStream<Uint8Array>, controller: AbortController): Promise<void> {
    const reader = body.getReader();
    const decoder = new TextDecoder();
    const parser = new SseParser();

    // §01 S-8 / C-22 — nothing at all for 2.5 heartbeats means the socket is
    // dead however healthy it looks. Comments count as traffic.
    let watchdog: ReturnType<typeof setTimeout> | null = null;
    const armWatchdog = () => {
      if (watchdog !== null) clearTimeout(watchdog);
      watchdog = setTimeout(() => {
        this.logger.log(logEvent('warn', 'stream keep-alive missed; reconnecting', { event: 'sse.watchdog' }));
        controller.abort();
      }, this.keepAliveMs);
      (watchdog as unknown as { unref?: () => void }).unref?.();
    };
    parser.onComment = () => armWatchdog();
    armWatchdog();

    try {
      for (;;) {
        const { done, value } = await reader.read();
        if (done) return;
        armWatchdog();
        for (const frame of parser.push(decoder.decode(value, { stream: true }))) this.dispatch(frame);
      }
    } catch (error) {
      if (isAbortError(error) || controller.signal.aborted) return;
      throw error;
    } finally {
      if (watchdog !== null) clearTimeout(watchdog);
      try {
        await reader.cancel();
      } catch {
        // The reader is already dead; that is why we are here.
      }
    }
  }

  private dispatch(frame: SseFrame): void {
    // §01 S-4 / C-18 — `pbx-ringing` forwards raw bus JSON. One unparseable
    // payload must not fail the stream or stop the events behind it, so the
    // raw string is delivered instead of the parse result.
    let data: unknown = frame.data;
    if (frame.data) {
      try {
        data = JSON.parse(frame.data);
      } catch {
        data = frame.data;
      }
    } else {
      // §01 S-2 / D23 — `alarm-list-updated` carries `{}` by design. It is a
      // nudge; there is no state to parse out of it.
      data = {};
    }

    const event: StreamEvent = { name: frame.event, data, raw: frame.data, id: frame.id };
    for (const listener of [...(this.listeners.get(frame.event) ?? [])]) {
      try {
        listener(event);
      } catch (error) {
        this.errors.emit(error instanceof Error ? error : new Error(String(error)));
      }
    }
    for (const listener of [...this.anyListeners]) {
      try {
        listener(event);
      } catch (error) {
        this.errors.emit(error instanceof Error ? error : new Error(String(error)));
      }
    }
  }
}

class StreamForbidden extends Error {
  constructor(readonly code: string) {
    super(`stream forbidden (${code})`);
    this.name = 'StreamForbidden';
  }
}

class StreamRateLimited extends Error {
  constructor(readonly code: string) {
    super(`stream rate limited (${code})`);
    this.name = 'StreamRateLimited';
  }
}

export type FeedMode = 'live' | 'polling' | 'stopped';

export interface PollingFallbackOptions {
  stream: EventStream;
  poll: () => void | Promise<void>;
  intervalMs?: number;
  clock?: Clock;
  logger?: Logger;
}

/**
 * §01 S-10 — polls only while the stream is not open, and reports which mode is
 * active so the UI can show "live" versus "polling".
 *
 * The mode is not a diagnostic nicety. F16 was weeks of a dead stream hidden
 * behind a working fallback; the only thing that would have surfaced it was a
 * badge saying the console had been polling since Tuesday.
 */
export class PollingFallback {
  readonly mode = new Store<FeedMode>('stopped');

  private timer: ReturnType<typeof setInterval> | null = null;
  private offStatus: Unsubscribe | null = null;
  private readonly intervalMs: number;
  private readonly logger: Logger;

  constructor(private readonly options: PollingFallbackOptions) {
    this.intervalMs = options.intervalMs ?? 5_000;
    this.logger = options.logger ?? noopLogger;
  }

  start(): void {
    if (this.offStatus) return;
    this.offStatus = this.options.stream.onStatusChanged((status) => this.apply(status));
    this.apply(this.options.stream.status.get());
  }

  stop(): void {
    this.offStatus?.();
    this.offStatus = null;
    this.clearTimer();
    this.mode.set('stopped');
  }

  private apply(status: StreamStatus): void {
    if (status === 'open') {
      this.clearTimer();
      if (this.mode.get() !== 'live') {
        this.logger.log(logEvent('info', 'feed is live', { event: 'feed.mode', data: { mode: 'live' } }));
      }
      this.mode.set('live');
      return;
    }
    if (status === 'closed' && this.timer === null && this.mode.get() === 'stopped') return;

    if (this.timer === null) {
      this.logger.log(
        logEvent('warn', 'feed fell back to polling', { event: 'feed.mode', data: { mode: 'polling', status } }),
      );
      this.timer = setInterval(() => void this.options.poll(), this.intervalMs);
      (this.timer as unknown as { unref?: () => void }).unref?.();
      void this.options.poll();
    }
    this.mode.set('polling');
  }

  private clearTimer(): void {
    if (this.timer !== null) clearInterval(this.timer);
    this.timer = null;
  }
}

async function safeText(response: Response): Promise<string> {
  try {
    return await response.text();
  } catch {
    return '';
  }
}

