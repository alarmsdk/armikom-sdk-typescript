/**
 * The loading/error/data triple, written once.
 *
 * Every list screen in the Voice.Cloud console carries its own `loading`,
 * `error` and `rows` fields plus a `load()` that sets all three — eleven copies
 * of the same eight lines, each with its own small differences in whether a
 * failed reload clears the previous rows and whether a slow response can
 * overwrite a newer one. Neither question is framework-specific, so neither
 * answer belongs in a component.
 *
 * Framework-free on purpose: `state` is a `Store`, which Angular reads through
 * `toSignal(from(state))` and React through `useSyncExternalStore`.
 */
import { RequestAbortedError, isApiError } from './errors.js';
import { Store, type Unsubscribe } from './observable.js';
import { iterate, type Page, type PageFetcher, type PageRequest } from './paging.js';

export type ResourceStatus = 'idle' | 'loading' | 'reloading' | 'ready' | 'error';

export interface ResourceState<T> {
  status: ResourceStatus;
  /** Retained across a reload, and across a *failed* reload: a grid that blanks
   *  itself because a refresh 500ed has thrown away the operator's context. */
  data: T | null;
  error: unknown;
  /** When the current `data` was loaded. Null until the first success. */
  loadedAt: number | null;
}

export interface AsyncResourceOptions<T> {
  load: (signal: AbortSignal) => Promise<T>;
  /** Load immediately on construction. Default false — screens usually load on init. */
  eager?: boolean;
  onError?: (error: unknown) => void;
}

export class AsyncResource<T> {
  readonly state: Store<ResourceState<T>>;

  private controller: AbortController | null = null;
  /** Guards against an older response overwriting a newer one. */
  private generation = 0;

  constructor(private readonly options: AsyncResourceOptions<T>) {
    this.state = new Store<ResourceState<T>>({ status: 'idle', data: null, error: null, loadedAt: null });
    if (options.eager) void this.reload();
  }

  get value(): T | null {
    return this.state.get().data;
  }

  get isLoading(): boolean {
    const status = this.state.get().status;
    return status === 'loading' || status === 'reloading';
  }

  subscribe(listener: (state: ResourceState<T>) => void): Unsubscribe {
    return this.state.subscribe(listener);
  }

  async reload(): Promise<T | null> {
    // A navigation that supersedes an in-flight read cancels it (§01 RT-6).
    this.controller?.abort();
    const controller = new AbortController();
    this.controller = controller;
    const generation = ++this.generation;

    const previous = this.state.get();
    this.state.set({ ...previous, status: previous.data === null ? 'loading' : 'reloading', error: null });

    try {
      const data = await this.options.load(controller.signal);
      if (generation !== this.generation) return null;
      this.state.set({ status: 'ready', data, error: null, loadedAt: Date.now() });
      return data;
    } catch (error) {
      if (generation !== this.generation) return null;
      // A cancellation is not a failure to show the user; it is a screen that
      // moved on.
      if (isApiError(error) && error instanceof RequestAbortedError) return null;
      this.state.set({ ...this.state.get(), status: 'error', error });
      this.options.onError?.(error);
      return null;
    }
  }

  /** Replaces the value without a round trip — after a write that returns the new entity. */
  set(data: T): void {
    this.state.set({ status: 'ready', data, error: null, loadedAt: Date.now() });
  }

  /** Cancels anything in flight. Call from a component's teardown. */
  dispose(): void {
    this.controller?.abort();
    this.controller = null;
  }
}

export interface PagedResourceState<T> extends ResourceState<T[]> {
  page: number;
  pageSize: number;
  totalCount: number | null;
  hasMore: boolean;
  /** §01 P-2 — the server truncated and cannot say how much it truncated. */
  isCapped: boolean;
}

export interface PagedResourceOptions<T> {
  fetch: PageFetcher<T>;
  pageSize?: number;
  onError?: (error: unknown) => void;
}

/**
 * A paged list screen's whole state. Works against any of the four wire shapes
 * because `PageFetcher` returns the normalised `Page<T>` from `paging.ts`.
 */
export class PagedResource<T> {
  readonly state: Store<PagedResourceState<T>>;

  private controller: AbortController | null = null;
  private generation = 0;
  private readonly pageSize: number;

  constructor(private readonly options: PagedResourceOptions<T>) {
    this.pageSize = options.pageSize ?? 50;
    this.state = new Store<PagedResourceState<T>>({
      status: 'idle',
      data: null,
      error: null,
      loadedAt: null,
      page: 1,
      pageSize: this.pageSize,
      totalCount: null,
      hasMore: false,
      isCapped: false,
    });
  }

  get items(): T[] {
    return this.state.get().data ?? [];
  }

  subscribe(listener: (state: PagedResourceState<T>) => void): Unsubscribe {
    return this.state.subscribe(listener);
  }

  load(page = this.state.get().page): Promise<void> {
    return this.run(Math.max(1, page), false);
  }

  next(): Promise<void> {
    return this.state.get().hasMore ? this.run(this.state.get().page + 1, false) : Promise.resolve();
  }

  previous(): Promise<void> {
    return this.state.get().page > 1 ? this.run(this.state.get().page - 1, false) : Promise.resolve();
  }

  /** Infinite-scroll variant: appends rather than replacing. */
  loadMore(): Promise<void> {
    return this.state.get().hasMore ? this.run(this.state.get().page + 1, true) : Promise.resolve();
  }

  /** Re-reads the current page. This is what an SSE nudge should be wired to. */
  refresh(): Promise<void> {
    return this.run(this.state.get().page, false);
  }

  /** Back to page one — what a filter change means. */
  reset(): Promise<void> {
    return this.run(1, false);
  }

  dispose(): void {
    this.controller?.abort();
    this.controller = null;
  }

  private async run(page: number, append: boolean): Promise<void> {
    this.controller?.abort();
    const controller = new AbortController();
    this.controller = controller;
    const generation = ++this.generation;

    const previous = this.state.get();
    this.state.set({ ...previous, status: previous.data === null ? 'loading' : 'reloading', error: null });

    const request: PageRequest = { page, pageSize: this.pageSize, offset: (page - 1) * this.pageSize };
    try {
      const result: Page<T> = await this.options.fetch(request, controller.signal);
      if (generation !== this.generation) return;
      this.state.set({
        status: 'ready',
        data: append ? [...(previous.data ?? []), ...result.items] : result.items,
        error: null,
        loadedAt: Date.now(),
        page,
        pageSize: this.pageSize,
        totalCount: result.totalCount,
        hasMore: result.hasMore,
        isCapped: result.isCapped,
      });
    } catch (error) {
      if (generation !== this.generation) return;
      if (isApiError(error) && error instanceof RequestAbortedError) return;
      this.state.set({ ...this.state.get(), status: 'error', error });
      this.options.onError?.(error);
    }
  }
}

/**
 * Reads every page into one array, for an export. Bounded on purpose — an
 * unbounded "select all" against `GetSignalEvents` is a browser tab that dies
 * quietly with the operator's export half-written.
 */
export async function loadAll<T>(fetcher: PageFetcher<T>, maxItems = 10_000, signal?: AbortSignal): Promise<T[]> {
  const out: T[] = [];
  for await (const item of iterate(fetcher, { maxItems, ...(signal ? { signal } : {}) })) out.push(item);
  return out;
}
