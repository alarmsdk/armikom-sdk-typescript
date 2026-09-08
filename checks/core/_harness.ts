/**
 * Test doubles for the core runtime checks.
 *
 * The whole point of §01 B-2 (injectable clock) and B-1 (injectable transport)
 * is that these exist: every rule in the specification can be asserted without
 * a socket and without sleeping. A suite that needs 62 real seconds to check
 * the keep-alive watchdog is a suite that gets deleted.
 */
import { Transport, TransportRequest } from '../../src/core/transport.js';

export interface RecordedRequest {
  url: string;
  method: string;
  headers: Record<string, string>;
  body: BodyInit | null | undefined;
}

export interface ScriptedResponse {
  status?: number;
  body?: unknown;
  headers?: Record<string, string>;
  /** Throw instead of answering — a transport failure with no response. */
  throws?: unknown;
  /** Raw text body, for the malformed-payload cases. */
  text?: string;
}

/**
 * A transport driven by a queue of scripted responses, plus a full log of what
 * it was asked. The last scripted response repeats once the queue runs dry, so
 * a retry test does not have to script every attempt.
 */
export class MockTransport {
  readonly requests: RecordedRequest[] = [];
  private readonly queue: ScriptedResponse[] = [];
  private fallback: ScriptedResponse = { status: 200, body: {} };

  push(...responses: ScriptedResponse[]): this {
    this.queue.push(...responses);
    return this;
  }

  always(response: ScriptedResponse): this {
    this.fallback = response;
    return this;
  }

  /** How many times a path was requested — the assertion C-03 and C-17 need. */
  countFor(fragment: string): number {
    return this.requests.filter((r) => r.url.includes(fragment)).length;
  }

  lastRequest(): RecordedRequest | undefined {
    return this.requests[this.requests.length - 1];
  }

  readonly transport: Transport = async (request: TransportRequest) => {
    // `fetch` rejects on an already-aborted signal rather than sending; a
    // double that answers anyway would let a cancellation bug through.
    if (request.signal?.aborted) throw abortError(request.signal);
    this.requests.push({
      url: request.url,
      method: request.method,
      headers: { ...request.headers },
      body: request.body,
    });
    const scripted = this.queue.shift() ?? this.fallback;
    if (scripted.throws) throw scripted.throws;

    const status = scripted.status ?? 200;
    const headers = new Headers(scripted.headers ?? {});
    if (!headers.has('content-type') && scripted.text === undefined) {
      headers.set('content-type', 'application/json');
    }
    const body =
      status === 204 || status === 304
        ? null
        : scripted.text !== undefined
          ? scripted.text
          : JSON.stringify(scripted.body ?? {});
    return new Response(body, { status, headers });
  };
}

/** A transport that answers an SSE stream from a scripted list of chunks. */
export function sseTransport(options: {
  status?: number;
  headers?: Record<string, string>;
  chunks?: string[];
  /** Leaves the stream open after the chunks — for watchdog and abort tests. */
  keepOpen?: boolean;
  onConnect?: (request: TransportRequest) => void;
}): Transport {
  return async (request) => {
    options.onConnect?.(request);
    const status = options.status ?? 200;
    if (status !== 200) {
      return new Response(JSON.stringify({ code: options.headers?.['x-code'] ?? 'STREAM.FORBIDDEN' }), {
        status,
        headers: { 'content-type': 'application/json' },
      });
    }

    const encoder = new TextEncoder();
    const chunks = [...(options.chunks ?? [])];
    const stream = new ReadableStream<Uint8Array>({
      start(controller) {
        for (const chunk of chunks) controller.enqueue(encoder.encode(chunk));
        if (!options.keepOpen) {
          controller.close();
          return;
        }
        // A kept-open stream must die when the request is aborted, exactly as
        // a real `fetch` body does — otherwise the watchdog has nothing to cut.
        request.signal?.addEventListener(
          'abort',
          () => {
            try {
              controller.error(abortError(request.signal));
            } catch {
              /* already closed */
            }
          },
          { once: true },
        );
      },
      cancel() {
        /* the reader gave up; nothing to release */
      },
    });
    return new Response(stream, { status: 200, headers: { 'content-type': 'text/event-stream' } });
  };
}

function abortError(signal: AbortSignal | undefined): unknown {
  if (signal?.reason) return signal.reason;
  const error = new Error('The operation was aborted');
  error.name = 'AbortError';
  return error;
}

/** Lets a test wait for a condition without an arbitrary sleep. */
export async function until(predicate: () => boolean, timeoutMs = 2_000): Promise<void> {
  const startedAt = Date.now();
  for (;;) {
    if (predicate()) return;
    if (Date.now() - startedAt > timeoutMs) throw new Error('condition was not met in time');
    await new Promise((resolve) => setTimeout(resolve, 5));
  }
}

/** A base64url JWT with the given `exp` (seconds). Signature is not checked anywhere. */
export function jwtWithExp(expSeconds: number): string {
  const encode = (value: unknown) =>
    Buffer.from(JSON.stringify(value)).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  return `${encode({ alg: 'none' })}.${encode({ exp: expSeconds })}.sig`;
}
