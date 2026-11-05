export type PrincipalType = 'operator' | 'dealer' | 'mobile' | 'system'

export interface MonitoringCenterOptions {
  view?: { passwordMask?: boolean }
  [section: string]: unknown
}

export interface MonitoringCenterSummary {
  id: string
  name: string
  code?: string
  timeZone?: string
  alarmSoundUrl?: string
  options?: MonitoringCenterOptions
}

export interface DealerSummary {
  id: string
  name: string
  code?: string
}

export interface AlarmCategoryAssignment {
  id: string
  name: string
}

export interface UserInfo {
  id: string
  userName: string
  fullName: string
  email?: string
  principalType: PrincipalType
  extension?: string
  monitoringCenterId?: string
  monitoringCenter?: MonitoringCenterSummary
  dealerId?: string
  dealer?: DealerSummary
  scopes: string[]
  /** Server-assigned alarm category filter. Empty/absent = no filter (see all). */
  allowedAlarmCategories?: AlarmCategoryAssignment[]
  /**
   * Role field policy (API D77): field keys such as `side.address` the API leaves out of
   * responses for this user, and those it refuses in a request body. Absent = none.
   */
  hiddenFields?: string[]
  readOnlyFields?: string[]
  /**
   * The operator's "play alarm sound" switch, from `/v1/auth/me`. Absent when the API did
   * not say (older API, login response), and then the console rings as it always has.
   */
  soundAlertEnabled?: boolean
  /**
   * API D86: the customers this operator is limited to, from `/v1/auth/me`. Null = not
   * limited; absent = the response did not say (login response), keep what /me said.
   */
  customerScope?: CustomerScopeAssignment[] | null
}

/** One customer a customer-limited operator may work with (API D86). */
export interface CustomerScopeAssignment {
  id: string
  /** Null when the customer was deleted since. */
  name: string | null
}

export interface ClientConfig {
  forceUppercase: boolean
  defaultLanguage: string
  supportedCultures: string[]
  idleWarningMinutes: number
  liveSignalLimit: number
  monitoringCenter: MonitoringCenterSummary
  featureFlags?: Record<string, boolean>
}

export interface SessionState {
  user: UserInfo | null
  config: ClientConfig | null
  isAuthenticated: boolean
  isLoading: boolean
  scopes: Set<string>
  intendedRoute: string | null
}
