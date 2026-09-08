/**
 * §01 O-4 — batched, best-effort telemetry.
 *
 * Pulled up from the Voice.Cloud console's `LoggerService`, which had already
 * learned the three things that make this work in a browser: batch on a timer,
 * flush errors immediately, and use `sendBeacon` on `visibilitychange` because
 * `beforeunload` alone loses the buffer when a phone backgrounds the tab.
 *
 * The rule that governs everything here is that telemetry must not be able to
 * degrade alarm handling: never retried aggressively, never blocking, silently
 * dropped on failure.
 */
import { type LogEvent, type Logger, redact } from './logger.js';

export interface BatchSinkOptions {
  /** Where the batch goes. Receives already-redacted events. */
  send: (events: readonly LogEvent[]) => Promise<void> | void;
  /**
   * Fire-and-forget variant used when the page is going away. `sendBeacon`
   * queues the payload with the browser and survives the unload; a `fetch`
   * started at that moment does not.
   */
  sendBeacon?: (events: readonly LogEvent[]) => boolean;
  maxBatchSize?: number;
  flushIntervalMs?: number;
  /** Hard cap so a disconnected client cannot grow the buffer without bound. */
  maxBufferSize?: number;
  /** Errors are shipped as they happen, not on the next tick. Default true. */
  flushOnError?: boolean;
}

export class BatchedLogSink implements Logger {
  private buffer: LogEvent[] = [];
  private timer: ReturnType<typeof setInterval> | null = null;
  private readonly options: Required<Omit<BatchSinkOptions, 'send' | 'sendBeacon'>> &
    Pick<BatchSinkOptions, 'send' | 'sendBeacon'>;
  private disposers: Array<() => void> = [];
  private sending = false;

  constructor(options: BatchSinkOptions) {
    this.options = {
      maxBatchSize: options.maxBatchSize ?? 20,
      flushIntervalMs: options.flushIntervalMs ?? 3_000,
      maxBufferSize: options.maxBufferSize ?? 500,
      flushOnError: options.flushOnError ?? true,
      send: options.send,
      ...(options.sendBeacon ? { sendBeacon: options.sendBeacon } : {}),
    };
    this.start();
  }

  log(event: LogEvent): void {
    this.buffer.push(redact(event));
    if (this.buffer.length > this.options.maxBufferSize) {
      // Drop the oldest: the newest events are the ones describing the failure
      // someone is about to ask about.
      this.buffer.splice(0, this.buffer.length - this.options.maxBufferSize);
    }
    if (event.level === 'error' && this.options.flushOnError) void this.flush();
    else if (this.buffer.length >= this.options.maxBatchSize) void this.flush();
  }

  async flush(): Promise<void> {
    if (this.sending || this.buffer.length === 0) return;
    const batch = this.buffer;
    this.buffer = [];
    this.sending = true;
    try {
      await this.options.send(batch);
    } catch {
      // Dropped on purpose. Re-queuing a failed batch is how a log shipper
      // turns a backend outage into an unbounded client-side memory leak, and
      // then into a retry storm when the backend comes back.
    } finally {
      this.sending = false;
    }
  }

  /** Best-effort final flush; safe to call when the document is being torn down. */
  flushSync(): void {
    if (this.buffer.length === 0) return;
    const batch = this.buffer;
    this.buffer = [];
    if (this.options.sendBeacon?.(batch)) return;
    void Promise.resolve(this.options.send(batch)).catch(() => undefined);
  }

  dispose(): void {
    this.flushSync();
    if (this.timer !== null) clearInterval(this.timer);
    this.timer = null;
    for (const off of this.disposers) off();
    this.disposers = [];
  }

  private start(): void {
    this.timer = setInterval(() => void this.flush(), this.options.flushIntervalMs);
    // Node: an interval that keeps the process alive for a log shipper is a bug.
    (this.timer as unknown as { unref?: () => void }).unref?.();

    const doc = (globalThis as { document?: Document }).document;
    const win = (globalThis as { addEventListener?: typeof addEventListener; removeEventListener?: typeof removeEventListener });
    if (doc && win.addEventListener) {
      const onHidden = () => {
        if (doc.visibilityState === 'hidden') this.flushSync();
      };
      const onUnload = () => this.flushSync();
      doc.addEventListener('visibilitychange', onHidden);
      win.addEventListener('pagehide', onUnload);
      this.disposers.push(() => doc.removeEventListener('visibilitychange', onHidden));
      this.disposers.push(() => win.removeEventListener?.('pagehide', onUnload));
    }
  }
}

/** `navigator.sendBeacon` wrapper; returns false where it is unavailable or refused. */
export function beaconSender(url: string): (events: readonly LogEvent[]) => boolean {
  return (events) => {
    const nav = (globalThis as { navigator?: Navigator }).navigator;
    if (!nav?.sendBeacon) return false;
    try {
      const blob = new Blob([JSON.stringify({ logs: events })], { type: 'application/json' });
      return nav.sendBeacon(url, blob);
    } catch {
      return false;
    }
  };
}
