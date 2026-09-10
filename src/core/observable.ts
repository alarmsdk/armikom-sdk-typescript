/**
 * The one reactive primitive the SDK exposes.
 *
 * Both target frameworks can consume it without an adapter package:
 *
 *   Angular  `toSignal(from(store))`   — via the `Symbol.observable` interop below
 *   React    `useSyncExternalStore(store.subscribe, store.get)`
 *
 * Which is why it is `subscribe(listener) => unsubscribe` with a synchronous
 * `get()`, rather than anything resembling an RxJS `Subject`: that shape is the
 * intersection of what both frameworks already know how to read.
 */

export type Listener<T> = (value: T) => void;
export type Unsubscribe = () => void;

const observableSymbol: symbol =
  (typeof Symbol === 'function' && (Symbol as unknown as { observable?: symbol }).observable) ||
  Symbol.for('https://github.com/benlesh/symbol-observable');

export interface ReadableStore<T> {
  get(): T;
  /** Fires on every change. Does NOT replay the current value — read `get()` first. */
  subscribe(listener: Listener<T>): Unsubscribe;
}

export class Store<T> implements ReadableStore<T> {
  private value: T;
  private readonly listeners = new Set<Listener<T>>();

  constructor(initial: T) {
    this.value = initial;
    // Bound so `useSyncExternalStore(store.subscribe, store.get)` works unbound.
    this.get = this.get.bind(this);
    this.subscribe = this.subscribe.bind(this);
  }

  get(): T {
    return this.value;
  }

  set(next: T): void {
    if (Object.is(next, this.value)) return;
    this.value = next;
    this.emit();
  }

  update(fn: (current: T) => T): void {
    this.set(fn(this.value));
  }

  subscribe(listener: Listener<T>): Unsubscribe {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private emit(): void {
    // Copied first: a listener that unsubscribes itself must not perturb the walk.
    for (const listener of [...this.listeners]) {
      try {
        listener(this.value);
      } catch {
        // A broken subscriber must not stop the others, and must not surface as
        // a failure of whatever wrote the value.
      }
    }
  }

  /** RxJS / Angular interop: `from(store)` and therefore `toSignal(from(store))`. */
  [observableSymbol]() {
    const self = this;
    return {
      subscribe(observer: { next?: (v: T) => void; complete?: () => void }) {
        observer.next?.(self.get());
        const unsubscribe = self.subscribe((v) => observer.next?.(v));
        return { unsubscribe, closed: false };
      },
      [observableSymbol]() {
        return this;
      },
    };
  }
}

/** A multicast event channel with no current value. */
export class Emitter<T> {
  private readonly listeners = new Set<Listener<T>>();

  on(listener: Listener<T>): Unsubscribe {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  once(listener: Listener<T>): Unsubscribe {
    const off = this.on((v) => {
      off();
      listener(v);
    });
    return off;
  }

  emit(value: T): void {
    for (const listener of [...this.listeners]) {
      try {
        listener(value);
      } catch {
        // See Store.emit.
      }
    }
  }

  get size(): number {
    return this.listeners.size;
  }
}

/**
 * §01 S-3 / C-17 — trailing debounce.
 *
 * `alarm-list-updated` is a nudge with an empty payload, delivered once per
 * event. During a storm that is dozens a second, and a re-read per nudge means
 * the client DOSes itself at exactly the moment the operator needs it.
 */
export function coalesce(fn: () => void, delayMs: number): { (): void; flush(): void; cancel(): void } {
  let timer: ReturnType<typeof setTimeout> | null = null;
  const trigger = () => {
    if (timer !== null) clearTimeout(timer);
    timer = setTimeout(() => {
      timer = null;
      fn();
    }, delayMs);
  };
  trigger.flush = () => {
    if (timer !== null) {
      clearTimeout(timer);
      timer = null;
      fn();
    }
  };
  trigger.cancel = () => {
    if (timer !== null) {
      clearTimeout(timer);
      timer = null;
    }
  };
  return trigger;
}
