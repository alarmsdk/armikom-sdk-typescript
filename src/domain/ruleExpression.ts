/**
 * Conversion between the signal rule condition tree the API stores and the filter
 * expression DevExtreme's FilterBuilder edits.
 *
 * The server's tree (`{"all":[…]}`, `{"fact":"side.brandId","op":"in","value":[…]}`) is the
 * only format that is ever saved. The FilterBuilder's array syntax
 * (`[["side.brandId","anyof",[…]],"and",[…]]`) lives in the editor and nowhere else, so the
 * rule engine never depends on a UI library and a rule written by the rule tool opens here
 * unchanged.
 *
 * Both directions are pure functions of the expression and the fact types: the same
 * DevExtreme operation means different rule operators on a scalar fact and on a set
 * (`anyof` is `in` on `side.brandId` but `containsAny` on `dealer.tags`).
 */

/** Value types the rule engine knows. Mirrors the catalog's `type`. */
export type FactType = 'String' | 'Number' | 'Bool' | 'StringSet'

/** One node of the stored condition tree (structurally the SDK's `SignalRuleCondition`). */
export interface RuleNode {
  all?: RuleNode[] | null
  any?: RuleNode[] | null
  not?: RuleNode | null
  fact?: string | null
  op?: string | null
  value?: unknown
}

/** DevExtreme filter expression: a condition, a group, or `["!", group]`. */
export type FilterExpression = unknown[]

/** A problem found while reading the editor's expression; `key` is an i18n key. */
export interface ConversionProblem {
  key: string
  params?: Record<string, unknown>
}

/** Custom FilterBuilder operations this editor adds next to DevExtreme's own. */
export const CUSTOM_OPERATIONS = {
  /** StringSet carries every listed value — `containsAll`. */
  allOf: 'allof',
  /** The fact has a value — `exists: true`. */
  exists: 'exists',
  /** The fact has no value — `exists: false`. */
  notExists: 'notexists'
} as const

const COMPARISONS: Record<string, string> = {
  '=': 'eq',
  '<>': 'neq',
  '<': 'lt',
  '<=': 'lte',
  '>': 'gt',
  '>=': 'gte'
}

const COMPARISONS_BACK: Record<string, string> = Object.fromEntries(
  Object.entries(COMPARISONS).map(([dx, rule]) => [rule, dx])
)

// ─────────────────────────────── editor → stored ───────────────────────────────

/**
 * Reads the FilterBuilder's value into a stored condition. `condition` is null when the
 * expression is empty or unusable; every problem found is listed, not just the first.
 */
export function toRuleCondition(
  expression: unknown,
  factTypes: ReadonlyMap<string, FactType>
): { condition: RuleNode | null; problems: ConversionProblem[] } {
  const problems: ConversionProblem[] = []
  const condition = readNode(expression, factTypes, problems)
  if (!condition && problems.length === 0) problems.push({ key: 'UI.SIGNAL_RULES.ERR_NO_CONDITION' })
  return { condition: problems.length ? null : condition, problems }
}

function readNode(
  expression: unknown,
  factTypes: ReadonlyMap<string, FactType>,
  problems: ConversionProblem[]
): RuleNode | null {
  if (!Array.isArray(expression) || expression.length === 0) return null

  if (expression[0] === '!') {
    const inner = readNode(expression[1], factTypes, problems)
    return inner ? { not: inner } : null
  }

  if (isCondition(expression)) return readCondition(expression, factTypes, problems)

  // A group: conditions or groups separated by "and" / "or". DevExtreme writes one
  // operator per group; adjacent items with nothing between them mean "and".
  const children: RuleNode[] = []
  const operators = new Set<string>()
  for (const item of expression) {
    if (typeof item === 'string') {
      operators.add(item.toLowerCase())
      continue
    }
    const child = readNode(item, factTypes, problems)
    if (child) children.push(child)
  }

  if (operators.size > 1) {
    problems.push({ key: 'UI.SIGNAL_RULES.ERR_MIXED_GROUP' })
    return null
  }
  if (children.length === 0) return null
  if (children.length === 1) return children[0] ?? null
  return operators.has('or') ? { any: children } : { all: children }
}

/** `["field", "op", value?]` — a condition rather than a group or a negation. */
function isCondition(expression: unknown[]): boolean {
  return typeof expression[0] === 'string' && expression[0] !== '!' && typeof expression[1] === 'string'
}

function readCondition(
  expression: unknown[],
  factTypes: ReadonlyMap<string, FactType>,
  problems: ConversionProblem[]
): RuleNode | null {
  const fact = expression[0] as string
  const operation = String(expression[1]).toLowerCase()
  const raw = expression[2]
  const type = factTypes.get(fact)

  if (!type) {
    problems.push({ key: 'UI.SIGNAL_RULES.ERR_UNKNOWN_FACT', params: { fact } })
    return null
  }

  const incomplete = () => {
    problems.push({ key: 'UI.SIGNAL_RULES.ERR_INCOMPLETE', params: { fact } })
    return null
  }

  if (operation in COMPARISONS) {
    if (isBlank(raw)) return incomplete()
    return { fact, op: COMPARISONS[operation], value: coerce(raw, type) }
  }

  switch (operation) {
    case 'between': {
      if (!Array.isArray(raw) || raw.length !== 2 || raw.some(isBlank)) return incomplete()
      return { fact, op: 'between', value: raw.map((v) => coerce(v, type)) }
    }
    case 'anyof':
    case 'noneof': {
      const values = asList(raw, type)
      if (!values) return incomplete()
      const leaf = { fact, op: type === 'StringSet' ? 'containsAny' : 'in', value: values }
      if (operation === 'anyof') return leaf
      // A set's "none of" has no operator of its own; a scalar's is `nin`.
      return type === 'StringSet' ? { not: leaf } : { fact, op: 'nin', value: values }
    }
    case CUSTOM_OPERATIONS.allOf: {
      const values = asList(raw, type)
      if (!values) return incomplete()
      return { fact, op: 'containsAll', value: values }
    }
    case 'contains':
    case 'notcontains': {
      if (isBlank(raw)) return incomplete()
      const leaf = { fact, op: 'contains', value: String(raw) }
      return operation === 'contains' ? leaf : { not: leaf }
    }
    case 'startswith':
      if (isBlank(raw)) return incomplete()
      return { fact, op: 'startsWith', value: String(raw) }
    case CUSTOM_OPERATIONS.exists:
    case 'isnotblank':
      return { fact, op: 'exists', value: true }
    case CUSTOM_OPERATIONS.notExists:
    case 'isblank':
      return { fact, op: 'exists', value: false }
    default:
      problems.push({ key: 'UI.SIGNAL_RULES.ERR_UNSUPPORTED_OPERATION', params: { fact, operation } })
      return null
  }
}

function isBlank(value: unknown): boolean {
  return value === null || value === undefined || (typeof value === 'string' && value.trim() === '')
}

function asList(raw: unknown, type: FactType): unknown[] | null {
  const list = (Array.isArray(raw) ? raw : isBlank(raw) ? [] : [raw]).filter((v) => !isBlank(v))
  return list.length ? list.map((v) => coerce(v, type)) : null
}

/** Numbers stay numbers (`side.no` is `90`, not `"90"`); a set's members are strings. */
function coerce(value: unknown, type: FactType): unknown {
  switch (type) {
    case 'Number': {
      const n = typeof value === 'number' ? value : Number(String(value).trim())
      return Number.isFinite(n) ? n : value
    }
    case 'Bool':
      return value === true || value === 'true'
    default:
      return typeof value === 'string' ? value.trim() : String(value)
  }
}

// ─────────────────────────────── stored → editor ───────────────────────────────

/**
 * Builds the FilterBuilder's value from a stored condition. Throws
 * {@link UnrepresentableConditionError} for a tree the visual editor cannot show — an
 * operator added to the engine after this build — so the caller can offer the JSON view
 * instead of silently dropping part of the rule.
 */
export function toFilterExpression(
  node: RuleNode | null | undefined,
  factTypes: ReadonlyMap<string, FactType>
): FilterExpression | null {
  if (!node) return null
  return writeNode(node, factTypes)
}

export class UnrepresentableConditionError extends Error {
  constructor(public readonly detail: string) {
    super(`Condition cannot be shown in the visual editor: ${detail}`)
  }
}

function writeNode(node: RuleNode, factTypes: ReadonlyMap<string, FactType>): FilterExpression {
  if (node.all) return writeGroup(node.all, 'and', factTypes)
  if (node.any) return writeGroup(node.any, 'or', factTypes)
  if (node.not) return writeNegation(node.not, factTypes)
  if (node.fact) return writeCondition(node, factTypes)
  throw new UnrepresentableConditionError('empty node')
}

function writeGroup(children: RuleNode[], operator: 'and' | 'or', factTypes: ReadonlyMap<string, FactType>) {
  const expression: unknown[] = []
  children.forEach((child, index) => {
    if (index > 0) expression.push(operator)
    expression.push(writeNode(child, factTypes))
  })
  return expression
}

function writeNegation(inner: RuleNode, factTypes: ReadonlyMap<string, FactType>): FilterExpression {
  // The negations DevExtreme has an operation for read better as that operation.
  if (inner.fact) {
    const type = factTypes.get(inner.fact)
    switch (inner.op) {
      case 'contains':
        return [inner.fact, 'notcontains', inner.value]
      case 'containsAny':
        return [inner.fact, 'noneof', inner.value]
      case 'in':
        return [inner.fact, 'noneof', inner.value]
      case 'exists':
        return [inner.fact, inner.value === false ? CUSTOM_OPERATIONS.exists : CUSTOM_OPERATIONS.notExists]
    }
    if (type) return ['!', [writeCondition(inner, factTypes)]]
  }
  return ['!', writeNode(inner, factTypes)]
}

function writeCondition(node: RuleNode, factTypes: ReadonlyMap<string, FactType>): FilterExpression {
  const fact = node.fact as string
  const op = node.op ?? ''
  const type = factTypes.get(fact)
  if (!type) throw new UnrepresentableConditionError(`unknown fact '${fact}'`)

  if (op in COMPARISONS_BACK) return [fact, COMPARISONS_BACK[op], node.value]

  switch (op) {
    case 'between':
      return [fact, 'between', node.value]
    case 'in':
    case 'containsAny':
      return [fact, 'anyof', node.value]
    case 'nin':
      return [fact, 'noneof', node.value]
    case 'containsAll':
      return [fact, CUSTOM_OPERATIONS.allOf, node.value]
    case 'contains':
      return [fact, 'contains', node.value]
    case 'startsWith':
      return [fact, 'startswith', node.value]
    case 'exists':
      return [fact, node.value === false ? CUSTOM_OPERATIONS.notExists : CUSTOM_OPERATIONS.exists]
    default:
      throw new UnrepresentableConditionError(`operator '${op}' on '${fact}'`)
  }
}

// ─────────────────────────────── fields ───────────────────────────────

/** FilterBuilder operations offered for a fact, by its type and whether it has a fixed value list. */
export function operationsFor(type: FactType, hasValueList: boolean, path: string): string[] {
  const presence = [CUSTOM_OPERATIONS.exists, CUSTOM_OPERATIONS.notExists]
  switch (type) {
    case 'Number':
      return ['=', '<>', '<', '<=', '>', '>=', 'between', 'anyof', 'noneof', ...presence]
    case 'Bool':
      return ['=', '<>', ...presence]
    case 'StringSet':
      return ['contains', 'notcontains', 'anyof', 'noneof', CUSTOM_OPERATIONS.allOf, ...presence]
    default:
      if (hasValueList) return ['=', '<>', 'anyof', 'noneof', ...presence]
      // Ordering on strings is ordinal: right for ISO dates, meaningless for names.
      if (/date$/i.test(path)) return ['=', '<>', '<', '<=', '>', '>=', 'between', ...presence]
      return ['=', '<>', 'anyof', 'noneof', 'contains', 'notcontains', 'startswith', ...presence]
  }
}

/** FilterBuilder `dataType` for a fact type. A set is edited as strings. */
export function dataTypeFor(type: FactType): 'string' | 'number' | 'boolean' {
  return type === 'Number' ? 'number' : type === 'Bool' ? 'boolean' : 'string'
}
