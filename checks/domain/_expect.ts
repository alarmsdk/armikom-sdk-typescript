/**
 * A small `expect` over `node:assert`, so the domain checks that came up from the Vue console
 * (written against vitest) run under `node --test` without adding a test framework to a package
 * whose whole point is having no dependencies. Only the matchers those checks use are here.
 */
import assert from 'node:assert/strict';
import { describe as nodeDescribe, it as nodeIt } from 'node:test';

type Matchers = {
  toBe(expected: unknown): void;
  toEqual(expected: unknown): void;
  toStrictEqual(expected: unknown): void;
  toMatchObject(expected: Record<string, unknown>): void;
  toContain(item: unknown): void;
  toHaveLength(length: number): void;
  toBeNull(): void;
  toBeUndefined(): void;
  toBeDefined(): void;
  toBeTruthy(): void;
  toBeFalsy(): void;
  toBeGreaterThan(n: number): void;
  toBeGreaterThanOrEqual(n: number): void;
  toBeLessThan(n: number): void;
  toMatch(pattern: RegExp | string): void;
  toThrow(message?: string | RegExp | (new (...args: any[]) => Error)): void;
  toHaveBeenCalled(): void;
  toHaveBeenCalledTimes(n: number): void;
  toHaveBeenCalledWith(...args: unknown[]): void;
};

type Expectation = Matchers & { not: Matchers; rejects: { toThrow(message?: string | RegExp): Promise<void> } };

function subset(actual: unknown, expected: unknown): boolean {
  if (expected === null || typeof expected !== 'object') return Object.is(actual, expected) || deepEqual(actual, expected);
  if (actual === null || typeof actual !== 'object') return false;
  if (Array.isArray(expected)) {
    if (!Array.isArray(actual) || actual.length !== expected.length) return false;
    return expected.every((e, i) => subset(actual[i], e));
  }
  return Object.entries(expected as Record<string, unknown>).every(([k, v]) =>
    subset((actual as Record<string, unknown>)[k], v),
  );
}

function deepEqual(a: unknown, b: unknown): boolean {
  try {
    assert.deepEqual(a, b);
    return true;
  } catch {
    return false;
  }
}

function matchers(actual: unknown, negate: boolean): Matchers {
  const check = (ok: boolean, message: string) => {
    if (ok === negate) assert.fail(`${negate ? 'not ' : ''}${message}\n  actual: ${safe(actual)}`);
  };
  return {
    toBe: (e) => check(Object.is(actual, e), `expected toBe ${safe(e)}`),
    toEqual: (e) => check(deepEqual(actual, e), `expected toEqual ${safe(e)}`),
    toStrictEqual: (e) => check(deepEqual(actual, e), `expected toStrictEqual ${safe(e)}`),
    toMatchObject: (e) => check(subset(actual, e), `expected toMatchObject ${safe(e)}`),
    toContain: (item) => {
      const has =
        typeof actual === 'string' ? actual.includes(String(item)) : Array.isArray(actual) ? actual.some((x) => deepEqual(x, item)) : false;
      check(has, `expected toContain ${safe(item)}`);
    },
    toHaveLength: (n) => check((actual as { length: number })?.length === n, `expected length ${n}`),
    toBeNull: () => check(actual === null, 'expected null'),
    toBeUndefined: () => check(actual === undefined, 'expected undefined'),
    toBeDefined: () => check(actual !== undefined, 'expected defined'),
    toBeTruthy: () => check(!!actual, 'expected truthy'),
    toBeFalsy: () => check(!actual, 'expected falsy'),
    toBeGreaterThan: (n) => check((actual as number) > n, `expected > ${n}`),
    toBeGreaterThanOrEqual: (n) => check((actual as number) >= n, `expected >= ${n}`),
    toBeLessThan: (n) => check((actual as number) < n, `expected < ${n}`),
    toMatch: (p) => check(typeof p === 'string' ? String(actual).includes(p) : p.test(String(actual)), `expected toMatch ${p}`),
    toThrow: (message) => {
      let threw: unknown = undefined;
      let did = false;
      try {
        (actual as () => unknown)();
      } catch (error) {
        did = true;
        threw = error;
      }
      const text = threw instanceof Error ? threw.message : String(threw);
      const matches =
        !message ||
        (typeof message === 'string'
          ? text.includes(message)
          : message instanceof RegExp
            ? message.test(text)
            : threw instanceof message);
      check(did && matches, `expected toThrow ${String(message ?? '')}`);
    },
    toHaveBeenCalled: () => check(calls(actual).length > 0, 'expected to have been called'),
    toHaveBeenCalledTimes: (n) => check(calls(actual).length === n, `expected ${n} calls, got ${calls(actual).length}`),
    toHaveBeenCalledWith: (...args) => check(calls(actual).some((c) => deepEqual(c, args)), `expected a call with ${safe(args)}`),
  };
}

function safe(value: unknown): string {
  try {
    return JSON.stringify(value) ?? String(value);
  } catch {
    return String(value);
  }
}

export function expect(actual: unknown): Expectation {
  return {
    ...matchers(actual, false),
    not: matchers(actual, true),
    rejects: {
      async toThrow(message) {
        let threw: unknown = undefined;
        let did = false;
        try {
          await (actual as Promise<unknown>);
        } catch (error) {
          did = true;
          threw = error;
        }
        const text = threw instanceof Error ? threw.message : String(threw);
        const matches = !message || (typeof message === 'string' ? text.includes(message) : message.test(text));
        if (!(did && matches)) assert.fail(`expected rejection ${message ?? ''}`);
      },
    },
  };
}

// ── mocks ───────────────────────────────────────────────────────────────────

interface MockFn {
  (...args: any[]): any;
  mock: { calls: unknown[][] };
  mockResolvedValue(value: unknown): MockFn;
  mockResolvedValueOnce(value: unknown): MockFn;
  mockRejectedValueOnce(error: unknown): MockFn;
  mockReturnValue(value: unknown): MockFn;
}

function calls(value: unknown): unknown[][] {
  return (value as MockFn)?.mock?.calls ?? [];
}

/** `vi.fn()` with the queue semantics the ported checks rely on. */
export function fn(impl?: (...args: unknown[]) => unknown): MockFn {
  const once: Array<() => unknown> = [];
  let always: (() => unknown) | undefined = impl ? () => impl : undefined;
  const mock = ((...args: unknown[]) => {
    mock.mock.calls.push(args);
    const next = once.shift();
    if (next) return next();
    if (always) return (always() as (...a: unknown[]) => unknown)(...args);
    return undefined;
  }) as MockFn;
  mock.mock = { calls: [] };
  mock.mockResolvedValue = (v) => ((always = () => () => Promise.resolve(v)), mock);
  mock.mockResolvedValueOnce = (v) => (once.push(() => Promise.resolve(v)), mock);
  mock.mockRejectedValueOnce = (e) => (once.push(() => Promise.reject(e)), mock);
  mock.mockReturnValue = (v) => ((always = () => () => v), mock);
  return mock;
}

export const vi = { fn };

// ── describe / it with `it.each` ─────────────────────────────────────────────

type ItFn = {
  (name: string, body: () => unknown | Promise<unknown>): void;
  each<T extends readonly unknown[]>(cases: readonly T[]): (name: string, body: (...args: T) => unknown) => void;
  each<T>(cases: readonly T[]): (name: string, body: (arg: T) => unknown) => void;
};

function format(name: string, args: unknown[]): string {
  let i = 0;
  return name.replace(/%[sdio]/g, () => safe(args[i++]));
}

export const describe = nodeDescribe;
export const it: ItFn = Object.assign(
  (name: string, body: () => unknown | Promise<unknown>) => {
    nodeIt(name, async () => {
      await body();
    });
  },
  {
    each: (cases: readonly unknown[]) => (name: string, body: (...args: any[]) => unknown) => {
      for (const c of cases) {
        const args = Array.isArray(c) ? c : [c];
        nodeIt(format(name, args), async () => {
          await body(...args);
        });
      }
    },
  },
) as ItFn;
