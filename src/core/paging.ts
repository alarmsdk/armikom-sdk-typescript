/**
 * §01 §10 / C-15 — one iterator over four wire shapes.
 *
 * | shape             | body                                                  | where |
 * |-------------------|-------------------------------------------------------|-------|
 * | `envelope`        | `{ items, totalCount, page, pageSize, hasNextPage }`   | Armikom.Api — `GetSides`, `GetSignalEvents`, `GetCalls` |
 * | `offset`          | `{ items, hasMore }`                                   | Armikom.Api — `ListCustomers`, `ListDealers`, `ListMobileUsers` |
 * | `capped-array`    | a bare array, silently truncated                       | Armikom.Api — `GetAlarmEvents` (100), `GetLiveSignals`, `reference/*` |
 * | `page-size-total` | `{ items, total, page, size }`                         | Voice.Cloud — every list in the console |
 *
 * Normalising hides the inconsistency; it does not fix it (14-api-gaps G-06).
 * What it does fix is that a grid component no longer has to know which of the
 * four it is bound to, which is the whole reason the console's list screens
 * each re-implemented paging slightly differently.
 */

export type PageShape = 'envelope' | 'offset' | 'capped-array' | 'page-size-total';

export interface Page<T> {
  items: T[];
  hasMore: boolean;
  /** §01 P-3 — null for the shapes that do not report one. Never faked. */
  totalCount: number | null;
  /**
   * §01 P-2 — true when the response is a bare array that came back at its cap.
   * The alarm queue truncating at 100 during a storm is a safety problem, so
   * the UI must be able to say "the first 100 of an unknown number".
   */
  isCapped: boolean;
  cap: number | null;
  page: number | null;
  pageSize: number | null;
  shape: PageShape;
}

export interface NormalizeOptions {
  /** Skip detection when you already know. */
  shape?: PageShape;
  /** The server-side cap for a bare-array endpoint. */
  cap?: number;
  /** Echoed from the request when the envelope omits them. */
  page?: number;
  pageSize?: number;
}

export function emptyPage<T>(shape: PageShape = 'offset'): Page<T> {
  return { items: [], hasMore: false, totalCount: 0, isCapped: false, cap: null, page: null, pageSize: null, shape };
}

export function detectShape(raw: unknown): PageShape {
  if (Array.isArray(raw)) return 'capped-array';
  const body = (raw ?? {}) as Record<string, unknown>;
  if ('hasNextPage' in body) return 'envelope';
  if ('total' in body && ('size' in body || 'pageSize' in body)) return 'page-size-total';
  if ('hasMore' in body) return 'offset';
  if ('totalCount' in body) return 'envelope';
  return 'offset';
}

export function normalizePage<T>(raw: unknown, options: NormalizeOptions = {}): Page<T> {
  const shape = options.shape ?? detectShape(raw);

  if (shape === 'capped-array') {
    const items = (Array.isArray(raw) ? raw : []) as T[];
    const cap = options.cap ?? null;
    return {
      items,
      // A capped array gives no way to ask for the next page, so "more" is
      // unknowable — reported through `isCapped` rather than guessed at here.
      hasMore: false,
      totalCount: cap !== null && items.length >= cap ? null : items.length,
      isCapped: cap !== null && items.length >= cap,
      cap,
      page: null,
      pageSize: null,
      shape,
    };
  }

  const body = (raw ?? {}) as Record<string, unknown>;
  const items = (Array.isArray(body['items']) ? body['items'] : []) as T[];
  const page = num(body['page']) ?? options.page ?? null;
  const pageSize = num(body['pageSize']) ?? num(body['size']) ?? options.pageSize ?? null;
  const totalCount = num(body['totalCount']) ?? num(body['total']) ?? null;

  let hasMore: boolean;
  if (typeof body['hasNextPage'] === 'boolean') hasMore = body['hasNextPage'];
  else if (typeof body['hasMore'] === 'boolean') hasMore = body['hasMore'];
  else if (totalCount !== null && page !== null && pageSize !== null) hasMore = page * pageSize < totalCount;
  else hasMore = false;

  return { items, hasMore, totalCount, isCapped: false, cap: null, page, pageSize, shape };
}

export interface PageRequest {
  /** 1-based, for the page-number APIs. */
  page: number;
  pageSize: number;
  /** 0-based, for the limit/offset APIs. Always `(page - 1) * pageSize`. */
  offset: number;
}

export type PageFetcher<T> = (request: PageRequest, signal?: AbortSignal) => Promise<Page<T>>;

export interface IterateOptions {
  pageSize?: number;
  startPage?: number;
  /** Stops after this many items. A grid export with no bound is a memory incident. */
  maxItems?: number;
  /** Stops after this many pages, whatever `hasMore` claims. */
  maxPages?: number;
  signal?: AbortSignal;
}

/** §01 P-1 — walks pages. Terminates on `hasMore === false`, an empty page, or a bound. */
export async function* iteratePages<T>(fetcher: PageFetcher<T>, options: IterateOptions = {}): AsyncGenerator<Page<T>> {
  const pageSize = options.pageSize ?? 50;
  let page = options.startPage ?? 1;
  let seen = 0;
  let pages = 0;

  for (;;) {
    const result = await fetcher({ page, pageSize, offset: (page - 1) * pageSize }, options.signal);
    yield result;
    seen += result.items.length;
    pages += 1;

    if (!result.hasMore) return;
    // A server that says "more" and returns nothing would otherwise spin here
    // forever. It has happened; the loop refuses to be the one that does.
    if (result.items.length === 0) return;
    if (options.maxItems !== undefined && seen >= options.maxItems) return;
    if (options.maxPages !== undefined && pages >= options.maxPages) return;
    page += 1;
  }
}

/** §01 P-1 — the flat item stream. `for await (const side of iterate(fetchSides))`. */
export async function* iterate<T>(fetcher: PageFetcher<T>, options: IterateOptions = {}): AsyncGenerator<T> {
  let seen = 0;
  for await (const page of iteratePages(fetcher, options)) {
    for (const item of page.items) {
      if (options.maxItems !== undefined && seen >= options.maxItems) return;
      seen += 1;
      yield item;
    }
  }
}

export async function collect<T>(fetcher: PageFetcher<T>, options: IterateOptions = {}): Promise<T[]> {
  const out: T[] = [];
  for await (const item of iterate(fetcher, options)) out.push(item);
  return out;
}

/**
 * The state a paged grid actually needs: current page, whether the next one
 * exists, and a `total` that may honestly be unknown. Replaces the
 * page/size/total triples the console kept per list screen.
 */
export class Paginator<T> {
  private current: Page<T> | null = null;
  private pageNumber: number;

  constructor(
    private readonly fetcher: PageFetcher<T>,
    private readonly pageSize = 50,
    startPage = 1,
  ) {
    this.pageNumber = startPage;
  }

  get items(): T[] {
    return this.current?.items ?? [];
  }

  get page(): number {
    return this.pageNumber;
  }

  get totalCount(): number | null {
    return this.current?.totalCount ?? null;
  }

  get hasNext(): boolean {
    return this.current?.hasMore ?? false;
  }

  get hasPrevious(): boolean {
    return this.pageNumber > 1;
  }

  get isCapped(): boolean {
    return this.current?.isCapped ?? false;
  }

  async load(page = this.pageNumber, signal?: AbortSignal): Promise<Page<T>> {
    this.pageNumber = Math.max(1, page);
    this.current = await this.fetcher(
      { page: this.pageNumber, pageSize: this.pageSize, offset: (this.pageNumber - 1) * this.pageSize },
      signal,
    );
    return this.current;
  }

  next(signal?: AbortSignal): Promise<Page<T>> {
    return this.load(this.pageNumber + 1, signal);
  }

  previous(signal?: AbortSignal): Promise<Page<T>> {
    return this.load(this.pageNumber - 1, signal);
  }
}

function num(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}
