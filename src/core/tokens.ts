/**
 * §01 §3.4 — the token store.
 *
 * §01 A-11 is the load-bearing rule: the SDK ships an in-memory store and
 * MUST NOT default to `localStorage`. Persisting a refresh token is a decision
 * with a threat model attached, and it belongs to the host application, made
 * once, in the open — not to a default nobody read.
 */

export interface Tokens {
  accessToken: string;
  refreshToken?: string;
  /** Epoch milliseconds. Absent means "unknown"; the SDK then refreshes reactively. */
  expiresAt?: number;
}

export interface TokenStore {
  read(): Tokens | null | Promise<Tokens | null>;
  write(tokens: Tokens): void | Promise<void>;
  clear(): void | Promise<void>;
}

export class MemoryTokenStore implements TokenStore {
  private tokens: Tokens | null;

  constructor(initial: Tokens | null = null) {
    this.tokens = initial;
  }

  read(): Tokens | null {
    return this.tokens;
  }

  write(tokens: Tokens): void {
    this.tokens = tokens;
  }

  clear(): void {
    this.tokens = null;
  }
}

/**
 * Opt-in persistence over anything Storage-shaped (`localStorage`,
 * `sessionStorage`, or a test double).
 *
 * Every access is guarded: Safari in private mode throws on `getItem`, and an
 * iframe with third-party storage blocked throws on construction of the whole
 * `localStorage` accessor. A console that cannot persist a token should ask the
 * user to log in again, not fail to boot.
 */
export interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

export class WebStorageTokenStore implements TokenStore {
  constructor(
    private readonly storage: StorageLike,
    private readonly key = 'armikom.tokens',
  ) {}

  read(): Tokens | null {
    try {
      const raw = this.storage.getItem(this.key);
      if (!raw) return null;
      const parsed = JSON.parse(raw) as Partial<Tokens>;
      if (typeof parsed.accessToken !== 'string') return null;
      return {
        accessToken: parsed.accessToken,
        ...(typeof parsed.refreshToken === 'string' ? { refreshToken: parsed.refreshToken } : {}),
        ...(typeof parsed.expiresAt === 'number' ? { expiresAt: parsed.expiresAt } : {}),
      };
    } catch {
      return null;
    }
  }

  write(tokens: Tokens): void {
    try {
      this.storage.setItem(this.key, JSON.stringify(tokens));
    } catch {
      // Quota or a blocked partition. The in-memory session still works for this tab.
    }
  }

  clear(): void {
    try {
      this.storage.removeItem(this.key);
    } catch {
      // See write().
    }
  }
}

/**
 * Reads `exp` out of a JWT so a login response that omits `expiresAt` still
 * gets proactive refresh (§01 A-2) instead of falling back to 401-driven
 * recovery. Returns null for anything that is not a readable JWT — the token is
 * still used, it just cannot be refreshed early.
 */
export function expiryFromJwt(accessToken: string): number | null {
  const parts = accessToken.split('.');
  if (parts.length < 2) return null;
  const payload = parts[1];
  if (!payload) return null;
  try {
    const json = base64UrlDecode(payload);
    const claims = JSON.parse(json) as { exp?: unknown };
    return typeof claims.exp === 'number' ? claims.exp * 1000 : null;
  } catch {
    return null;
  }
}

function base64UrlDecode(input: string): string {
  const padded = input.replace(/-/g, '+').replace(/_/g, '/').padEnd(Math.ceil(input.length / 4) * 4, '=');
  const g = globalThis as { atob?: (s: string) => string; Buffer?: { from(s: string, enc: string): { toString(enc: string): string } } };
  if (typeof g.atob === 'function') return g.atob(padded);
  if (g.Buffer) return g.Buffer.from(padded, 'base64').toString('utf8');
  throw new Error('no base64 decoder available');
}
