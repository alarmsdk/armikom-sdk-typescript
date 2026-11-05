/**
 * The console's auth driver and token-store decorator for `ArmikomClient`.
 *
 * `core/session.ts` owns the session logic (proactive refresh, single-flight, replay-once,
 * terminal codes, scope re-read) and `ArmikomAuthDriver` the four calls. The console needs
 * two things the core keeps no room for: the full `UserInfo` the screens are written against
 * (field policy, customer scope, alarm categories, sound flag) and `shiftRestricted` (D42)
 * from the login and refresh responses. This driver remembers both and emits the latter.
 */
import type { AuthenticationApi } from '../../generated/apis/AuthenticationApi.js'
import type { LoginResponse } from '../../generated/models/LoginResponse.js'
import type { UserInfoResponse } from '../../generated/models/UserInfoResponse.js'
import type { UserInfo as WireUserInfo } from '../../generated/models/UserInfo.js'
import type { ArmikomCredentials } from '../armikom/auth.js'
import { Emitter } from '../core/observable.js'
import type { AuthDriver, AuthResult, SessionUser } from '../core/session.js'
import type { TokenStore, Tokens } from '../core/tokens.js'
import type { UserInfo } from '../domain/types/session.js'

/** `/v1/auth/me` as the console's `UserInfo`. */
export function toUserInfo(resp: UserInfoResponse): UserInfo {
  return {
    id: resp.id || '',
    userName: resp.name || '',
    fullName: resp.name || '',
    principalType: (resp.type || 'operator') as UserInfo['principalType'],
    extension: resp.extension || '',
    monitoringCenterId: resp.monitoringCenterId || '',
    dealerId: resp.dealerId || '',
    scopes: resp.scopes || [],
    allowedAlarmCategories: (resp as { allowedAlarmCategories?: UserInfo['allowedAlarmCategories'] }).allowedAlarmCategories ?? undefined,
    hiddenFields: resp.hiddenFields ?? [],
    readOnlyFields: resp.readOnlyFields ?? [],
    ...(typeof resp.soundAlertEnabled === 'boolean' ? { soundAlertEnabled: resp.soundAlertEnabled } : {}),
    customerScope: resp.customerScope
      ? resp.customerScope.map((c) => ({ id: c.id || '', name: c.name ?? null }))
      : null
  }
}

/** The user on a login response: what the server said, with the credentials as the fallback. */
export function loginUserInfo(user: WireUserInfo, username: string, type: string): Partial<UserInfo> {
  return {
    id: user.id || '',
    userName: user.name || username,
    fullName: user.name || username,
    principalType: (user.type || type) as UserInfo['principalType'],
    extension: user.extension || '',
    monitoringCenterId: user.monitoringCenterId || '',
    dealerId: user.dealerId || '',
    scopes: user.scopes || []
  }
}

function tokensOf(resp: { accessToken?: string | null; refreshToken?: string | null; expiresAt?: Date }): Tokens {
  return {
    accessToken: resp.accessToken ?? '',
    ...(resp.refreshToken ? { refreshToken: resp.refreshToken } : {}),
    ...(resp.expiresAt ? { expiresAt: resp.expiresAt.getTime() } : {})
  }
}

export class ConsoleAuthDriver implements AuthDriver<ArmikomCredentials> {
  /** The last login response, so the facade can report what the core session does not keep. */
  lastLogin: LoginResponse | null = null
  /** A refresh token given explicitly to `logout`; the stored one is revoked otherwise. */
  logoutToken: string | null = null
  /** D42 — fires after every successful refresh. */
  readonly refreshed = new Emitter<{ shiftRestricted: boolean }>()

  constructor(
    private readonly api: AuthenticationApi,
    private readonly tokens: TokenStore
  ) {}

  async login(credentials: ArmikomCredentials, signal?: AbortSignal): Promise<AuthResult> {
    const resp = await this.api.login({ loginRequest: credentials }, signal ? { signal } : undefined)
    this.lastLogin = resp
    const user = resp.user
      ? (loginUserInfo(resp.user, credentials.username ?? '', credentials.type ?? 'operator') as unknown as SessionUser)
      : null
    return {
      tokens: tokensOf(resp),
      user,
      ...(resp.user?.scopes ? { scopes: resp.user.scopes } : {})
    }
  }

  async refresh(refreshToken: string, signal?: AbortSignal): Promise<AuthResult> {
    const resp = await this.api.refreshToken({ refreshRequest: { refreshToken } }, signal ? { signal } : undefined)
    this.refreshed.emit({ shiftRestricted: resp.shiftRestricted ?? false })
    return { tokens: tokensOf(resp) }
  }

  async logout(signal?: AbortSignal): Promise<void> {
    const stored = await this.tokens.read()
    const refreshToken = this.logoutToken ?? stored?.refreshToken ?? null
    this.logoutToken = null
    // The endpoint revokes the refresh token it is given; without one there is nothing
    // server-side to end, and clearing the store (which the session does next) is the job.
    if (!refreshToken) return
    await this.api.logout({ refreshRequest: { refreshToken } }, signal ? { signal } : undefined)
  }

  async currentUser(signal?: AbortSignal): Promise<{ user: SessionUser | null; scopes: readonly string[] }> {
    const me = await this.api.getCurrentUser({}, signal ? { signal } : undefined)
    const user = toUserInfo(me)
    // §01 A-10 — the authoritative capability list for the session.
    return { user: user as unknown as SessionUser, scopes: user.scopes }
  }
}

/**
 * Wraps the host's token store so the facade can report token changes (`onTokensChanged`)
 * without the core session having to know anyone is listening.
 */
export class NotifyingTokenStore implements TokenStore {
  readonly changed = new Emitter<Tokens | null>()

  constructor(private readonly inner: TokenStore) {}

  read(): Tokens | null | Promise<Tokens | null> {
    return this.inner.read()
  }

  async write(tokens: Tokens): Promise<void> {
    await this.inner.write(tokens)
    this.changed.emit(tokens)
  }

  async clear(): Promise<void> {
    await this.inner.clear()
    this.changed.emit(null)
  }
}
