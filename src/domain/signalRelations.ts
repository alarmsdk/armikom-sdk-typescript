/**
 * The domain layer behind the Protocol Studio's relation tabs.
 *
 * A relation says: when a signal of any *source* type arrives, do what its **type**
 * says to the open alarms of every *target* type. Two types ship with the platform —
 * `REMOVE` closes those alarms, `DELAY` moves them to the waiting list for a while —
 * and the set is open: the Engine dispatches on the type's name, and each type
 * carries a JSON Schema describing its parameters.
 *
 * That schema is why this module exists. The console cannot hard-code a form per
 * relation type without a release for every new one, so it renders the form from the
 * schema instead. `schemaFields` is that translation, and `validateParameters`
 * mirrors the server's own check so an operator sees the problem before the round
 * trip rather than as a 422.
 *
 * Pure functions only — no Vue, no client.
 */

import type { SignalRelationRow } from './protocolStudio.js'

export {
  RELATION_TYPE_REMOVE,
  RELATION_TYPE_DELAY,
  RELATION_TYPE_LLM,
  isClosingRelation,
  isDelayingRelation,
  isAdvisoryRelation
} from './protocolStudio.js'
import { RELATION_TYPE_DELAY, RELATION_TYPE_LLM, RELATION_TYPE_REMOVE } from './protocolStudio.js'
import { HOOKS } from './advisory.js'


export interface SignalRelationTypeRow {
  id: string
  name?: string | null
  /** JSON Schema of ONE parameter object; `parameters` is an array of them. */
  parameterSchema?: string | null
  /** True for REMOVE and DELAY: the console locks these against rename and delete. */
  isSystem?: boolean
  relationCount?: number
}

// ── the parameter schema ─────────────────────────────────────────────────────

export type SchemaFieldKind = 'string' | 'integer' | 'number' | 'boolean' | 'enum'

/** One input the console renders for a parameter object. */
export interface SchemaField {
  name: string
  kind: SchemaFieldKind
  /** The schema's `title`, when it has one. Server-authored, so shown verbatim. */
  title?: string
  description?: string
  required: boolean
  minimum?: number
  maximum?: number
  options?: string[]
  default?: unknown
}

/**
 * Reads a relation type's `parameterSchema` into the fields a form can render.
 *
 * Deliberately a subset of JSON Schema — `type`, `properties`, `required`,
 * `minimum`/`maximum`, `enum`, `title`, `description`, `default` — matching the
 * server's validator. An unreadable schema yields no fields rather than throwing:
 * the editor then falls back to raw JSON, which still lets an operator fix a type
 * whose schema is the thing that is broken.
 */
export function schemaFields(parameterSchema?: string | null): SchemaField[] {
  if (!parameterSchema || !parameterSchema.trim()) return []

  let schema: any
  try {
    schema = JSON.parse(parameterSchema)
  } catch (err) {
    return []
  }

  if (!schema || typeof schema !== 'object' || typeof schema.properties !== 'object') return []

  const required: string[] = Array.isArray(schema.required) ? schema.required : []

  return Object.entries(schema.properties as Record<string, any>).map(([name, raw]) => {
    const spec = (raw ?? {}) as Record<string, any>
    const options = Array.isArray(spec.enum) ? spec.enum.map((v: unknown) => String(v)) : undefined

    return {
      name,
      kind: options ? 'enum' : normaliseKind(spec.type),
      title: typeof spec.title === 'string' ? spec.title : undefined,
      description: typeof spec.description === 'string' ? spec.description : undefined,
      required: required.includes(name),
      minimum: typeof spec.minimum === 'number' ? spec.minimum : undefined,
      maximum: typeof spec.maximum === 'number' ? spec.maximum : undefined,
      options,
      default: spec.default
    }
  })
}

function normaliseKind(type: unknown): SchemaFieldKind {
  switch (type) {
    case 'integer':
      return 'integer'
    case 'number':
      return 'number'
    case 'boolean':
      return 'boolean'
    default:
      // Anything the subset does not name renders as free text, which is the one
      // control that can express every value the server might accept.
      return 'string'
  }
}

/** An empty parameter object for a schema, honouring any `default`s it declares. */
export function emptyParameters(fields: SchemaField[]): Record<string, unknown> {
  const row: Record<string, unknown> = {}
  for (const field of fields) {
    if (field.default !== undefined) row[field.name] = field.default
    else if (field.kind === 'boolean') row[field.name] = false
    else row[field.name] = ''
  }
  return row
}

/**
 * Parses a relation's stored `parameters` into editable rows.
 *
 * The stored shape is an array of objects. A bare object is read as a one-element
 * array — the Engine tolerates the same thing, and an existing row written by hand
 * should open in the editor rather than be silently discarded.
 */
export function parseParameters(parameters?: string | null): Record<string, unknown>[] {
  if (!parameters || !parameters.trim()) return []

  let parsed: unknown
  try {
    parsed = JSON.parse(parameters)
  } catch (err) {
    return []
  }

  if (Array.isArray(parsed)) {
    return parsed.filter((row): row is Record<string, unknown> => isPlainObject(row))
  }
  return isPlainObject(parsed) ? [parsed] : []
}

/** True when `parameters` is present but unreadable as an array of objects. */
export function parametersAreUnreadable(parameters?: string | null): boolean {
  if (!parameters || !parameters.trim()) return false
  try {
    const parsed = JSON.parse(parameters)
    if (Array.isArray(parsed)) return !parsed.every(isPlainObject)
    return !isPlainObject(parsed)
  } catch (err) {
    return true
  }
}

/**
 * Serialises editor rows back to the stored shape, dropping blanks.
 *
 * Numbers are written as numbers rather than as the strings the inputs produce.
 * The server and the Engine both accept `"300"`, but a stored `300` is what the
 * schema describes, and the round trip should not degrade the value.
 */
export function serialiseParameters(
  rows: Record<string, unknown>[],
  fields: SchemaField[]
): string | null {
  const kinds = new Map(fields.map((f) => [f.name, f.kind]))

  const cleaned = rows
    .map((row) => {
      const out: Record<string, unknown> = {}
      for (const [key, value] of Object.entries(row)) {
        if (value === '' || value === null || value === undefined) continue

        const kind = kinds.get(key)
        if ((kind === 'integer' || kind === 'number') && typeof value === 'string') {
          const parsed = Number(value)
          out[key] = Number.isFinite(parsed) ? parsed : value
        } else {
          out[key] = value
        }
      }
      return out
    })
    .filter((row) => Object.keys(row).length > 0)

  return cleaned.length ? JSON.stringify(cleaned) : null
}

export interface ParameterError {
  /** Index into the rows array. */
  row: number
  field: string
  /** A translation key under `ERROR.RELATIONS.*`, with `params` for interpolation. */
  key: string
  params?: Record<string, unknown>
}

/**
 * Mirrors the server's parameter validation so the operator sees the problem in the
 * form rather than as a 422 after saving.
 *
 * The server remains the authority — this is an earlier, friendlier copy of the same
 * rules, not a replacement for them.
 */
export function validateParameters(
  rows: Record<string, unknown>[],
  fields: SchemaField[]
): ParameterError[] {
  const errors: ParameterError[] = []

  rows.forEach((row, index) => {
    for (const field of fields) {
      const value = row[field.name]
      const blank = value === '' || value === null || value === undefined

      if (field.required && blank) {
        errors.push({ row: index, field: field.name, key: 'ERROR.RELATIONS.PARAM_REQUIRED' })
        continue
      }
      if (blank) continue

      if (field.kind === 'integer' || field.kind === 'number') {
        const numeric = typeof value === 'number' ? value : Number(String(value))
        if (!Number.isFinite(numeric)) {
          errors.push({ row: index, field: field.name, key: 'ERROR.RELATIONS.PARAM_NOT_NUMBER' })
          continue
        }
        if (field.kind === 'integer' && !Number.isInteger(numeric)) {
          errors.push({ row: index, field: field.name, key: 'ERROR.RELATIONS.PARAM_NOT_INTEGER' })
          continue
        }
        if (field.minimum !== undefined && numeric < field.minimum) {
          errors.push({
            row: index,
            field: field.name,
            key: 'ERROR.RELATIONS.PARAM_MIN',
            params: { min: field.minimum }
          })
          continue
        }
        if (field.maximum !== undefined && numeric > field.maximum) {
          errors.push({
            row: index,
            field: field.name,
            key: 'ERROR.RELATIONS.PARAM_MAX',
            params: { max: field.maximum }
          })
        }
        continue
      }

      if (field.kind === 'enum' && field.options && !field.options.includes(String(value))) {
        errors.push({
          row: index,
          field: field.name,
          key: 'ERROR.RELATIONS.PARAM_ENUM',
          params: { options: field.options.join(', ') }
        })
      }
    }
  })

  return errors
}

// ── when a rule fires, and what an LLM rule asks ─────────────────────────────

/**
 * The extra condition a rule can require beyond its source types and its scope.
 *
 * Stored on the relation rather than in its parameters because it is independent of what the
 * rule *does*: "only when an operator will see this" is as sensible for a DELAY rule as for
 * an LLM one, and the Engine reads it before it knows the type.
 *
 * Kept in sync with `SignalRelationTriggerConditions` in Armikom.SignalPipeline. **A condition
 * this build does not know stops the rule there** rather than defaulting to "always", so a
 * console that offers a condition the Engine has never heard of would be offering a way to
 * switch a rule off. That is what `isKnownTriggerCondition` is for.
 */
export const TRIGGER_ALWAYS = ''
export const TRIGGER_ALARM = 'ALARM'
export const TRIGGER_NOALARM = 'NOALARM'

/** Every condition this build can offer, in the order the editor lists them. */
export const TRIGGER_CONDITIONS = [TRIGGER_ALWAYS, TRIGGER_ALARM, TRIGGER_NOALARM] as const

export type TriggerCondition = (typeof TRIGGER_CONDITIONS)[number] | (string & {})

/** Trims and upper-cases a stored condition into the form the constants use. */
export function normaliseTriggerCondition(condition?: string | null): string {
  return (condition ?? '').trim().toUpperCase()
}

/** True when the Engine knows how to evaluate this condition — empty counts. */
export function isKnownTriggerCondition(condition?: string | null): boolean {
  const value = normaliseTriggerCondition(condition)
  return value === TRIGGER_ALWAYS || value === TRIGGER_ALARM || value === TRIGGER_NOALARM
}

/**
 * The operator actions an LLM rule may attach advice to.
 *
 * Imported from the alarm console's own list rather than restated, because the two must agree:
 * a rule naming a hook the console never calls produces notes no operator ever sees, and the
 * whole point of picking them here is that an administrator cannot invent one.
 *
 * The set is open on the server — the Engine passes unknown names through to the model's
 * schema — so this is the console's menu, not a validator.
 */
export const ADVISORY_HOOKS: readonly string[] = Object.values(HOOKS)

/** Parameter key holding the hook list of an LLM rule, as the Engine reads it. */
export const HOOKS_PARAMETER = 'hooks'

/**
 * Reads the stored hook CSV.
 *
 * Empty means *every* hook, which is the Engine's own reading — so an empty list here is not
 * "no hooks" and the editor must say so rather than showing an unticked set of boxes.
 */
export function parseHooks(value: unknown): string[] {
  if (typeof value !== 'string') return []
  return value
    .split(',')
    .map((hook) => hook.trim())
    .filter((hook) => hook.length > 0)
}

/** Writes the hook list back in the comma-separated form the Engine parses. */
export function serialiseHooks(hooks: string[]): string {
  return hooks.map((hook) => hook.trim()).filter(Boolean).join(',')
}

// ── the rules, as the list shows them ────────────────────────────────────────

export type RelationFindingCode =
  | 'no-source'
  | 'no-target'
  | 'scoped-to-nobody'
  | 'delay-without-parameters'
  | 'llm-without-prompt'
  | 'unknown-trigger-condition'
  | 'not-yet-valid'
  | 'expired'

/**
 * Ways a rule is configured such that the Engine will never apply it.
 *
 * Each of these is silent at runtime: the rule sits in the table looking configured
 * while the Engine skips it. The list shows them so "why did this not fire?" is
 * answered where the rule is edited.
 */
export function relationFindings(
  relation: SignalRelationRow,
  types: Map<string, SignalRelationTypeRow>
): RelationFindingCode[] {
  const findings: RelationFindingCode[] = []
  const typeName = relation.typeName?.toUpperCase()
  const isAdvisory = typeName === RELATION_TYPE_LLM

  // Validity window: warn when the rule is outside its configured dates.
  const now = new Date()
  if (relation.validFrom) {
    const from = relation.validFrom instanceof Date ? relation.validFrom : new Date(relation.validFrom)
    if (!isNaN(from.getTime()) && from > now) findings.push('not-yet-valid')
  }
  if (relation.validTo) {
    const to = relation.validTo instanceof Date ? relation.validTo : new Date(relation.validTo)
    if (!isNaN(to.getTime()) && to < now) findings.push('expired')
  }

  // REMOVE and DELAY rules may name alarm categories as well as types; the two are ORed, so
  // either one is enough. LLM does not read categories.
  const takesCategories = !typeName || typeName === RELATION_TYPE_REMOVE || typeName === RELATION_TYPE_DELAY
  const sourceCategories = takesCategories ? (relation.sourceAlarmCategories || []).length : 0
  const targetCategories = takesCategories ? (relation.targetAlarmCategories || []).length : 0

  if (!(relation.sourceSignalTypes || []).length && !sourceCategories) findings.push('no-source')

  // An LLM rule has nothing to target. It reads the alarm the signal produced and writes
  // notes about it; it never touches another type's open alarms. Demanding targets here
  // would push an administrator into picking rows that mean nothing.
  if (!isAdvisory && !(relation.targetSignalTypes || []).length && !targetCategories)
    findings.push('no-target')

  // A non-global rule with no subscribers is scoped to no one, which is a rule that
  // cannot fire rather than a rule that applies everywhere.
  if (relation.global !== true && !(relation.sides || []).length) findings.push('scoped-to-nobody')

  // The Engine stops a rule whose condition it cannot evaluate rather than reading it as
  // "always" — so a typo here is a rule that silently never runs, not one that over-runs.
  if (!isKnownTriggerCondition(relation.triggerCondition)) findings.push('unknown-trigger-condition')

  // An LLM rule is its prompt: without one there is nothing to ask, and the planner skips it.
  if (isAdvisory && !relation.promptId) findings.push('llm-without-prompt')

  if (typeName === RELATION_TYPE_DELAY) {
    const type = relation.typeId ? types.get(relation.typeId) : undefined
    const fields = schemaFields(type?.parameterSchema)
    const rows = parseParameters(relation.parameters)

    const missing =
      rows.length === 0 ||
      validateParameters(rows.slice(0, 1), fields).length > 0 ||
      parametersAreUnreadable(relation.parameters)

    if (missing) findings.push('delay-without-parameters')
  }

  return findings
}

/** Rules ordered the way the Engine applies them: priority ascending, then name. */
export function sortRelations(relations: SignalRelationRow[]): SignalRelationRow[] {
  return [...relations].sort((a, b) => {
    const priority = (a.priority ?? 0) - (b.priority ?? 0)
    if (priority !== 0) return priority
    return (a.name ?? '').localeCompare(b.name ?? '', 'tr')
  })
}

/** The scope column: how many subscribers a rule reaches, or that it reaches all. */
export function scopeSummary(relation: SignalRelationRow): { global: boolean; count: number } {
  return { global: relation.global === true, count: (relation.sides || []).length }
}

/** Whether a type may be renamed or deleted. REMOVE and DELAY may not. */
export function isSystemType(type: SignalRelationTypeRow): boolean {
  if (type.isSystem !== undefined) return type.isSystem
  const name = type.name?.toUpperCase()
  return name === RELATION_TYPE_REMOVE || name === RELATION_TYPE_DELAY
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}
