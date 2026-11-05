/**
 * The domain layer behind S-808 · Protocol Studio.
 *
 * `Sinyal Mimarisi.md` describes a packet crossing four layers before an operator
 * sees it — wire, dictionary, classification, runtime. The console's admin tables
 * expose those layers as four unrelated grids, which is why defining a protocol is
 * currently guesswork: nothing on the `Signal` row tells you that mapping it to
 * `BUR` will raise a siren, and nothing on the `SignalType` row tells you that no
 * restore relation exists, so the alarm it raises can never close by itself.
 *
 * This module resolves the chain in one place so the screen can render it, and
 * audits a whole protocol for the four ways the chain breaks.
 *
 * Pure functions only — no Vue, no client — so the rules are testable without
 * mounting the screen.
 */

/** `UpdateSignalRequest` cannot express "explicitly null" for a `Guid?`, so the
 * server reads the empty guid as "clear this foreign key". Sending `null` instead
 * would leave the old mapping in place — the failure mode this constant exists to
 * prevent. See `SignalAdminContracts.cs`. */
export const CLEAR_GUID = '00000000-0000-0000-0000-000000000000'

export interface SignalTypeRow {
  id: string
  name?: string | null
  signalCode?: string | null
  alert?: boolean
  soundAlert?: boolean
  priority?: number | null
  backColor?: string | null
  frontColor?: string | null
  signalCount?: number
}

export interface SignalRelationSideRef {
  id: string
  sideNo?: number | null
  name?: string | null
}

export interface SignalRelationRow {
  id: string
  name?: string | null
  /** The relation type. Absent means the rule predates types and behaves as REMOVE. */
  typeId?: string | null
  typeName?: string | null
  /** True: applies to every subscriber, and `sides` is ignored. */
  global?: boolean
  /** A JSON array of parameter objects, shaped by the type's `parameterSchema`. */
  parameters?: string | null
  /** Application order among the rules matching one signal, ascending. */
  priority?: number
  /**
   * An extra condition the rule requires, beyond its source types and its scope.
   * Empty means none. See `TRIGGER_CONDITIONS` in `./signalRelations`.
   */
  triggerCondition?: string | null
  /** The prompt an LLM rule runs. Meaningless for the other types. */
  promptId?: string | null
  /** Its name, so the list can show the rule without a fetch per row. */
  promptName?: string | null
  /** When set, the rule applies only from this UTC date onward. Null means no lower bound. */
  validFrom?: Date | string | null
  /** When set, the rule applies only until this UTC date. Null means no upper bound. */
  validTo?: Date | string | null
  sourceSignalTypes?: Array<{ id: string; name?: string | null }> | null
  targetSignalTypes?: Array<{ id: string; name?: string | null }> | null
  /** REMOVE and DELAY only: alarm categories that also trigger the rule, ORed with `sourceSignalTypes`. */
  sourceAlarmCategories?: Array<{ id: string; name?: string | null }> | null
  /** REMOVE and DELAY only: alarm categories whose open alarms are also acted on, ORed with `targetSignalTypes`. */
  targetAlarmCategories?: Array<{ id: string; name?: string | null }> | null
  sides?: SignalRelationSideRef[] | null
}

/** The behaviours the Engine dispatches on. Kept in sync with `SignalRelationType.SystemNames`. */
export const RELATION_TYPE_REMOVE = 'REMOVE'
export const RELATION_TYPE_DELAY = 'DELAY'
export const RELATION_TYPE_LLM = 'LLM'

/**
 * Whether a relation closes its targets' alarms.
 *
 * A relation with no type is one written before types existed; every one of those
 * meant REMOVE, and the Engine reads them that way until its seed adopts them. The
 * console has to agree, or a protocol audited here would report a restore path the
 * Engine does not have — or worse, the reverse.
 */
export function isClosingRelation(relation: SignalRelationRow): boolean {
  const type = relation.typeName?.toUpperCase()
  return !type || type === RELATION_TYPE_REMOVE
}

/** Whether a relation defers its targets' alarms instead of closing them. */
export function isDelayingRelation(relation: SignalRelationRow): boolean {
  return relation.typeName?.toUpperCase() === RELATION_TYPE_DELAY
}

/**
 * Whether a relation asks a model for advice instead of touching alarms at all.
 *
 * An LLM rule is the one type that does not act on its targets — it writes notes the console
 * shows the operator. That is why the chain and coverage views leave it out: counting it as a
 * restore path would report a way out of an alarm that does not exist.
 */
export function isAdvisoryRelation(relation: SignalRelationRow): boolean {
  return relation.typeName?.toUpperCase() === RELATION_TYPE_LLM
}

/** A resolved dictionary row. Since G-76 the list carries this shape directly;
 * `GetSignalById` is now only used to re-read a single row after a write. */
export interface SignalDetailRow {
  id: string
  eventCode?: string | null
  userCode?: string | null
  userNo?: string | null
  protocolId?: string | null
  protocolName?: string | null
  signalTypeId?: string | null
  signalTypeName?: string | null
  signalTypeCode?: string | null
  alarmCategoryId?: string | null
  alarmCategoryName?: string | null
}

export type RowState = 'pending' | 'ready' | 'failed'

/**
 * One line of the dictionary.
 *
 * `state` survives the removal of the old per-row hydration because a re-read
 * after a write can still fail; `detail` is then stale or absent and the row must
 * say so rather than render as "no signal type", which is a different fact.
 */
export interface DictionaryRow {
  id: string
  eventCode: string
  state: RowState
  detail: SignalDetailRow | null
}

// ── the resolution chain ─────────────────────────────────────────────────────

export interface RuntimeOutcome {
  /** `SignalType.Alert` — the flag that decides whether an `AlarmEvent` row is
   * created and the operator has to work it, or the signal only lands in history. */
  entersAlarmQueue: boolean
  soundsAlarm: boolean
  priority: number | null
  /** Relations that close an open alarm of this type when their source arrives. */
  closedBy: SignalRelationRow[]
  /**
   * Relations that only *defer* an open alarm of this type. A DELAY rule is not a
   * restore path — the alarm comes back — so it is counted separately from
   * `closedBy` and does not satisfy the "alert without restore" audit.
   */
  delayedBy: SignalRelationRow[]
  /** Relations where this type is the restore signal — arriving closes those. */
  closes: SignalRelationRow[]
}

export interface ResolvedChain {
  signal: SignalDetailRow
  signalType: SignalTypeRow | null
  runtime: RuntimeOutcome | null
}

/**
 * Walks one dictionary row through the layers, using the catalogues already in
 * memory. A signal with no `signalTypeId` resolves to a chain that stops after the
 * dictionary — which is exactly what the Engine does with it.
 */
export function resolveChain(
  signal: SignalDetailRow,
  signalTypes: Map<string, SignalTypeRow>,
  relations: SignalRelationRow[]
): ResolvedChain {
  const signalType = signal.signalTypeId ? signalTypes.get(signal.signalTypeId) ?? null : null
  if (!signalType) {
    return { signal, signalType: null, runtime: null }
  }

  return {
    signal,
    signalType,
    runtime: {
      entersAlarmQueue: signalType.alert === true,
      soundsAlarm: signalType.soundAlert === true,
      priority: signalType.priority ?? null,
      closedBy: relationsTargeting(signalType.id, relations).filter(isClosingRelation),
      delayedBy: relationsTargeting(signalType.id, relations).filter(isDelayingRelation),
      closes: relationsSourcedFrom(signalType.id, relations)
    }
  }
}

/** Relations whose **target** is this type: the open alarm these close. */
export function relationsTargeting(signalTypeId: string, relations: SignalRelationRow[]): SignalRelationRow[] {
  return relations.filter((r) => (r.targetSignalTypes || []).some((t) => t.id === signalTypeId))
}

/** Relations whose **source** is this type: arriving closes the target's alarms. */
export function relationsSourcedFrom(signalTypeId: string, relations: SignalRelationRow[]): SignalRelationRow[] {
  return relations.filter((r) => (r.sourceSignalTypes || []).some((s) => s.id === signalTypeId))
}

// ── the audit ────────────────────────────────────────────────────────────────

export type FindingCode =
  | 'no-signal-type'
  | 'duplicate-code'
  | 'no-alarm-category'
  | 'alert-without-restore'
  | 'silent-alert'

export type FindingSeverity = 'error' | 'warning' | 'info'

export interface CoverageFinding {
  code: FindingCode
  severity: FindingSeverity
  /** Signal ids the finding is about, so the panel can filter the grid to them. */
  signalIds: string[]
  /** Event codes, for the summary line. Kept verbatim — they are packet data. */
  eventCodes: string[]
}

export const FINDING_SEVERITY: Record<FindingCode, FindingSeverity> = {
  // The Engine has nothing to classify the packet with: no colour, no priority,
  // no alert decision. This is the one that makes a protocol non-functional.
  'no-signal-type': 'error',
  // Two rows with the same key in one protocol: which one wins is arbitrary.
  'duplicate-code': 'error',
  // The signal is classified but routes to no notification channel.
  'no-alarm-category': 'warning',
  // Raises an alarm that no restore signal can ever close — it sits in the queue
  // until an operator closes it by hand. §5.6 of the architecture note.
  'alert-without-restore': 'warning',
  // Raises an alarm with no audible cue. Legitimate for low-priority types, worth
  // seeing when it was not deliberate.
  'silent-alert': 'info'
}

export interface CoverageReport {
  total: number
  /** Rows the audit could actually read. An unreadable row is excluded rather
   * than counted as "well defined", so the percentages never overstate coverage. */
  analysed: number
  failed: number
  withSignalType: number
  withAlarmCategory: number
  findings: CoverageFinding[]
}

function dedupeKey(detail: SignalDetailRow): string {
  // The Engine's lookup key inside a protocol. `userCode` / `userNo` distinguish
  // rows that share an event code, so two rows only collide when all three match.
  // A separator that cannot occur in packet data, so "E13" + "0" never collides
  // with "E130" + "".
  return [detail.eventCode ?? '', detail.userCode ?? '', detail.userNo ?? ''].join('\u0000')
}

/**
 * Audits every readable row of one protocol.
 *
 * Rows the audit could not resolve are not judged: reporting "40 codes have no
 * signal type" when those 40 simply failed to load would be worse than no audit.
 */
export function auditDictionary(
  rows: DictionaryRow[],
  signalTypes: Map<string, SignalTypeRow>,
  relations: SignalRelationRow[]
): CoverageReport {
  const analysed = rows.filter((r) => r.state === 'ready' && r.detail)
  const details = analysed.map((r) => r.detail as SignalDetailRow)

  const noSignalType: SignalDetailRow[] = []
  const noAlarmCategory: SignalDetailRow[] = []
  const alertWithoutRestore: SignalDetailRow[] = []
  const silentAlert: SignalDetailRow[] = []

  const seen = new Map<string, SignalDetailRow[]>()

  for (const detail of details) {
    const key = dedupeKey(detail)
    const bucket = seen.get(key)
    if (bucket) bucket.push(detail)
    else seen.set(key, [detail])

    if (!detail.signalTypeId) {
      noSignalType.push(detail)
      continue
    }
    if (!detail.alarmCategoryId) noAlarmCategory.push(detail)

    const signalType = signalTypes.get(detail.signalTypeId)
    if (!signalType || signalType.alert !== true) continue

    // Only a closing relation counts. A DELAY rule postpones the alarm; the operator
    // still has to work it, which is exactly what this finding is about.
    if (relationsTargeting(signalType.id, relations).filter(isClosingRelation).length === 0)
      alertWithoutRestore.push(detail)
    if (signalType.soundAlert !== true) silentAlert.push(detail)
  }

  const duplicates = [...seen.values()].filter((bucket) => bucket.length > 1).flat()

  const findings: CoverageFinding[] = []
  const push = (code: FindingCode, subjects: SignalDetailRow[]) => {
    if (!subjects.length) return
    findings.push({
      code,
      severity: FINDING_SEVERITY[code],
      signalIds: subjects.map((s) => s.id),
      eventCodes: subjects.map((s) => s.eventCode ?? '')
    })
  }

  push('no-signal-type', noSignalType)
  push('duplicate-code', duplicates)
  push('no-alarm-category', noAlarmCategory)
  push('alert-without-restore', alertWithoutRestore)
  push('silent-alert', silentAlert)

  const severityOrder: Record<FindingSeverity, number> = { error: 0, warning: 1, info: 2 }
  findings.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity])

  return {
    total: rows.length,
    analysed: analysed.length,
    failed: rows.filter((r) => r.state === 'failed').length,
    withSignalType: details.filter((d) => !!d.signalTypeId).length,
    withAlarmCategory: details.filter((d) => !!d.alarmCategoryId).length,
    findings
  }
}

/**
 * The PATCH body for a mapping change.
 *
 * `undefined` omits the field, the empty guid clears it — the two cases a caller
 * gets wrong when it passes `null` and silently keeps the old mapping.
 */
export function mappingPatch(fields: {
  signalTypeId?: string | null
  alarmCategoryId?: string | null
}): Record<string, unknown> {
  const patch: Record<string, unknown> = {}
  if (fields.signalTypeId !== undefined) patch.signalTypeId = fields.signalTypeId || CLEAR_GUID
  if (fields.alarmCategoryId !== undefined) patch.alarmCategoryId = fields.alarmCategoryId || CLEAR_GUID
  return patch
}
