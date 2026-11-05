/**
 * `ArmikomClientInterface` — the operator consoles' client facade.
 *
 * Every screen in the Vue console is written against this interface, and the mock client
 * (`createMockArmikomClient`) implements it too, which is what lets the whole console run
 * without a backend. It is the *console's* view of the API: sections per screen family,
 * `Page<T>` for every list, `BinaryContent` for every download, and the console's own
 * view-model types (`UserInfo`, `ClientConfig`, …) rather than the generated models.
 *
 * `createConsoleClient` is the real implementation, built on `ArmikomClient`. A React or
 * Angular console takes the same interface and the same implementation; only the mock and
 * the framework glue (provide/inject, hooks, DI) are theirs to write.
 */
import type { UserInfo, ClientConfig, CustomerScopeAssignment } from '../domain/types/session.js'
import type {
  PhoneAuditSummaryResponse,
  PhoneAuditEntityDetailResponse,
  PhoneNormalizationResult,
  MyAlarmSisSignalTypeItem,
  MyAlarmSisComparisonRequest,
  MyAlarmSisComparisonResponse,
  SignalRuleCatalog,
  SignalRuleDetail,
  SignalRuleItem,
  SignalRuleValidationResponse,
  SignalRuleWriteRequest
} from '../../generated/index.js'
import type {
  BinaryContent,
  BinaryOperation,
  SignalExportOptions,
  SideExportOptions,
  SideStatusHistoryExportOptions,
  BulkSmsAlarmTargetOptions
} from '../domain/types/files.js'
import type { ReportsClient } from '../domain/types/reports.js'
import type { DeletePreview } from '../domain/deletePreview.js'
import type { Tokens } from '../core/tokens.js'
import type { SessionEndReason } from '../core/session.js'
import type { Unsubscribe } from '../core/observable.js'
import type { ArmikomClient } from '../armikom/client.js'

export interface Page<T> {
  items: T[]
  hasMore: boolean
  totalCount?: number | null
  isCapped?: boolean
}

/** Canned action text offered by the quick-complete picker (`ListSignalExplanations`). */
export interface SignalExplanation {
  id: string
  name: string
  priority?: number
}

/** Canned note text offered by the quick-complete picker for subscriber notes (`ListNoteExplanations`). */
export interface NoteExplanation {
  id: string
  name: string
  priority?: number
}

export interface LoginResult {
  accessToken?: string | null
  refreshToken?: string | null
  expiresAt?: Date
  user?: Partial<UserInfo>
  /**
   * True when the server reduced this session to read-only scopes because the
   * operator is outside their work schedule (D42). It is not an error and not a
   * lesser login — the shell says so, and write affordances degrade rather than
   * waiting to 403.
   */
  shiftRestricted?: boolean
}

/**
 * S-800 create. `extension` is a number on the wire; sending the string the input
 * yields is a 400 the operator cannot diagnose.
 */
export interface OperatorUserCreate {
  userName: string
  password: string
  isActive?: boolean
  extension?: number | null
  soundAlertEnabled?: boolean
  monitoringCenterId?: string | null
  workScheduleId?: string | null
  roleIds?: string[]
}

/** S-800 edit. The user name is immutable and the password is never carried here. */
export interface OperatorUserUpdate {
  isActive?: boolean | null
  extension?: number | null
  soundAlertEnabled?: boolean | null
  monitoringCenterId?: string | null
  workScheduleId?: string | null
}

export interface WorkScheduleWrite {
  name: string
  isActive?: boolean
  entries?: WorkScheduleEntryWrite[]
}

/**
 * `dayOfWeek` is EDayOfWeek — Monday = 1 … Sunday = 7, not `Date.getDay()`.
 * `startTime` / `endTime` are **seconds of day**, matching SideTimeTable; an entry
 * whose end is before its start is an overnight shift, which the API supports.
 */
export interface WorkScheduleEntryWrite {
  dayOfWeek: number
  startTime: number | null
  endTime: number | null
}

/**
 * S-202 create. Every field is optional on the wire, but `sideNo` and `dealerId`
 * are refused server-side when absent — the wizard enforces both before submit
 * rather than letting the operator reach the summary step and bounce off a 400.
 *
 * The three dates are `Date` on the wire, not the `yyyy-MM-dd` string an
 * `<input type="date">` yields; the wizard converts before it calls.
 */
export interface SideCreate {
  sideNo: number
  partNo?: number | null
  name?: string | null
  monitoringCenterId?: string | null
  dealerId?: string | null
  customerId?: string | null
  customerName?: string | null
  installerId?: string | null
  address?: string | null
  cityId?: string | null
  districtId?: string | null
  regionId?: string | null
  latitude?: string | null
  longitude?: string | null
  timeZone?: string | null
  brandId?: string | null
  modelId?: string | null
  protocolId?: string | null
  serialNumber?: string | null
  armType?: string | null
  gprs?: boolean | null
  mobileNotification?: boolean | null
  gprsModule?: number | null
  ebsModulePort?: number | null
  timeoutDurationMinutes?: number | null
  gprsTimeoutMinutes?: number | null
  accountTypeId?: string | null
  businessSectorId?: string | null
  sideTypeId?: string | null
  installDate?: Date | null
  startDate?: Date | null
  endDate?: Date | null
  safePassword?: string | null
  identityNo?: string | null
  taxOffice?: string | null
  taxNo?: string | null
  policeStationNo?: string | null
  phone1?: string | null
  phone2?: string | null
  sysPhone?: string | null
  mobilePhone?: string | null
  comment?: string | null
}

/**
 * S-203. `include[]` names the sections that carry over. Unknown names return
 * `SIDE_CLONE.UNKNOWN_SECTION`, so the UI offers fixed checkboxes and never free
 * text — see CLONE_SECTIONS.
 */
export interface SideCloneRequest {
  sideNo: number
  name?: string | null
  include?: string[]
  /**
   * API D87: copy into another monitoring center. Only operators without a centre on
   * their token may name one other than the source's (403 otherwise); sent only when
   * it differs, so a same-centre copy keeps working against an older API.
   */
  monitoringCenterId?: string
}

/** S-203 partition: a new `partNo` on the *same* `sideNo`. */
export interface SidePartitionRequest {
  partNo: number
  name?: string | null
  include?: string[]
}

/**
 * The sections `CloneSide` and `CreatePartition` accept in `include[]`.
 *
 * Fixed list by contract: the server rejects anything it does not recognise, so
 * these are rendered as checkboxes. Kept next to the request types so the two
 * cannot drift apart.
 */
export const CLONE_SECTIONS = [
  'contacts',
  'users',
  'zones',
  'signal-types',
  'timetables',
  'sms-config'
] as const

export type CloneSection = (typeof CLONE_SECTIONS)[number]

/** Locale key per section; the wire names carry a hyphen and a plural the keys predate. */
export const CLONE_SECTION_LABEL_KEYS: Record<CloneSection, string> = {
  contacts: 'UI.SUBSCRIBER_CLONE.SECTION_CONTACTS',
  users: 'UI.SUBSCRIBER_CLONE.SECTION_USERS',
  zones: 'UI.SUBSCRIBER_CLONE.SECTION_ZONES',
  'signal-types': 'UI.SUBSCRIBER_CLONE.SECTION_SIGNALTYPES',
  timetables: 'UI.SUBSCRIBER_CLONE.SECTION_TIMETABLE',
  'sms-config': 'UI.SUBSCRIBER_CLONE.SECTION_SMSCONFIG'
}

/**
 * S-206b. `target` is one of four mutually exclusive blast radii.
 *
 * The fourth — `filter` — is the subscriber list's own criteria, re-run server-side
 * so "apply to what I'm looking at" hits the same rows the operator confirmed.
 * `expectedCount` is the row count the operator retyped; a set that moved since
 * comes back as `SIDE_HOLIDAY.COUNT_MISMATCH` with nothing written.
 */
export interface ApplyHolidaysCommand {
  holidays: { name?: string | null; startDate?: Date | null; recurring?: boolean; startTime?: string | null; endTime?: string | null }[]
  target: {
    sideIds?: string[] | null
    dealerId?: string | null
    allInMonitoringCenter?: boolean
    filter?: Record<string, unknown> | null
  }
  expectedCount?: number | null
}

/**
 * S-104. The mode vocabulary is **server-driven**: `availableModes` is the only list
 * the dialog may render, and `hasTimeTable = false` is what removes shift-closing
 * from it (`CLOSING_DELAY.SHIFT_CLOSING_TIME_UNAVAILABLE` if attempted anyway).
 */
export interface ClosingDelayOptions {
  hasTimeTable?: boolean
  availableModes?: string[] | null
  suggestedBaseTime?: Date | null
  todayClosingTime?: string | null
  /** Per-day closing times. Null when no timetable exists. */
  closingSchedule?: ClosingScheduleEntry[] | null
}

/** One day's closing time in the subscriber's weekly schedule. */
export interface ClosingScheduleEntry {
  /** EDayOfWeek: Monday = 1 … Sunday = 7. */
  day?: number
  /** Closing time as "HH:mm". */
  closingTime?: string | null
  /** True when closing is after midnight (shift closes on the next calendar day). */
  isNextDay?: boolean
}

/** All computation happens in the subscriber's zone and is stored UTC (D21). */
export interface ClosingDelayCommand {
  mode?: string | null
  delayTime?: number
  timeUnit?: string | null
  closingDate?: Date | null
  note?: string | null
}

/**
 * S-809 · one activity event. Producer only: there is no read endpoint (G-28) and
 * the sink is Serilog → Seq (D18), so no viewer is built for this.
 */
export interface ActivityEvent {
  type: string
  occurredAt?: Date
  target?: string | null
  caption?: string | null
  detail?: Record<string, unknown> | null
}

/**
 * A Side record with a brand/model/protocol data issue — either a missing
 * field or a protocol that is not in ModelProtocol for the selected model.
 */
export interface SideDataIssueItem {
  id: string
  sideNo: number | null
  partNo?: number | null
  name: string | null
  active: boolean | null
  dealerName: string | null
  customerName: string | null
  brandId: string | null
  brandName: string | null
  modelId: string | null
  modelName: string | null
  protocolId: string | null
  protocolName: string | null
  /** "missing" (null fields) or "protocol_mismatch" (protocol not valid for model). */
  issueType: 'missing' | 'protocol_mismatch'
}

/** What `session.onChanged` reports. */
export interface SessionSnapshot {
  status: 'anonymous' | 'authenticated'
  user: UserInfo | null
  scopes: readonly string[]
}

/** GetAlarmEvents never returns more than this many rows (Pitfall 2); the grid must say so. */
export const ALARM_EVENTS_ROW_CAP = 100

export interface ArmikomClientInterface {
  baseUrl: string
  /**
   * The underlying SDK client, when this facade is `createConsoleClient`. Absent on the mock.
   * Reach for it for what the facade does not cover (`sdk.http`, `sdk.stream`, `sdk.reference`).
   */
  sdk?: ArmikomClient
  session: {
    can: (scope: string) => boolean
    /**
     * Signs in and adopts the new session: tokens go to the client's token store, and every
     * later request carries them. Returns what the server said, including `shiftRestricted`.
     */
    login?: (username: string, password: string, type?: string) => Promise<LoginResult>
    getCurrentUser: () => Promise<UserInfo>
    /**
     * Ends the session on both sides: the refresh token is revoked server-side (the stored one,
     * or the one given), and the token store is cleared even when the server call fails (A-7).
     */
    logout: (refreshToken?: string | null) => Promise<void>
    /**
     * Boot: restores the session from the token store, refreshing proactively when the access
     * token is inside the skew window (A-2), and reads the user and scopes (A-10). Resolves to
     * the user, or null when there is no usable session — the token store is then already clear.
     */
    restore?: () => Promise<UserInfo | null>
    /** A refresh on demand, single-flight (A-3). False when the session ended instead. */
    refresh?: () => Promise<boolean>
    /** The tokens the client is currently using, from its store. */
    getTokens?: () => Promise<Tokens | null>
    /** Adopts tokens obtained by another route (an SSO handoff, a test fixture); null ends the session. */
    setTokens?: (tokens: Tokens | null) => Promise<void>
    /** Fires whenever the client's tokens change — login, refresh, logout — with null on clear. */
    onTokensChanged?: (listener: (tokens: Tokens | null) => void) => Unsubscribe
    /**
     * Fires once per session end with the reason: a terminal auth code (A-5), a failed refresh,
     * `remote-access-denied` (D83), or `logout`. The host routes to its login screen here.
     */
    onEnded?: (listener: (reason: SessionEndReason) => void) => Unsubscribe
    /**
     * Fires after every successful token refresh with what the refresh response said. A refresh
     * re-reads the user and scopes by itself (A-10); the host learns about them via `onChanged`.
     */
    onRefreshed?: (listener: (result: { shiftRestricted: boolean }) => void) => Unsubscribe
    /**
     * Fires on login, refresh and logout with the session's user and scopes. `user` is the
     * console's `UserInfo` (as `getCurrentUser` returns it) once the profile has been read.
     */
    onChanged?: (listener: (state: SessionSnapshot) => void) => Unsubscribe
  }
  config: {
    get: () => Promise<ClientConfig>
  }
  i18n: {
    bundle: (culture: string) => Promise<{
      culture: string
      values: Record<string, string>
      t: (key: string, params?: Record<string, unknown>) => string
    }>
    /** The cultures the server actually ships, for the S-806 parity report. */
    supportedCultures?: () => Promise<string[]>
    /** D82 — the tenant's text overrides, culture → key → text. Anonymous. */
    overrides?: () => Promise<Record<string, Record<string, string>>>
    /** D82 — overrides with who changed them last. `admin:translations`. */
    listOverrides?: () => Promise<TranslationOverrideItem[]>
    /** D82 — create or replace one override. `admin:translations`. */
    setOverride?: (culture: string, key: string, value: string) => Promise<TranslationOverrideItem>
    /** D82 — remove one override; the console returns to its shipped text. `admin:translations`. */
    deleteOverride?: (culture: string, key: string) => Promise<void>
  }
  reference: {
    bundle: () => Promise<Record<string, unknown>>
    /**
     * The panel cascade and the city→district pair are **not** in the reference
     * bundle — `ReferenceBundleResponse` carries brands and cities but neither
     * models, protocols nor districts. They are their own endpoints, filtered
     * server-side by the parent id, and must be re-fetched when the parent
     * changes (S-202 step 3).
     */
    models?: (brandId?: string) => Promise<Array<{ id?: string; name?: string | null }>>
    protocols?: (modelId?: string) => Promise<Array<{ id?: string; name?: string | null }>>
    districts?: (cityId?: string) => Promise<Array<{ id?: string; name?: string | null }>>
    /** Lazy fetch of the HTML description for a panel model. */
    getModelDescription?: (modelId: string) => Promise<{ modelId: string; descriptionHtml: string }>
  }
  alarmEvents?: {
    list: (params?: Record<string, unknown>) => Promise<Page<any>>
    getById?: (id: string) => Promise<any>
    lock?: (id: string, options?: { force?: boolean }) => Promise<any>
    unlock?: (id: string) => Promise<any>
    complete?: (id: string, request: any) => Promise<any>
    quickComplete?: (id: string, request: { signalExplanationId: string }) => Promise<any>
    getBatchCandidates?: (params?: { brandId?: string; modelId?: string }) => Promise<any[]>
    batchComplete?: (request: { signalCodes: string[]; action: string; cutoffUtc?: string; brandId?: string; modelId?: string }) => Promise<any>
    batchDelay?: (request: { signalCodes: string[]; delayMinutes: number; cutoffUtc?: string; brandId?: string; modelId?: string }) => Promise<any>
    /** Alarms that left the queue within the last hour (server keeps an hour), newest first. */
    listRecent?: (params?: { minutes?: number; limit?: number }) => Promise<any[]>
    /** Reopen a recently closed alarm: back into the queue under its old id. 409 when already open. */
    restoreRecent?: (id: string) => Promise<any>
  }
  sides?: {
    list: (params?: Record<string, unknown>) => Promise<Page<any>>
    listUnapproved?: (params?: Record<string, unknown>) => Promise<Page<any>>
    getById?: (id: string) => Promise<any>
    contacts?: (sideId: string) => Promise<any[]>
    zones?: (sideId: string) => Promise<any[]>
    notes?: (sideId: string) => Promise<any[]>
    timetables?: (sideId: string) => Promise<any[]>
    holidays?: (sideId: string) => Promise<any[]>
    users?: (sideId: string) => Promise<any[]>
    documents?: (sideId: string) => Promise<any[]>
    agreements?: (sideId: string) => Promise<any[]>
    signalHistory?: (sideId: string, opts?: { page?: number; pageSize?: number }) => Promise<{ items?: any[] | null; hasMore?: boolean; totalCount?: number | null }>
    signalTypes?: (sideId: string) => Promise<any[]>
    /** Guard tour (bekçi takip) definitions — GET/POST/PUT/DELETE /v1/sides/{id}/guard-tours. */
    guardTours?: {
      list: (sideId: string) => Promise<GuardTourItem[]>
      create: (sideId: string, request: GuardTourWrite) => Promise<{ id: string }>
      update: (sideId: string, id: string, request: GuardTourWrite) => Promise<{ id: string }>
      remove: (sideId: string, id: string) => Promise<void>
    }
    smsConfig?: (sideId: string) => Promise<any[]>
    mailConfig?: (sideId: string) => Promise<any[]>
    /** Merged global defaults + this subscriber's overrides, with overriddenFields[]. */
    effectiveSignalTypes?: (sideId: string) => Promise<any[]>
    approve?: (sideId: string, request: { note?: string }) => Promise<any>
    activate?: (sideId: string, request: { activeCategoryId?: string; note?: string }) => Promise<any>
    deactivate?: (sideId: string, request: { activeCategoryId?: string; note?: string }) => Promise<any>
    reasons?: (sideId: string) => Promise<any[]>

    /**
     * Sub-resources whose list lives on `SubscribersApi` while their writes live
     * on an api of their own — the shape is asymmetric in the generated client,
     * not here.
     */
    simCards?: (sideId: string) => Promise<any[]>
    createSimCard?: (sideId: string, request: Record<string, unknown>) => Promise<any>
    updateSimCard?: (sideId: string, id: string, request: Record<string, unknown>) => Promise<any>
    deleteSimCard?: (sideId: string, id: string) => Promise<void>

    controls?: (sideId: string) => Promise<any[]>
    createControl?: (sideId: string, request: Record<string, unknown>) => Promise<any>
    updateControl?: (sideId: string, id: string, request: Record<string, unknown>) => Promise<any>
    deleteControl?: (sideId: string, id: string) => Promise<void>

    mails?: (sideId: string) => Promise<any[]>
    createMail?: (sideId: string, request: Record<string, unknown>) => Promise<any>
    updateMail?: (sideId: string, id: string, request: Record<string, unknown>) => Promise<any>
    deleteMail?: (sideId: string, id: string) => Promise<void>

    /** Invoices are created by the generation run; `paid` is the only editable field. */
    invoices?: (sideId: string) => Promise<any[]>
    setInvoicePaid?: (sideId: string, id: string, paid: boolean) => Promise<any>

    /** SMS the sender queued for this subscriber, newest first (GET /v1/sms-log?sideId, registers:read). */
    smsLog?: (sideId: string) => Promise<any[]>
    /** Push notifications sent to this subscriber's mobile users (GET /v1/sides/{id}/mobile-messages). */
    pushMessages?: (sideId: string) => Promise<any[]>

    /** Overview PATCH — only dirty fields travel (RFC 7396, §01 R-6). */
    update?: (sideId: string, patch: Record<string, unknown>) => Promise<any>

    /**
     * S-200 batch update: the same field values across many subscribers. The target is
     * named either by `sideIds` or by `filter` — the list endpoint's own criteria, re-run
     * server-side so a batch can only ever hit what the search matched — and never both.
     * `expectedCount` is the row count the operator confirmed; a set that has moved since
     * comes back as `SIDE_BATCH.COUNT_MISMATCH` with nothing written.
     */
    batchUpdate?: (request: {
      sideIds?: string[]
      filter?: Record<string, unknown>
      expectedCount?: number
      changes: Record<string, unknown>
    }) => Promise<{
      requestedCount: number
      updatedCount: number
      skippedCount: number
      isCapped?: boolean
      failures?: Array<{
        sideId: string
        sideNo?: number | null
        partNo?: number | null
        name?: string | null
        code: string
        message: string
      }>
      sideEffects?: string[] | null
    }>

    createContact?: (sideId: string, request: Record<string, unknown>) => Promise<any>
    updateContact?: (sideId: string, id: string, patch: Record<string, unknown>) => Promise<any>
    deleteContact?: (sideId: string, id: string) => Promise<any>
    /** Atomic and complete: a partial ordering returns SIDE_CONTACT.ORDER_INCOMPLETE. */
    reorderContacts?: (sideId: string, ids: string[]) => Promise<any>

    createUser?: (sideId: string, request: Record<string, unknown>) => Promise<any>
    updateUser?: (sideId: string, id: string, patch: Record<string, unknown>) => Promise<any>
    deleteUser?: (sideId: string, id: string) => Promise<any>

    createZone?: (sideId: string, request: Record<string, unknown>) => Promise<any>
    updateZone?: (sideId: string, id: string, patch: Record<string, unknown>) => Promise<any>
    deleteZone?: (sideId: string, id: string) => Promise<any>
    /** One transaction — all or nothing. */
    bulkCreateZones?: (sideId: string, zones: Record<string, unknown>[]) => Promise<any>

    /** Replaces the whole week. */
    upsertTimetable?: (sideId: string, days: Record<string, unknown>[]) => Promise<any>
    updateTimetableDay?: (sideId: string, id: string, request: Record<string, unknown>) => Promise<any>
    deleteTimetableDay?: (sideId: string, id: string) => Promise<any>

    createHoliday?: (sideId: string, request: Record<string, unknown>) => Promise<any>
    updateHoliday?: (sideId: string, id: string, patch: Record<string, unknown>) => Promise<any>
    deleteHoliday?: (sideId: string, id: string) => Promise<any>
    bulkCreateHolidays?: (sideId: string, holidays: Record<string, unknown>[]) => Promise<any>

    createNote?: (sideId: string, request: Record<string, unknown>) => Promise<any>
    updateNote?: (sideId: string, id: string, patch: Record<string, unknown>) => Promise<any>
    deleteNote?: (sideId: string, id: string) => Promise<any>

    createSignalType?: (sideId: string, request: Record<string, unknown>) => Promise<any>
    updateSignalType?: (sideId: string, id: string, patch: Record<string, unknown>) => Promise<any>
    deleteSignalType?: (sideId: string, id: string) => Promise<any>
    /** Replaces the entire override set — tier-3 confirm. */
    bulkReplaceSignalTypes?: (sideId: string, overrides: Record<string, unknown>[]) => Promise<any>
    copySignalTypes?: (sideId: string, sourceSideId: string, overwrite: boolean) => Promise<any>

    createSmsConfig?: (sideId: string, request: Record<string, unknown>) => Promise<any>
    updateSmsConfig?: (sideId: string, id: string, patch: Record<string, unknown>) => Promise<any>
    deleteSmsConfig?: (sideId: string, id: string) => Promise<any>

    createMailConfig?: (sideId: string, request: Record<string, unknown>) => Promise<any>
    updateMailConfig?: (sideId: string, id: string, patch: Record<string, unknown>) => Promise<any>
    deleteMailConfig?: (sideId: string, id: string) => Promise<any>

    createAgreement?: (sideId: string, request: Record<string, unknown>) => Promise<any>
    updateAgreement?: (sideId: string, id: string, patch: Record<string, unknown>) => Promise<any>
    deleteAgreement?: (sideId: string, id: string) => Promise<any>

    createDocument?: (sideId: string, file: File, name?: string) => Promise<any>
    deleteDocument?: (sideId: string, id: string) => Promise<any>

    /** S-202. Returns SideWriteResponse — `id` plus the server's sideEffects[]. */
    create?: (request: SideCreate) => Promise<any>
    /** S-203 clone: a new subscriber carrying the chosen sections. */
    clone?: (sideId: string, request: SideCloneRequest) => Promise<any>
    /** S-203 partition: another partNo under the same sideNo. */
    createPartition?: (sideId: string, request: SidePartitionRequest) => Promise<any>
    changeSideNo?: (sideId: string, sideNo: number) => Promise<any>
    /**
     * S-201 delete. Legal only while the subscriber is passive
     * (`SIDE.DELETE_REQUIRES_PASSIVE`); the header offers Deactivate first rather
     * than letting the operator find out from the error.
     */
    remove?: (sideId: string) => Promise<any>
    /**
     * What deleting the subscriber touches (history that stays, blockers). Subscribers are
     * soft-deleted and can be restored from the deleted list.
     */
    deletePreview?: (sideId: string) => Promise<DeletePreview>
    /** What deleting a contact touches: SMS configuration removed with it, history kept. */
    contactDeletePreview?: (sideId: string, id: string) => Promise<DeletePreview>
    /** Soft-deleted subscribers, newest deletion first. */
    listDeleted?: (params?: { q?: string; limit?: number; offset?: number }) => Promise<Page<any>>
    /** Brings a deleted subscriber back (still passive). 409 `SIDE.SIDE_NO_DUPLICATE` if its number was reused. */
    restore?: (sideId: string) => Promise<any>

    /** S-206a. The next free number, optionally within a range. */
    nextSideNo?: (params?: {
      monitoringCenterId?: string
      start?: number
      end?: number
    }) => Promise<{ sideNo?: number; sideEffects?: string[] | null }>
    /**
     * S-206a. Free numbers in [start, end]. The server caps a request at 2000
     * numbers, so the range picker pages rather than asking for the whole space.
     */
    availableSideNos?: (
      start: number,
      end: number,
      params?: { monitoringCenterId?: string }
    ) => Promise<{ availableNumbers?: number[] | null; totalCount?: number }>

    /**
     * S-206b. Mass mutation: the response reports what it skipped and why, and the
     * UI renders that report rather than a bare success toast.
     */
    applyHolidays?: (request: ApplyHolidaysCommand) => Promise<any>

    /** Candidates are ranked and never auto-applied (S-201 acceptance 8). */
    geocode?: (sideId: string, force?: boolean) => Promise<any>
    geocodeSearch?: (q: string) => Promise<any>
    setLocation?: (sideId: string, latitude: string, longitude: string) => Promise<any>

    /** Quick-complete text for subscriber notes. */
    listNoteExplanations?: () => Promise<NoteExplanation[]>
  }
  receivers?: {
    list: () => Promise<Array<{ id?: string; name?: string | null; receiverNo?: string | null; active?: boolean | null }>>
  }
  advisories?: {
    /** AI advice for one signal event. Resolves to [] when the service is unavailable. */
    forSignalEvent: (signalEventId: string) => Promise<any[]>
  }
  signalEvents?: {
    list: (params?: Record<string, unknown>) => Promise<Page<any>>
    listLive?: () => Promise<any[]>
    getById?: (id: string) => Promise<any>
    listExplanations?: () => Promise<SignalExplanation[]>
    appendAction?: (id: string, request: { text: string; stamp: boolean }) => Promise<any>
    replaceAction?: (id: string, request: { text: string; stamp: boolean }) => Promise<any>
    delay?: (id: string, request: { delayTime: number; timeUnit: string }) => Promise<any>
    block?: (id: string, request: { blokeTime: number; timeUnit: string }) => Promise<any>
    blockReceiver?: (id: string, request: { sideNo: number }) => Promise<any>
  }
  services?: {
    list: (params?: Record<string, unknown>) => Promise<Page<any>>
    listForSide?: (sideId: string) => Promise<any[]>
    getById?: (id: string) => Promise<any>
    complete?: (id: string) => Promise<any>
    cancel?: (id: string, request: { cancelReason: string }) => Promise<any>
    details?: (id: string) => Promise<any[]>
    photos?: (id: string) => Promise<any[]>
    /** S-402. Creating a service raises ASS and fans out SMS and e-mail. */
    create?: (sideId: string, request: Record<string, unknown>) => Promise<any>
    /** S-401 field edit. */
    update?: (id: string, request: Record<string, unknown>) => Promise<any>
    createDetail?: (id: string, request: Record<string, unknown>) => Promise<any>
    /** Keyed by detailId alone; the server does not take the service id here. */
    updateDetail?: (detailId: string, request: Record<string, unknown>) => Promise<any>
    deleteDetail?: (detailId: string) => Promise<any>
    /**
     * Photo upload. Only the file is sent: the generator drops the description and
     * photoType fields these endpoints accept (G-73), so offering them would mean
     * offering a field that is silently discarded.
     */
    createPhoto?: (id: string, file: File) => Promise<any>
    replacePhotoContent?: (photoId: string, file: File) => Promise<any>
    deletePhoto?: (photoId: string) => Promise<any>
  }
  technicalWork?: {
    listAll: () => Promise<any[]>
    listForSide?: (sideId: string) => Promise<any[]>
    statusForSide?: (sideId: string) => Promise<any>
    completeById?: (id: string) => Promise<any>
    completeForSide?: (sideId: string) => Promise<any>
    /**
     * S-411. An omitted `sideZoneId` suppresses the **whole site**, not one zone —
     * the dialog has to make that distinction unmissable.
     */
    create?: (sideId: string, request: Record<string, unknown>) => Promise<any>
    /** Technicians on file; free text covers anyone who is not. */
    listTechnicalPeople?: (params?: Record<string, unknown>) => Promise<any[]>
  }
  customers?: {
    list: (params?: Record<string, unknown>) => Promise<Page<any>>
    getById?: (id: string) => Promise<any>
    sides?: (id: string) => Promise<any[]>
    /** S-301 writes. */
    create?: (request: Record<string, unknown>) => Promise<any>
    update?: (id: string, request: Record<string, unknown>) => Promise<any>
    /** Refused by the server while sides are still linked; the UI says so first. */
    remove?: (id: string) => Promise<any>
  }
  dealers?: {
    list: (params?: Record<string, unknown>) => Promise<Page<any>>
    getById?: (id: string) => Promise<any>
    statistics?: () => Promise<any>
    sidesByStatus?: (statusType: string) => Promise<any[]>
    /** S-311 writes. No monitoring-centre picker on create, per D32. */
    create?: (request: Record<string, unknown>) => Promise<any>
    update?: (id: string, request: Record<string, unknown>) => Promise<any>
    remove?: (id: string) => Promise<any>
    /**
     * The generated `uploadDealerLogo` builds a PUT with no body at all (G-72).
     * The facade sends the FormData through `initOverrides`; no Content-Type is set
     * by hand, because the server sniffs magic bytes (§01 F-2).
     */
    uploadLogo?: (id: string, file: File) => Promise<any>
    deleteLogo?: (id: string) => Promise<any>
    /** S-312 · the side-number pool. */
    sideNos?: (dealerId: string) => Promise<any>
    sideNoPool?: (dealerId: string) => Promise<any>
    reserveSideNos?: (dealerId: string, request: Record<string, unknown>) => Promise<any>
    releaseSideNo?: (dealerId: string, sideNo: number) => Promise<any>
    releaseSideNoRange?: (dealerId: string, from: number, to: number) => Promise<any>
  }
  mobileUsers?: {
    list: (params?: Record<string, unknown>) => Promise<Page<any>>
    getById?: (id: string) => Promise<any>
    /** S-201 tab o: mobile users linked to one subscriber. */
    listForSide?: (sideId: string) => Promise<any[]>
    /** S-321 writes. The update carries name and phone only — never the password. */
    update?: (id: string, request: { name?: string | null; phone?: string | null }) => Promise<any>
    /** The server takes the new password; it does not generate one. */
    resetPassword?: (id: string, password: string) => Promise<any>
    /**
     * Disable: no login, every issued token refused, all devices logged out. Enable lets the
     * user log in again. Logout-all ends every session but keeps the account usable.
     */
    disable?: (id: string) => Promise<any>
    enable?: (id: string) => Promise<any>
    logoutAll?: (id: string) => Promise<any>
    /** Unlinking from one side; the account survives. Keyed by side, then user. */
    unlinkFromSide?: (sideId: string, userId: string) => Promise<any>
    linkToSide?: (sideId: string, request: Record<string, unknown>) => Promise<any>
    /** S-321: one user to many subscribers in a single request, keyed by user. */
    batchLinkToSides?: (
      userId: string,
      request: { sideIds: string[]; expectedCount?: number }
    ) => Promise<any>
    /** Deleting the account. The response reports what was removed with it. */
    remove?: (id: string) => Promise<any>
    /**
     * New server-generated password per user, texted to each. Ids or the list filter, never
     * both; the response carries counts and per-user failures, never a password.
     */
    batchResetPasswords?: (request: MobileUserBatchResetRequest) => Promise<MobileUserBatchResetResult>
  }
  invoices?: {
    preview: (request: { period: string; dealerId?: string; sideIds?: string[] }) => Promise<any>
    generate: (request: { period: string; dealerId?: string; sideIds?: string[]; expectedCount: number }) => Promise<any>
  }
  dashboard?: {
    counters: () => Promise<{ activeAlarms?: number; liveEventsToday?: number; activeSignals?: number }>
  }
  search?: {
    global: (q: string, signal?: AbortSignal) => Promise<any>
    globalFiltered?: (q: string, entityType: string, limit?: number, skip?: number, signal?: AbortSignal) => Promise<any>
    /** D84: per-section counts for a query, fetched after the uncounted list. */
    counts?: (q: string, signal?: AbortSignal) => Promise<{ sections: Array<{ entityType: string; totalCount: number }>; totalCount: number }>
  }
  admin?: {
    listOperatorUsers: (params?: Record<string, unknown>) => Promise<Page<any>>
    getOperatorUser?: (id: string) => Promise<any>
    unlockUser?: (id: string) => Promise<any>
    health?: () => Promise<any>
    bulkHashPasswords?: (dryRun: boolean) => Promise<any>
    /**
     * Maintenance: subscribers with missing brand/model/protocol or a protocol
     * that is not valid for the selected model. Server-side query, capped at 1000.
     */
    getSidesWithDataIssues?: () => Promise<SideDataIssueItem[]>
    getPhoneAuditSummary?: () => Promise<PhoneAuditSummaryResponse>
    getPhoneAuditDetail?: (entity: string, limit?: number) => Promise<PhoneAuditEntityDetailResponse>
    normalizePhones?: (entities: string[], dryRun: boolean) => Promise<PhoneNormalizationResult>
    /**
     * Maintenance: MyAlarmSis ↔ Armikom signal comparison. Only deployments with a
     * MyAlarmSis database configured answer; others return 503 MYALARMSIS.NOT_CONFIGURED.
     */
    listMyAlarmSisSignalTypes?: () => Promise<MyAlarmSisSignalTypeItem[]>
    compareMyAlarmSisSignals?: (request: MyAlarmSisComparisonRequest) => Promise<MyAlarmSisComparisonResponse>
    /**
     * S-800 writes. These exist as of W-09c — file 11's "Read-only + unlock"
     * heading predates them. `extension` is a number on the wire, not a string.
     */
    createOperatorUser?: (request: OperatorUserCreate) => Promise<any>
    updateOperatorUser?: (id: string, request: OperatorUserUpdate) => Promise<any>
    deleteOperatorUser?: (id: string) => Promise<void>
    resetOperatorPassword?: (id: string, newPassword: string) => Promise<any>
    setUserRoles?: (id: string, roleIds: string[]) => Promise<any>
    /** Set which alarm categories a user is allowed to see. Empty array = no filter (see all). */
    setUserAlarmCategories?: (id: string, categoryIds: string[]) => Promise<any>
    /**
     * API D86: customers an operator is limited to. Empty = not limited. A limited operator
     * sees only these customers and their subscribers; admins are never limited.
     */
    getUserCustomers?: (id: string) => Promise<CustomerScopeAssignment[]>
    /** Replaces the list; [] lifts the limit. 503 when the tenant lacks the migration. */
    setUserCustomers?: (id: string, customerIds: string[]) => Promise<void>
    /**
     * S-811. Roles themselves are defined in XAF (D40); what the API owns — and
     * this screen edits — is the role → scope mapping.
     */
    listRoles?: () => Promise<any[]>
    setRoleScopes?: (id: string, scopes: string[]) => Promise<any>
    /**
     * D78: roles are created, renamed and deleted from the web (XAF is no longer used). A new
     * role starts with the given scopes, or a copy of another role's, or none. Deleting is
     * refused while users hold the role (409 AUTH.ROLE_IN_USE) or for an administrative role.
     */
    createRole?: (request: { name: string; scopes?: string[]; copyScopesFromRoleId?: string }) => Promise<any>
    renameRole?: (id: string, name: string) => Promise<any>
    deleteRole?: (id: string) => Promise<void>
    /**
     * D77 role field policy. The catalogue lists every field a policy can name (built by the
     * API from its DTOs); subjects are operator roles plus the two virtual roles "all dealers"
     * and "all mobile users"; a subject's policy is its hidden and read-only field keys.
     */
    getFieldCatalog?: () => Promise<FieldCatalogEntry[]>
    listFieldPolicySubjects?: () => Promise<FieldPolicySubject[]>
    getRoleFieldPolicy?: (id: string) => Promise<RoleFieldPolicy>
    setRoleFieldPolicy?: (id: string, policy: { hidden: string[]; readOnly: string[] }) => Promise<RoleFieldPolicy>
    /** Monitoring centres, for the assignment picker. Read-only by D41. */
    listMonitoringCenters?: () => Promise<any[]>

    /**
     * Self-service on the signed-in account (`/v1/auth/me`). `UpdateSelfRequest`
     * carries `soundAlertEnabled` only — the extension is an administrator's
     * field, changed through `updateOperatorUser`.
     */
    updateSelf?: (request: { soundAlertEnabled?: boolean | null }) => Promise<any>
    changeOwnPassword?: (currentPassword: string, newPassword: string) => Promise<void>
  }
  /** S-813 · monitoring-centre signal rules. */
  signalRules?: SignalRulesClient
  /** S-620 report assistant · S-621 saved reports. */
  reports?: ReportsClient

  /**
   * The signal dictionary and the shared catalogue — the reference tables that
   * were XAF-owned until the desktop app was retired.
   *
   * A `Signal` has no name of its own: it is the (protocol, event code) row the
   * Engine matches an incoming packet against, and everything an operator sees —
   * the label, the colours, the priority — comes from the `SignalType` it points
   * at. Editing one is editing how every future event of that code is classified.
   */
  referenceAdmin?: {
    listSignals: (params?: {
      q?: string
      page?: number
      pageSize?: number
      /** Scopes the dictionary to one protocol — the studio never lists every protocol at once. */
      protocolId?: string
      signalTypeId?: string
      alarmCategoryId?: string
      /** true: only the codes with no signal type. false: only the ones that classify. */
      unmapped?: boolean
    }) => Promise<Page<any>>
    getSignal: (id: string) => Promise<any>
    createSignal: (request: Record<string, unknown>) => Promise<{ id?: string }>
    updateSignal: (id: string, request: Record<string, unknown>) => Promise<{ id?: string }>
    deleteSignal: (id: string) => Promise<void>

    listSignalTypes: (params?: { q?: string; page?: number; pageSize?: number }) => Promise<Page<any>>
    getSignalType: (id: string) => Promise<any>
    createSignalType: (request: Record<string, unknown>) => Promise<{ id?: string }>
    updateSignalType: (id: string, request: Record<string, unknown>) => Promise<{ id?: string }>
    deleteSignalType: (id: string) => Promise<void>

    listSignalRelations: (params?: { q?: string; page?: number; pageSize?: number }) => Promise<Page<any>>
    getSignalRelation: (id: string) => Promise<any>
    createSignalRelation: (request: Record<string, unknown>) => Promise<{ id?: string }>
    updateSignalRelation: (id: string, request: Record<string, unknown>) => Promise<{ id?: string }>
    deleteSignalRelation: (id: string) => Promise<void>

    /** Relation types — what a `SignalRelation` does. REMOVE and DELAY are seeded by the Engine. */
    listSignalRelationTypes: (params?: { q?: string; page?: number; pageSize?: number }) => Promise<Page<any>>
    getSignalRelationType?: (id: string) => Promise<any>
    createSignalRelationType?: (request: Record<string, unknown>) => Promise<{ id?: string }>
    updateSignalRelationType?: (id: string, request: Record<string, unknown>) => Promise<{ id?: string }>
    deleteSignalRelationType?: (id: string) => Promise<void>

    listProducts: () => Promise<any[]>
    createProduct: (request: Record<string, unknown>) => Promise<{ id?: string }>
    updateProduct: (id: string, request: Record<string, unknown>) => Promise<{ id?: string }>
    deleteProduct: (id: string) => Promise<void>

    listMobileOperators: () => Promise<any[]>
    createMobileOperator: (request: Record<string, unknown>) => Promise<{ id?: string }>
    updateMobileOperator: (id: string, request: Record<string, unknown>) => Promise<{ id?: string }>
    deleteMobileOperator: (id: string) => Promise<void>

    /**
     * The detailed list, not the lookup one: it carries phones, dealer and the
     * `hasPassword` flag. A dealer principal always receives only its own people,
     * whatever `dealerId` says.
     */
    listTechnicalPeople: (params?: { dealerId?: string; activeOnly?: boolean; monitoringCenterId?: string }) => Promise<any[]>
    createTechnicalPerson: (request: Record<string, unknown>) => Promise<{ id?: string }>
    updateTechnicalPerson: (id: string, request: Record<string, unknown>) => Promise<{ id?: string }>
    deleteTechnicalPerson: (id: string) => Promise<void>

    /**
     * The nineteen web-owned catalogue tables (§18).
     *
     * Every list returns `LookupItem` and every `get…` returns the detail row
     * that carries the editable columns, so the two are not interchangeable —
     * see `fetchDetailOnEdit` in `collectionSchema.ts`.
     */
    listBrands: () => Promise<any[]>
    getBrand: (id: string) => Promise<any>
    createBrand: (request: Record<string, unknown>) => Promise<{ id?: string }>
    updateBrand: (id: string, request: Record<string, unknown>) => Promise<{ id?: string }>
    deleteBrand: (id: string) => Promise<void>

    listModels: (params?: { brandId?: string }) => Promise<any[]>
    getModel: (id: string) => Promise<any>
    createModel: (request: Record<string, unknown>) => Promise<{ id?: string }>
    updateModel: (id: string, request: Record<string, unknown>) => Promise<{ id?: string }>
    deleteModel: (id: string) => Promise<void>

    /** No update: the row *is* the (model, protocol) pair. */
    listModelProtocols: (params?: { modelId?: string }) => Promise<any[]>
    getModelProtocol: (id: string) => Promise<any>
    createModelProtocol: (request: Record<string, unknown>) => Promise<{ id?: string }>
    deleteModelProtocol: (id: string) => Promise<void>

    listProtocols: (params?: { modelId?: string }) => Promise<any[]>
    getProtocol: (id: string) => Promise<any>
    createProtocol: (request: Record<string, unknown>) => Promise<{ id?: string }>
    updateProtocol: (id: string, request: Record<string, unknown>) => Promise<{ id?: string }>
    deleteProtocol: (id: string) => Promise<void>

    listNoteTypes: () => Promise<any[]>
    getNoteType: (id: string) => Promise<any>
    createNoteType: (request: Record<string, unknown>) => Promise<{ id?: string }>
    updateNoteType: (id: string, request: Record<string, unknown>) => Promise<{ id?: string }>
    deleteNoteType: (id: string) => Promise<void>

    listAlarmCategories: () => Promise<any[]>
    getAlarmCategory: (id: string) => Promise<any>
    createAlarmCategory: (request: Record<string, unknown>) => Promise<{ id?: string }>
    updateAlarmCategory: (id: string, request: Record<string, unknown>) => Promise<{ id?: string }>
    deleteAlarmCategory: (id: string) => Promise<void>

    listActiveCategories: () => Promise<any[]>
    getActiveCategory: (id: string) => Promise<any>
    createActiveCategory: (request: Record<string, unknown>) => Promise<{ id?: string }>
    updateActiveCategory: (id: string, request: Record<string, unknown>) => Promise<{ id?: string }>
    deleteActiveCategory: (id: string) => Promise<void>

    listAccountTypes: () => Promise<any[]>
    getAccountType: (id: string) => Promise<any>
    createAccountType: (request: Record<string, unknown>) => Promise<{ id?: string }>
    updateAccountType: (id: string, request: Record<string, unknown>) => Promise<{ id?: string }>
    deleteAccountType: (id: string) => Promise<void>

    listAccountItems: () => Promise<any[]>
    getAccountItem: (id: string) => Promise<any>
    createAccountItem: (request: Record<string, unknown>) => Promise<{ id?: string }>
    updateAccountItem: (id: string, request: Record<string, unknown>) => Promise<{ id?: string }>
    deleteAccountItem: (id: string) => Promise<void>

    listSideTypes: () => Promise<any[]>
    getSideType: (id: string) => Promise<any>
    createSideType: (request: Record<string, unknown>) => Promise<{ id?: string }>
    updateSideType: (id: string, request: Record<string, unknown>) => Promise<{ id?: string }>
    deleteSideType: (id: string) => Promise<void>

    listServiceTypes: () => Promise<any[]>
    getServiceType: (id: string) => Promise<any>
    createServiceType: (request: Record<string, unknown>) => Promise<{ id?: string }>
    updateServiceType: (id: string, request: Record<string, unknown>) => Promise<{ id?: string }>
    deleteServiceType: (id: string) => Promise<void>

    listCountries: () => Promise<any[]>
    getCountry: (id: string) => Promise<any>
    createCountry: (request: Record<string, unknown>) => Promise<{ id?: string }>
    updateCountry: (id: string, request: Record<string, unknown>) => Promise<{ id?: string }>
    deleteCountry: (id: string) => Promise<void>

    listRegions: () => Promise<any[]>
    getRegion: (id: string) => Promise<any>
    createRegion: (request: Record<string, unknown>) => Promise<{ id?: string }>
    updateRegion: (id: string, request: Record<string, unknown>) => Promise<{ id?: string }>
    deleteRegion: (id: string) => Promise<void>

    listCities: (params?: { countryId?: string }) => Promise<any[]>
    getCity: (id: string) => Promise<any>
    createCity: (request: Record<string, unknown>) => Promise<{ id?: string }>
    updateCity: (id: string, request: Record<string, unknown>) => Promise<{ id?: string }>
    deleteCity: (id: string) => Promise<void>

    listCityEmergencyContacts: (cityId: string) => Promise<any[]>
    createCityEmergencyContact: (cityId: string, request: Record<string, unknown>) => Promise<{ id?: string }>
    updateCityEmergencyContact: (cityId: string, id: string, request: Record<string, unknown>) => Promise<{ id?: string }>
    deleteCityEmergencyContact: (cityId: string, id: string) => Promise<void>

    listDistricts: (params?: { cityId?: string }) => Promise<any[]>
    getDistrict: (id: string) => Promise<any>
    createDistrict: (request: Record<string, unknown>) => Promise<{ id?: string }>
    updateDistrict: (id: string, request: Record<string, unknown>) => Promise<{ id?: string }>
    deleteDistrict: (id: string) => Promise<void>

    listHolidayTypes: () => Promise<any[]>
    getHolidayType: (id: string) => Promise<any>
    createHolidayType: (request: Record<string, unknown>) => Promise<{ id?: string }>
    updateHolidayType: (id: string, request: Record<string, unknown>) => Promise<{ id?: string }>
    deleteHolidayType: (id: string) => Promise<void>

    listHolidays: (params?: { holidayTypeId?: string }) => Promise<any[]>
    getHoliday: (id: string) => Promise<any>
    createHoliday: (request: Record<string, unknown>) => Promise<{ id?: string }>
    updateHoliday: (id: string, request: Record<string, unknown>) => Promise<{ id?: string }>
    deleteHoliday: (id: string) => Promise<void>

    listSignalExplanations: () => Promise<any[]>
    getSignalExplanation: (id: string) => Promise<any>
    createSignalExplanation: (request: Record<string, unknown>) => Promise<{ id?: string }>
    updateSignalExplanation: (id: string, request: Record<string, unknown>) => Promise<{ id?: string }>
    deleteSignalExplanation: (id: string) => Promise<void>
    /** Reorder signal explanations atomically. Pass the full ID list in desired display order. */
    reorderSignalExplanations: (ids: string[]) => Promise<void>

    listNoteExplanations: () => Promise<any[]>
    getNoteExplanation: (id: string) => Promise<any>
    createNoteExplanation: (request: Record<string, unknown>) => Promise<{ id?: string }>
    updateNoteExplanation: (id: string, request: Record<string, unknown>) => Promise<{ id?: string }>
    deleteNoteExplanation: (id: string) => Promise<void>
    /** Reorder note explanations atomically. Pass the full ID list in desired display order. */
    reorderNoteExplanations: (ids: string[]) => Promise<void>

    listDealerAccountTypes: (params?: { dealerId?: string }) => Promise<any[]>
    getDealerAccountType: (id: string) => Promise<any>
    createDealerAccountType: (request: Record<string, unknown>) => Promise<{ id?: string }>
    updateDealerAccountType: (id: string, request: Record<string, unknown>) => Promise<{ id?: string }>
    deleteDealerAccountType: (id: string) => Promise<void>

    /**
     * Read-only. The ranges are what `DEALER_SIDE_NO.OUTSIDE_MC_RANGE` is checked
     * against, so S-804 shows them to explain a rejected subscriber number.
     */
    listMonitoringCenterSideNoRanges: () => Promise<any[]>
  }
  /**
   * Monitoring-centre and signal-reception configuration (`admin:config`).
   *
   * No read here ever returns a credential. Each one is reported as a `has…`
   * boolean instead, so the screen can show "configured / not configured" without
   * the console ever holding the value. On a write, leaving a password out keeps
   * the stored one and sending an empty string clears it — which is why the forms
   * send `undefined`, never `''`, for an untouched password field.
   */
  adminConfig?: {
    listMonitoringCenters: () => Promise<any[]>
    getMonitoringCenter: (id: string) => Promise<any>
    createMonitoringCenter: (request: Record<string, unknown>) => Promise<{ id?: string }>
    updateMonitoringCenter: (id: string, request: Record<string, unknown>) => Promise<{ id?: string }>
    deleteMonitoringCenter: (id: string) => Promise<void>
    uploadAlarmSound: (id: string, file: File) => Promise<void>
    deleteAlarmSound: (id: string) => Promise<void>

    listReceivers: () => Promise<any[]>
    getReceiver: (id: string) => Promise<any>
    createReceiver: (request: Record<string, unknown>) => Promise<{ id?: string }>
    updateReceiver: (id: string, request: Record<string, unknown>) => Promise<{ id?: string }>
    deleteReceiver: (id: string) => Promise<void>

    listReceiverLines: (receiverId: string) => Promise<any[]>
    createReceiverLine: (receiverId: string, request: Record<string, unknown>) => Promise<{ id?: string }>
    updateReceiverLine: (receiverId: string, id: string, request: Record<string, unknown>) => Promise<{ id?: string }>
    deleteReceiverLine: (receiverId: string, id: string) => Promise<void>

    listReceiverRules: (receiverId: string) => Promise<any[]>
    createReceiverRule: (receiverId: string, request: Record<string, unknown>) => Promise<{ id?: string }>
    updateReceiverRule: (receiverId: string, id: string, request: Record<string, unknown>) => Promise<{ id?: string }>
    deleteReceiverRule: (receiverId: string, id: string) => Promise<void>

    /**
     * Where the Engine looks for a subscriber missing from the receiver's own centre:
     * the listed centres in order, then every centre when `crossMcSideLookup` (null =
     * the Engine setting) is on. The save replaces the whole configuration and is
     * cross-centre operators only.
     */
    /**
     * Agreements a monitoring centre asks customer-app users to accept after login.
     * Answers are per version; `requireReacceptance` on update asks everyone again.
     * Delete is refused (409) once anyone answered — deactivate instead.
     */
    listMobileAgreements: () => Promise<MobileAgreement[]>
    createMobileAgreement: (request: MobileAgreementInput & { monitoringCenterId?: string | null }) => Promise<{ id?: string }>
    updateMobileAgreement: (
      id: string,
      request: Partial<MobileAgreementInput> & { requireReacceptance?: boolean }
    ) => Promise<{ id?: string }>
    deleteMobileAgreement: (id: string) => Promise<void>
    listMobileAgreementConsents: (id: string) => Promise<MobileAgreementConsent[]>

    /**
     * SMS / mail / IVR texts with {Placeholder}s, deployment-wide. Alarm templates may be
     * overridden per alarm category or signal type (signal type wins, then category, then
     * global, then the built-in default). Writes need a cross-centre operator.
     */
    listMessageTemplateDefinitions: () => Promise<MessageTemplateDefinition[]>
    listMessageTemplates: () => Promise<MessageTemplate[]>
    createMessageTemplate: (request: MessageTemplateInput) => Promise<{ id?: string }>
    updateMessageTemplate: (
      id: string,
      request: { subject?: string | null; body?: string; isActive?: boolean }
    ) => Promise<{ id?: string }>
    deleteMessageTemplate: (id: string) => Promise<void>
    previewMessageTemplate: (request: {
      channel: string
      kind: string
      subject?: string | null
      body: string
    }) => Promise<MessageTemplatePreview>
    /** The text that applies now (placeholders unfilled); any operator may read it. */
    getEffectiveMessageTemplate: (channel: string, kind: string) => Promise<{ subject?: string | null; body: string; isCustom: boolean }>

    getReceiverMcFallback: (receiverId: string) => Promise<{
      receiverId?: string
      crossMcSideLookup?: boolean | null
      monitoringCenters?: { monitoringCenterId?: string; monitoringCenterName?: string | null; sortOrder?: number }[] | null
    }>
    saveReceiverMcFallback: (
      receiverId: string,
      request: { crossMcSideLookup: boolean | null; monitoringCenterIds: string[] }
    ) => Promise<{ id?: string }>

    listReceiverLineTypes: (receiverId: string) => Promise<any[]>
    createReceiverLineType: (receiverId: string, request: Record<string, unknown>) => Promise<{ id?: string }>
    updateReceiverLineType: (receiverId: string, id: string, request: Record<string, unknown>) => Promise<{ id?: string }>
    deleteReceiverLineType: (receiverId: string, id: string) => Promise<void>

    listReceiverTypes: () => Promise<any[]>
    createReceiverType: (request: Record<string, unknown>) => Promise<{ id?: string }>
    updateReceiverType: (id: string, request: Record<string, unknown>) => Promise<{ id?: string }>
    deleteReceiverType: (id: string) => Promise<void>

    listMailSettings: () => Promise<any[]>
    createMailSetting: (request: Record<string, unknown>) => Promise<{ id?: string }>
    updateMailSetting: (id: string, request: Record<string, unknown>) => Promise<{ id?: string }>
    deleteMailSetting: (id: string) => Promise<void>

    listSmsSettings: () => Promise<any[]>
    createSmsSetting: (request: Record<string, unknown>) => Promise<{ id?: string }>
    updateSmsSetting: (id: string, request: Record<string, unknown>) => Promise<{ id?: string }>
    deleteSmsSetting: (id: string) => Promise<void>

    listDeviceRegexes: () => Promise<any[]>
    createDeviceRegex: (request: Record<string, unknown>) => Promise<{ id?: string }>
    updateDeviceRegex: (id: string, request: Record<string, unknown>) => Promise<{ id?: string }>
    deleteDeviceRegex: (id: string) => Promise<void>

    listPrompts: () => Promise<any[]>
    createPrompt: (request: Record<string, unknown>) => Promise<{ id?: string }>
    updatePrompt: (id: string, request: Record<string, unknown>) => Promise<{ id?: string }>
    deletePrompt: (id: string) => Promise<void>

    listEmergencyPhones: () => Promise<any[]>
    createEmergencyPhone: (request: Record<string, unknown>) => Promise<{ id?: string }>
    updateEmergencyPhone: (id: string, request: Record<string, unknown>) => Promise<{ id?: string }>
    deleteEmergencyPhone: (id: string) => Promise<void>

    listCityEmergencyContacts: (cityId: string) => Promise<any[]>
    createCityEmergencyContact: (cityId: string, request: Record<string, unknown>) => Promise<{ id?: string }>
    updateCityEmergencyContact: (cityId: string, id: string, request: Record<string, unknown>) => Promise<{ id?: string }>
    deleteCityEmergencyContact: (cityId: string, id: string) => Promise<void>

    listPanelCommands: (params?: { sideId?: string; pendingOnly?: boolean; limit?: number }) => Promise<any[]>
    createPanelCommand: (request: Record<string, unknown>) => Promise<{ id?: string }>
    deletePanelCommand: (id: string) => Promise<void>
  }
  /**
   * S-900 / S-901 / S-902 · the operational registers.
   *
   * G-34 and G-35 were the asymmetry these close: the API could create a signal
   * block and a delay but never list or lift one, so a suppression the operator
   * started was invisible until it expired on its own.
   */
  registers?: {
    listSignalBlocks: (params?: Record<string, unknown>) => Promise<Page<any>>
    cancelSignalBlock?: (id: string) => Promise<any>
    listWaitingEvents: (params?: Record<string, unknown>) => Promise<Page<any>>
    /** Ends the delay now; Engine re-queues the alarm on its next cycle (≤ 1 min). */
    releaseWaitingEvent?: (id: string) => Promise<any>
    releaseWaitingEventsBulk?: (ids: string[]) => Promise<any>
    listPassiveSignals: (params?: Record<string, unknown>) => Promise<Page<any>>
    listEventRaws: (params?: Record<string, unknown>) => Promise<Page<any>>
    /**
     * S-903 · SMS delivery log. `SmsLogListItem` reports only `isSent`; the retry
     * count, next attempt and last error are on `SmsLogEntryResponse`, so a row
     * cannot be shown as "failed" without reading the detail.
     */
    listSmsLog?: (params?: Record<string, unknown>) => Promise<Page<any>>
    getSmsLogEntry?: (id: string) => Promise<any>
    /** G-45 · active delays by default; `activeOnly: false` adds processed history. */
    listClosingDelays?: (params?: Record<string, unknown>) => Promise<Page<any>>
    /** Deletes the delay; a pending one stops suppressing CLL on Engine's next check. */
    cancelClosingDelay?: (id: string) => Promise<any>
  }
  /** S-810 · work schedules. Per D42 these gate login, not merely rostering. */
  workSchedules?: {
    list: (params?: Record<string, unknown>) => Promise<any[]>
    get?: (id: string) => Promise<any>
    create?: (request: WorkScheduleWrite) => Promise<any>
    update?: (id: string, request: WorkScheduleWrite) => Promise<any>
    remove?: (id: string) => Promise<any>
    listEntries?: (id: string) => Promise<any[]>
    setEntries?: (id: string, entries: WorkScheduleEntryWrite[]) => Promise<any>
  }
  /**
   * S-104 · closing delays.
   *
   * Note the asymmetric keys, which are the server's: the options are read per
   * **subscriber**. Both options and set are keyed by sideId (D74).
   * `list` exists as of the current SDK — G-45 records "no GET /v1/closing-delays",
   * which is now stale — but there is still no cancel operation, so a delay can be
   * seen and not lifted.
   */
  closingDelays?: {
    options: (sideId: string) => Promise<ClosingDelayOptions>
    set: (sideId: string, request: ClosingDelayCommand) => Promise<any>
    list?: (params?: Record<string, unknown>) => Promise<Page<any>>
  }
  /**
   * S-809 · usage telemetry. Best-effort by contract (§01 O-4): batched, never
   * retried aggressively, never blocking, silently dropped on failure.
   */
  activity?: {
    post: (sessionId: string, events: ActivityEvent[]) => Promise<void>
  }
  files?: {
    /**
     * Fetch binary content as a blob, with the filename and content type the server
     * actually sent. The server detects the type from magic bytes (§01 F-2), so its
     * answer is the only trustworthy one.
     */
    blobFor: (op: BinaryOperation, id: string) => Promise<BinaryContent>
    /**
     * A blob URL for `<img>` / `<audio>`, because every binary endpoint needs the
     * bearer header and a bare `src` cannot carry one (§01 F-4).
     *
     * The caller MUST revoke it, or a shift's worth of photos leaks (C-16).
     * `useObjectUrls()` does this on scope disposal and is the intended entry point.
     */
    objectUrlFor: (op: BinaryOperation, id: string) => Promise<string>
    revokeObjectUrl: (url: string) => void
    /**
     * The sixth binary operation: takes a filter body rather than an id.
     *
     * Takes an AbortSignal because the export is synchronous with no job id (G-17):
     * a wide range ties up the request until the ingress times out, and the operator
     * needs a way out that actually stops the work.
     */
    exportSignalEvents?: (
      options: SignalExportOptions,
      signal?: AbortSignal
    ) => Promise<BinaryContent>
    /**
     * Subscriber list export. Same synchronous pattern as signal export (G-17):
     * takes the current filter set so the file matches what the operator sees.
     * The API endpoint does not exist yet — tracked as a future gap.
     */
    exportSides?: (
      options: SideExportOptions,
      signal?: AbortSignal
    ) => Promise<BinaryContent>
    /** AR-29 · active/passive changes with operator and reason (POST /v1/sides/status-history/export). */
    exportSideStatusHistory?: (
      options: SideStatusHistoryExportOptions,
      signal?: AbortSignal
    ) => Promise<BinaryContent>
  }
  telephony?: {
    listCalls: (params?: Record<string, unknown>) => Promise<Page<any>>
    getCallById?: (id: string) => Promise<any>
    /** The PBX rings the operator's own extension first, then bridges (S-503). */
    dial?: (request: {
      phoneNumber: string
      sideId?: string
      signalEventId?: string
      contactName?: string
      monitoringCenterId?: string
    }) => Promise<any>
  }
  messaging?: {
    /** Pre-rendered text plus the contacts and the zone it was rendered in (S-510). */
    smsTemplate?: (signalEventId: string) => Promise<any>
    sendSms?: (
      sideId: string,
      request: {
        text: string
        recipients: 'first-contact' | 'explicit' | 'contacts'
        phones?: string[]
        contactIds?: string[]
      }
    ) => Promise<any>
    /** Bulk SMS — one text to many subscribers, server resolves recipients (POST /v1/sides/batch-sms). */
    bulkSendSms?: (request: {
      text: string
      recipients: 'first-contact' | 'sms-contacts'
      sideIds?: string[]
      filter?: Record<string, unknown>
      /** AR-16 · the alarm batch screen's selection; exactly one of the three targets. */
      alarms?: BulkSmsAlarmTargetOptions
      expectedCount?: number
    }) => Promise<{
      requestedCount: number
      queuedCount: number
      successCount: number
      failedCount: number
      isCapped: boolean
      failures: Array<{
        sideId: string
        sideNo?: number
        partNo?: number
        name?: string
        code: string
        message: string
      }>
      sideEffects?: string[]
    }>
    sendSidePush?: (sideId: string, request: { title?: string; message: string }) => Promise<any>
    sendCustomerPush?: (
      customerId: string,
      request: { title?: string; message: string }
    ) => Promise<any>
  }
  stream?: {
    /**
     * Opens `GET /v1/stream` and hands back the undecoded body.
     *
     * The SDK builds the request — URL, bearer header, `Last-Event-ID` — and the app
     * reads the frames, because `EventSource` cannot carry an `Authorization`
     * header (§01 12.3, decision U1). Non-2xx throws, and the thrown error carries
     * `response.status`: 403 is terminal (S-6), 429 is `STREAM.TOO_MANY_CONNECTIONS`
     * (S-7).
     */
    open: (options: {
      lastEventId?: string | null
      signal: AbortSignal
    }) => Promise<ReadableStream<Uint8Array>>
  }
  /**
   * G-76 · MC-wide UI layout settings.
   *
   * Layouts are a **shared pool** within a monitoring centre. Any user with `admin:config`
   * can create, edit, and delete templates. All users see the full pool. One template per
   * screen is marked "active" — that is the one every operator gets.
   *
   * The server stores opaque JSON blobs keyed by screen + template id. The client validates
   * and migrates them (`@/layout/validate.ts`).
   */
  uiLayouts?: {
    /** List all saved layout templates for a screen. Returns [] when none exist. */
    listTemplates: (screen: string) => Promise<Array<{ id: string; name: string; contentJson: string; updatedAt?: string }>>
    /** Save (create or update) a named layout template. Requires `admin:config`. */
    saveTemplate: (screen: string, id: string, contentJson: string) => Promise<void>
    /** Delete a layout template by id. Requires `admin:config`. */
    deleteTemplate: (screen: string, id: string) => Promise<void>
    /** Get the id of the active template for a screen. Returns null when none is set. */
    getActiveTemplateId: (screen: string) => Promise<string | null>
    /** Set which template is active for the whole MC. Requires `admin:config`. */
    setActiveTemplateId: (screen: string, id: string) => Promise<void>
    /** The caller's own row for a screen (D88: the operator's theme choice). Null when none. */
    getUserLayout?: (screen: string) => Promise<string | null>
    /** Save the caller's own row for a screen. Any signed-in user. */
    saveUserLayout?: (screen: string, contentJson: string) => Promise<void>
    /** Remove the caller's own row for a screen. */
    deleteUserLayout?: (screen: string) => Promise<void>
  }
}

/**
 * Guard tour (bekçi takip). Between startTime and endTime (subscriber wall clock, "HH:mm"; an
 * end not after the start crosses midnight) one of the signal types must arrive from the zone
 * every intervalMinutes, otherwise the Engine raises the system signal GTM.
 */
export interface GuardTourWrite {
  name?: string | null
  sideZoneId: string
  startTime: string
  endTime: string
  intervalMinutes: number
  active: boolean
  notes?: string | null
  signalTypeIds: string[]
}

export interface GuardTourItem extends GuardTourWrite {
  id: string
  zoneNo?: number | null
  zoneName?: string | null
  signalTypes: Array<{ id: string; name?: string | null; signalCode?: string | null }>
  /** UTC ISO-8601. */
  lastAlarmAt?: string | null
}

/** D77: one field a role field policy can restrict. */
export interface FieldCatalogEntry {
  key: string
  entity: string
  field: string
  /** False for fields the system needs (id, number, name …): no policy may restrict them. */
  lockable: boolean
  /** Some response carries it, so hiding it has an effect. */
  readable: boolean
  /** Some create/update body carries it, so making it read-only has an effect. */
  writable: boolean
  carriedBy: string[]
}

/** D77: an operator role, or one of the virtual roles for all dealers / all mobile users. */
export interface FieldPolicySubject {
  id: string
  name: string
  kind: 'role' | 'dealer' | 'mobile'
  /** Administrative roles hold system:admin; field policy never applies to them. */
  exempt: boolean
  hasPolicy: boolean
}

/** D82: a tenant's replacement for one console text in one culture. */
export interface TranslationOverrideItem {
  culture: string
  key: string
  value: string
  updatedAt?: Date | string | null
  updatedBy?: string | null
}

export interface RoleFieldPolicy {
  roleId: string
  hidden: string[]
  readOnly: string[]
  updatedAt?: Date | string | null
  updatedBy?: string | null
}

/**
 * S-813 · monitoring-centre signal rules (`/v1/reference/signal-rules`).
 *
 * Every call takes an optional `monitoringCenterId`. Omitted, the server uses the caller's
 * own centre; a system administrator, who has none, names the centre they are working on.
 */
export interface SignalRulesClient {
  list: (monitoringCenterId?: string) => Promise<SignalRuleItem[]>
  get: (id: string, monitoringCenterId?: string) => Promise<SignalRuleDetail>
  /** Facts, operators and actions a rule may use in this centre. */
  catalog: (monitoringCenterId?: string) => Promise<SignalRuleCatalog>
  /** Every check a save would run; writes nothing. */
  validate: (request: SignalRuleWriteRequest, monitoringCenterId?: string) => Promise<SignalRuleValidationResponse>
  create: (request: SignalRuleWriteRequest, monitoringCenterId?: string) => Promise<{ id?: string }>
  update: (id: string, request: SignalRuleWriteRequest, monitoringCenterId?: string) => Promise<{ id?: string }>
  remove: (id: string, monitoringCenterId?: string) => Promise<void>
}

/** An agreement customer-app users are asked to accept after login (admin view). */
export interface MobileAgreement {
  id: string
  monitoringCenterId?: string | null
  monitoringCenterName?: string | null
  title: string
  content?: string | null
  url?: string | null
  isMandatory: boolean
  isActive: boolean
  sortOrder: number
  version: number
  createdDate?: string | Date
  updatedDate?: string | Date | null
  acceptedCount: number
  declinedCount: number
}

export interface MobileAgreementInput {
  title: string
  content?: string | null
  url?: string | null
  isMandatory: boolean
  isActive: boolean
  sortOrder: number
}

/** One user's answer to one version of an agreement. */
export interface MobileAgreementConsent {
  id: string
  mobileUserId: string
  mobileUserName?: string | null
  mobileUserPhone?: string | null
  version: number
  status: 'accepted' | 'declined' | string
  date: string | Date
  deviceId?: string | null
  platform?: string | null
  appVersion?: string | null
  ipAddress?: string | null
}

export interface MessageTemplatePlaceholder {
  name: string
  description: string
  example: string
  required: boolean
}

export interface MessageTemplateDefinition {
  /** sms | mail | ivr */
  channel: string
  /** alarm, technicalWorkStarted, serviceCreatedSubscriber, ... */
  kind: string
  supportsOverrides: boolean
  defaultSubject?: string | null
  defaultBody: string
  placeholders: MessageTemplatePlaceholder[]
}

export interface MessageTemplate {
  id: string
  channel: string
  kind: string
  alarmCategoryId?: string | null
  alarmCategoryName?: string | null
  signalTypeId?: string | null
  signalTypeName?: string | null
  subject?: string | null
  body: string
  isActive: boolean
  createdDate?: string | Date
  updatedDate?: string | Date | null
  updatedBy?: string | null
}

export interface MessageTemplateInput {
  channel: string
  kind: string
  alarmCategoryId?: string | null
  signalTypeId?: string | null
  subject?: string | null
  body: string
  isActive?: boolean
}

export interface MessageTemplatePreview {
  subject?: string | null
  body: string
  length: number
  unicode: boolean
  segments: number
  errors: string[]
}

export interface MobileUserBatchResetRequest {
  mobileUserIds?: string[]
  filter?: { q?: string; monitoringCenterId?: string }
  expectedCount?: number
  /** Must contain `{password}`; `{phone}` and `{name}` are filled in per user. */
  smsText: string
}

export interface MobileUserBatchResetResult {
  requestedCount: number
  resetCount: number
  skippedCount: number
  failures: Array<{ mobileUserId: string; name?: string | null; phone?: string | null; code: string; message?: string | null }>
  sideEffects?: string[] | null
}
