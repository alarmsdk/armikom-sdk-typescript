import { existsSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';

/** Compile-time assertion helper. `type _ = Expect<...>` fails tsc if false. */
export type Expect<T extends true> = T;
export type IsArrayOf<T, E> = [T] extends [Array<E>] ? true : false;
export type Has<T, K extends string> = K extends keyof T ? true : false;

/**
 * Repo root, found by walking up from the compiled test file. The marker is the
 * pinned spec, not package.json: the compiled checks live under .build/checks/,
 * which carries its own package.json to mark the CommonJS boundary.
 */
export function repoRoot(from: string = __dirname): string {
  let dir = resolve(from);
  for (;;) {
    if (existsSync(join(dir, 'openapi', 'armikom-api.v1.json'))) return dir;
    const up = dirname(dir);
    if (up === dir) throw new Error('repo root not found');
    dir = up;
  }
}

/** A fetch that answers every request with one canned JSON body. */
export function stubJsonFetch(body: unknown, status = 200): typeof fetch {
  return (async () =>
    new Response(JSON.stringify(body), {
      status,
      headers: { 'content-type': 'application/json' },
    })) as unknown as typeof fetch;
}
