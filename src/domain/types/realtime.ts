export type RealtimeStatus = 'live' | 'polling' | 'offline' | 'too-many-connections'

/**
 * The connection's own state machine (§12 1.4), which is finer-grained than the
 * four-way status the operator sees. `forbidden` and `stopped` are terminal.
 */
export type StreamPhase =
  | 'idle'
  | 'connecting'
  | 'open'
  | 'reconnecting'
  | 'throttled'
  | 'forbidden'
  | 'stopped'

/** The ten event names the server sends (§12 1.1). */
export const REALTIME_EVENT_NAMES = [
  'alarm-list-updated',
  'signal-events',
  'pbx-ringing',
  'side-lock-changed',
  'side-status-changed',
  'side-approval-changed',
  'reference-bundle-changed',
  'localization-bundle-changed',
  'resync-required',
  'copilot-conversation'
] as const

export type RealtimeEventName = (typeof REALTIME_EVENT_NAMES)[number]

/**
 * `resync` is not a server event. The stream emits it whenever a consumer's working
 * set may have gaps — first connect, or a reconnect the server could not replay.
 * This is C-19, the single most important realtime rule in the bundle.
 */
export type RealtimeSignalName = RealtimeEventName | 'resync'

/**
 * Actual payload from the API's `PublishLockChanged` in `AlarmLockService.cs`:
 * `{ sideId, lockUser, lockUserName }`
 * A null `lockUser` means the lock was released.
 */
export interface SideLockChangedEvent {
  sideId: string
  lockUser?: string | null
  lockUserName?: string | null
}

/**
 * Actual payload from `SideStatusService.cs`:
 * `{ sideId, active, passiveDate }`
 */
export interface SideStatusChangedEvent {
  sideId: string
  active: boolean
  passiveDate?: string | null
}

/**
 * Actual payload from `SideApprovalService.cs`:
 * `{ sideId, approved }`
 */
export interface SideApprovalChangedEvent {
  sideId: string
  approved: boolean
}

/**
 * The live call transcript, relayed by CopilotX through the API (S-101 region 6).
 *
 * One frame carries a batch: the API groups a CopilotX flush per operator extension so a
 * busy call cannot overrun the connection's 64-event channel. The frames only ever reach
 * the extension that is on the call — the console does not have to filter, and cannot ask
 * for someone else's.
 */
export interface CopilotConversationFrame {
  events: CopilotConversationEvent[]
}

export type CopilotEventKind =
  | 'call-started'
  | 'call-status'
  | 'segment'
  | 'suggested-action'
  | 'summary'

export type CopilotSpeaker = 'operator' | 'customer'

export interface CopilotConversationEvent {
  kind: CopilotEventKind
  callId: string
  operatorExtension: string
  /** The signal event this call relates to, when initiated via click-to-dial from an alarm. */
  signalEventId?: string
  customerNumber?: string
  callerIsOperator?: boolean
  startedAt?: string
  endedAt?: string
  /** `active`, `degraded` (a channel dropped mid-call) or `completed`. */
  status?: string
  segment?: CopilotSegment
  action?: CopilotSuggestedAction
  summary?: CopilotSummary
}

export interface CopilotSegment {
  speaker: CopilotSpeaker
  text: string
  startOffsetMs: number
  endOffsetMs: number
  /** False while the recogniser is still revising this line. */
  isFinal: boolean
  /**
   * Stable per utterance. Every interim of one line shares it with the final that closes
   * the line, which is what lets the panel update a line in place instead of stuttering.
   */
  sequenceKey: number
}

/**
 * What the operator can do with a proposal. An unknown value renders as a text card —
 * that is what lets the producers add a kind without breaking a console that predates it.
 */
export type CopilotProposalKind = 'info' | 'prompt' | 'operation'

/** Raised while the call is up, or once it ended. */
export type CopilotProposalPhase = 'during-call' | 'after-call'

/**
 * Something for the operator to know, to write, or to do.
 *
 * A proposal is never a command. `operation` names a console dialog and pre-fills it; the
 * operator confirms, and the endpoint behind that dialog enforces its own scope. Nothing
 * the copilot sends executes on its own.
 */
export interface CopilotSuggestedAction {
  /** Stable across re-raises of the same finding; empty falls back to title matching. */
  id?: string
  kind?: CopilotProposalKind | string
  actionType: string
  title: string
  detail: string
  confidence: number
  /** `keyword` or `gemini`. */
  source: string
  phase?: CopilotProposalPhase | string
  operation?: CopilotProposedOperation
  createdAt?: string
}

export interface CopilotProposedOperation {
  /** `set-closing-delay`, `delay-signal`, `block-signal`, `send-sms`, `append-action`, … */
  name: string
  /** The scope the operation needs, when the producer knows it. */
  scope?: string
  /** Pre-fill values for the dialog. Always strings; the operator may change them. */
  parameters?: Record<string, string>
}

export interface CopilotSummary {
  overview: string
  highlights: string[]
  outcome: string
  createdAt?: string
}

export interface ResyncRequiredEvent {
  reason: string
  lastKnownId?: string
}

/** Why the stream asked consumers to re-read. Carried on the `resync` signal. */
export interface ResyncSignal {
  reason: 'first-connect' | 'buffer-expired' | 'replay-unavailable' | 'server-requested'
  lastKnownId?: string
}

export interface RealtimeState {
  status: RealtimeStatus
  lastEventAt: Date | null
  activeAlarmCount: number
  reconnectAttempts: number
  isPollingFallback: boolean
}

/** A payload the stream could not parse is delivered as-is, never dropped silently. */
export interface RealtimeEnvelope<T = unknown> {
  name: RealtimeSignalName
  /** Parsed JSON, or `undefined` when the payload was not JSON (C-18). */
  payload?: T
  /** The unparsed `data:` text. Always present, so nothing is lost. */
  raw: string
  /** The frame's `id:`, when the server sent one (D59). */
  id?: string
}

export type RealtimeHandler<T = unknown> = (envelope: RealtimeEnvelope<T>) => void
