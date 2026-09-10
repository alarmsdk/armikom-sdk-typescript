/**
 * §01 §10 — pagination conformance: C-15 and C-24.
 */
import assert from 'node:assert/strict';
import test from 'node:test';

import { collect, detectShape, iterate, normalizePage, Paginator, type Page } from '../../src/core/paging.js';
import { PagedResource } from '../../src/core/resource.js';

test('C-15 all four wire shapes normalise to one iterator surface', async () => {
  // A — page envelope (GetSides, GetSignalEvents, GetCalls)
  const a = normalizePage<number>({ items: [1, 2], totalCount: 5, page: 1, pageSize: 2, hasNextPage: true });
  assert.deepEqual([a.items, a.hasMore, a.totalCount, a.shape], [[1, 2], true, 5, 'envelope']);

  // B — limit/offset (ListCustomers, ListDealers, ListMobileUsers): no total
  const b = normalizePage<number>({ items: [1, 2], hasMore: true });
  assert.deepEqual([b.hasMore, b.totalCount, b.shape], [true, null, 'offset']);

  // C — capped bare array (GetAlarmEvents, reference/*)
  const c = normalizePage<number>([1, 2, 3], { cap: 100 });
  assert.deepEqual([c.items.length, c.isCapped, c.shape], [3, false, 'capped-array']);

  // D — Voice.Cloud's { total, page, size }
  const d = normalizePage<number>({ items: [1, 2], total: 5, page: 1, size: 2 });
  assert.deepEqual([d.hasMore, d.totalCount, d.shape], [true, 5, 'page-size-total']);

  // §01 P-3 — totalCount is nullable, never invented for the shapes without one.
  assert.equal(b.totalCount, null);
});

test('C-15 the same iterator walks an envelope and an offset list to completion', async () => {
  const envelope = async ({ page }: { page: number }): Promise<Page<number>> =>
    normalizePage<number>({
      items: page <= 3 ? [page * 10, page * 10 + 1] : [],
      totalCount: 6,
      page,
      pageSize: 2,
      hasNextPage: page < 3,
    });
  const offset = async ({ offset: skip }: { offset: number }): Promise<Page<number>> =>
    normalizePage<number>({ items: skip < 6 ? [skip, skip + 1] : [], hasMore: skip + 2 < 6 });

  assert.deepEqual(await collect(envelope, { pageSize: 2 }), [10, 11, 20, 21, 30, 31]);
  assert.deepEqual(await collect(offset, { pageSize: 2 }), [0, 1, 2, 3, 4, 5]);
});

test('C-24 an array that comes back exactly at the cap reports isCapped', () => {
  const rows = Array.from({ length: 100 }, (_, i) => i);
  const page = normalizePage<number>(rows, { cap: 100 });
  assert.equal(page.isCapped, true, 'the alarm queue silently truncating at 100 is a safety problem');
  assert.equal(page.totalCount, null, 'and the true total is unknowable, so it must not be guessed');

  assert.equal(normalizePage<number>(rows.slice(0, 99), { cap: 100 }).isCapped, false);
});

test('detectShape recognises each envelope without being told', () => {
  assert.equal(detectShape([1, 2]), 'capped-array');
  assert.equal(detectShape({ items: [], hasNextPage: false }), 'envelope');
  assert.equal(detectShape({ items: [], hasMore: false }), 'offset');
  assert.equal(detectShape({ items: [], total: 0, size: 20 }), 'page-size-total');
});

test('the iterator refuses to spin on a server that says "more" and returns nothing', async () => {
  let calls = 0;
  const liar = async (): Promise<Page<number>> => {
    calls += 1;
    return normalizePage<number>({ items: [], hasMore: true });
  };
  assert.deepEqual(await collect(liar), []);
  assert.equal(calls, 1);
});

test('iterate honours maxItems', async () => {
  const endless = async ({ page }: { page: number }): Promise<Page<number>> =>
    normalizePage<number>({ items: [page, page], hasMore: true });
  const out: number[] = [];
  for await (const item of iterate(endless, { maxItems: 5 })) out.push(item);
  assert.equal(out.length, 5);
});

test('Paginator exposes what a grid needs, including an honest unknown total', async () => {
  const fetcher = async ({ page }: { page: number }): Promise<Page<string>> =>
    normalizePage<string>({ items: [`row-${page}`], hasMore: page < 2 });

  const paginator = new Paginator(fetcher, 20);
  await paginator.load();
  assert.deepEqual(paginator.items, ['row-1']);
  assert.equal(paginator.hasNext, true);
  assert.equal(paginator.hasPrevious, false);
  assert.equal(paginator.totalCount, null);

  await paginator.next();
  assert.deepEqual(paginator.items, ['row-2']);
  assert.equal(paginator.hasNext, false);
  assert.equal(paginator.hasPrevious, true);
});

test('PagedResource keeps the previous rows when a refresh fails', async () => {
  let fail = false;
  const resource = new PagedResource<string>({
    pageSize: 10,
    fetch: async () => {
      if (fail) throw new Error('500');
      return normalizePage<string>({ items: ['a', 'b'], total: 2, page: 1, size: 10 });
    },
  });

  await resource.load();
  assert.deepEqual(resource.items, ['a', 'b']);
  assert.equal(resource.state.get().totalCount, 2);

  fail = true;
  await resource.refresh();
  assert.equal(resource.state.get().status, 'error');
  assert.deepEqual(resource.items, ['a', 'b'], 'a failed refresh must not blank the grid');
});

test('PagedResource appends on loadMore and replaces on load', async () => {
  const resource = new PagedResource<number>({
    pageSize: 2,
    fetch: async ({ page }) => normalizePage<number>({ items: [page * 10, page * 10 + 1], hasMore: page < 3 }),
  });

  await resource.load();
  await resource.loadMore();
  assert.deepEqual(resource.items, [10, 11, 20, 21]);

  await resource.load(1);
  assert.deepEqual(resource.items, [10, 11]);
});

test('a superseded page load cannot overwrite a newer one', async () => {
  const delays = [40, 0];
  let call = 0;
  const resource = new PagedResource<string>({
    pageSize: 10,
    fetch: async ({ page }) => {
      const delay = delays[call++] ?? 0;
      await new Promise((resolve) => setTimeout(resolve, delay));
      return normalizePage<string>({ items: [`page-${page}`], hasMore: true });
    },
  });

  const slow = resource.load(1);
  const fast = resource.load(2);
  await Promise.all([slow, fast]);
  assert.deepEqual(resource.items, ['page-2'], 'the slow first response must not clobber the fast second');
});
