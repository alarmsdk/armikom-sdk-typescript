/**
 * The Armikom.Api implementation of layer 2's `AuthDriver`.
 *
 * All the session *logic* — proactive refresh, single-flight, terminal codes,
 * scope re-read — lives in `core/session.ts` and knows nothing about this file.
 * This is only the four calls (§01 3.1) and the mapping of their payloads.
 */
import type { AuthDriver, AuthResult, SessionUser } from '../core/session.js';
import type { LoginRequest } from '../../generated/models/LoginRequest.js';
import type { AuthenticationApi } from '../../generated/apis/AuthenticationApi.js';

export interface ArmikomCredentials extends LoginRequest {}

export class ArmikomAuthDriver implements AuthDriver<ArmikomCredentials> {
  constructor(private readonly api: AuthenticationApi) {}

  async login(credentials: ArmikomCredentials): Promise<AuthResult> {
    const response = await this.api.login({ loginRequest: credentials });
    return {
      tokens: {
        accessToken: response.accessToken ?? '',
        ...(response.refreshToken ? { refreshToken: response.refreshToken } : {}),
        ...(response.expiresAt ? { expiresAt: response.expiresAt.getTime() } : {}),
      },
      user: toSessionUser(response.user),
      ...(response.user?.scopes ? { scopes: response.user.scopes } : {}),
    };
  }

  async refresh(refreshToken: string): Promise<AuthResult> {
    const response = await this.api.refreshToken({ refreshRequest: { refreshToken } });
    return {
      tokens: {
        accessToken: response.accessToken ?? '',
        ...(response.refreshToken ? { refreshToken: response.refreshToken } : {}),
        ...(response.expiresAt ? { expiresAt: response.expiresAt.getTime() } : {}),
      },
    };
  }

  async logout(): Promise<void> {
    // The refresh token is what the server revokes; without one there is
    // nothing server-side to end, and clearing the local store is the whole job.
    await this.api.logout({ refreshRequest: { refreshToken: '' } });
  }

  async currentUser(): Promise<{ user: SessionUser | null; scopes: readonly string[] }> {
    const me = await this.api.getCurrentUser({});
    return {
      user: {
        ...(me.id ? { id: me.id } : {}),
        ...(me.name ? { name: me.name } : {}),
        ...(me.type ? { type: me.type } : {}),
        ...(me.monitoringCenterId ? { monitoringCenterId: me.monitoringCenterId } : {}),
        ...(me.dealerId ? { dealerId: me.dealerId } : {}),
        ...(me.extension ? { extension: me.extension } : {}),
        monitoringCenterName: me.monitoringCenterName ?? null,
        dealerName: me.dealerName ?? null,
      },
      // §01 A-10 — the authoritative capability list for the session.
      scopes: me.scopes ?? [],
    };
  }
}

function toSessionUser(user: { id?: string; name?: string | null; type?: string | null } | undefined): SessionUser | null {
  if (!user) return null;
  return {
    ...(user.id ? { id: user.id } : {}),
    ...(user.name ? { name: user.name } : {}),
    ...(user.type ? { type: user.type } : {}),
  };
}
