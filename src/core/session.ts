/**
 * §01 §3 — authentication, refresh and the capability API.
 *
 * The session owns the tokens; nothing else reads or writes them. It knows how
 * to *drive* login/refresh but not how to *call* them — that is the injected
 * `AuthDriver`, which is what lets the same session logic serve both
 * Armikom.Api (`Login` / `RefreshToken` / `GetCurrentUser`) and Voice.Cloud
 * (`/v1/auth/login` / `/v1/auth/refresh` / `/v1/auth/me`).
 */
import type { Clock } from './clock.js';
import { systemClock } from './clock.js';
import { AuthCodes, isTerminalAuthCode, type ProblemDetails } from './errors.js';
import { Emitter, Store } from './observable.js';
import { expiryFromJwt, MemoryTokenStore, type TokenStore, type Tokens } from './tokens.js';

export type PrincipalType = 'operator' | 'dealer' | 'mobile' | (string & {});

export interface SessionUser {
  id?: string;
  name?: string;
  type?: PrincipalType;
  monitoringCenterId?: string;
  dealerId?: string;
  extension?: string;
  [key: string]: unknown;
}

export interface AuthResult {
  tokens: Tokens;
  /** Some APIs return the user with the login response; others need a second call. */
  user?: SessionUser | null;
  scopes?: readonly string[];
}

export interface AuthDriver<TCredentials = unknown> {
  login(credentials: TCredentials, signal?: AbortSignal): Promise<AuthResult>;
  refresh(refreshToken: string, signal?: AbortSignal): Promise<AuthResult>;
  /** §01 A-7 — the store is cleared whether or not this succeeds. */
  logout?(signal?: AbortSignal): Promise<void>;
  /** §01 A-10 — re-read after every refresh; roles can change mid-session. */
  currentUser?(signal?: AbortSignal): Promise<{ user: SessionUser | null; scopes: readonly string[] }>;
}

export type SessionEndReason =
  | 'logout'
  | 'no-refresh-token'
  | 'refresh-failed'
  | 'token-invalid'
  | 'account-locked';

export interface SessionState {
  status: 'anonymous' | 'authenticated';
  user: SessionUser | null;
  scopes: readonly string[];
}

const ANONYMOUS: SessionState = { status: 'anonymous', user: null, scopes: [] };

export interface AuthSessionOptions<TCredentials> {
  driver: AuthDriver<TCredentials>;
  tokenStore?: TokenStore;
  clock?: Clock;
  /** §01 A-2 — refresh this far before `expiresAt`. Default 60 s. */
  refreshSkewMs?: number;
  /** Called whenever tokens change, including on clear. */
  onTokensChanged?: (tokens: Tokens | null) => void;
}

export class AuthSession<TCredentials = unknown> {
  readonly state = new Store<SessionState>(ANONYMOUS);
  /** §01 A-5 — fires once per session end, with the reason. */
  readonly ended = new Emitter<SessionEndReason>();

  private readonly driver: AuthDriver<TCredentials>;
  private readonly store: TokenStore;
  private readonly clock: Clock;
  private readonly skewMs: number;
  private readonly onTokensChanged: ((tokens: Tokens | null) => void) | undefined;

  /** §01 A-3 / C-03 — the single-flight latch. */
  private refreshInFlight: Promise<Tokens | null> | null = null;
  private scopeSet: Set<string> = new Set();

  constructor(options: AuthSessionOptions<TCredentials>) {
    this.driver = options.driver;
    this.store = options.tokenStore ?? new MemoryTokenStore();
    this.clock = options.clock ?? systemClock;
    this.skewMs = options.refreshSkewMs ?? 60_000;
    this.onTokensChanged = options.onTokensChanged;
  }

  get user(): SessionUser | null {
    return this.state.get().user;
  }

  get scopes(): readonly string[] {
    return this.state.get().scopes;
  }

  get isAuthenticated(): boolean {
    return this.state.get().status === 'authenticated';
  }

  get isOperator(): boolean {
    return this.user?.type === 'operator';
  }

  get isDealer(): boolean {
    return this.user?.type === 'dealer';
  }

  get isMobile(): boolean {
    return this.user?.type === 'mobile';
  }

  /**
   * §01 A-9 / C-07 — exact match, no hierarchy. `sides:write` does not imply
   * `sides:read`; `GetCustomerSides` genuinely requires both.
   */
  can(scope: string): boolean {
    return this.scopeSet.has(scope);
  }

  canAll(scopes: readonly string[]): boolean {
    return scopes.every((s) => this.scopeSet.has(s));
  }

  canAny(scopes: readonly string[]): boolean {
    return scopes.some((s) => this.scopeSet.has(s));
  }

  /** Fires on login, refresh and logout. Returns an unsubscribe. */
  onChanged(listener: (state: SessionState) => void) {
    return this.state.subscribe(listener);
  }

  onSessionEnded(listener: (reason: SessionEndReason) => void) {
    return this.ended.on(listener);
  }

  /**
   * Restores a session from a persistent token store on boot.
   *
   * A no-op when the session is already live and has a profile: a host that
   * calls this from a shell's init after a login in the same page would
   * otherwise read `GetCurrentUser` twice for one sign-in.
   */
  async restore(): Promise<boolean> {
    const tokens = await this.store.read();
    if (!tokens?.accessToken) return false;
    if (this.isAuthenticated && this.user) return true;

    this.applyState({ status: 'authenticated', user: this.user, scopes: this.scopes });
    await this.loadUser();
    return this.isAuthenticated;
  }

  async login(credentials: TCredentials, signal?: AbortSignal): Promise<SessionState> {
    const result = await this.driver.login(credentials, signal);
    await this.acceptAuthResult(result);
    if (!result.user && this.driver.currentUser) await this.loadUser(signal);
    return this.state.get();
  }

  /** §01 A-7 — the store is cleared even when the server call fails. */
  async logout(signal?: AbortSignal): Promise<void> {
    try {
      await this.driver.logout?.(signal);
    } catch {
      // A logout that cannot reach the server still ends the local session.
    } finally {
      await this.end('logout');
    }
  }

  /**
   * §01 A-1/A-2 — the token to put on the next request, refreshed proactively
   * when it is inside the skew window. Returns null when there is no session.
   */
  async getAccessToken(): Promise<string | null> {
    const tokens = await this.store.read();
    if (!tokens?.accessToken) return null;

    if (this.isExpiring(tokens)) {
      const refreshed = await this.refresh();
      return refreshed?.accessToken ?? null;
    }
    return tokens.accessToken;
  }

  /**
   * §01 A-4/A-5/A-6 — what to do with a 401 that arrived anyway.
   * Returns true when the caller should replay the request exactly once.
   *
   * `staleToken` is the token the failed request carried. If the store has
   * moved on since, another request already refreshed and the replay proceeds
   * with the new token rather than issuing a second refresh (§01 A-3).
   */
  async handleUnauthorized(problem: ProblemDetails, staleToken: string | null): Promise<boolean> {
    if (isTerminalAuthCode(problem.code)) {
      await this.end(problem.code === AuthCodes.ACCOUNT_LOCKED ? 'account-locked' : 'token-invalid');
      return false;
    }

    const current = await this.store.read();
    if (current?.accessToken && staleToken && current.accessToken !== staleToken) return true;

    const refreshed = await this.refresh();
    return refreshed !== null;
  }

  /**
   * §01 A-3 / C-03 — one refresh, however many callers ask.
   *
   * Refresh tokens rotate and are hashed at rest (D15), so a second concurrent
   * refresh does not merely waste a round trip, it invalidates the session that
   * the first one just established.
   */
  refresh(): Promise<Tokens | null> {
    if (this.refreshInFlight) return this.refreshInFlight;
    this.refreshInFlight = this.doRefresh().finally(() => {
      this.refreshInFlight = null;
    });
    return this.refreshInFlight;
  }

  private async doRefresh(): Promise<Tokens | null> {
    const tokens = await this.store.read();
    if (!tokens?.refreshToken) {
      await this.end('no-refresh-token');
      return null;
    }
    try {
      const result = await this.driver.refresh(tokens.refreshToken);
      await this.acceptAuthResult(result);
      // §01 A-10 — scopes are re-read after refresh, not only at login.
      if (!result.scopes && this.driver.currentUser) await this.loadUser();
      return (await this.store.read()) ?? null;
    } catch (error) {
      const code = (error as { code?: string } | null)?.code;
      await this.end(
        code === AuthCodes.ACCOUNT_LOCKED
          ? 'account-locked'
          : isTerminalAuthCode(code)
            ? 'token-invalid'
            : 'refresh-failed',
      );
      return null;
    }
  }

  /** Re-reads user and scopes. Safe to call at any time; no-op without a driver hook. */
  async loadUser(signal?: AbortSignal): Promise<void> {
    if (!this.driver.currentUser) return;
    try {
      const { user, scopes } = await this.driver.currentUser(signal);
      this.applyState({ status: 'authenticated', user, scopes });
    } catch {
      // A failed profile read is not a failed session: the token may still be
      // good and the next request will say so. Scopes stay as they were.
    }
  }

  /** For hosts that obtain tokens by another route (an SSO handoff, a test fixture). */
  async setTokens(tokens: Tokens | null): Promise<void> {
    if (!tokens) {
      await this.end('logout');
      return;
    }
    await this.store.write(this.withExpiry(tokens));
    this.onTokensChanged?.(tokens);
    this.applyState({ status: 'authenticated', user: this.user, scopes: this.scopes });
  }

  private async acceptAuthResult(result: AuthResult): Promise<void> {
    await this.store.write(this.withExpiry(result.tokens));
    this.onTokensChanged?.(result.tokens);
    this.applyState({
      status: 'authenticated',
      user: result.user ?? this.user,
      scopes: result.scopes ?? this.scopes,
    });
  }

  private async end(reason: SessionEndReason): Promise<void> {
    await this.store.clear();
    this.onTokensChanged?.(null);
    this.scopeSet = new Set();
    this.state.set(ANONYMOUS);
    this.ended.emit(reason);
  }

  private applyState(next: SessionState): void {
    this.scopeSet = new Set(next.scopes);
    // Always a fresh object: subscribers compare by identity.
    this.state.set({ status: next.status, user: next.user, scopes: [...next.scopes] });
  }

  /** A login response without `expiresAt` still yields proactive refresh if the JWT says `exp`. */
  private withExpiry(tokens: Tokens): Tokens {
    if (tokens.expiresAt !== undefined) return tokens;
    const exp = expiryFromJwt(tokens.accessToken);
    return exp === null ? tokens : { ...tokens, expiresAt: exp };
  }

  private isExpiring(tokens: Tokens): boolean {
    if (tokens.expiresAt === undefined) return false;
    return tokens.expiresAt - this.clock.now() < this.skewMs;
  }
}
