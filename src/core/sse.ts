/**
 * A Server-Sent Events frame parser.
 *
 * §01 12.3 decision U1(a): `EventSource` cannot set an `Authorization` header,
 * and the two alternatives — a token in the query string, or cookie auth for
 * one endpoint — put a live credential in access logs or add a second auth
 * mechanism with its own CSRF surface. So the web SDK reads the stream with
 * `fetch` and parses the frames itself. This is that parser: ~100 lines, and
 * the reason the rest of realtime.ts can hold the header.
 */

export interface SseFrame {
  /** Defaults to `message`, per the spec, when the frame carries no `event:`. */
  event: string;
  data: string;
  id: string | null;
  /** Server-suggested reconnect delay, from a `retry:` field. */
  retryMs: number | null;
}

const LINE_BREAK = /\r\n|\r|\n/;
const CRLF = '\r\n';

/**
 * Feed it decoded text; it yields whole frames. Keeps the trailing partial line
 * across calls, which is the entire point: a chunk boundary lands mid-frame
 * often enough that treating each chunk as complete loses events under load.
 */
export class SseParser {
  private buffer = '';
  private dataLines: string[] = [];
  private eventName: string | null = null;
  private lastId: string | null = null;
  private retryMs: number | null = null;

  /** Fires for every `:` comment line, including the keep-alive heartbeat. */
  onComment: ((text: string) => void) | null = null;

  /**
   * The SSE "last event ID buffer": set by `id:` and persisting across frames
   * until the server sends a new one.
   *
   * Exposed because reconnect replay needs it — a client that sends
   * `Last-Event-ID` on reconnect can be replayed the events it missed from the
   * server's buffer, which is the only thing that narrows the §01 S-9 gap
   * rather than merely coping with it.
   */
  get lastEventId(): string | null {
    return this.lastId;
  }

  push(chunk: string): SseFrame[] {
    if (!chunk) return [];
    this.buffer += chunk;
    const frames: SseFrame[] = [];

    /**
     * A chunk boundary falls anywhere, including *between* the CR and the LF of
     * a CRLF. Treating that lone trailing CR as a terminator would end the line
     * early and then read the next chunk's leading LF as a blank line, which
     * dispatches a frame that has not finished arriving. So it is held back
     * until the next chunk says what follows it.
     */
    let searchable = this.buffer;
    let held = '';
    if (searchable.endsWith('\r')) {
      held = '\r';
      searchable = searchable.slice(0, -1);
    }

    // Split on any of the three line terminators the spec allows. A trailing
    // fragment stays in the buffer for the next chunk.
    let index: number;
    while ((index = searchable.search(LINE_BREAK)) !== -1) {
      const line = searchable.slice(0, index);
      const terminator = searchable.startsWith(CRLF, index) ? 2 : 1;
      searchable = searchable.slice(index + terminator);
      const frame = this.consumeLine(line);
      if (frame) frames.push(frame);
    }
    this.buffer = searchable + held;
    return frames;
  }

  /** Flushes a frame that was never terminated, e.g. at end of stream. */
  flush(): SseFrame | null {
    if (this.buffer.length === 0) return this.dispatch();
    const line = this.buffer;
    this.buffer = '';
    return this.consumeLine(line) ?? this.dispatch();
  }

  private consumeLine(line: string): SseFrame | null {
    if (line === '') return this.dispatch();

    if (line.startsWith(':')) {
      // The 25 s keep-alive comment. It carries no data, but its *arrival* is
      // what the watchdog in realtime.ts is watching for.
      this.onComment?.(line.slice(1).trimStart());
      return null;
    }

    const colon = line.indexOf(':');
    const field = colon === -1 ? line : line.slice(0, colon);
    // Exactly one leading space is stripped, per the spec.
    let value = colon === -1 ? '' : line.slice(colon + 1);
    if (value.startsWith(' ')) value = value.slice(1);

    switch (field) {
      case 'event':
        this.eventName = value;
        break;
      case 'data':
        this.dataLines.push(value);
        break;
      case 'id':
        // An id containing a NULL must be ignored rather than stored.
        if (!value.includes('\u0000')) this.lastId = value;
        break;
      case 'retry': {
        const ms = Number(value);
        if (Number.isInteger(ms) && ms >= 0) this.retryMs = ms;
        break;
      }
      default:
        // Unknown fields are ignored, which is what makes the format
        // forward-compatible.
        break;
    }
    return null;
  }

  private dispatch(): SseFrame | null {
    if (this.dataLines.length === 0 && this.eventName === null) return null;
    const frame: SseFrame = {
      event: this.eventName ?? 'message',
      data: this.dataLines.join('\n'),
      id: this.lastId,
      retryMs: this.retryMs,
    };
    this.dataLines = [];
    this.eventName = null;
    return frame;
  }
}
