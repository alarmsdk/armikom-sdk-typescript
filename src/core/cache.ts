/**
 * §01 §7 / C-13 — ETag caching for the two bundles that support it.
 *
 * `GetReferenceBundle` and `GetLocalizationBundle` are large and change rarely;
 * re-downloading them on every cold start is the single biggest avoidable cost
 * in the client (CA-2). Everything else is uncacheable, and the SDK
 * deliberately offers no TTL knob for it: a client-side TTL on `alarm-events`
 * is how a queue goes stale without anyone noticing (CA-5).
 */
import type { Clock } from './clock.js';
import { systemClock } from './clock.js';
import type { StorageLike } from './tokens.js';

export interface CacheEntry<T = unknown> {
  value: T;
  etag?: string;
  storedAt: number;
}

export interface CacheStore {
  get<T>(key: string): CacheEntry<T> | null | Promise<CacheEntry<T> | null>;
  set<T>(key: string, entry: CacheEntry<T>): void | Promise<void>;
  delete(key: string): void | Promise<void>;
  clear(): void | Promise<void>;
}

export class MemoryCacheStore implements CacheStore {
  private readonly entries = new Map<string, CacheEntry>();

  get<T>(key: string): CacheEntry<T> | null {
    return (this.entries.get(key) as CacheEntry<T> | undefined) ?? null;
  }

  set<T>(key: string, entry: CacheEntry<T>): void {
    this.entries.set(key, entry);
  }

  delete(key: string): void {
    this.entries.delete(key);
  }

  clear(): void {
    this.entries.clear();
  }
}

/**
 * §01 CA-2 — survives a process restart. Every access is guarded: a quota
 * failure on a 400 kB localisation bundle must degrade to "fetch it again",
 * never to a thrown error on boot.
 */
export class WebStorageCacheStore implements CacheStore {
  constructor(
    private readonly storage: StorageLike,
    private readonly prefix = 'armikom.cache.',
  ) {}

  get<T>(key: string): CacheEntry<T> | null {
    try {
      const raw = this.storage.getItem(this.prefix + key);
      return raw ? (JSON.parse(raw) as CacheEntry<T>) : null;
    } catch {
      return null;
    }
  }

  set<T>(key: string, entry: CacheEntry<T>): void {
    try {
      this.storage.setItem(this.prefix + key, JSON.stringify(entry));
    } catch {
      // Out of quota. The value stays live in memory for this session.
    }
  }

  delete(key: string): void {
    try {
      this.storage.removeItem(this.prefix + key);
    } catch {
      /* nothing to do */
    }
  }

  clear(): void {
    // Deliberately narrow: this store owns only its own prefix, and wiping
    // the host application's storage is not ours to do.
    for (const key of Object.keys((this.storage as unknown as Record<string, unknown>) ?? {})) {
      if (key.startsWith(this.prefix)) this.delete(key.slice(this.prefix.length));
    }
  }
}

export interface RevalidateResult<T> {
  /** Absent when the server answered 304 and the cached value stands. */
  value?: T;
  etag?: string | null;
  notModified: boolean;
}

export interface ETagResourceOptions<T> {
  key: string;
  store: CacheStore;
  /** Issues the conditional request. Receives the cached ETag, if any. */
  fetch: (etag: string | undefined, signal?: AbortSignal) => Promise<RevalidateResult<T>>;
  clock?: Clock;
  /**
   * How long a cached value is served without revalidating at all. Zero means
   * "always revalidate", which is the correct default for a bundle whose
   * staleness the SSE `reference-bundle-changed` event also announces.
   */
  freshForMs?: number;
}

/**
 * §01 CA-3 — a cached accessor that revalidates transparently. Screens call
 * this, never the raw operation.
 */
export class ETagResource<T> {
  private inFlight: Promise<T> | null = null;
  private readonly clock: Clock;

  constructor(private readonly options: ETagResourceOptions<T>) {
    this.clock = options.clock ?? systemClock;
  }

  /** Returns the cached value if fresh, otherwise revalidates. Single-flight. */
  async get(signal?: AbortSignal): Promise<T> {
    const cached = await this.options.store.get<T>(this.options.key);
    const freshFor = this.options.freshForMs ?? 0;
    if (cached && freshFor > 0 && this.clock.now() - cached.storedAt < freshFor) return cached.value;
    if (this.inFlight) return this.inFlight;

    this.inFlight = this.revalidate(cached, signal).finally(() => {
      this.inFlight = null;
    });
    return this.inFlight;
  }

  /** Ignores freshness and the ETag: forces a full re-read. */
  async refresh(signal?: AbortSignal): Promise<T> {
    await this.options.store.delete(this.options.key);
    return this.get(signal);
  }

  async peek(): Promise<T | null> {
    const cached = await this.options.store.get<T>(this.options.key);
    return cached?.value ?? null;
  }

  async invalidate(): Promise<void> {
    await this.options.store.delete(this.options.key);
  }

  private async revalidate(cached: CacheEntry<T> | null, signal?: AbortSignal): Promise<T> {
    const result = await this.options.fetch(cached?.etag, signal);

    if (result.notModified) {
      if (!cached) {
        // A 304 with nothing cached means the conditional header was sent
        // without a stored body — a bug rather than a cache hit. Re-read.
        const fresh = await this.options.fetch(undefined, signal);
        return this.store(fresh);
      }
      await this.options.store.set(this.options.key, { ...cached, storedAt: this.clock.now() });
      return cached.value;
    }
    return this.store(result);
  }

  private async store(result: RevalidateResult<T>): Promise<T> {
    const value = result.value as T;
    await this.options.store.set(this.options.key, {
      value,
      ...(result.etag ? { etag: result.etag } : {}),
      storedAt: this.clock.now(),
    });
    return value;
  }
}

/**
 * §01 CA-4 — reference lookups are exposed as indexed maps, not arrays.
 * `SignalTypeItem` is looked up once per row on the alarm and signal grids; a
 * linear scan per row is O(n·m) on the hottest screen in the product.
 */
export function indexBy<T, K extends string | number>(items: readonly T[], key: (item: T) => K | null | undefined): Map<K, T> {
  const map = new Map<K, T>();
  for (const item of items) {
    const k = key(item);
    if (k !== null && k !== undefined) map.set(k, item);
  }
  return map;
}

export function groupBy<T, K extends string | number>(items: readonly T[], key: (item: T) => K | null | undefined): Map<K, T[]> {
  const map = new Map<K, T[]>();
  for (const item of items) {
    const k = key(item);
    if (k === null || k === undefined) continue;
    const bucket = map.get(k);
    if (bucket) bucket.push(item);
    else map.set(k, [item]);
  }
  return map;
}
