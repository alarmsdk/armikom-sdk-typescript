/**
 * `createConsoleClient` — the console facade, built on `ArmikomClient`.
 *
 * This used to be the Vue console's `createRealArmikomClient`: 2 200 lines over the generated
 * APIs, with its own middleware chain for proactive refresh, 401 replay, the network-zone
 * header and the UTC timestamp repair, a module-level token the session store had to keep
 * in step, and two dozen hand-written `fetch` calls for endpoints the generated client lacked.
 *
 * On `ArmikomClient` every one of those concerns is the core runtime's: `client.api(XApi)`
 * routes a generated API through the pipeline (bearer, proactive refresh, single-flight,
 * replay-once on 401, retry with no POST replay, deadlines, typed errors, timestamp repair),
 * and `client.http` gives the hand-written endpoints the same pipeline. The session is
 * `client.session` (`AuthSession`), with the token store the host passes in (§01 A-11).
 *
 * What this file adds is only the *console's shape*: the sections, the `Page<T>` and
 * `BinaryContent` normalisation, the `UserInfo` / `ClientConfig` view models, and the parts of
 * the login and refresh responses the core session does not keep (`shiftRestricted`, D42).
 */
import {
  ActivityApi,
  AdministrationApi,
  AlarmEventsApi,
  AuthenticationApi,
  CallHistoryApi,
  ClosingDelayApi,
  ClosingDelaysApi,
  ConfigurationApi,
  CustomersApi,
  DealersApi,
  EventRawsApi,
  FilesApi,
  GeocodingApi,
  InvoicesApi,
  LocalisationApi,
  MobileUsersApi,
  PassiveSignalsApi,
  PushNotificationsApi,
  ReferenceDataApi,
  ReportAssistantApi,
  ReportsApi,
  SMSApi,
  SMSLogApi,
  SearchApi,
  ServiceDetailsApi,
  ServicePhotosApi,
  ServicesApi,
  SidesApi,
  SignalBlocksApi,
  SignalEventsApi,
  SignalExplanationsApi,
  StatisticsApi,
  StreamingApi,
  SubscriberAgreementsApi,
  SubscriberControlsApi,
  SubscriberHolidaysApi,
  SubscriberInvoicesApi,
  SubscriberMailsApi,
  SubscriberMobileMessagesApi,
  SubscriberNotesApi,
  SubscriberReasonsApi,
  SubscriberSIMCardsApi,
  SubscriberSignalTypesApi,
  SubscriberSubResourcesApi,
  SubscriberTimetablesApi,
  SubscribersApi,
  SystemApi,
  TechnicalWorkApi,
  TelephonyApi,
  UserAdministrationApi,
  WaitingEventsApi,
  WorkSchedulesApi
} from '../../generated/index.js'
import type { MyAlarmSisComparisonRequest } from '../../generated/index.js'
import { ArmikomClient, type ArmikomClientOptions } from '../armikom/client.js'
import { AuthCodes, NotFoundError } from '../core/errors.js'
import { MemoryTokenStore } from '../core/tokens.js'
import type { UserInfo } from '../domain/types/session.js'
import type {
  BinaryContent,
  BinaryOperation,
  SignalExportOptions,
  SideExportOptions,
  SideStatusHistoryExportOptions,
  BulkSmsAlarmTargetOptions
} from '../domain/types/files.js'
import { drainPages } from '../core/paging.js'
import { ConsoleAuthDriver, NotifyingTokenStore, loginUserInfo, toUserInfo } from './auth.js'
import { toBinaryContent } from './binary.js'
import { createReportsClient } from './reports.js'
import { createSignalRulesClient } from './signalRules.js'
import {
  ALARM_EVENTS_ROW_CAP,
  type ActivityEvent,
  type ApplyHolidaysCommand,
  type ArmikomClientInterface,
  type ClosingDelayCommand,
  type GuardTourWrite,
  type LoginResult,
  type MobileUserBatchResetRequest,
  type OperatorUserCreate,
  type OperatorUserUpdate,
  type RoleFieldPolicy,
  type SideCloneRequest,
  type SideCreate,
  type SidePartitionRequest,
  type TranslationOverrideItem,
  type WorkScheduleEntryWrite,
  type WorkScheduleWrite
} from './types.js'

/**
 * A host-side cache for the canned explanation texts an operator picks while handling an
 * alarm. They change rarely and are opened on a keystroke, so the Vue console answers from
 * its last copy and re-reads in the background; the facade only asks, and tells the cache
 * when an admin write in this client made the copy stale.
 */
export interface ExplanationCache {
  read<T>(kind: 'signal' | 'note', fetcher: () => Promise<T[]>): Promise<T[]>
  invalidate(kind: 'signal' | 'note'): void
}

export interface ConsoleClientOptions extends Omit<ArmikomClientOptions, 'authDriver'> {
  explanations?: ExplanationCache
  /** API D83 — the zone the server reports on every response. */
  onNetworkZone?: (zone: 'internal' | 'external') => void
}

/** A 404 that means "nothing stored yet" rather than a failure. */
async function notFoundAsNull<T>(promise: Promise<T>): Promise<T | null> {
  try {
    return await promise
  } catch (error) {
    if (error instanceof NotFoundError) return null
    throw error
  }
}


/** D77: the SDK's policy response as the console's `RoleFieldPolicy`. */
function toRoleFieldPolicy(p: { roleId?: string; hidden?: string[] | null; readOnly?: string[] | null; updatedAt?: Date | null; updatedBy?: string | null }): RoleFieldPolicy {
  return {
    roleId: p.roleId ?? '',
    hidden: p.hidden ?? [],
    readOnly: p.readOnly ?? [],
    updatedAt: p.updatedAt ?? null,
    updatedBy: p.updatedBy ?? null
  }
}

/** D82: the SDK's override item as the console's `TranslationOverrideItem`. */
function toTranslationOverride(o: { culture?: string | null; key?: string | null; value?: string | null; updatedAt?: Date | null; updatedBy?: string | null }): TranslationOverrideItem {
  return {
    culture: o.culture ?? '',
    key: o.key ?? '',
    value: o.value ?? '',
    updatedAt: o.updatedAt ?? null,
    updatedBy: o.updatedBy ?? null
  }
}


export function createConsoleClient(options: ConsoleClientOptions): ArmikomClientInterface {
  const normalizedBase = options.baseUrl.replace(/\/+$/, '')
  const { explanations, onNetworkZone, tokenStore: givenStore, ...sdkOptions } = options

  const tokenStore = new NotifyingTokenStore(givenStore ?? new MemoryTokenStore())
  let driver!: ConsoleAuthDriver
  const client = new ArmikomClient({
    ...sdkOptions,
    baseUrl: normalizedBase,
    tokenStore,
    authDriver: (api) => (driver = new ConsoleAuthDriver(api, tokenStore)),
    onResponse: (observation) => {
      options.onResponse?.(observation)
      // API D83: the server names the zone on every response, and refuses an operator outside
      // the centre's network with a 403 that — unlike any other 403 (A-6) — ends the session.
      const zone = observation.headers.get('x-armikom-network-zone')
      if (zone === 'internal' || zone === 'external') onNetworkZone?.(zone)
      if (observation.status === 403 && observation.problem?.code === AuthCodes.REMOTE_ACCESS_DENIED) {
        void client.session.terminate('remote-access-denied')
      }
    }
  })

  /** Explanation lists are MC-scoped; the host decides whether and how to cache them. */
  const cachedExplanations = <T>(kind: 'signal' | 'note', fetcher: () => Promise<T[]>): Promise<T[]> =>
    explanations ? explanations.read(kind, fetcher) : fetcher()
  const invalidateExplanations = (kind: 'signal' | 'note'): void => explanations?.invalidate(kind)

  const authApi = client.api(AuthenticationApi)
  const configApi = client.api(ConfigurationApi)
  const locApi = client.api(LocalisationApi)
  const refApi = client.api(ReferenceDataApi)
  const alarmEventsApi = client.api(AlarmEventsApi)
  const signalEventsApi = client.api(SignalEventsApi)
  const signalExplanationsApi = client.api(SignalExplanationsApi)
  const subscribersApi = client.api(SubscribersApi)
  const subscriberReasonsApi = client.api(SubscriberReasonsApi)
  const sidesApi = client.api(SidesApi)
  const closingDelayApi = client.api(ClosingDelayApi)
  const closingDelaysApi = client.api(ClosingDelaysApi)
  const activityApi = client.api(ActivityApi)
  const subResourcesApi = client.api(SubscriberSubResourcesApi)
  const timetablesApi = client.api(SubscriberTimetablesApi)
  const sideHolidaysApi = client.api(SubscriberHolidaysApi)
  const sideNotesApi = client.api(SubscriberNotesApi)
  const sideSignalTypesApi = client.api(SubscriberSignalTypesApi)
  const sideAgreementsApi = client.api(SubscriberAgreementsApi)
  const sideMailsApi = client.api(SubscriberMailsApi)
  const sideSimCardsApi = client.api(SubscriberSIMCardsApi)
  const sideControlsApi = client.api(SubscriberControlsApi)
  const sideInvoicesApi = client.api(SubscriberInvoicesApi)
  const sideMobileMessagesApi = client.api(SubscriberMobileMessagesApi)
  const geocodingApi = client.api(GeocodingApi)
  const servicesApi = client.api(ServicesApi)
  const serviceDetailsApi = client.api(ServiceDetailsApi)
  const servicePhotosApi = client.api(ServicePhotosApi)
  const technicalWorkApi = client.api(TechnicalWorkApi)
  const customersApi = client.api(CustomersApi)
  const dealersApi = client.api(DealersApi)
  const mobileUsersApi = client.api(MobileUsersApi)
  const statisticsApi = client.api(StatisticsApi)
  const invoicesApi = client.api(InvoicesApi)
  const searchApi = client.api(SearchApi)
  const userAdminApi = client.api(UserAdministrationApi)
  const workSchedulesApi = client.api(WorkSchedulesApi)
  const signalBlocksApi = client.api(SignalBlocksApi)
  const waitingEventsApi = client.api(WaitingEventsApi)
  const passiveSignalsApi = client.api(PassiveSignalsApi)
  const eventRawsApi = client.api(EventRawsApi)
  const systemApi = client.api(SystemApi)
  const administrationApi = client.api(AdministrationApi)
  const streamingApi = client.api(StreamingApi)
  const filesApi = client.api(FilesApi)
  const callHistoryApi = client.api(CallHistoryApi)
  const telephonyApi = client.api(TelephonyApi)
  const smsApi = client.api(SMSApi)
  const smsLogApi = client.api(SMSLogApi)
  const pushApi = client.api(PushNotificationsApi)

  async function binaryContentFor(op: BinaryOperation, id: string): Promise<BinaryContent> {
    switch (op) {
      case 'GetSideDocumentContent':
        return toBinaryContent((await filesApi.getSideDocumentContentRaw({ id })).raw, 'document')
      case 'GetServicePhotoContent':
        return toBinaryContent(
          (await filesApi.getServicePhotoContentRaw({ photoId: id })).raw,
          'photo'
        )
      case 'GetMonitoringCenterAlarmSound':
        return toBinaryContent(
          (await filesApi.getMonitoringCenterAlarmSoundRaw({ id })).raw,
          'alarm-sound'
        )
      case 'GetDealerLogo':
        return toBinaryContent((await dealersApi.getDealerLogoRaw({ id })).raw, 'dealer-logo')
      case 'GetCallRecording':
        return toBinaryContent((await callHistoryApi.getCallRecordingRaw({ id })).raw, 'recording')
      default: {
        // Exhaustiveness: a new binary operation must be handled, not silently dropped.
        const unreachable: never = op
        throw new Error(`Unsupported binary operation: ${String(unreachable)}`)
      }
    }
  }

  return {
    baseUrl: normalizedBase,
    sdk: client,
    session: {
      can: (scope: string) => client.session.can(scope),
      login: async (username: string, password: string, type: string = 'operator'): Promise<LoginResult> => {
        // The SDK session drives the login: tokens land in the store, every later request
        // carries them, and refresh is proactive from here on (A-2). What the facade adds is
        // the part of the response the core session does not keep.
        await client.session.login({ username, password, type })
        const resp = driver.lastLogin
        return {
          accessToken: resp?.accessToken,
          refreshToken: resp?.refreshToken,
          ...(resp?.expiresAt ? { expiresAt: resp.expiresAt } : {}),
          // D42: the server may have already reduced this session to read-only scopes because
          // the operator is off-shift. Dropping the flag here is what makes a write look like
          // an unexplained 403 later.
          shiftRestricted: resp?.shiftRestricted ?? false,
          ...(resp?.user ? { user: loginUserInfo(resp.user, username, type) } : {})
        }
      },
      getCurrentUser: async () => toUserInfo(await authApi.getCurrentUser()),
      logout: async (refreshToken?: string | null) => {
        // The endpoint revokes the refresh token it is given. It used to be sent '', so
        // nothing was revoked and a signed-out session stayed refreshable until it expired.
        driver.logoutToken = refreshToken ?? null
        await client.session.logout()
      },
      restore: async () => {
        const restored = await client.session.restore()
        return restored ? ((client.session.user as unknown as UserInfo | null) ?? null) : null
      },
      refresh: async () => (await client.session.refresh()) !== null,
      getTokens: async () => (await tokenStore.read()) ?? null,
      setTokens: (tokens) => client.session.setTokens(tokens),
      onTokensChanged: (listener) => tokenStore.changed.on(listener),
      onEnded: (listener) => client.session.onSessionEnded(listener),
      onRefreshed: (listener) => driver.refreshed.on(listener),
      onChanged: (listener) =>
        client.session.onChanged((state) =>
          listener({
            status: state.status,
            user: (state.user as unknown as UserInfo | null) ?? null,
            scopes: state.scopes
          })
        )
    },
    config: {
      get: async () => {
        const resp = await configApi.getClientConfig()
        return {
          forceUppercase: resp.forceUppercase ?? false,
          defaultLanguage: resp.defaultLanguage || 'tr',
          supportedCultures: resp.supportedCultures || ['tr'],
          idleWarningMinutes: resp.idleWarningMinutes || 15,
          liveSignalLimit: resp.liveSignalLimit || 100,
          monitoringCenter: {
            id: '',
            name: resp.monitoringCenter?.name || 'Monitoring Center',
            alarmSoundUrl: resp.monitoringCenter?.alarmSoundUrl ?? undefined,
            options: resp.monitoringCenter?.options ?? undefined
          }
        }
      }
    },
    i18n: {
      bundle: async (culture: string) => {
        const resp = await locApi.getLocalizationBundle({ culture })
        const keysMap = (resp.keys as Record<string, string>) || {}
        return {
          culture: resp.culture || culture,
          values: keysMap,
          t: (key: string, params?: Record<string, unknown>) => {
            let str = keysMap[key] ?? key
            if (params) {
              for (const [k, v] of Object.entries(params)) {
                str = str.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v))
              }
            }
            return str
          }
        }
      },
      supportedCultures: async () => (await locApi.getSupportedCultures()) || [],
      overrides: async () => {
        const resp = await locApi.getTranslationOverrides()
        return (resp.cultures as Record<string, Record<string, string>>) || {}
      },
      listOverrides: async () =>
        ((await locApi.listTranslationOverrides()) || []).map(toTranslationOverride),
      setOverride: async (culture: string, key: string, value: string) =>
        toTranslationOverride(
          await locApi.setTranslationOverride({ culture, key, setTranslationOverrideRequest: { value } })
        ),
      deleteOverride: async (culture: string, key: string) => {
        await locApi.deleteTranslationOverride({ culture, key })
      }
    },
    reference: {
      bundle: async () => {
        // Always revalidate. The response carries an ETag, so an unchanged bundle costs a
        // 304; a fresh-for-five-minutes browser copy is what made an admin's change invisible
        // until the cache was cleared, even across a reload.
        const resp = await refApi.getReferenceBundle({}, { cache: 'no-cache' })
        return resp as any
      },
      // Filtered server-side by the parent id. The reference bundle does not carry
      // these three collections at all, so there is nothing to filter client-side.
      models: async (brandId?: string) => (await refApi.getModels({ brandId })) || [],
      protocols: async (modelId?: string) => (await refApi.getProtocols({ modelId })) || [],
      districts: async (cityId?: string) => (await refApi.getDistricts({ cityId })) || [],
      /** Lazy fetch of the HTML description for a panel model (G-75). */
      getModelDescription: async (modelId: string) => {
        // The generated SDK may not have this method yet (pending codegen).
        // Call the endpoint directly via the same auth config the SDK uses.
        if (typeof (refApi as any).getModelDescription === 'function') {
          return (await (refApi as any).getModelDescription({ id: modelId })) as any
        }
        const resp = await client.http.fetch(`/v1/reference/models/${modelId}/description`)
        return await resp.json()
      }
    },
    alarmEvents: {
      list: async (params?: Record<string, unknown>) => {
        const resp = await alarmEventsApi.getAlarmEvents(params as any)
        return {
          items: resp || [],
          hasMore: false,
          totalCount: resp?.length ?? 0,
          // GetAlarmEvents caps at 100 rows (Pitfall 2) — the grid must say so.
          isCapped: (resp?.length ?? 0) >= ALARM_EVENTS_ROW_CAP
        }
      },
      getById: async (id: string) => {
        return await alarmEventsApi.getAlarmEventById({ id })
      },
      lock: async (id: string, options?: { force?: boolean }) => {
        return await alarmEventsApi.lockAlarmEvent({ id, force: options?.force })
      },
      unlock: async (id: string) => {
        return await alarmEventsApi.unlockAlarmEvent({ id })
      },
      complete: async (id: string, request: any) => {
        return await alarmEventsApi.completeAlarmEvent({ id, completeAlarmRequest: request })
      },
      quickComplete: async (id: string, request: { signalExplanationId: string }) => {
        return await alarmEventsApi.quickCompleteAlarmEvent({
          id,
          quickCompleteAlarmRequest: { signalExplanationId: request.signalExplanationId }
        })
      },
      getBatchCandidates: async (params?: { brandId?: string; modelId?: string }) => {
        return (await alarmEventsApi.getBatchCandidates(params as any)) || []
      },
      listRecent: async (params?: { minutes?: number; limit?: number }) => {
        return (await alarmEventsApi.getRecentAlarmEvents(params ?? {})) || []
      },
      restoreRecent: async (id: string) => {
        return await alarmEventsApi.restoreRecentAlarmEvent({ id })
      },
      batchComplete: async (request: { signalCodes: string[]; action: string; cutoffUtc?: string; brandId?: string; modelId?: string }) => {
        return await alarmEventsApi.batchCompleteAlarmEvents({
          batchCompleteRequest: {
            ...request,
            cutoffUtc: request.cutoffUtc ? new Date(request.cutoffUtc) : undefined
          }
        })
      },
      batchDelay: async (request: { signalCodes: string[]; delayMinutes: number; cutoffUtc?: string; brandId?: string; modelId?: string }) => {
        return await alarmEventsApi.batchDelayAlarmEvents({
          batchDelayRequest: {
            ...request,
            cutoffUtc: request.cutoffUtc ? new Date(request.cutoffUtc) : undefined
          }
        })
      }
    },
    sides: {
      list: async (params?: Record<string, unknown>) => {
        const resp = await subscribersApi.getSides(params as any)
        return {
          items: resp.items || [],
          hasMore: resp.hasNextPage ?? false,
          totalCount: resp.totalCount,
          isCapped: false
        }
      },
      listUnapproved: async (params?: Record<string, unknown>) => {
        const resp = await subscribersApi.getUnapprovedSides(params as any)
        return {
          items: resp.items || [],
          hasMore: resp.hasNextPage ?? false,
          totalCount: resp.totalCount,
          isCapped: false
        }
      },
      getById: async (id: string) => {
        return await subscribersApi.getSideById({ sideId: id })
      },
      contacts: async (sideId: string) => (await subscribersApi.getSideContacts({ sideId })) || [],
      zones: async (sideId: string) => (await subscribersApi.getSideZones({ sideId })) || [],
      notes: async (sideId: string) => (await subscribersApi.getSideNotes({ sideId })) || [],
      timetables: async (sideId: string) => (await subscribersApi.getSideTimetables({ sideId })) || [],
      holidays: async (sideId: string) => (await subscribersApi.getSideHolidays({ sideId })) || [],
      users: async (sideId: string) => (await subscribersApi.getSideUsers({ sideId })) || [],
      documents: async (sideId: string) => (await subscribersApi.getSideDocuments({ sideId })) || [],
      agreements: async (sideId: string) => (await subscribersApi.getSideAgreements({ sideId })) || [],
      signalHistory: async (sideId: string, opts?: { page?: number; pageSize?: number }) => {
        const res = await subscribersApi.getSideSignals({ id: sideId, page: opts?.page, pageSize: opts?.pageSize })
        return res
      },
      signalTypes: async (sideId: string) => (await subscribersApi.getSideSignalTypes({ sideId })) || [],
      smsConfig: async (sideId: string) => (await subscribersApi.getSideSmsConfig({ sideId })) || [],
      mailConfig: async (sideId: string) => (await subscribersApi.getSideMails({ sideId })) || [],
      effectiveSignalTypes: async (sideId: string) =>
        (await sideSignalTypesApi.getEffectiveSignalTypes({ sideId })) || [],
      // Guard tours (bekçi takip). The endpoints post-date the pinned SDK spec, so they go
      // through the generated API's own request() — same base URL, auth and middleware (V1).
      // Replace with generated calls once the SDK is regenerated.
      guardTours: {
        list: async (sideId: string) => {
          const resp = await (sidesApi as any).request({
            path: `/v1/sides/${encodeURIComponent(sideId)}/guard-tours`,
            method: 'GET',
            headers: {}
          })
          const json = await resp.json()
          return Array.isArray(json) ? json : []
        },
        create: async (sideId: string, request: GuardTourWrite) => {
          const resp = await (sidesApi as any).request({
            path: `/v1/sides/${encodeURIComponent(sideId)}/guard-tours`,
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: request
          })
          return await resp.json()
        },
        update: async (sideId: string, id: string, request: GuardTourWrite) => {
          const resp = await (sidesApi as any).request({
            path: `/v1/sides/${encodeURIComponent(sideId)}/guard-tours/${encodeURIComponent(id)}`,
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: request
          })
          return await resp.json()
        },
        remove: async (sideId: string, id: string) => {
          await (sidesApi as any).request({
            path: `/v1/sides/${encodeURIComponent(sideId)}/guard-tours/${encodeURIComponent(id)}`,
            method: 'DELETE',
            headers: {}
          })
        }
      },
      approve: async (sideId: string, request: { note?: string }) => {
        return await subscribersApi.approveSide({ sideId, approveSideRequest: { note: request.note } })
      },
      activate: async (sideId: string, request: { activeCategoryId?: string; note?: string }) => {
        return await subscribersApi.activateSide({
          sideId,
          activateSideRequest: { activeCategoryId: request.activeCategoryId, note: request.note }
        })
      },
      deactivate: async (sideId: string, request: { activeCategoryId?: string; note?: string }) => {
        return await subscribersApi.deactivateSide({
          sideId,
          deactivateSideRequest: { activeCategoryId: request.activeCategoryId, note: request.note }
        })
      },
      reasons: async (sideId: string) => {
        return await drainPages((p) =>
          subscriberReasonsApi.listSideReasons({ sideId, page: p, pageSize: 200 })
        )
      },

      // ── Sub-resources whose list lives on SubscribersApi and whose writes
      //    live on their own api (§18: SimCard, SideControl, SideMail, SideInvoice).
      simCards: async (sideId: string) => (await subscribersApi.getSideSimCards({ sideId })) || [],
      createSimCard: async (sideId: string, request: Record<string, unknown>) =>
        await sideSimCardsApi.createSideSimCard({ sideId, createSimCardRequest: request as any }),
      updateSimCard: async (sideId: string, id: string, request: Record<string, unknown>) =>
        await sideSimCardsApi.updateSideSimCard({ sideId, id, updateSimCardRequest: request as any }),
      deleteSimCard: async (sideId: string, id: string) => {
        await sideSimCardsApi.deleteSideSimCard({ sideId, id })
      },

      controls: async (sideId: string) => (await subscribersApi.getSideControls({ sideId })) || [],
      createControl: async (sideId: string, request: Record<string, unknown>) =>
        await sideControlsApi.createSideControl({ sideId, createSideControlRequest: request as any }),
      updateControl: async (sideId: string, id: string, request: Record<string, unknown>) =>
        await sideControlsApi.updateSideControl({ sideId, id, updateSideControlRequest: request as any }),
      deleteControl: async (sideId: string, id: string) => {
        await sideControlsApi.deleteSideControl({ sideId, id })
      },

      mails: async (sideId: string) => (await subscribersApi.getSideMails({ sideId })) || [],
      createMail: async (sideId: string, request: Record<string, unknown>) =>
        await sideMailsApi.createSideMail({ sideId, createSideMailRequest: request as any }),
      updateMail: async (sideId: string, id: string, request: Record<string, unknown>) =>
        await sideMailsApi.updateSideMail({ sideId, id, updateSideMailRequest: request as any }),
      deleteMail: async (sideId: string, id: string) => {
        await sideMailsApi.deleteSideMail({ sideId, id })
      },

      // An invoice is created by the generation run; `Paid` is the only field a
      // console may change (§18).
      invoices: async (sideId: string) => {
        return await drainPages((p) =>
          sideInvoicesApi.listSideInvoices({ sideId, page: p, pageSize: 200 })
        )
      },
      setInvoicePaid: async (sideId: string, id: string, paid: boolean) =>
        await sideInvoicesApi.updateSideInvoice({
          sideId,
          id,
          updateSideInvoiceRequest: { paid }
        }),

      // What was sent to this subscriber's people, newest first. Both logs only grow, so the
      // panels read the latest 1 000 rows rather than draining a decade of alarms.
      smsLog: async (sideId: string) => {
        return await drainPages(
          (p) => smsLogApi.listSmsLog({ sideId, page: p, pageSize: 200 }),
          5
        )
      },
      pushMessages: async (sideId: string) => {
        return await drainPages(
          (p) => sideMobileMessagesApi.listMobileMessages({ sideId, page: p, pageSize: 200 }),
          5
        )
      },

      update: async (sideId: string, patch: Record<string, unknown>) => {
        return await subscribersApi.updateSide({ sideId, updateSideRequest: patch as any })
      },

      /**
       * S-200 batch update. The filter form sends the list endpoint's own criteria and the
       * server re-runs them, so the rows written are the rows the search matched rather
       * than a page of ids the client had lying around.
       */
      batchUpdate: async (request: Record<string, unknown>) => {
        return await (subscribersApi as any).batchUpdateSides({
          sideBatchUpdateRequest: request as any
        })
      },

      create: async (request: SideCreate) =>
        await subscribersApi.createSide({ createSideRequest: request as any }),
      clone: async (sideId: string, request: SideCloneRequest) =>
        await subscribersApi.cloneSide({ sideId, cloneSideRequest: request as any }),
      createPartition: async (sideId: string, request: SidePartitionRequest) =>
        await subscribersApi.createPartition({ sideId, createPartitionRequest: request as any }),
      changeSideNo: async (sideId: string, sideNo: number) =>
        await (subscribersApi as any).changeSideNo({ sideId, changeSideNoRequest: { sideNo } }),
      remove: async (sideId: string) => await subscribersApi.deleteSide({ sideId }),
      deletePreview: async (sideId: string) =>
        (await subscribersApi.getSideDeletePreview({ sideId })) as any,
      contactDeletePreview: async (sideId: string, id: string) =>
        (await subResourcesApi.getSideContactDeletePreview({ sideId, id })) as any,
      listDeleted: async (params?: { q?: string; limit?: number; offset?: number }) => {
        const resp = await subscribersApi.listDeletedSides({ ...(params || {}) })
        return {
          items: resp.items || [],
          hasMore: resp.hasMore ?? false,
          totalCount: resp.totalCount,
          isCapped: false
        }
      },
      restore: async (sideId: string) => await subscribersApi.restoreSide({ sideId }),

      nextSideNo: async (params?: { monitoringCenterId?: string; start?: number; end?: number }) =>
        await sidesApi.getNextSideNo({ ...(params || {}) }),
      availableSideNos: async (
        start: number,
        end: number,
        params?: { monitoringCenterId?: string }
      ) => await sidesApi.getAvailableSideNos({ start, end, ...(params || {}) }),

      applyHolidays: async (request: ApplyHolidaysCommand) =>
        await sideHolidaysApi.applyHolidays({ applyHolidaysRequest: request as any }),

      createContact: async (sideId: string, request: Record<string, unknown>) =>
        await subResourcesApi.createSideContact({ sideId, createSideContactRequest: request as any }),
      updateContact: async (sideId: string, id: string, patch: Record<string, unknown>) =>
        await subResourcesApi.updateSideContact({ sideId, id, updateSideContactRequest: patch as any }),
      deleteContact: async (sideId: string, id: string) =>
        await subResourcesApi.deleteSideContact({ sideId, id }),
      reorderContacts: async (sideId: string, ids: string[]) =>
        await subResourcesApi.reorderSideContacts({ sideId, reorderContactsRequest: { ids } }),

      createUser: async (sideId: string, request: Record<string, unknown>) =>
        await subResourcesApi.createSideUser({ sideId, createSideUserRequest: request as any }),
      updateUser: async (sideId: string, id: string, patch: Record<string, unknown>) =>
        await subResourcesApi.updateSideUser({ sideId, id, updateSideUserRequest: patch as any }),
      deleteUser: async (sideId: string, id: string) =>
        await subResourcesApi.deleteSideUser({ sideId, id }),

      createZone: async (sideId: string, request: Record<string, unknown>) =>
        await subResourcesApi.createSideZone({ sideId, createSideZoneRequest: request as any }),
      updateZone: async (sideId: string, id: string, patch: Record<string, unknown>) =>
        await subResourcesApi.updateSideZone({ sideId, id, updateSideZoneRequest: patch as any }),
      deleteZone: async (sideId: string, id: string) =>
        await subResourcesApi.deleteSideZone({ sideId, id }),
      bulkCreateZones: async (sideId: string, zones: Record<string, unknown>[]) =>
        await subResourcesApi.bulkCreateSideZones({
          sideId,
          bulkCreateSideZoneRequest: { zones: zones as any }
        }),

      upsertTimetable: async (sideId: string, days: Record<string, unknown>[]) =>
        await timetablesApi.upsertSideTimeTable({ sideId, upsertTimeTableRequest: { days: days as any } }),
      updateTimetableDay: async (sideId: string, id: string, request: Record<string, unknown>) =>
        await timetablesApi.updateSideTimeTableDay({
          sideId,
          id,
          updateSingleTimeTableRequest: request as any
        }),
      deleteTimetableDay: async (sideId: string, id: string) =>
        await timetablesApi.deleteSideTimeTableDay({ sideId, id }),

      createHoliday: async (sideId: string, request: Record<string, unknown>) =>
        await sideHolidaysApi.createSideHoliday({ sideId, createHolidayRequest: request as any }),
      updateHoliday: async (sideId: string, id: string, patch: Record<string, unknown>) =>
        await sideHolidaysApi.updateSideHoliday({ sideId, id, updateHolidayRequest: patch as any }),
      deleteHoliday: async (sideId: string, id: string) =>
        await sideHolidaysApi.deleteSideHoliday({ sideId, id }),
      bulkCreateHolidays: async (sideId: string, holidays: Record<string, unknown>[]) =>
        await sideHolidaysApi.bulkCreateSideHolidays({
          sideId,
          bulkHolidayRequest: { holidays: holidays as any }
        }),

      createNote: async (sideId: string, request: Record<string, unknown>) =>
        await sideNotesApi.createSideNote({ sideId, createSideNoteRequest: request as any }),
      updateNote: async (sideId: string, id: string, patch: Record<string, unknown>) =>
        await sideNotesApi.updateSideNote({ sideId, id, updateSideNoteRequest: patch as any }),
      deleteNote: async (sideId: string, id: string) =>
        await sideNotesApi.deleteSideNote({ sideId, id }),

      createSignalType: async (sideId: string, request: Record<string, unknown>) =>
        await sideSignalTypesApi.createSideSignalType({
          sideId,
          createSideSignalTypeRequest: request as any
        }),
      updateSignalType: async (sideId: string, id: string, patch: Record<string, unknown>) =>
        await sideSignalTypesApi.updateSideSignalType({
          sideId,
          id,
          updateSideSignalTypeRequest: patch as any
        }),
      deleteSignalType: async (sideId: string, id: string) =>
        await sideSignalTypesApi.deleteSideSignalType({ sideId, id }),
      bulkReplaceSignalTypes: async (sideId: string, overrides: Record<string, unknown>[]) =>
        await sideSignalTypesApi.bulkReplaceSideSignalTypes({
          sideId,
          bulkSideSignalTypeRequest: { overrides: overrides as any }
        }),
      copySignalTypes: async (sideId: string, sourceSideId: string, overwrite: boolean) =>
        await sideSignalTypesApi.copySideSignalTypes({
          sideId,
          sourceSideId,
          copySignalTypesRequest: { overwrite }
        }),

      createSmsConfig: async (sideId: string, request: Record<string, unknown>) =>
        await subResourcesApi.createSideSmsConfig({
          sideId,
          createSideSmsConfigRequest: request as any
        }),
      updateSmsConfig: async (sideId: string, id: string, patch: Record<string, unknown>) =>
        await subResourcesApi.updateSideSmsConfig({
          sideId,
          id,
          updateSideSmsConfigRequest: patch as any
        }),
      deleteSmsConfig: async (sideId: string, id: string) =>
        await subResourcesApi.deleteSideSmsConfig({ sideId, id }),

      createMailConfig: async (sideId: string, request: Record<string, unknown>) =>
        await sideMailsApi.createSideMail({
          sideId,
          createSideMailRequest: request as any
        }),
      updateMailConfig: async (sideId: string, id: string, patch: Record<string, unknown>) =>
        await sideMailsApi.updateSideMail({
          sideId,
          id,
          updateSideMailRequest: patch as any
        }),
      deleteMailConfig: async (sideId: string, id: string) =>
        await sideMailsApi.deleteSideMail({ sideId, id }),

      createAgreement: async (sideId: string, request: Record<string, unknown>) =>
        await sideAgreementsApi.createSideAgreement({ sideId, createAgreementRequest: request as any }),
      updateAgreement: async (sideId: string, id: string, patch: Record<string, unknown>) =>
        await sideAgreementsApi.updateSideAgreement({
          sideId,
          id,
          updateAgreementRequest: patch as any
        }),
      deleteAgreement: async (sideId: string, id: string) =>
        await sideAgreementsApi.deleteSideAgreement({ sideId, id }),

      createDocument: async (sideId: string, file: File, name?: string) =>
        await subResourcesApi.createSideDocument({ sideId, file, name }),
      deleteDocument: async (sideId: string, id: string) =>
        await subResourcesApi.deleteSideDocument({ sideId, id }),

      geocode: async (sideId: string, force?: boolean) =>
        await geocodingApi.geocodeSide({ sideId, geocodeSideRequest: { force } }),
      geocodeSearch: async (q: string) => await geocodingApi.geocodeSearch({ q }),
      setLocation: async (sideId: string, latitude: string, longitude: string) =>
        await geocodingApi.setSideLocation({ sideId, setLocationRequest: { latitude, longitude } }),
      listNoteExplanations: async () =>
        cachedExplanations('note', async () => {
          const resp = await client.http.fetch(`/v1/note-explanations`, {
            headers: {}
          })
            return (await resp.json()).map((e: any) => ({
            id: e.id || '',
            name: e.name || '',
            priority: e.priority
          }))
        })
    },
    receivers: {
      list: async () => (await refApi.getReceivers({})) || []
    },
    signalEvents: {
      listLive: async () => (await signalEventsApi.getLiveSignals({})) || [],
      getById: async (id: string) => await signalEventsApi.getSignalEventById({ id }),
      list: async (params?: Record<string, unknown>) => {
        const resp = await signalEventsApi.getSignalEvents(params as any)
        return {
          items: resp.items || [],
          hasMore: resp.hasNextPage ?? false,
          totalCount: resp.totalCount,
          isCapped: false
        }
      },
      listExplanations: async () =>
        cachedExplanations('signal', async () => {
          const resp = await signalExplanationsApi.listSignalExplanations()
          return (resp || []).map(e => ({
            id: e.id || '',
            name: e.name || '',
            priority: e.priority
          }))
        }),
      appendAction: async (id: string, request: { text: string; stamp: boolean }) => {
        return await signalEventsApi.appendActionText({ id, appendActionTextRequest: request })
      },
      replaceAction: async (id: string, request: { text: string; stamp: boolean }) => {
        // PUT /v1/signal-events/{id}/action — reuses the append request opts but
        // overrides the HTTP method. Goes through the full SDK middleware pipeline
        // (auth, timestamps, retry) until the next SDK regeneration adds a native method.
        const opts = await signalEventsApi.appendActionTextRequestOpts({
          id,
          appendActionTextRequest: request,
        })
        opts.method = 'PUT'
        const resp = await (signalEventsApi as any).request(opts)
        return await resp.json()
      },
      delay: async (id: string, request: { delayTime: number; timeUnit: string }) => {
        return await signalEventsApi.delaySignal({ id, signalDelayRequest: request })
      },
      block: async (id: string, request: { blokeTime: number; timeUnit: string }) => {
        return await signalEventsApi.blockSignal({ id, signalBlockRequest: request })
      },
      blockReceiver: async (id: string, request: { sideNo: number }) => {
        return await signalEventsApi.blockReceiver({ id, receiverBlockRequest: { sideNo: request.sideNo } })
      }
    },
    services: {
      // ListServices is pagination shape C: capped by `limit`, no total, no page (S-400).
      list: async (params?: Record<string, unknown>) => {
        const resp = await servicesApi.listServices(params as any)
        return {
          items: resp.items || [],
          hasMore: resp.hasMore ?? false,
          totalCount: null,
          isCapped: resp.hasMore ?? false
        }
      },
      listForSide: async (sideId: string) => (await servicesApi.listServicesForSide({ sideId })) || [],
      getById: async (id: string) => await servicesApi.getServiceById({ id }),
      complete: async (id: string) => await servicesApi.completeService({ id }),
      cancel: async (id: string, request: { cancelReason: string }) => {
        return await servicesApi.cancelService({
          id,
          cancelSideServiceRequest: { cancelReason: request.cancelReason }
        })
      },
      details: async (id: string) => (await serviceDetailsApi.listServiceDetails({ id })) || [],
      // Metadata only, by design — the list never returns binary (S-401 panel 4).
      photos: async (id: string) => (await servicePhotosApi.listServicePhotos({ id })) || [],
      create: async (sideId: string, request: Record<string, unknown>) =>
        await servicesApi.createService({ sideId, createSideServiceRequest: request as any }),
      update: async (id: string, request: Record<string, unknown>) =>
        await servicesApi.updateService({ id, updateSideServiceRequest: request as any }),
      createDetail: async (id: string, request: Record<string, unknown>) =>
        await serviceDetailsApi.createServiceDetail({
          id,
          createServiceDetailRequest: request as any
        }),
      updateDetail: async (detailId: string, request: Record<string, unknown>) =>
        await serviceDetailsApi.updateServiceDetail({
          detailId,
          updateServiceDetailRequest: request as any
        }),
      deleteDetail: async (detailId: string) =>
        await serviceDetailsApi.deleteServiceDetail({ detailId }),
      // Only the file: the generated code drops `description` and `photoType` even
      // though its types accept them (G-73), so passing them would be a silent no-op.
      createPhoto: async (id: string, file: File) =>
        await servicePhotosApi.createServicePhoto({ id, file }),
      replacePhotoContent: async (photoId: string, file: File) =>
        await servicePhotosApi.replaceServicePhotoContent({ photoId, file }),
      deletePhoto: async (photoId: string) => await servicePhotosApi.deleteServicePhoto({ photoId })
    },
    technicalWork: {
      listAll: async () => (await technicalWorkApi.listAllTechnicalWorks({})) || [],
      listForSide: async (sideId: string) => (await technicalWorkApi.listTechnicalWorks({ sideId })) || [],
      statusForSide: async (sideId: string) => await technicalWorkApi.getTechnicalWorkStatus({ sideId }),
      completeById: async (id: string) => await technicalWorkApi.completeTechnicalWorkById({ id }),
      completeForSide: async (sideId: string) => await technicalWorkApi.completeTechnicalWorkForSide({ sideId }),
      create: async (sideId: string, request: Record<string, unknown>) =>
        await technicalWorkApi.createTechnicalWork({
          sideId,
          createTechnicalWorkRequest: request as any
        }),
      listTechnicalPeople: async (params?: Record<string, unknown>) =>
        (await refApi.getTechnicalPeople(params as any)) || []
    },
    customers: {
      // Shape B: limit/offset with hasMore and no total — the footer must not claim one (S-300).
      list: async (params?: Record<string, unknown>) => {
        const resp = await customersApi.listCustomers(params as any)
        return {
          items: resp.items || [],
          hasMore: resp.hasMore ?? false,
          totalCount: resp.totalCount ?? null,
          isCapped: false
        }
      },
      getById: async (id: string) => await customersApi.getCustomerById({ id }),
      sides: async (id: string) => (await customersApi.getCustomerSides({ id })) as any,
      create: async (request: Record<string, unknown>) =>
        await customersApi.createCustomer({ createCustomerRequest: request as any }),
      update: async (id: string, request: Record<string, unknown>) =>
        await customersApi.updateCustomer({ id, updateCustomerRequest: request as any }),
      remove: async (id: string) => await customersApi.deleteCustomer({ id })
    },
    dealers: {
      list: async (params?: Record<string, unknown>) => {
        const resp = await dealersApi.listDealers(params as any)
        return {
          items: resp.items || [],
          hasMore: resp.hasMore ?? false,
          totalCount: resp.totalCount ?? null,
          isCapped: false
        }
      },
      getById: async (id: string) => await dealersApi.getDealerById({ id }),
      statistics: async () => await statisticsApi.getDealerStatistics(),
      sidesByStatus: async (statusType: string) =>
        ((await statisticsApi.getDealerSidesByStatus({ type: statusType })) as any) || [],
      create: async (request: Record<string, unknown>) =>
        await dealersApi.createDealer({ createDealerRequest: request as any }),
      update: async (id: string, request: Record<string, unknown>) =>
        await dealersApi.updateDealer({ id, updateDealerRequest: request as any }),
      remove: async (id: string) => await dealersApi.deleteDealer({ id }),
      uploadLogo: async (id: string, file: File) => {
        // G-72: the generated operation builds a PUT with no body. The runtime merges
        // `initOverrides` over the generated init and passes FormData through
        // untouched, so the body goes out correctly from here.
        //
        // No Content-Type is set by hand: the browser writes the multipart boundary,
        // and the server detects the real type from magic bytes anyway (§01 F-2).
        const form = new FormData()
        form.append('file', file)
        return await dealersApi.uploadDealerLogo({ id }, { body: form } as any)
      },
      deleteLogo: async (id: string) => await dealersApi.deleteDealerLogo({ id }),
      sideNos: async (dealerId: string) => await dealersApi.getDealerSideNos({ dealerId }),
      sideNoPool: async (dealerId: string) => await dealersApi.getDealerSideNoPool({ dealerId }),
      reserveSideNos: async (dealerId: string, request: Record<string, unknown>) =>
        await dealersApi.reserveDealerSideNos({
          dealerId,
          reserveDealerSideNosRequest: request as any
        }),
      releaseSideNo: async (dealerId: string, sideNo: number) =>
        await dealersApi.releaseDealerSideNo({ dealerId, sideNo }),
      releaseSideNoRange: async (dealerId: string, from: number, to: number) =>
        await dealersApi.releaseDealerSideNoRange({ dealerId, from, to })
    },
    mobileUsers: {
      list: async (params?: Record<string, unknown>) => {
        const resp = await mobileUsersApi.listMobileUsers(params as any)
        return {
          items: resp.items || [],
          hasMore: resp.hasMore ?? false,
          totalCount: resp.totalCount ?? null,
          isCapped: false
        }
      },
      getById: async (id: string) => await mobileUsersApi.getMobileUserById({ id }),
      update: async (id: string, request: { name?: string | null; phone?: string | null }) =>
        await mobileUsersApi.updateMobileUser({ id, updateMobileUserRequest: request }),
      resetPassword: async (id: string, password: string) =>
        await mobileUsersApi.resetMobileUserPassword({
          id,
          resetMobileUserPasswordRequest: { password }
        }),
      listForSide: async (sideId: string) =>
        (await mobileUsersApi.listMobileUsersForSide({ sideId })) || [],
      disable: async (id: string) => await mobileUsersApi.disableMobileUser({ id }),
      enable: async (id: string) => await mobileUsersApi.enableMobileUser({ id }),
      logoutAll: async (id: string) => await mobileUsersApi.logoutMobileUserDevices({ id }),
      unlinkFromSide: async (sideId: string, userId: string) =>
        await mobileUsersApi.unlinkMobileUserFromSide({ sideId, userId }),
      linkToSide: async (sideId: string, request: Record<string, unknown>) =>
        await mobileUsersApi.linkMobileUserToSide({
          sideId,
          linkMobileUserRequest: request as any
        }),
      batchLinkToSides: async (
        userId: string,
        request: { sideIds: string[]; expectedCount?: number }
      ) =>
        await mobileUsersApi.batchLinkMobileUserToSides({
          id: userId,
          batchLinkSidesRequest: {
            sideIds: request.sideIds,
            expectedCount: request.expectedCount
          }
        }),
      remove: async (id: string) => await mobileUsersApi.deleteMobileUser({ id }),
      batchResetPasswords: async (request: MobileUserBatchResetRequest) => {
        const res = await mobileUsersApi.batchResetMobileUserPasswords({
          batchResetMobileUserPasswordsRequest: request
        })
        return {
          requestedCount: res.requestedCount ?? 0,
          resetCount: res.resetCount ?? 0,
          skippedCount: res.skippedCount ?? 0,
          failures: (res.failures || []).map((f) => ({
            mobileUserId: f.mobileUserId ?? '',
            name: f.name,
            phone: f.phone,
            code: f.code ?? '',
            message: f.message
          })),
          sideEffects: res.sideEffects
        }
      }
    },
    invoices: {
      preview: async (request: { period: string; dealerId?: string; sideIds?: string[] }) => {
        return await invoicesApi.previewInvoices({ invoicePreviewRequest: request })
      },
      generate: async (request: { period: string; dealerId?: string; sideIds?: string[]; expectedCount: number }) => {
        return await invoicesApi.generateInvoices({ invoiceGenerateRequest: request })
      }
    },
    dashboard: {
      counters: async () => await statisticsApi.getDashboardCounters()
    },
    search: {
      /**
       * D84: the list without per-section counts (`isCounted` false, `hasMore` set), so it lands
       * before the counts; {@link counts} fills them in afterwards. The generated SDK does not yet
       * include includeCount (pending SDK regen), so it is injected like globalFiltered's params.
       */
      global: async (q: string, signal?: AbortSignal) => {
        const opts = await searchApi.globalSearchRequestOpts({ q })
        opts.query = { ...opts.query, includeCount: false }
        const response = await (searchApi as any).request(opts, signal ? { signal } : undefined)
        return await response.json()
      },
      counts: async (q: string, signal?: AbortSignal) => {
        const opts = await searchApi.globalSearchRequestOpts({ q })
        opts.path = `${opts.path.replace(/\/$/, '')}/counts`
        const response = await (searchApi as any).request(opts, signal ? { signal } : undefined)
        return (await response.json()) as { sections: Array<{ entityType: string; totalCount: number }>; totalCount: number }
      },
      globalFiltered: async (q: string, entityType: string, limit?: number, skip?: number, signal?: AbortSignal) => {
        // The generated SDK does not yet include entityType/limit/skip params (pending SDK regen).
        // Inject them into the request options manually.
        const opts = await searchApi.globalSearchRequestOpts({ q })
        const extra: Record<string, string | number> = { entityType, limit: limit ?? 50 }
        if (skip && skip > 0) extra.skip = skip
        opts.query = { ...opts.query, ...extra }
        const response = await (searchApi as any).request(opts, signal ? { signal } : undefined)
        return await response.json()
      }
    },
    admin: {
      listOperatorUsers: async (params?: Record<string, unknown>) => {
        const resp = await userAdminApi.listOperatorUsers(params as any)
        return {
          items: resp.items || [],
          hasMore: resp.hasNextPage ?? false,
          totalCount: resp.totalCount,
          isCapped: false
        }
      },
      getOperatorUser: async (id: string) => await userAdminApi.getOperatorUser({ id }),
      unlockUser: async (id: string) => await userAdminApi.unlockUser({ id }),
      health: async () => await systemApi.getCutoverHealth(),
      bulkHashPasswords: async (dryRun: boolean) => await administrationApi.bulkHashPasswords({ dryRun }),
      getSidesWithDataIssues: async () =>
        (await administrationApi.getSidesWithDataIssues({})) as any,
      getPhoneAuditSummary: async () =>
        await administrationApi.getPhoneAuditSummary({}),
      getPhoneAuditDetail: async (entity: string, limit = 500) =>
        await administrationApi.getPhoneAuditEntityDetail({ entity, limit }),
      normalizePhones: async (entities: string[], dryRun: boolean) =>
        await administrationApi.normalizePhones({ phoneNormalizationRequest: { entities }, dryRun }),
      listMyAlarmSisSignalTypes: async () =>
        await administrationApi.listMyAlarmSisSignalTypes(),
      compareMyAlarmSisSignals: async (request: MyAlarmSisComparisonRequest) =>
        await administrationApi.compareMyAlarmSisSignals({ myAlarmSisComparisonRequest: request }),
      createOperatorUser: async (request: OperatorUserCreate) =>
        await userAdminApi.createOperatorUser({ createOperatorUserRequest: request }),
      updateOperatorUser: async (id: string, request: OperatorUserUpdate) =>
        await userAdminApi.updateOperatorUser({ id, updateOperatorUserRequest: request }),
      deleteOperatorUser: async (id: string) =>
        await userAdminApi.deleteOperatorUser({ id }),
      resetOperatorPassword: async (id: string, newPassword: string) =>
        await userAdminApi.resetOperatorPassword({ id, resetPasswordRequest: { newPassword } }),
      setUserRoles: async (id: string, roleIds: string[]) =>
        await userAdminApi.setUserRoles({ id, setUserRolesRequest: { roleIds } }),
      getUserCustomers: async (id: string) => {
        const resp = await userAdminApi.getUserCustomers({ id })
        return (resp.customers || []).map((c) => ({ id: c.id || '', name: c.name ?? null }))
      },
      setUserCustomers: async (id: string, customerIds: string[]) => {
        await userAdminApi.setUserCustomers({ id, setUserCustomersRequest: { customerIds } })
      },
      setUserAlarmCategories: async (id: string, categoryIds: string[]) => {
        const resp = await client.http.fetch(`/v1/auth/users/${id}/alarm-categories`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ alarmCategoryIds: categoryIds })
        })
        if (resp.status === 204) return
        return resp.json()
      },
      listRoles: async () => (await userAdminApi.listRoles()) || [],
      setRoleScopes: async (id: string, scopes: string[]) =>
        await userAdminApi.setRoleScopes({ id, setRoleScopesRequest: { scopes } }),
      createRole: async (request: { name: string; scopes?: string[]; copyScopesFromRoleId?: string }) =>
        await userAdminApi.createRole({ createRoleRequest: request }),
      renameRole: async (id: string, name: string) =>
        await userAdminApi.renameRole({ id, renameRoleRequest: { name } }),
      deleteRole: async (id: string) => {
        await userAdminApi.deleteRole({ id })
      },
      getFieldCatalog: async () =>
        ((await userAdminApi.getFieldCatalog()) || []).map((e) => ({
          key: e.key ?? '',
          entity: e.entity ?? '',
          field: e.field ?? '',
          lockable: !!e.lockable,
          readable: !!e.readable,
          writable: !!e.writable,
          carriedBy: e.carriedBy ?? []
        })),
      listFieldPolicySubjects: async () =>
        ((await userAdminApi.listFieldPolicySubjects()) || []).map((s) => ({
          id: s.id ?? '',
          name: s.name ?? '',
          kind: (s.kind ?? 'role') as 'role' | 'dealer' | 'mobile',
          exempt: !!s.exempt,
          hasPolicy: !!s.hasPolicy
        })),
      getRoleFieldPolicy: async (id: string) => toRoleFieldPolicy(await userAdminApi.getRoleFieldPolicy({ id })),
      setRoleFieldPolicy: async (id: string, policy: { hidden: string[]; readOnly: string[] }) =>
        toRoleFieldPolicy(await userAdminApi.setRoleFieldPolicy({ id, setRoleFieldPolicyRequest: policy })),
      listMonitoringCenters: async () => (await refApi.getMonitoringCenters()) || [],

      /**
       * The two things an operator may change about their own account.
       *
       * `UpdateSelfRequest` carries `soundAlertEnabled` and nothing else — the
       * extension is set by a user administrator through `UpdateOperatorUser`,
       * not by its owner. Do not add it here without the contract changing first.
       */
      updateSelf: async (request: { soundAlertEnabled?: boolean | null }) =>
        await userAdminApi.updateSelf({ updateSelfRequest: request }),
      changeOwnPassword: async (currentPassword: string, newPassword: string) => {
        await userAdminApi.changeOwnPassword({
          changeOwnPasswordRequest: { currentPassword, newPassword }
        })
      }
    },
    signalRules: createSignalRulesClient(refApi),
    reports: createReportsClient(client.api(ReportsApi), client.api(ReportAssistantApi)),
    referenceAdmin: {
      listSignals: async (params?: {
        q?: string
        page?: number
        pageSize?: number
        protocolId?: string
        signalTypeId?: string
        alarmCategoryId?: string
        unmapped?: boolean
      }) => {
        const resp = await refApi.getSignals({
          q: params?.q,
          page: params?.page,
          pageSize: params?.pageSize,
          protocolId: params?.protocolId,
          signalTypeId: params?.signalTypeId,
          alarmCategoryId: params?.alarmCategoryId,
          unmapped: params?.unmapped
        })
        return {
          items: resp.items || [],
          hasMore: resp.hasMore ?? false,
          totalCount: resp.totalCount ?? null
        }
      },
      getSignal: async (id: string) => await refApi.getSignalById({ id }),
      createSignal: async (request: Record<string, unknown>) =>
        await refApi.createSignal({ createSignalRequest: request as any }),
      updateSignal: async (id: string, request: Record<string, unknown>) =>
        await refApi.updateSignal({ id, updateSignalRequest: request as any }),
      deleteSignal: async (id: string) => {
        await refApi.deleteSignal({ id })
      },

      listSignalTypes: async (params?: { q?: string; page?: number; pageSize?: number }) => {
        const resp = await refApi.getSignalTypes({ q: params?.q, page: params?.page, pageSize: params?.pageSize })
        const items = resp.items || []
        return {
          items,
          hasMore: resp.hasMore ?? false,
          totalCount: resp.totalCount ?? null
        }
      },
      getSignalType: async (id: string) => await refApi.getSignalTypeById({ id }),
      createSignalType: async (request: Record<string, unknown>) =>
        await refApi.createSignalType({ createSignalTypeRequest: request as any }),
      updateSignalType: async (id: string, request: Record<string, unknown>) =>
        await refApi.updateSignalType({ id, updateSignalTypeRequest: request as any }),
      deleteSignalType: async (id: string) => {
        await refApi.deleteSignalType({ id })
      },

      listSignalRelations: async (params?: { q?: string; page?: number; pageSize?: number }) => {
        const resp = await refApi.listSignalRelations({ q: params?.q, page: params?.page, pageSize: params?.pageSize })
        return {
          items: resp.items || [],
          hasMore: resp.hasMore ?? false,
          totalCount: resp.totalCount ?? null
        }
      },
      getSignalRelation: async (id: string) => await refApi.getSignalRelationById({ id }),
      createSignalRelation: async (request: Record<string, unknown>) =>
        await refApi.createSignalRelation({ createSignalRelationRequest: request as any }),
      updateSignalRelation: async (id: string, request: Record<string, unknown>) =>
        await refApi.updateSignalRelation({ id, updateSignalRelationRequest: request as any }),
      deleteSignalRelation: async (id: string) => {
        await refApi.deleteSignalRelation({ id })
      },

      listSignalRelationTypes: async (params?: { q?: string; page?: number; pageSize?: number }) => {
        const resp = await refApi.listSignalRelationTypes({
          q: params?.q,
          page: params?.page,
          pageSize: params?.pageSize
        })
        return {
          items: resp.items || [],
          hasMore: resp.hasMore ?? false,
          totalCount: resp.totalCount ?? null
        }
      },
      getSignalRelationType: async (id: string) => await refApi.getSignalRelationTypeById({ id }),
      createSignalRelationType: async (request: Record<string, unknown>) =>
        await refApi.createSignalRelationType({ createSignalRelationTypeRequest: request as any }),
      updateSignalRelationType: async (id: string, request: Record<string, unknown>) =>
        await refApi.updateSignalRelationType({ id, updateSignalRelationTypeRequest: request as any }),
      deleteSignalRelationType: async (id: string) => {
        await refApi.deleteSignalRelationType({ id })
      },

      listProducts: async () => (await refApi.listProducts()) || [],
      createProduct: async (request: Record<string, unknown>) =>
        await refApi.createProduct({ saveProductRequest: request as any }),
      updateProduct: async (id: string, request: Record<string, unknown>) =>
        await refApi.updateProduct({ id, saveProductRequest: request as any }),
      deleteProduct: async (id: string) => {
        await refApi.deleteProduct({ id })
      },

      listMobileOperators: async () => (await refApi.getMobileOperators()) || [],
      createMobileOperator: async (request: Record<string, unknown>) =>
        await refApi.createMobileOperator({ saveMobileOperatorRequest: request as any }),
      updateMobileOperator: async (id: string, request: Record<string, unknown>) =>
        await refApi.updateMobileOperator({ id, saveMobileOperatorRequest: request as any }),
      deleteMobileOperator: async (id: string) => {
        await refApi.deleteMobileOperator({ id })
      },

      listTechnicalPeople: async (params?: { dealerId?: string; activeOnly?: boolean; monitoringCenterId?: string }) =>
        (await refApi.listTechnicalPeopleDetailed(params as any)) || [],
      createTechnicalPerson: async (request: Record<string, unknown>) =>
        await refApi.createTechnicalPerson({ createTechnicalPersonRequest: request as any }),
      updateTechnicalPerson: async (id: string, request: Record<string, unknown>) =>
        await refApi.updateTechnicalPerson({ id, updateTechnicalPersonRequest: request as any }),
      deleteTechnicalPerson: async (id: string) => {
        await refApi.deleteTechnicalPerson({ id })
      },

      // ── The nineteen web-owned catalogue tables (§18) ───────────────────────
      //
      // Each list returns `LookupItem` — id, name and the parent id — while the
      // create and update requests carry the rest of the columns. That asymmetry
      // is why every descriptor below sets `fetchDetailOnEdit`: the values the
      // form edits only exist on the detail endpoint.

      listBrands: async () => (await refApi.getBrands()) || [],
      getBrand: async (id: string) => await refApi.getBrandById({ id }),
      createBrand: async (request: Record<string, unknown>) =>
        await refApi.createBrand({ createBrandRequest: request as any }),
      updateBrand: async (id: string, request: Record<string, unknown>) =>
        await refApi.updateBrand({ id, updateBrandRequest: request as any }),
      deleteBrand: async (id: string) => {
        await refApi.deleteBrand({ id })
      },

      listModels: async (params?: { brandId?: string }) =>
        (await refApi.getModels({ brandId: params?.brandId })) || [],
      getModel: async (id: string) => await refApi.getModelById({ id }),
      createModel: async (request: Record<string, unknown>) =>
        await refApi.createModel({ createModelRequest: request as any }),
      updateModel: async (id: string, request: Record<string, unknown>) =>
        await refApi.updateModel({ id, updateModelRequest: request as any }),
      deleteModel: async (id: string) => {
        await refApi.deleteModel({ id })
      },

      // A model-protocol row is the pair itself, so there is nothing to update:
      // changing either side is a different pair. The API offers no PATCH.
      listModelProtocols: async (params?: { modelId?: string }) =>
        (await refApi.listModelProtocols({ modelId: params?.modelId })) || [],
      getModelProtocol: async (id: string) => await refApi.getModelProtocolById({ id }),
      createModelProtocol: async (request: Record<string, unknown>) =>
        await refApi.createModelProtocol({ createModelProtocolRequest: request as any }),
      deleteModelProtocol: async (id: string) => {
        await refApi.deleteModelProtocol({ id })
      },

      listProtocols: async (params?: { modelId?: string }) =>
        (await refApi.getProtocols({ modelId: params?.modelId })) || [],
      getProtocol: async (id: string) => await refApi.getProtocolById({ id }),
      createProtocol: async (request: Record<string, unknown>) =>
        await refApi.createProtocol({ createProtocolRequest: request as any }),
      updateProtocol: async (id: string, request: Record<string, unknown>) =>
        await refApi.updateProtocol({ id, updateProtocolRequest: request as any }),
      deleteProtocol: async (id: string) => {
        await refApi.deleteProtocol({ id })
      },

      listNoteTypes: async () => (await refApi.listNoteTypes()) || [],
      getNoteType: async (id: string) => await refApi.getNoteTypeById({ id }),
      createNoteType: async (request: Record<string, unknown>) =>
        await refApi.createNoteType({ createNoteTypeRequest: request as any }),
      updateNoteType: async (id: string, request: Record<string, unknown>) =>
        await refApi.updateNoteType({ id, updateNoteTypeRequest: request as any }),
      deleteNoteType: async (id: string) => {
        await refApi.deleteNoteType({ id })
      },

      listAlarmCategories: async () => (await refApi.getAlarmCategories()) || [],
      getAlarmCategory: async (id: string) => await refApi.getAlarmCategoryById({ id }),
      createAlarmCategory: async (request: Record<string, unknown>) =>
        await refApi.createAlarmCategory({ createAlarmCategoryRequest: request as any }),
      updateAlarmCategory: async (id: string, request: Record<string, unknown>) =>
        await refApi.updateAlarmCategory({ id, updateAlarmCategoryRequest: request as any }),
      deleteAlarmCategory: async (id: string) => {
        await refApi.deleteAlarmCategory({ id })
      },

      listActiveCategories: async () => (await refApi.getActiveCategories()) || [],
      getActiveCategory: async (id: string) => await refApi.getActiveCategoryById({ id }),
      createActiveCategory: async (request: Record<string, unknown>) =>
        await refApi.createActiveCategory({ createActiveCategoryRequest: request as any }),
      updateActiveCategory: async (id: string, request: Record<string, unknown>) =>
        await refApi.updateActiveCategory({ id, updateActiveCategoryRequest: request as any }),
      deleteActiveCategory: async (id: string) => {
        await refApi.deleteActiveCategory({ id })
      },

      listAccountTypes: async () => (await refApi.getAccountTypes()) || [],
      getAccountType: async (id: string) => await refApi.getAccountTypeById({ id }),
      createAccountType: async (request: Record<string, unknown>) =>
        await refApi.createAccountType({ createAccountTypeRequest: request as any }),
      updateAccountType: async (id: string, request: Record<string, unknown>) =>
        await refApi.updateAccountType({ id, updateAccountTypeRequest: request as any }),
      deleteAccountType: async (id: string) => {
        await refApi.deleteAccountType({ id })
      },

      listAccountItems: async () => (await refApi.getAccountItems()) || [],
      getAccountItem: async (id: string) => await refApi.getAccountItemById({ id }),
      createAccountItem: async (request: Record<string, unknown>) =>
        await refApi.createAccountItem({ createAccountItemRequest: request as any }),
      updateAccountItem: async (id: string, request: Record<string, unknown>) =>
        await refApi.updateAccountItem({ id, updateAccountItemRequest: request as any }),
      deleteAccountItem: async (id: string) => {
        await refApi.deleteAccountItem({ id })
      },

      listSideTypes: async () => (await refApi.getSideTypes()) || [],
      getSideType: async (id: string) => await refApi.getSideTypeById({ id }),
      createSideType: async (request: Record<string, unknown>) =>
        await refApi.createSideType({ createSideTypeRequest: request as any }),
      updateSideType: async (id: string, request: Record<string, unknown>) =>
        await refApi.updateSideType({ id, updateSideTypeRequest: request as any }),
      deleteSideType: async (id: string) => {
        await refApi.deleteSideType({ id })
      },

      listServiceTypes: async () => (await refApi.getServiceTypes()) || [],
      getServiceType: async (id: string) => await refApi.getServiceTypeById({ id }),
      createServiceType: async (request: Record<string, unknown>) =>
        await refApi.createServiceType({ createServiceTypeRequest: request as any }),
      updateServiceType: async (id: string, request: Record<string, unknown>) =>
        await refApi.updateServiceType({ id, updateServiceTypeRequest: request as any }),
      deleteServiceType: async (id: string) => {
        await refApi.deleteServiceType({ id })
      },

      listCountries: async () => (await refApi.getCountries()) || [],
      getCountry: async (id: string) => await refApi.getCountryById({ id }),
      createCountry: async (request: Record<string, unknown>) =>
        await refApi.createCountry({ createCountryRequest: request as any }),
      updateCountry: async (id: string, request: Record<string, unknown>) =>
        await refApi.updateCountry({ id, updateCountryRequest: request as any }),
      deleteCountry: async (id: string) => {
        await refApi.deleteCountry({ id })
      },

      listRegions: async () => (await refApi.getRegions()) || [],
      getRegion: async (id: string) => await refApi.getRegionById({ id }),
      createRegion: async (request: Record<string, unknown>) =>
        await refApi.createRegion({ createRegionRequest: request as any }),
      updateRegion: async (id: string, request: Record<string, unknown>) =>
        await refApi.updateRegion({ id, updateRegionRequest: request as any }),
      deleteRegion: async (id: string) => {
        await refApi.deleteRegion({ id })
      },

      listCities: async (params?: { countryId?: string }) =>
        (await refApi.getCities({ countryId: params?.countryId })) || [],
      getCity: async (id: string) => await refApi.getCityById({ id }),
      createCity: async (request: Record<string, unknown>) =>
        await refApi.createCity({ createCityRequest: request as any }),
      updateCity: async (id: string, request: Record<string, unknown>) =>
        await refApi.updateCity({ id, updateCityRequest: request as any }),
      deleteCity: async (id: string) => {
        await refApi.deleteCity({ id })
      },

      listCityEmergencyContacts: async (cityId: string) => {
        const resp = await client.http.fetch(`/v1/reference/cities/${cityId}/emergency-contacts`)
        return (await resp.json()) || []
      },
      createCityEmergencyContact: async (cityId: string, request: Record<string, unknown>) => {
        const resp = await client.http.fetch(`/v1/reference/cities/${cityId}/emergency-contacts`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(request)
        })
        return await resp.json()
      },
      updateCityEmergencyContact: async (cityId: string, id: string, request: Record<string, unknown>) => {
        const resp = await client.http.fetch(`/v1/reference/cities/${cityId}/emergency-contacts/${id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(request)
        })
        return await resp.json()
      },
      deleteCityEmergencyContact: async (cityId: string, id: string) => {
        const resp = await client.http.fetch(`/v1/reference/cities/${cityId}/emergency-contacts/${id}`, {
          method: 'DELETE',
          headers: {}
        })
      },

      listDistricts: async (params?: { cityId?: string }) =>
        (await refApi.getDistricts({ cityId: params?.cityId })) || [],
      getDistrict: async (id: string) => await refApi.getDistrictById({ id }),
      createDistrict: async (request: Record<string, unknown>) =>
        await refApi.createDistrict({ createDistrictRequest: request as any }),
      updateDistrict: async (id: string, request: Record<string, unknown>) =>
        await refApi.updateDistrict({ id, updateDistrictRequest: request as any }),
      deleteDistrict: async (id: string) => {
        await refApi.deleteDistrict({ id })
      },

      listHolidayTypes: async () => (await refApi.listHolidayTypes()) || [],
      getHolidayType: async (id: string) => await refApi.getHolidayTypeById({ id }),
      createHolidayType: async (request: Record<string, unknown>) =>
        await refApi.createHolidayType({ createHolidayTypeRequest: request as any }),
      updateHolidayType: async (id: string, request: Record<string, unknown>) =>
        await refApi.updateHolidayType({ id, updateHolidayTypeRequest: request as any }),
      deleteHolidayType: async (id: string) => {
        await refApi.deleteHolidayType({ id })
      },

      listHolidays: async (params?: { holidayTypeId?: string }) =>
        (await refApi.listHolidays({ holidayTypeId: params?.holidayTypeId })) || [],
      getHoliday: async (id: string) => await refApi.getHolidayById({ id }),
      createHoliday: async (request: Record<string, unknown>) =>
        await refApi.createHoliday({ createReferenceHolidayRequest: request as any }),
      updateHoliday: async (id: string, request: Record<string, unknown>) =>
        await refApi.updateHoliday({ id, updateReferenceHolidayRequest: request as any }),
      deleteHoliday: async (id: string) => {
        await refApi.deleteHoliday({ id })
      },

      listSignalExplanations: async () => (await refApi.listReferenceSignalExplanations()) || [],
      getSignalExplanation: async (id: string) => await refApi.getSignalExplanationById({ id }),
      createSignalExplanation: async (request: Record<string, unknown>) => {
        const created = await refApi.createSignalExplanation({ createSignalExplanationRequest: request as any })
        invalidateExplanations('signal')
        return created
      },
      updateSignalExplanation: async (id: string, request: Record<string, unknown>) => {
        const updated = await refApi.updateSignalExplanation({ id, updateSignalExplanationRequest: request as any })
        invalidateExplanations('signal')
        return updated
      },
      deleteSignalExplanation: async (id: string) => {
        await refApi.deleteSignalExplanation({ id })
        invalidateExplanations('signal')
      },
      reorderSignalExplanations: async (ids: string[]) => {
        const resp = await client.http.fetch(`/v1/reference/signal-explanations/order`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ ids })
        })
        invalidateExplanations('signal')
      },

      listNoteExplanations: async () => {
        const resp = await client.http.fetch(`/v1/reference/note-explanations`)
        return await resp.json()
      },
      getNoteExplanation: async (id: string) => {
        const resp = await client.http.fetch(`/v1/reference/note-explanations/${id}`)
        return await resp.json()
      },
      createNoteExplanation: async (request: Record<string, unknown>) => {
        const resp = await client.http.fetch(`/v1/reference/note-explanations`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(request)
        })
        invalidateExplanations('note')
        return await resp.json()
      },
      updateNoteExplanation: async (id: string, request: Record<string, unknown>) => {
        const resp = await client.http.fetch(`/v1/reference/note-explanations/${id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(request)
        })
        invalidateExplanations('note')
        return await resp.json()
      },
      deleteNoteExplanation: async (id: string) => {
        const resp = await client.http.fetch(`/v1/reference/note-explanations/${id}`, {
          method: 'DELETE',
          headers: {}
        })
        invalidateExplanations('note')
      },
      reorderNoteExplanations: async (ids: string[]) => {
        const resp = await client.http.fetch(`/v1/reference/note-explanations/order`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ ids })
        })
        invalidateExplanations('note')
      },

      listDealerAccountTypes: async (params?: { dealerId?: string }) =>
        (await refApi.listDealerAccountTypes({ dealerId: params?.dealerId })) || [],
      getDealerAccountType: async (id: string) => await refApi.getDealerAccountTypeById({ id }),
      createDealerAccountType: async (request: Record<string, unknown>) =>
        await refApi.createDealerAccountType({ createDealerAccountTypeRequest: request as any }),
      updateDealerAccountType: async (id: string, request: Record<string, unknown>) =>
        await refApi.updateDealerAccountType({ id, updateDealerAccountTypeRequest: request as any }),
      deleteDealerAccountType: async (id: string) => {
        await refApi.deleteDealerAccountType({ id })
      },

      listMonitoringCenterSideNoRanges: async () =>
        (await refApi.listMonitoringCenterSideNoRanges()) || []
    },
    adminConfig: {
      listMonitoringCenters: async () => (await administrationApi.listAdminMonitoringCenters()) || [],
      getMonitoringCenter: async (id: string) => await administrationApi.getAdminMonitoringCenter({ id }),
      createMonitoringCenter: async (request: Record<string, unknown>) =>
        await administrationApi.createMonitoringCenter({ createMonitoringCenterRequest: request as any }),
      updateMonitoringCenter: async (id: string, request: Record<string, unknown>) =>
        await administrationApi.updateMonitoringCenter({ id, updateMonitoringCenterRequest: request as any }),
      deleteMonitoringCenter: async (id: string) => {
        await administrationApi.deleteMonitoringCenter({ id })
      },
      uploadAlarmSound: async (id: string, file: File) => {
        // The generated SDK has no upload operation for alarm sound yet.
        // Same workaround as the dealer logo (G-72): build a FormData body
        // and send it via fetch. No Content-Type is set by hand — the
        // browser writes the multipart boundary.
        const form = new FormData()
        form.append('file', file)
        await client.http.fetch(`/v1/admin/monitoring-centers/${id}/alarm-sound`, {
          method: 'PUT',
          body: form
        })
      },
      deleteAlarmSound: async (id: string) => {
        await client.http.fetch(`/v1/admin/monitoring-centers/${id}/alarm-sound`, { method: 'DELETE' })
      },

      listReceivers: async () => (await administrationApi.listAdminReceivers()) || [],
      getReceiver: async (id: string) => await administrationApi.getAdminReceiver({ id }),
      createReceiver: async (request: Record<string, unknown>) =>
        await administrationApi.createReceiver({ createReceiverRequest: request as any }),
      updateReceiver: async (id: string, request: Record<string, unknown>) =>
        await administrationApi.updateReceiver({ id, updateReceiverRequest: request as any }),
      deleteReceiver: async (id: string) => {
        await administrationApi.deleteReceiver({ id })
      },

      listReceiverLines: async (receiverId: string) =>
        (await administrationApi.listReceiverLines({ receiverId })) || [],
      createReceiverLine: async (receiverId: string, request: Record<string, unknown>) =>
        await administrationApi.createReceiverLine({ receiverId, saveReceiverLineRequest: request as any }),
      updateReceiverLine: async (receiverId: string, id: string, request: Record<string, unknown>) =>
        await administrationApi.updateReceiverLine({ receiverId, id, saveReceiverLineRequest: request as any }),
      deleteReceiverLine: async (receiverId: string, id: string) => {
        await administrationApi.deleteReceiverLine({ receiverId, id })
      },

      listReceiverRules: async (receiverId: string) =>
        (await administrationApi.listReceiverRules({ receiverId })) || [],
      createReceiverRule: async (receiverId: string, request: Record<string, unknown>) =>
        await administrationApi.createReceiverRule({ receiverId, saveReceiverRuleRequest: request as any }),
      updateReceiverRule: async (receiverId: string, id: string, request: Record<string, unknown>) =>
        await administrationApi.updateReceiverRule({ receiverId, id, saveReceiverRuleRequest: request as any }),
      deleteReceiverRule: async (receiverId: string, id: string) => {
        await administrationApi.deleteReceiverRule({ receiverId, id })
      },

      listMessageTemplateDefinitions: async () =>
        ((await administrationApi.listMessageTemplateDefinitions()) || []) as any,
      listMessageTemplates: async () => ((await administrationApi.listMessageTemplates()) || []) as any,
      createMessageTemplate: async (request) =>
        await administrationApi.createMessageTemplate({ createMessageTemplateRequest: request as any }),
      updateMessageTemplate: async (id, request) =>
        await administrationApi.updateMessageTemplate({ id, updateMessageTemplateRequest: request as any }),
      deleteMessageTemplate: async (id: string) => {
        await administrationApi.deleteMessageTemplate({ id })
      },
      previewMessageTemplate: async (request) =>
        (await administrationApi.previewMessageTemplate({ previewMessageTemplateRequest: request as any })) as any,
      getEffectiveMessageTemplate: async (channel: string, kind: string) =>
        (await smsApi.getEffectiveMessageTemplate({ channel, kind })) as any,

      listMobileAgreements: async () => ((await administrationApi.listMobileAgreements()) || []) as any,
      createMobileAgreement: async (request) =>
        await administrationApi.createMobileAgreement({ createMobileAgreementRequest: request as any }),
      updateMobileAgreement: async (id, request) =>
        await administrationApi.updateMobileAgreement({ id, updateMobileAgreementRequest: request as any }),
      deleteMobileAgreement: async (id: string) => {
        await administrationApi.deleteMobileAgreement({ id })
      },
      listMobileAgreementConsents: async (id: string) =>
        ((await administrationApi.listMobileAgreementConsents({ id })) || []) as any,

      getReceiverMcFallback: async (receiverId: string) =>
        await administrationApi.getReceiverMcFallback({ receiverId }),
      saveReceiverMcFallback: async (
        receiverId: string,
        request: { crossMcSideLookup: boolean | null; monitoringCenterIds: string[] }
      ) =>
        await administrationApi.saveReceiverMcFallback({ receiverId, saveReceiverMcFallbackRequest: request }),

      listReceiverLineTypes: async (receiverId: string) =>
        (await administrationApi.listReceiverLineTypes({ receiverId })) || [],
      createReceiverLineType: async (receiverId: string, request: Record<string, unknown>) =>
        await administrationApi.createReceiverLineType({
          receiverId,
          saveReceiverLineTypeRequest: request as any
        }),
      updateReceiverLineType: async (receiverId: string, id: string, request: Record<string, unknown>) =>
        await administrationApi.updateReceiverLineType({
          receiverId,
          id,
          saveReceiverLineTypeRequest: request as any
        }),
      deleteReceiverLineType: async (receiverId: string, id: string) => {
        await administrationApi.deleteReceiverLineType({ receiverId, id })
      },

      listReceiverTypes: async () => (await administrationApi.listReceiverTypes()) || [],
      createReceiverType: async (request: Record<string, unknown>) =>
        await administrationApi.createReceiverType({ saveReceiverTypeRequest: request as any }),
      updateReceiverType: async (id: string, request: Record<string, unknown>) =>
        await administrationApi.updateReceiverType({ id, saveReceiverTypeRequest: request as any }),
      deleteReceiverType: async (id: string) => {
        await administrationApi.deleteReceiverType({ id })
      },

      listMailSettings: async () => (await administrationApi.listMailSettings()) || [],
      createMailSetting: async (request: Record<string, unknown>) =>
        await administrationApi.createMailSetting({ createMailSettingRequest: request as any }),
      updateMailSetting: async (id: string, request: Record<string, unknown>) =>
        await administrationApi.updateMailSetting({ id, updateMailSettingRequest: request as any }),
      deleteMailSetting: async (id: string) => {
        await administrationApi.deleteMailSetting({ id })
      },

      listSmsSettings: async () => (await administrationApi.listSmsSettings()) || [],
      createSmsSetting: async (request: Record<string, unknown>) =>
        await administrationApi.createSmsSetting({ createSmsSettingRequest: request as any }),
      updateSmsSetting: async (id: string, request: Record<string, unknown>) =>
        await administrationApi.updateSmsSetting({ id, updateSmsSettingRequest: request as any }),
      deleteSmsSetting: async (id: string) => {
        await administrationApi.deleteSmsSetting({ id })
      },

      listDeviceRegexes: async () => (await administrationApi.listDeviceRegexes()) || [],
      createDeviceRegex: async (request: Record<string, unknown>) =>
        await administrationApi.createDeviceRegex({ saveDeviceRegexRequest: request as any }),
      updateDeviceRegex: async (id: string, request: Record<string, unknown>) =>
        await administrationApi.updateDeviceRegex({ id, saveDeviceRegexRequest: request as any }),
      deleteDeviceRegex: async (id: string) => {
        await administrationApi.deleteDeviceRegex({ id })
      },

      listPrompts: async () => (await administrationApi.listPrompts()) || [],
      createPrompt: async (request: Record<string, unknown>) =>
        await administrationApi.createPrompt({ savePromptRequest: request as any }),
      updatePrompt: async (id: string, request: Record<string, unknown>) =>
        await administrationApi.updatePrompt({ id, savePromptRequest: request as any }),
      deletePrompt: async (id: string) => {
        await administrationApi.deletePrompt({ id })
      },

      listEmergencyPhones: async () => (await administrationApi.listEmergencyPhones()) || [],
      createEmergencyPhone: async (request: Record<string, unknown>) =>
        await administrationApi.createEmergencyPhone({ saveEmergencyPhoneRequest: request as any }),
      updateEmergencyPhone: async (id: string, request: Record<string, unknown>) =>
        await administrationApi.updateEmergencyPhone({ id, saveEmergencyPhoneRequest: request as any }),
      deleteEmergencyPhone: async (id: string) => {
        await administrationApi.deleteEmergencyPhone({ id })
      },

      listCityEmergencyContacts: async (cityId: string) => {
        const resp = await client.http.fetch(`/v1/reference/cities/${cityId}/emergency-contacts`)
        return (await resp.json()) || []
      },
      createCityEmergencyContact: async (cityId: string, request: Record<string, unknown>) => {
        const resp = await client.http.fetch(`/v1/reference/cities/${cityId}/emergency-contacts`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(request)
        })
        return await resp.json()
      },
      updateCityEmergencyContact: async (cityId: string, id: string, request: Record<string, unknown>) => {
        const resp = await client.http.fetch(`/v1/reference/cities/${cityId}/emergency-contacts/${id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(request)
        })
        return await resp.json()
      },
      deleteCityEmergencyContact: async (cityId: string, id: string) => {
        const resp = await client.http.fetch(`/v1/reference/cities/${cityId}/emergency-contacts/${id}`, {
          method: 'DELETE',
          headers: {}
        })
      },

      listPanelCommands: async (params?: { sideId?: string; pendingOnly?: boolean; limit?: number }) =>
        (await administrationApi.listPanelCommands((params || {}) as any)) || [],
      createPanelCommand: async (request: Record<string, unknown>) =>
        await administrationApi.createPanelCommand({ createProsecCommandRequest: request as any }),
      deletePanelCommand: async (id: string) => {
        await administrationApi.deletePanelCommand({ id })
      }
    },
    registers: {
      // Shape A throughout: items + totalCount. `hasMore` prefers the current field
      // over the deprecated `hasNextPage`.
      listSignalBlocks: async (params?: Record<string, unknown>) => {
        const resp = await signalBlocksApi.listSignalBlocks(params as any)
        return {
          items: resp.items || [],
          hasMore: resp.hasMore ?? resp.hasNextPage ?? false,
          totalCount: resp.totalCount,
          isCapped: false
        }
      },
      cancelSignalBlock: async (id: string) => await signalBlocksApi.cancelSignalBlock({ id }),
      listWaitingEvents: async (params?: Record<string, unknown>) => {
        const resp = await waitingEventsApi.listWaitingEvents(params as any)
        return {
          items: resp.items || [],
          hasMore: resp.hasMore ?? resp.hasNextPage ?? false,
          totalCount: resp.totalCount,
          isCapped: false
        }
      },
      // Release, not cancel: DELETE /v1/waiting-events/{id} drops the alarm for good,
      // which is not what "Şimdi Döndür" promises the operator.
      releaseWaitingEvent: async (id: string) => await waitingEventsApi.releaseWaitingEvent({ id }),
      releaseWaitingEventsBulk: async (ids: string[]) =>
        await waitingEventsApi.releaseWaitingEventsBulk({ bulkReleaseRequest: { ids } }),
      listPassiveSignals: async (params?: Record<string, unknown>) => {
        const resp = await passiveSignalsApi.listPassiveSignals(params as any)
        return {
          items: resp.items || [],
          hasMore: resp.hasMore ?? resp.hasNextPage ?? false,
          totalCount: resp.totalCount,
          isCapped: false
        }
      },
      listEventRaws: async (params?: Record<string, unknown>) => {
        const resp = await eventRawsApi.listEventRaws(params as any)
        return {
          items: resp.items || [],
          hasMore: resp.hasMore ?? resp.hasNextPage ?? false,
          totalCount: resp.totalCount,
          isCapped: false
        }
      },

      // S-903 · the SMS delivery log. The list row carries `isSent` and nothing
      // more about the outcome; the retry count, the next attempt and the last
      // error live on the detail, which is why the drawer is a second read.
      listSmsLog: async (params?: Record<string, unknown>) => {
        const resp = await smsLogApi.listSmsLog(params as any)
        return {
          items: resp.items || [],
          hasMore: resp.hasMore ?? resp.hasNextPage ?? false,
          totalCount: resp.totalCount,
          isCapped: false
        }
      },
      getSmsLogEntry: async (id: string) => await smsLogApi.getSmsLogEntry({ id }),

      // G-45: the server lists active delays only unless activeOnly=false.
      listClosingDelays: async (params?: Record<string, unknown>) => {
        const resp = await closingDelaysApi.listClosingDelays(params as any)
        return {
          items: resp.items || [],
          hasMore: resp.hasMore ?? resp.hasNextPage ?? false,
          totalCount: resp.totalCount,
          isCapped: false
        }
      },
      cancelClosingDelay: async (id: string) => await closingDelaysApi.cancelClosingDelay({ id })
    },
    workSchedules: {
      list: async () => (await workSchedulesApi.listWorkSchedules()) || [],
      get: async (id: string) => await workSchedulesApi.getWorkSchedule({ id }),
      create: async (request: WorkScheduleWrite) =>
        await workSchedulesApi.createWorkSchedule({
          createWorkScheduleRequest: {
            name: request.name,
            isActive: request.isActive ?? true,
            entries: request.entries
          }
        }),
      update: async (id: string, request: WorkScheduleWrite) =>
        await workSchedulesApi.updateWorkSchedule({
          id,
          updateWorkScheduleRequest: {
            name: request.name,
            isActive: request.isActive,
            entries: request.entries
          }
        }),
      remove: async (id: string) => await workSchedulesApi.deleteWorkSchedule({ id }),
      listEntries: async (id: string) => (await workSchedulesApi.listWorkScheduleEntries({ id })) || [],
      setEntries: async (id: string, entries: WorkScheduleEntryWrite[]) =>
        // Replaces the whole week, exactly like UpsertSideTimeTable: a caller that
        // sends one day silently drops the other six.
        await workSchedulesApi.setWorkScheduleEntries({ id, workScheduleEntryInput: entries })
    },
    closingDelays: {
      options: async (sideId: string) => await closingDelayApi.getClosingDelayOptions({ sideId }),
      set: async (sideId: string, request: ClosingDelayCommand) =>
        await closingDelayApi.setClosingDelay({
          sideId,
          closingDelayRequest: request as any
        } as any),
      list: async (params?: Record<string, unknown>) => {
        const resp = await closingDelaysApi.listClosingDelays(params as any)
        return {
          items: resp.items || [],
          hasMore: resp.hasNextPage ?? false,
          totalCount: resp.totalCount,
          isCapped: false
        }
      }
    },
    activity: {
      post: async (sessionId: string, events: ActivityEvent[]) => {
        await activityApi.postActivity({ postActivityRequest: { sessionId, events: events as any } })
      }
    },
    files: {
      blobFor: (op: BinaryOperation, id: string) => binaryContentFor(op, id),
      objectUrlFor: async (op: BinaryOperation, id: string) => {
        const { blob } = await binaryContentFor(op, id)
        return URL.createObjectURL(blob)
      },
      revokeObjectUrl: (url: string) => URL.revokeObjectURL(url),
      exportSignalEvents: async (options: SignalExportOptions, signal?: AbortSignal) => {
        const resp = await signalEventsApi.exportSignalEventsRaw(
          {
            signalExportRequest: {
              query: options.query,
              from: options.from,
              to: options.to,
              sort: options.sort,
              format: options.format,
              // The operator picks the zone; inferring it from the browser would
              // silently shift every row in the export (V6).
              timeZone: options.timeZone
            }
          },
          signal ? { signal } : undefined
        )
        return await toBinaryContent(resp.raw, 'signal-events')
      },
      exportSides: async (options: SideExportOptions, signal?: AbortSignal) => {
        const resp = await sidesApi.exportSidesRaw(
          {
            sideExportRequest: {
              // The list's advanced search (city, dealer, panel, dates…) goes first so the
              // file holds exactly the rows on screen (AR-24); the named fields win on overlap.
              ...(options.advanced as Record<string, unknown> | undefined),
              query: options.query,
              active: options.active,
              approved: options.approved,
              dealerId: options.dealerId,
              sort: options.sort,
              format: options.format,
              timeZone: options.timeZone
            }
          },
          signal ? { signal } : undefined
        )
        return await toBinaryContent(resp.raw, 'subscribers')
      },
      exportSideStatusHistory: async (options: SideStatusHistoryExportOptions, signal?: AbortSignal) => {
        const resp = await sidesApi.exportSideStatusHistoryRaw(
          {
            sideStatusReportRequest: {
              from: options.from,
              to: options.to,
              dealerId: options.dealerId,
              format: options.format,
              timeZone: options.timeZone
            }
          },
          signal ? { signal } : undefined
        )
        return await toBinaryContent(resp.raw, 'aktif-pasif')
      }
    },
    telephony: {
      listCalls: async (params?: Record<string, unknown>) => {
        const resp = await callHistoryApi.getCalls(params as any)
        return {
          items: resp.items || [],
          hasMore: resp.hasNextPage ?? false,
          totalCount: resp.totalCount,
          isCapped: false
        }
      },
      getCallById: async (id: string) => await callHistoryApi.getCallById({ id }),
      dial: async (request) => await telephonyApi.dial({ dialRequest: request })
    },
    messaging: {
      smsTemplate: async (signalEventId: string) =>
        await smsApi.getSignalEventSmsTemplate({ id: signalEventId }),
      sendSms: async (sideId: string, request) =>
        await smsApi.sendSideSms({
          sideId,
          // note and recall are write-only dead fields (finding F1) and are never sent.
          sendSmsRequest: {
            text: request.text,
            recipients: request.recipients,
            phones: request.phones,
            contactIds: request.contactIds
          }
        }),
      bulkSendSms: async (request: {
        text: string
        recipients: string
        sideIds?: string[]
        filter?: Record<string, unknown>
        alarms?: BulkSmsAlarmTargetOptions
        expectedCount?: number
      }) => {
        const resp = await (smsApi as any).request({
          path: '/v1/sides/batch-sms',
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: request
        })
        return await resp.json()
      },
      sendSidePush: async (sideId: string, request) =>
        await pushApi.sendSidePush({ sideId, sendPushRequest: request }),
      sendCustomerPush: async (customerId: string, request) =>
        await pushApi.sendCustomerPush({ customerId, sendPushRequest: request })
    },
    stream: {
      open: async ({ lastEventId, signal }) => {
        // getStream() discards the body; getStreamRaw() hands back the Response, which
        // is what an SSE reader needs. The SDK still owns the URL, the bearer header
        // and the middleware chain, so V1 holds.
        const resp = await streamingApi.getStreamRaw(
          lastEventId ? { lastEventID: lastEventId } : {},
          { signal }
        )
        const body = resp.raw.body
        if (!body) {
          throw new Error('STREAM.NO_BODY')
        }
        return body
      }
    },
    // Advisories. Through `client.http`, same reason as uiLayouts below: the endpoint post-dates
    // the pinned spec. Replace once the generated layer ships an advisories operation.
    //
    // A failure here returns [] rather than throwing. An advisory is an enhancement; an alarm
    // screen that will not open because the advice service is down is a far worse outcome than
    // one that opens without advice.
    advisories: {
      forSignalEvent: async (signalEventId: string) => {
        try {
          const json = await client.http.json<unknown>({
            method: 'GET',
            path: `/v1/signal-events/${encodeURIComponent(signalEventId)}/advisories`,
            operationId: 'GetSignalEventAdvisories'
          })
          return Array.isArray(json) ? json : []
        } catch {
          return []
        }
      }
    },

    // G-76 · UI layout persistence (shared pool). Through `client.http` until the generated
    // layer ships `UiLayoutsApi` / `UiLayoutTemplatesApi`. A 404 is "nothing stored yet".
    uiLayouts: {
      listTemplates: async (screen: string) => {
        const json = await notFoundAsNull<any>(
          client.http.json({ method: 'GET', path: `/v1/ui-layout-templates/${encodeURIComponent(screen)}`, operationId: 'ListUiLayoutTemplates' })
        )
        if (json === null) return []
        return Array.isArray(json) ? json : (json.items ?? [])
      },
      saveTemplate: async (screen: string, id: string, contentJson: string) => {
        await client.http.json({
          method: 'PUT',
          path: `/v1/ui-layout-templates/${encodeURIComponent(screen)}/${encodeURIComponent(id)}`,
          body: { contentJson },
          operationId: 'SaveUiLayoutTemplate'
        })
      },
      deleteTemplate: async (screen: string, id: string) => {
        await client.http.json({
          method: 'DELETE',
          path: `/v1/ui-layout-templates/${encodeURIComponent(screen)}/${encodeURIComponent(id)}`,
          operationId: 'DeleteUiLayoutTemplate'
        })
      },
      getActiveTemplateId: async (screen: string) => {
        const json = await notFoundAsNull<{ activeTemplateId?: string | null }>(
          client.http.json({ method: 'GET', path: `/v1/ui-layout-templates/${encodeURIComponent(screen)}/active`, operationId: 'GetActiveUiLayoutTemplate' })
        )
        return json?.activeTemplateId ?? null
      },
      setActiveTemplateId: async (screen: string, id: string) => {
        await client.http.json({
          method: 'PUT',
          path: `/v1/ui-layout-templates/${encodeURIComponent(screen)}/active`,
          body: { activeTemplateId: id },
          operationId: 'SetActiveUiLayoutTemplate'
        })
      },
      getUserLayout: async (screen: string) => {
        const json = await notFoundAsNull<{ contentJson?: unknown }>(
          client.http.json({ method: 'GET', path: `/v1/ui-layouts/${encodeURIComponent(screen)}`, operationId: 'GetUserUiLayout' })
        )
        return typeof json?.contentJson === 'string' ? json.contentJson : null
      },
      saveUserLayout: async (screen: string, contentJson: string) => {
        await client.http.json({
          method: 'PUT',
          path: `/v1/ui-layouts/${encodeURIComponent(screen)}`,
          body: { contentJson },
          operationId: 'SaveUserUiLayout'
        })
      },
      deleteUserLayout: async (screen: string) => {
        await notFoundAsNull(
          client.http.json({ method: 'DELETE', path: `/v1/ui-layouts/${encodeURIComponent(screen)}`, operationId: 'DeleteUserUiLayout' })
        )
      }
    }
  }
}
