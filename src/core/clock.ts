/**
 * §01 B-2 / C-01 — the clock is injectable.
 *
 * Token expiry, lock age, retry backoff and the SSE keep-alive watchdog are all
 * "is it later than X yet" questions. With `Date.now()` reached for directly,
 * none of them can be tested without sleeping, and a suite that sleeps for the
 * 62 s keep-alive window is a suite nobody runs.
 */
export interface Clock {
  /** Epoch milliseconds. */
  now(): number;
  /** Resolves after `ms`; rejects with the abort reason if `signal` aborts first. */
  sleep(ms: number, signal?: AbortSignal): Promise<void>;
}

export const systemClock: Clock = {
  now: () => Date.now(),
  sleep: (ms, signal) =>
    new Promise<void>((resolve, reject) => {
      if (signal?.aborted) {
        reject(signal.reason ?? new Error('aborted'));
        return;
      }
      const timer = setTimeout(() => {
        signal?.removeEventListener('abort', onAbort);
        resolve();
      }, ms);
      const onAbort = () => {
        clearTimeout(timer);
        reject(signal?.reason ?? new Error('aborted'));
      };
      signal?.addEventListener('abort', onAbort, { once: true });
    }),
};

/**
 * A clock whose time only moves when you move it. `sleep` resolves as soon as
 * the fake time passes the deadline, so a test for the 62 s watchdog costs
 * microseconds.
 */
export class ManualClock implements Clock {
  private current: number;
  private readonly waiters: Array<{ at: number; resolve: () => void; reject: (e: unknown) => void }> = [];

  constructor(startEpochMs = 0) {
    this.current = startEpochMs;
  }

  now(): number {
    return this.current;
  }

  sleep(ms: number, signal?: AbortSignal): Promise<void> {
    if (signal?.aborted) return Promise.reject(signal.reason ?? new Error('aborted'));
    return new Promise<void>((resolve, reject) => {
      const waiter = { at: this.current + ms, resolve, reject };
      this.waiters.push(waiter);
      signal?.addEventListener(
        'abort',
        () => {
          const i = this.waiters.indexOf(waiter);
          if (i >= 0) this.waiters.splice(i, 1);
          reject(signal.reason ?? new Error('aborted'));
        },
        { once: true },
      );
    });
  }

  /** Moves time forward and releases every sleeper whose deadline has passed. */
  async advance(ms: number): Promise<void> {
    this.current += ms;
    const due = this.waiters.filter((w) => w.at <= this.current);
    for (const w of due) {
      this.waiters.splice(this.waiters.indexOf(w), 1);
      w.resolve();
    }
    // Let the released continuations run before the caller asserts on them.
    await new Promise((r) => setTimeout(r, 0));
  }

  get pending(): number {
    return this.waiters.length;
  }
}
