import type { SignalRuleCatalog, SignalRuleFactItem } from '../../generated/index.js'
import { dataTypeFor, operationsFor, type FactType, type RuleNode } from './ruleExpression.js'

/**
 * FilterBuilder field definitions built from the server's rule catalog, and the plain
 * reading of a stored condition shown under the editor.
 *
 * Fields are hierarchical (`side.brandId` sits under "Subscriber"), which is how the
 * FilterBuilder already reads a dotted `dataField`; the group nodes are given their
 * translated captions here instead of DevExtreme's captionised prefixes.
 */

export interface RuleLookupRow {
  id: string
  name: string
}

/** Translated labels for the facts the pipeline ships with. Anything else shows its path. */
export const FACT_LABEL_KEYS: Record<string, string> = {
  'signal.eventCode': 'UI.SIGNAL_RULES.FACT_SIGNAL_EVENT_CODE',
  'signal.typeCode': 'UI.SIGNAL_RULES.FACT_SIGNAL_TYPE_CODE',
  'signal.priority': 'UI.SIGNAL_RULES.FACT_SIGNAL_PRIORITY',
  'signal.alert': 'UI.SIGNAL_RULES.FACT_SIGNAL_ALERT',
  'signal.soundAlert': 'UI.SIGNAL_RULES.FACT_SIGNAL_SOUND_ALERT',
  'signal.isReal': 'UI.SIGNAL_RULES.FACT_SIGNAL_IS_REAL',
  'signal.zone': 'UI.SIGNAL_RULES.FACT_SIGNAL_ZONE',
  'signal.zoneUser': 'UI.SIGNAL_RULES.FACT_SIGNAL_ZONE_USER',
  'category.id': 'UI.SIGNAL_RULES.FACT_CATEGORY',
  'category.code': 'UI.SIGNAL_RULES.FACT_CATEGORY_CODE',
  'category.name': 'UI.SIGNAL_RULES.FACT_CATEGORY_NAME',
  'category.callType': 'UI.SIGNAL_RULES.FACT_CATEGORY_CALL_TYPE',
  'signalType.id': 'UI.SIGNAL_RULES.FACT_SIGNAL_TYPE',
  'signalType.code': 'UI.SIGNAL_RULES.FACT_SIGNAL_TYPE_CODE',
  'side.id': 'UI.SIGNAL_RULES.FACT_SIDE_ID',
  'side.no': 'UI.SIGNAL_RULES.FACT_SIDE_NO',
  'side.partNo': 'UI.SIGNAL_RULES.FACT_SIDE_PART_NO',
  'side.sideTypeId': 'UI.SIGNAL_RULES.FACT_SIDE_TYPE',
  'side.businessSectorId': 'UI.SIGNAL_RULES.FACT_SIDE_BUSINESS_SECTOR',
  'side.cityId': 'UI.SIGNAL_RULES.FACT_SIDE_CITY',
  'side.districtId': 'UI.SIGNAL_RULES.FACT_SIDE_DISTRICT',
  'side.regionId': 'UI.SIGNAL_RULES.FACT_SIDE_REGION',
  'side.brandId': 'UI.SIGNAL_RULES.FACT_SIDE_BRAND',
  'side.modelId': 'UI.SIGNAL_RULES.FACT_SIDE_MODEL',
  'side.isOpen': 'UI.SIGNAL_RULES.FACT_SIDE_IS_OPEN',
  'side.gprs': 'UI.SIGNAL_RULES.FACT_SIDE_GPRS',
  'side.cloudAlarm': 'UI.SIGNAL_RULES.FACT_SIDE_CLOUD_ALARM',
  'customer.id': 'UI.SIGNAL_RULES.FACT_CUSTOMER_ID',
  'dealer.id': 'UI.SIGNAL_RULES.FACT_DEALER_ID',
  'dealer.name': 'UI.SIGNAL_RULES.FACT_DEALER_NAME',
  'partnerDealer.id': 'UI.SIGNAL_RULES.FACT_PARTNER_DEALER_ID',
  'receiver.id': 'UI.SIGNAL_RULES.FACT_RECEIVER',
  'receiver.no': 'UI.SIGNAL_RULES.FACT_RECEIVER_NO',
  'receiver.lineNo': 'UI.SIGNAL_RULES.FACT_RECEIVER_LINE_NO',
  'mc.id': 'UI.SIGNAL_RULES.FACT_MC',
  'sideType.id': 'UI.SIGNAL_RULES.FACT_SIDE_TYPE',
  'time.localHour': 'UI.SIGNAL_RULES.FACT_TIME_HOUR',
  'time.localMinute': 'UI.SIGNAL_RULES.FACT_TIME_MINUTE',
  'time.minuteOfDay': 'UI.SIGNAL_RULES.FACT_TIME_MINUTE_OF_DAY',
  'time.weekday': 'UI.SIGNAL_RULES.FACT_TIME_WEEKDAY',
  'time.localDate': 'UI.SIGNAL_RULES.FACT_TIME_DATE'
}

/** Translated labels for the fact groups (the part of the path before the first dot). */
export const GROUP_LABEL_KEYS: Record<string, string> = {
  signal: 'UI.SIGNAL_RULES.GROUP_SIGNAL',
  category: 'UI.SIGNAL_RULES.GROUP_CATEGORY',
  signalType: 'UI.SIGNAL_RULES.GROUP_SIGNAL_TYPE',
  side: 'UI.SIGNAL_RULES.GROUP_SIDE',
  customer: 'UI.SIGNAL_RULES.GROUP_CUSTOMER',
  dealer: 'UI.SIGNAL_RULES.GROUP_DEALER',
  partnerDealer: 'UI.SIGNAL_RULES.GROUP_PARTNER_DEALER',
  receiver: 'UI.SIGNAL_RULES.GROUP_RECEIVER',
  mc: 'UI.SIGNAL_RULES.GROUP_MC',
  sideType: 'UI.SIGNAL_RULES.GROUP_SIDE_TYPE',
  time: 'UI.SIGNAL_RULES.GROUP_TIME'
}

type Translate = (key: string, params?: Record<string, unknown>) => string

/**
 * The rows a lookup offers for a rule in a given scope.
 *
 * IMPORTANT — monitoring-centre scoping. A rule written for centre A only ever sees centre A's
 * signals, so offering centre B's receivers (or any other centre-owned row) would let an
 * administrator write a condition that can never match, with nothing to say so. Rows that
 * carry a `monitoringCenterId` are therefore narrowed to the rule's centre; rows without one
 * are shared and always offered — the same rule `useMcFilteredLookup` applies elsewhere.
 *
 * `centreId` null is the global scope (a rule evaluated for every centre): nothing is
 * narrowed there, because every centre's rows are meaningful to a global rule.
 *
 * `monitoringCenters` itself is the one collection whose rows *are* centres: in a centre's
 * scope the only meaningful value for `mc.id` is that centre.
 */
export function scopeLookupRows(collection: string, list: unknown, centreId: string | null): RuleLookupRow[] {
  if (!Array.isArray(list)) return []
  const rows = (list as Array<Record<string, unknown>>).filter((row) => row && row.id)
  const scoped = !centreId
    ? rows
    : collection === 'monitoringCenters'
      ? rows.filter((row) => String(row.id) === centreId)
      : rows.filter((row) => !row.monitoringCenterId || String(row.monitoringCenterId) === centreId)
  return scoped.map((row) => ({ id: String(row.id), name: String(row.name ?? row.signalCode ?? row.id) }))
}

export function factLabel(fact: SignalRuleFactItem, t: Translate): string {
  const path = fact.path ?? ''
  if (fact.source === 'tags') return t('UI.SIGNAL_RULES.FACT_TAGS')
  if (fact.source === 'attribute') return fact.label || path.slice(path.lastIndexOf('.') + 1)
  const key = FACT_LABEL_KEYS[path]
  return key ? t(key) : path.slice(path.indexOf('.') + 1)
}

export function groupLabel(group: string, t: Translate): string {
  const key = GROUP_LABEL_KEYS[group]
  return key ? t(key) : group
}

/** One FilterBuilder field (the subset of DevExtreme's `Field` this editor sets). */
export interface BuilderField {
  dataField: string
  caption: string
  dataType: 'string' | 'number' | 'boolean' | 'object'
  filterOperations: string[]
  lookup?: { dataSource: unknown[]; valueExpr?: string; displayExpr?: string; allowClearing?: boolean }
}

/**
 * The FilterBuilder's fields for a catalog. `lookups` resolves a reference collection
 * (`brands`, `signalTypes`, …) to its rows; an id fact whose collection is empty still
 * gets a field, edited as text, rather than disappearing.
 */
export function buildFields(
  catalog: SignalRuleCatalog,
  lookups: (collection: string) => RuleLookupRow[],
  t: Translate
): BuilderField[] {
  const fields: BuilderField[] = []
  const parents: BuilderField[] = []

  const addParent = (dataField: string, caption: string) => {
    if (parents.some((p) => p.dataField === dataField)) return
    // DevExtreme makes the same node itself when it is missing; giving it here only
    // changes its caption.
    parents.push({ dataField, caption, dataType: 'object', filterOperations: ['isblank', 'isnotblank'] })
  }

  for (const fact of catalog.facts ?? []) {
    if (!fact.path) continue
    const type = fact.type as FactType
    const group = fact.group || fact.path.slice(0, fact.path.indexOf('.'))
    addParent(group, groupLabel(group, t))
    if (fact.source === 'attribute') addParent(`${group}.attr`, t('UI.SIGNAL_RULES.GROUP_ATTRIBUTES'))

    const rows = fact.lookup ? lookups(fact.lookup) : []
    const field: BuilderField = {
      dataField: fact.path,
      caption: factLabel(fact, t),
      dataType: dataTypeFor(type),
      filterOperations: operationsFor(type, rows.length > 0 || !!fact.values?.length, fact.path)
    }
    if (rows.length) {
      field.lookup = { dataSource: rows, valueExpr: 'id', displayExpr: 'name', allowClearing: true }
    } else if (fact.values?.length) {
      field.lookup = { dataSource: [...fact.values], allowClearing: true }
    }
    fields.push(field)
  }
  // Group nodes go last: a new condition starts on the first field in the list, and it
  // must be a fact, not a group heading.
  return [...fields, ...parents]
}

// ─────────────────────────────── plain reading ───────────────────────────────

const OPERATOR_KEYS: Record<string, string> = {
  eq: 'UI.SIGNAL_RULES.READ_EQ',
  neq: 'UI.SIGNAL_RULES.READ_NEQ',
  lt: 'UI.SIGNAL_RULES.READ_LT',
  lte: 'UI.SIGNAL_RULES.READ_LTE',
  gt: 'UI.SIGNAL_RULES.READ_GT',
  gte: 'UI.SIGNAL_RULES.READ_GTE',
  between: 'UI.SIGNAL_RULES.READ_BETWEEN',
  in: 'UI.SIGNAL_RULES.READ_IN',
  nin: 'UI.SIGNAL_RULES.READ_NIN',
  contains: 'UI.SIGNAL_RULES.READ_CONTAINS',
  containsAny: 'UI.SIGNAL_RULES.READ_CONTAINS_ANY',
  containsAll: 'UI.SIGNAL_RULES.READ_CONTAINS_ALL',
  startsWith: 'UI.SIGNAL_RULES.READ_STARTS_WITH'
}

/**
 * The condition as one line of text — what will actually be saved, independent of what
 * the FilterBuilder is showing (it leaves half-filled rows on screen but out of its value).
 */
export function describeCondition(
  node: RuleNode | null,
  labelOf: (path: string) => string,
  valueOf: (path: string, value: unknown) => string,
  t: Translate
): string {
  if (!node) return ''
  const join = (children: RuleNode[], word: string) =>
    children.map((c) => wrap(c, describeCondition(c, labelOf, valueOf, t))).join(` ${word} `)

  if (node.all) return join(node.all, t('UI.SIGNAL_RULES.READ_AND'))
  if (node.any) return join(node.any, t('UI.SIGNAL_RULES.READ_OR'))
  if (node.not) return `${t('UI.SIGNAL_RULES.READ_NOT')} (${describeCondition(node.not, labelOf, valueOf, t)})`

  const fact = node.fact ?? ''
  const label = labelOf(fact)
  if (node.op === 'exists') {
    return `${label} ${t(node.value === false ? 'UI.SIGNAL_RULES.READ_EMPTY' : 'UI.SIGNAL_RULES.READ_NOT_EMPTY')}`
  }
  const values = Array.isArray(node.value) ? node.value : [node.value]
  const text =
    node.op === 'between'
      ? values.map((v) => valueOf(fact, v)).join(' – ')
      : values.map((v) => valueOf(fact, v)).join(', ')
  const key = OPERATOR_KEYS[node.op ?? '']
  return `${label} ${key ? t(key) : node.op} ${text}`
}

function wrap(node: RuleNode, text: string): string {
  return node.all || node.any ? `(${text})` : text
}
