import type { ChipItem } from './types/ui.js'
import type { FilterToken } from './types/ui.js'


/**
 * The subscriber advanced search, as data.
 *
 * S-200 grew the same filter grammar the signal explorer (S-111) already had —
 * include and exclude chips per dimension, contains / does-not-contain for the free
 * text — because an operator who has learned one panel should not have to learn a
 * second. Keeping the model out of the view is what lets the URL round-trip, the API
 * parameters, the summary tokens and the batch-update payload all be built from one
 * description instead of four hand-written copies that drift.
 */

/** One dimension the operator picks values for, with include/exclude per chip. */
export type SideChipKind =
  | 'dealer'
  | 'customer'
  | 'city'
  | 'district'
  | 'region'
  | 'brand'
  | 'model'
  | 'protocol'
  | 'accountType'
  | 'businessSector'
  | 'sideType'
  | 'center'
  | 'installer'

/** One free-text box, with its own contains / does-not-contain operator. */
export type SideTextKind = 'name' | 'address' | 'serialNumber' | 'comment' | 'phone'

/**
 * Free text takes an operator rather than the chips' `-` prefix: an address or a
 * comment can legitimately begin with a dash, so a prefix there would quietly mean two
 * different things.
 */
export type TextOp = 'has' | 'not'

/** Which date column the one date range applies to. */
export type SideDateField = 'installDate' | 'startDate' | 'endDate' | 'lastSignal'

/** Tri-state select: '' is "either", the other two are the two answers. */
export type TriState = '' | 'true' | 'false'

export interface SideTextFilter {
  value: string
  op: TextOp
}

export interface SideAdvancedFilters {
  chips: Record<SideChipKind, ChipItem[]>
  texts: Record<SideTextKind, SideTextFilter>
  sideNoFrom: string
  sideNoTo: string
  dateField: SideDateField
  /** `yyyy-mm-dd` as the date inputs give it, or '' for no bound. */
  dateFrom: string
  dateTo: string
  isOpen: TriState
  cloudAlarm: TriState
  neverSignalled: TriState
}

export const SIDE_CHIP_KINDS: SideChipKind[] = [
  'dealer',
  'customer',
  'city',
  'district',
  'region',
  'brand',
  'model',
  'protocol',
  'accountType',
  'businessSector',
  'sideType',
  'center',
  'installer'
]

export const SIDE_TEXT_KINDS: SideTextKind[] = ['name', 'address', 'serialNumber', 'comment', 'phone']

/**
 * D77: the `side` fields each filter reads. The API refuses (403 `AUTH.FIELD_HIDDEN`) a filter
 * on a field hidden from the caller, so the panel does not offer one. `phone` matches all four
 * phones and is refused when any of them is hidden.
 */
export const SIDE_CHIP_FIELD: Record<SideChipKind, string> = {
  dealer: 'dealerId',
  customer: 'customerId',
  city: 'cityId',
  district: 'districtId',
  region: 'regionId',
  brand: 'brandId',
  model: 'modelId',
  protocol: 'protocolId',
  accountType: 'accountTypeId',
  businessSector: 'businessSectorId',
  sideType: 'sideTypeId',
  center: 'monitoringCenterId',
  installer: 'installerId'
}

export const SIDE_TEXT_FIELDS: Record<SideTextKind, string[]> = {
  name: ['name'],
  address: ['address'],
  serialNumber: ['serialNumber'],
  comment: ['comment'],
  phone: ['phone1', 'phone2', 'sysPhone', 'mobilePhone']
}

export const SIDE_DATE_FIELD: Record<SideDateField, string> = {
  installDate: 'installDate',
  startDate: 'startDate',
  endDate: 'endDate',
  lastSignal: 'lastSignalDate'
}

/** URL query key per chip dimension — plural, because each carries a list. */
const CHIP_QUERY_KEY: Record<SideChipKind, string> = {
  dealer: 'dealers',
  customer: 'customers',
  city: 'cities',
  district: 'districts',
  region: 'regions',
  brand: 'brands',
  model: 'models',
  protocol: 'protocols',
  accountType: 'accountTypes',
  businessSector: 'businessSectors',
  sideType: 'sideTypes',
  center: 'centers',
  installer: 'installers'
}

/** API parameter per chip dimension; the exclusion is the same name plus `Not`. */
const CHIP_PARAM: Record<SideChipKind, string> = {
  // The list endpoint's long-standing single-valued `dealerId` stays what it is, so the
  // multi-valued form has a name of its own.
  dealer: 'dealerIds',
  customer: 'customerId',
  city: 'cityId',
  district: 'districtId',
  region: 'regionId',
  brand: 'brandId',
  model: 'modelId',
  protocol: 'protocolId',
  accountType: 'accountTypeId',
  businessSector: 'businessSectorId',
  sideType: 'sideTypeId',
  center: 'monitoringCenterId',
  installer: 'installerId'
}

const CHIP_EXCLUDE_PARAM: Record<SideChipKind, string> = {
  dealer: 'dealerIdNot',
  customer: 'customerIdNot',
  city: 'cityIdNot',
  district: 'districtIdNot',
  region: 'regionIdNot',
  brand: 'brandIdNot',
  model: 'modelIdNot',
  protocol: 'protocolIdNot',
  accountType: 'accountTypeIdNot',
  businessSector: 'businessSectorIdNot',
  sideType: 'sideTypeIdNot',
  center: 'monitoringCenterIdNot',
  installer: 'installerIdNot'
}

/** i18n key per dimension, used by both the panel labels and the summary tokens. */
export const CHIP_LABEL_KEY: Record<SideChipKind, string> = {
  dealer: 'UI.SUBSCRIBERS.ADV_DEALER',
  customer: 'UI.SUBSCRIBERS.ADV_CUSTOMER',
  city: 'UI.SUBSCRIBERS.ADV_CITY',
  district: 'UI.SUBSCRIBERS.ADV_DISTRICT',
  region: 'UI.SUBSCRIBERS.ADV_REGION',
  brand: 'UI.SUBSCRIBERS.ADV_BRAND',
  model: 'UI.SUBSCRIBERS.ADV_MODEL',
  protocol: 'UI.SUBSCRIBERS.ADV_PROTOCOL',
  accountType: 'UI.SUBSCRIBERS.ADV_ACCOUNT_TYPE',
  businessSector: 'UI.SUBSCRIBERS.ADV_BUSINESS_SECTOR',
  sideType: 'UI.SUBSCRIBERS.ADV_SIDE_TYPE',
  center: 'UI.SUBSCRIBERS.ADV_CENTER',
  installer: 'UI.SUBSCRIBERS.ADV_INSTALLER'
}

export const TEXT_LABEL_KEY: Record<SideTextKind, string> = {
  name: 'UI.SUBSCRIBERS.ADV_NAME',
  address: 'UI.SUBSCRIBERS.ADV_ADDRESS',
  serialNumber: 'UI.SUBSCRIBERS.ADV_SERIAL',
  comment: 'UI.SUBSCRIBERS.ADV_COMMENT',
  phone: 'UI.SUBSCRIBERS.ADV_PHONE'
}

export const DATE_FIELD_LABEL_KEY: Record<SideDateField, string> = {
  installDate: 'UI.SUBSCRIBERS.COL_INSTALL_DATE',
  startDate: 'UI.SUBSCRIBERS.COL_START_DATE',
  endDate: 'UI.SUBSCRIBERS.COL_END_DATE',
  lastSignal: 'UI.SUBSCRIBERS.COL_LAST_SIGNAL'
}

/** API parameter prefix per date column; the endpoint takes `<prefix>From`/`<prefix>To`. */
const DATE_PARAM_PREFIX: Record<SideDateField, string> = {
  installDate: 'installDate',
  startDate: 'startDate',
  endDate: 'endDate',
  lastSignal: 'lastSignal'
}

export function createEmptyAdvancedFilters(): SideAdvancedFilters {
  const chips = {} as Record<SideChipKind, ChipItem[]>
  for (const kind of SIDE_CHIP_KINDS) chips[kind] = []

  const texts = {} as Record<SideTextKind, SideTextFilter>
  for (const kind of SIDE_TEXT_KINDS) texts[kind] = { value: '', op: 'has' }

  return {
    chips,
    texts,
    sideNoFrom: '',
    sideNoTo: '',
    dateField: 'lastSignal',
    dateFrom: '',
    dateTo: '',
    isOpen: '',
    cloudAlarm: '',
    neverSignalled: ''
  }
}

export function hasActiveAdvancedFilters(f: SideAdvancedFilters): boolean {
  if (SIDE_CHIP_KINDS.some((kind) => f.chips[kind].length > 0)) return true
  if (SIDE_TEXT_KINDS.some((kind) => f.texts[kind].value.trim() !== '')) return true
  return !!(
    f.sideNoFrom ||
    f.sideNoTo ||
    f.dateFrom ||
    f.dateTo ||
    f.isOpen ||
    f.cloudAlarm ||
    f.neverSignalled
  )
}

function parseChips(raw: unknown): ChipItem[] {
  if (typeof raw !== 'string' || !raw) return []
  try {
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed)
      ? parsed.filter((c: any) => c && typeof c.id === 'string' && typeof c.label === 'string')
      : []
  } catch (err) {
    return []
  }
}

function parseTextOp(value: unknown): TextOp {
  return value === 'not' ? 'not' : 'has'
}

function parseTriState(value: unknown): TriState {
  return value === 'true' || value === 'false' ? value : ''
}

function parseDateField(value: unknown): SideDateField {
  return value === 'installDate' || value === 'startDate' || value === 'endDate'
    ? value
    : 'lastSignal'
}

/** Rebuilds the panel from a URL, so a link someone shared opens as the search they ran. */
export function advancedFromQuery(query: Record<string, any>): SideAdvancedFilters {
  const f = createEmptyAdvancedFilters()

  for (const kind of SIDE_CHIP_KINDS) {
    f.chips[kind] = parseChips(query[CHIP_QUERY_KEY[kind]])
  }

  for (const kind of SIDE_TEXT_KINDS) {
    const value = typeof query[kind] === 'string' ? (query[kind] as string) : ''
    f.texts[kind] = { value, op: parseTextOp(query[`${kind}Op`]) }
  }

  f.sideNoFrom = typeof query.sideNoFrom === 'string' ? query.sideNoFrom : ''
  f.sideNoTo = typeof query.sideNoTo === 'string' ? query.sideNoTo : ''
  f.dateField = parseDateField(query.dateField)
  f.dateFrom = typeof query.dateFrom === 'string' ? query.dateFrom : ''
  f.dateTo = typeof query.dateTo === 'string' ? query.dateTo : ''
  f.isOpen = parseTriState(query.isOpen)
  f.cloudAlarm = parseTriState(query.cloudAlarm)
  f.neverSignalled = parseTriState(query.neverSignalled)

  return f
}

/** Only what is set is written, so a plain search keeps producing the URL it always did. */
export function advancedToQuery(f: SideAdvancedFilters): Record<string, string> {
  const query: Record<string, string> = {}

  for (const kind of SIDE_CHIP_KINDS) {
    if (f.chips[kind].length) query[CHIP_QUERY_KEY[kind]] = JSON.stringify(f.chips[kind])
  }

  for (const kind of SIDE_TEXT_KINDS) {
    const text = f.texts[kind]
    if (!text.value.trim()) continue
    query[kind] = text.value
    if (text.op === 'not') query[`${kind}Op`] = 'not'
  }

  if (f.sideNoFrom) query.sideNoFrom = f.sideNoFrom
  if (f.sideNoTo) query.sideNoTo = f.sideNoTo
  if (f.dateFrom || f.dateTo) {
    query.dateField = f.dateField
    if (f.dateFrom) query.dateFrom = f.dateFrom
    if (f.dateTo) query.dateTo = f.dateTo
  }
  if (f.isOpen) query.isOpen = f.isOpen
  if (f.cloudAlarm) query.cloudAlarm = f.cloudAlarm
  if (f.neverSignalled) query.neverSignalled = f.neverSignalled

  return query
}

/**
 * Include and exclude travel in the same chip list, so each call splits them by
 * polarity: `brandId` takes the included ids, `brandIdNot` the excluded ones. The server
 * ANDs the two, which is what the panel's hint promises.
 */
function idCsv(chips: ChipItem[], exclude: boolean): string | undefined {
  const ids = chips.filter((c) => !!c.exclude === exclude).map((c) => c.id)
  return ids.length ? ids.join(',') : undefined
}

/**
 * The operator's date input is a calendar day in their own zone; the wire is UTC (V6).
 * `from` opens the day and `to` closes it, so "01.09 – 01.09" is that whole day rather
 * than its first instant.
 */
function dayStart(value: string): Date | undefined {
  if (!value) return undefined
  const d = new Date(`${value}T00:00:00`)
  return Number.isNaN(d.getTime()) ? undefined : d
}

function dayEnd(value: string): Date | undefined {
  if (!value) return undefined
  const d = new Date(`${value}T23:59:59.999`)
  return Number.isNaN(d.getTime()) ? undefined : d
}

function triStateParam(value: TriState): boolean | undefined {
  if (value === 'true') return true
  if (value === 'false') return false
  return undefined
}

function positiveInt(value: string): number | undefined {
  if (!value.trim()) return undefined
  const n = Number(value)
  return Number.isFinite(n) ? n : undefined
}

/**
 * The advanced criteria as the SDK takes them. Undefined values are dropped by the
 * caller, so a filter nobody touched contributes nothing to the query string.
 */
export function advancedToParams(f: SideAdvancedFilters): Record<string, unknown> {
  const params: Record<string, unknown> = {}

  for (const kind of SIDE_CHIP_KINDS) {
    params[CHIP_PARAM[kind]] = idCsv(f.chips[kind], false)
    params[CHIP_EXCLUDE_PARAM[kind]] = idCsv(f.chips[kind], true)
  }

  for (const kind of SIDE_TEXT_KINDS) {
    const { value, op } = f.texts[kind]
    const trimmed = value.trim()
    params[kind] = op === 'has' && trimmed ? trimmed : undefined
    params[`${kind}Not`] = op === 'not' && trimmed ? trimmed : undefined
  }

  params.sideNoFrom = positiveInt(f.sideNoFrom)
  params.sideNoTo = positiveInt(f.sideNoTo)

  const prefix = DATE_PARAM_PREFIX[f.dateField]
  params[`${prefix}From`] = dayStart(f.dateFrom)
  params[`${prefix}To`] = dayEnd(f.dateTo)

  params.isOpen = triStateParam(f.isOpen)
  params.cloudAlarm = triStateParam(f.cloudAlarm)
  params.neverSignalled = triStateParam(f.neverSignalled)

  for (const key of Object.keys(params)) {
    if (params[key] === undefined) delete params[key]
  }

  return params
}

/**
 * One token per active criterion, each one removable in a single click. The summary
 * above the grid is the other half of the exclusion feature: an include is visible in
 * the rows, an exclusion is only visible in the rows that are gone.
 */
export function buildSideFilterTokens(
  f: SideAdvancedFilters,
  t: (key: string, params?: Record<string, unknown>) => string
): FilterToken[] {
  const tokens: FilterToken[] = []

  for (const kind of SIDE_CHIP_KINDS) {
    const group = t(CHIP_LABEL_KEY[kind])
    for (const chip of f.chips[kind]) {
      tokens.push({
        id: `${kind}:${chip.id}`,
        kind,
        chipId: chip.id,
        group,
        value: chip.label,
        ...(chip.exclude ? { exclude: true } : {})
      })
    }
  }

  for (const kind of SIDE_TEXT_KINDS) {
    const text = f.texts[kind]
    if (!text.value.trim()) continue
    tokens.push({
      id: `text:${kind}`,
      kind: `text:${kind}`,
      group: t(TEXT_LABEL_KEY[kind]),
      value: text.value,
      ...(text.op === 'not' ? { exclude: true } : {})
    })
  }

  if (f.sideNoFrom || f.sideNoTo) {
    tokens.push({
      id: 'sideNoRange',
      kind: 'sideNoRange',
      group: t('UI.SUBSCRIBERS.FILTER_SIDE_NO'),
      value: `${f.sideNoFrom || '…'} – ${f.sideNoTo || '…'}`
    })
  }

  if (f.dateFrom || f.dateTo) {
    tokens.push({
      id: 'dateRange',
      kind: 'dateRange',
      group: t(DATE_FIELD_LABEL_KEY[f.dateField]),
      value: `${f.dateFrom || '…'} – ${f.dateTo || '…'}`
    })
  }

  if (f.isOpen) {
    tokens.push({
      id: 'isOpen',
      kind: 'isOpen',
      group: t('UI.SUBSCRIBERS.ADV_SYSTEM_STATE'),
      value: t(f.isOpen === 'true' ? 'UI.SUBSCRIBERS.SYSTEM_UNARMED' : 'UI.SUBSCRIBERS.SYSTEM_ARMED')
    })
  }

  if (f.neverSignalled) {
    tokens.push({
      id: 'neverSignalled',
      kind: 'neverSignalled',
      group: t('UI.SUBSCRIBERS.ADV_SIGNAL_STATE'),
      value: t(
        f.neverSignalled === 'true'
          ? 'UI.SUBSCRIBERS.ADV_NEVER_SIGNALLED'
          : 'UI.SUBSCRIBERS.ADV_HAS_SIGNALLED'
      )
    })
  }

  if (f.cloudAlarm) {
    tokens.push({
      id: 'cloudAlarm',
      kind: 'cloudAlarm',
      group: t('UI.SUBSCRIBERS.ADV_CLOUD'),
      value: t(
        f.cloudAlarm === 'true' ? 'UI.SUBSCRIBERS.ADV_CLOUD_ONLY' : 'UI.SUBSCRIBERS.ADV_CLOUD_EXCLUDE'
      )
    })
  }

  return tokens
}

/** Clearing a token clears exactly that one criterion and leaves the rest standing. */
export function removeSideFilterToken(
  f: SideAdvancedFilters,
  token: FilterToken
): SideAdvancedFilters {
  const next: SideAdvancedFilters = {
    ...f,
    chips: { ...f.chips },
    texts: { ...f.texts }
  }

  if (token.chipId && (SIDE_CHIP_KINDS as string[]).includes(token.kind)) {
    const kind = token.kind as SideChipKind
    next.chips[kind] = f.chips[kind].filter((c) => c.id !== token.chipId)
    return next
  }

  if (token.kind.startsWith('text:')) {
    const kind = token.kind.slice('text:'.length) as SideTextKind
    next.texts[kind] = { value: '', op: 'has' }
    return next
  }

  switch (token.kind) {
    case 'sideNoRange':
      next.sideNoFrom = ''
      next.sideNoTo = ''
      break
    case 'dateRange':
      next.dateFrom = ''
      next.dateTo = ''
      break
    case 'isOpen':
      next.isOpen = ''
      break
    case 'neverSignalled':
      next.neverSignalled = ''
      break
    case 'cloudAlarm':
      next.cloudAlarm = ''
      break
  }

  return next
}
