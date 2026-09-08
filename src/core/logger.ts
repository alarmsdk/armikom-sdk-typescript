/**
 * §01 §13 — observability.
 *
 * O-3 / C-05 is not advisory. `LoginRequest.password`, refresh tokens,
 * `safePassword` on `SideDetailResponse` and subscriber phone numbers all pass
 * through this layer, and a log shipper is exactly the component that copies
 * them somewhere they were never meant to go. Redaction happens here, once,
 * rather than at every call site.
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogEvent {
  level: LogLevel;
  message: string;
  /** Machine-readable event name: `request`, `retry`, `token.refresh`, `sse.status`, `cache`. */
  event?: string;
  operationId?: string;
  correlationId?: string;
  durationMs?: number;
  status?: number;
  component?: string;
  url?: string;
  exception?: string;
  timestamp: string;
  data?: Record<string, unknown>;
}

export interface Logger {
  log(event: LogEvent): void;
}

export const noopLogger: Logger = { log: () => undefined };

export interface ConsoleLoggerOptions {
  prefix?: string;
  /** Events below this level are dropped. Default `info`. */
  level?: LogLevel;
}

const ORDER: Record<LogLevel, number> = { debug: 10, info: 20, warn: 30, error: 40 };

export class ConsoleLogger implements Logger {
  private readonly prefix: string;
  private readonly threshold: number;

  constructor(options: ConsoleLoggerOptions = {}) {
    this.prefix = options.prefix ?? '[armikom]';
    this.threshold = ORDER[options.level ?? 'info'];
  }

  log(event: LogEvent): void {
    if (ORDER[event.level] < this.threshold) return;
    const tag = `${this.prefix}${event.component ? ` [${event.component}]` : ''}${event.event ? ` ${event.event}` : ''}`;
    const detail = redact(event.data ?? {});
    // The message and the stack are scrubbed too: the most common leak is a
    // credential interpolated into a message, not one assigned to a field
    // called `token` (§01 O-3 / C-05).
    const message = scrubText(event.message);
    const exception = event.exception ? scrubText(event.exception) : '';
    if (event.level === 'error') console.error(tag, message, exception, detail);
    else if (event.level === 'warn') console.warn(tag, message, detail);
    else console.log(tag, message, detail);
  }
}

/** Fans one event out to several sinks — console for the developer, a batched shipper for support. */
export class MultiLogger implements Logger {
  constructor(private readonly sinks: readonly Logger[]) {}

  log(event: LogEvent): void {
    for (const sink of this.sinks) {
      try {
        sink.log(event);
      } catch {
        // A failing log sink must never fail the operation that logged.
      }
    }
  }
}

const SECRET_KEY = /(pass|password|secret|token|authorization|apikey|api_key|credential|safepassword)/i;
const BEARER = /\bBearer\s+[A-Za-z0-9._~+/-]+=*/gi;
const JWT = /\beyJ[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]+/g;

export const REDACTED = '[redacted]';

/**
 * Removes credentials from anything on its way to a log. Deliberately
 * conservative: it redacts by key name *and* scrubs token-shaped substrings out
 * of free text, because the most common leak is a token pasted into a message
 * rather than assigned to a field called `token`.
 */
export function redact<T>(value: T, depth = 0): T {
  if (depth > 6) return REDACTED as unknown as T;
  if (typeof value === 'string') return scrubText(value) as unknown as T;
  if (Array.isArray(value)) return value.map((v) => redact(v, depth + 1)) as unknown as T;
  if (value && typeof value === 'object') {
    const out: Record<string, unknown> = {};
    for (const [key, v] of Object.entries(value as Record<string, unknown>)) {
      out[key] = SECRET_KEY.test(key) ? REDACTED : redact(v, depth + 1);
    }
    return out as unknown as T;
  }
  return value;
}

export function scrubText(text: string): string {
  return text.replace(BEARER, `Bearer ${REDACTED}`).replace(JWT, REDACTED);
}

export function logEvent(level: LogLevel, message: string, rest: Partial<LogEvent> = {}): LogEvent {
  return { level, message, timestamp: new Date().toISOString(), ...rest };
}
