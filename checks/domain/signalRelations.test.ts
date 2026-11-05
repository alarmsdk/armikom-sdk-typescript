// Ported from Armikom.Open.Vue tests/unit/features/protocols/signalRelations.test.ts; the implementation now lives in this package.
import { describe, expect, it } from './_expect.js'
import {
  emptyParameters,
  isSystemType,
  parametersAreUnreadable,
  parseParameters,
  isKnownTriggerCondition,
  normaliseTriggerCondition,
  parseHooks,
  relationFindings,
  schemaFields,
  scopeSummary,
  serialiseHooks,
  serialiseParameters,
  sortRelations,
  validateParameters,
  type SignalRelationTypeRow
} from '../../src/domain/index.js'
import type { SignalRelationRow, SchemaField } from '../../src/domain/index.js'

/**
 * The console renders a relation type's parameter form from its JSON Schema rather
 * than from a per-type component, so these cover the translation both ways — schema
 * to fields, fields back to the stored array — and the rules that decide whether a
 * configured rule will actually fire.
 */

const DELAY_SCHEMA =
  '{"type":"object","properties":{"delayTime":{"type":"integer","minimum":1,"maximum":86400,"title":"Erteleme süresi (saniye)"}},"required":["delayTime"]}'

const REMOVE_TYPE: SignalRelationTypeRow = {
  id: 'srt-remove',
  name: 'REMOVE',
  parameterSchema: '{"type":"object","properties":{}}',
  isSystem: true
}

const DELAY_TYPE: SignalRelationTypeRow = {
  id: 'srt-delay',
  name: 'DELAY',
  parameterSchema: DELAY_SCHEMA,
  isSystem: true
}

const LLM_TYPE: SignalRelationTypeRow = {
  id: 'srt-llm',
  name: 'LLM',
  parameterSchema:
    '{"type":"object","properties":{"hooks":{"type":"string"},"maxNotes":{"type":"integer","minimum":1,"maximum":10,"default":3}},"required":[]}',
  isSystem: true
}

const TYPES = new Map<string, SignalRelationTypeRow>([
  [REMOVE_TYPE.id, REMOVE_TYPE],
  [DELAY_TYPE.id, DELAY_TYPE],
  [LLM_TYPE.id, LLM_TYPE]
])

/** An LLM rule as the editor saves a complete one: a prompt, and only when an alarm was made. */
function llmRelation(overrides: Partial<SignalRelationRow> = {}): SignalRelationRow {
  return relation({
    id: 'sr-llm',
    typeId: LLM_TYPE.id,
    typeName: 'LLM',
    targetSignalTypes: [],
    triggerCondition: 'ALARM',
    promptId: 'pr-1',
    promptName: 'Arama öncesi uyarı',
    ...overrides
  })
}

function relation(overrides: Partial<SignalRelationRow> = {}): SignalRelationRow {
  return {
    id: 'sr-1',
    name: 'kural',
    typeId: REMOVE_TYPE.id,
    typeName: 'REMOVE',
    global: true,
    priority: 0,
    sourceSignalTypes: [{ id: 'st-open', name: 'Açılış' }],
    targetSignalTypes: [{ id: 'st-burglar', name: 'Hırsız' }],
    sides: [],
    ...overrides
  }
}

describe('schemaFields', () => {
  it('reads a property into the field a form can render', () => {
    const [field] = schemaFields(DELAY_SCHEMA) as [SchemaField]

    expect(field.name).toBe('delayTime')
    expect(field.kind).toBe('integer')
    expect(field.required).toBe(true)
    expect(field.minimum).toBe(1)
    expect(field.maximum).toBe(86400)
    expect(field.title).toBe('Erteleme süresi (saniye)')
  })

  it('renders an enum as a choice regardless of its declared type', () => {
    const [field] = schemaFields('{"type":"object","properties":{"mode":{"type":"string","enum":["soft","hard"]}}}') as [SchemaField]

    expect(field.kind).toBe('enum')
    expect(field.options).toEqual(['soft', 'hard'])
  })

  it('falls back to free text for a type the subset does not name', () => {
    const [field] = schemaFields('{"type":"object","properties":{"note":{"type":"anything"}}}') as [SchemaField]
    expect(field.kind).toBe('string')
  })

  it('yields no fields for an unreadable schema rather than throwing', () => {
    // The editor then falls back to raw JSON, which is what lets an operator fix a
    // type whose schema is the thing that is broken.
    expect(schemaFields('not json')).toEqual([])
    expect(schemaFields(null)).toEqual([])
    expect(schemaFields('{"type":"object"}')).toEqual([])
  })
})

describe('parseParameters', () => {
  it('reads the stored array', () => {
    expect(parseParameters('[{"delayTime":300}]')).toEqual([{ delayTime: 300 }])
  })

  it('reads a bare object as a one-element array', () => {
    // A hand-edited row tends to contain this, and opening it beats discarding it.
    expect(parseParameters('{"delayTime":300}')).toEqual([{ delayTime: 300 }])
  })

  it('yields nothing for blank or invalid JSON', () => {
    expect(parseParameters(null)).toEqual([])
    expect(parseParameters('')).toEqual([])
    expect(parseParameters('nope')).toEqual([])
  })
})

describe('parametersAreUnreadable', () => {
  it('is false for blank and for both accepted shapes', () => {
    expect(parametersAreUnreadable(null)).toBe(false)
    expect(parametersAreUnreadable('[{"a":1}]')).toBe(false)
    expect(parametersAreUnreadable('{"a":1}')).toBe(false)
  })

  it('is true for anything the form cannot represent', () => {
    expect(parametersAreUnreadable('nope')).toBe(true)
    expect(parametersAreUnreadable('[1,2]')).toBe(true)
  })
})

describe('serialiseParameters', () => {
  const fields = schemaFields(DELAY_SCHEMA)

  it('writes a numeric field as a number, not as the string the input produced', () => {
    expect(serialiseParameters([{ delayTime: '300' }], fields)).toBe('[{"delayTime":300}]')
  })

  it('drops blank values and empty rows', () => {
    expect(serialiseParameters([{ delayTime: '' }], fields)).toBeNull()
  })

  it('leaves a non-numeric entry alone so the server can reject it by name', () => {
    expect(serialiseParameters([{ delayTime: 'soon' }], fields)).toBe('[{"delayTime":"soon"}]')
  })
})

describe('validateParameters', () => {
  const fields = schemaFields(DELAY_SCHEMA)

  it('accepts a valid value', () => {
    expect(validateParameters([{ delayTime: 300 }], fields)).toEqual([])
  })

  it('reports a missing required value', () => {
    expect(validateParameters([{ delayTime: '' }], fields)[0]).toMatchObject({
      row: 0,
      field: 'delayTime',
      key: 'ERROR.RELATIONS.PARAM_REQUIRED'
    })
  })

  it('reports values outside the schema bounds', () => {
    expect(validateParameters([{ delayTime: 0 }], fields)[0]!.key).toBe('ERROR.RELATIONS.PARAM_MIN')
    expect(validateParameters([{ delayTime: 90000 }], fields)[0]!.key).toBe('ERROR.RELATIONS.PARAM_MAX')
  })

  it('reports a fractional value for an integer field', () => {
    expect(validateParameters([{ delayTime: 1.5 }], fields)[0]!.key).toBe('ERROR.RELATIONS.PARAM_NOT_INTEGER')
  })

  it('reports a value outside an enum', () => {
    const enumFields = schemaFields('{"type":"object","properties":{"mode":{"type":"string","enum":["soft"]}}}')
    expect(validateParameters([{ mode: 'hard' }], enumFields)[0]!.key).toBe('ERROR.RELATIONS.PARAM_ENUM')
  })
})

describe('emptyParameters', () => {
  it('honours a declared default and blanks the rest', () => {
    const fields = schemaFields(
      '{"type":"object","properties":{"a":{"type":"integer","default":30},"b":{"type":"boolean"},"c":{"type":"string"}}}'
    )
    expect(emptyParameters(fields)).toEqual({ a: 30, b: false, c: '' })
  })
})

describe('relationFindings', () => {
  it('reports nothing for a complete global REMOVE rule', () => {
    expect(relationFindings(relation(), TYPES)).toEqual([])
  })

  it('reports a rule with no source or no target', () => {
    expect(relationFindings(relation({ sourceSignalTypes: [] }), TYPES)).toContain('no-source')
    expect(relationFindings(relation({ targetSignalTypes: [] }), TYPES)).toContain('no-target')
  })

  it('reports a non-global rule linked to no subscriber', () => {
    // Scoped to no one is a rule that cannot fire, not a rule that applies everywhere.
    expect(relationFindings(relation({ global: false, sides: [] }), TYPES)).toContain('scoped-to-nobody')
  })

  it('does not report a non-global rule that has subscribers', () => {
    const scoped = relation({ global: false, sides: [{ id: 'sd-1', sideNo: 1001, name: 'Abone' }] })
    expect(relationFindings(scoped, TYPES)).toEqual([])
  })

  it('reports a DELAY rule whose delay is missing or unusable', () => {
    const delay = (parameters: string | null) =>
      relation({ id: 'sr-2', typeId: DELAY_TYPE.id, typeName: 'DELAY', parameters })

    expect(relationFindings(delay(null), TYPES)).toContain('delay-without-parameters')
    expect(relationFindings(delay('[{"delayTime":0}]'), TYPES)).toContain('delay-without-parameters')
    expect(relationFindings(delay('nope'), TYPES)).toContain('delay-without-parameters')
    expect(relationFindings(delay('[{"delayTime":300}]'), TYPES)).toEqual([])
  })

  // ── LLM rules ─────────────────────────────────────────────────────────────
  //
  // An advisory rule fails differently from the other two, and the console has to agree
  // with the Engine about which of those failures are silent.

  it('reports nothing for a complete LLM rule', () => {
    expect(relationFindings(llmRelation(), TYPES)).toEqual([])
  })

  it('does not demand targets of an LLM rule', () => {
    // The point of the exemption: an LLM rule writes advice about the alarm this signal
    // produced. It has nothing to apply to another type's open alarms, so asking for
    // target types would make an administrator pick rows that mean nothing.
    expect(relationFindings(llmRelation({ targetSignalTypes: [] }), TYPES)).not.toContain('no-target')
    expect(relationFindings(relation({ targetSignalTypes: [] }), TYPES)).toContain('no-target')
  })

  it('reports an LLM rule with no prompt', () => {
    // The planner skips it in silence. Without this the rule sits in the list looking
    // configured while nothing ever runs.
    expect(relationFindings(llmRelation({ promptId: null }), TYPES)).toContain('llm-without-prompt')
  })

  it('does not ask the other types for a prompt', () => {
    expect(relationFindings(relation({ promptId: null }), TYPES)).not.toContain('llm-without-prompt')
  })

  it('reports a trigger condition this build cannot evaluate', () => {
    // The Engine stops such a rule rather than reading it as "always", so a typo here is a
    // rule that silently never runs — for any type, not only LLM.
    expect(relationFindings(relation({ triggerCondition: 'OUT_OF_HOURS' }), TYPES)).toContain(
      'unknown-trigger-condition'
    )
    expect(relationFindings(relation({ triggerCondition: 'NOALARM' }), TYPES)).toEqual([])
    expect(relationFindings(relation({ triggerCondition: null }), TYPES)).toEqual([])
  })
})

describe('trigger conditions', () => {
  it('knows the three the Engine evaluates, and nothing else', () => {
    expect(isKnownTriggerCondition('')).toBe(true)
    expect(isKnownTriggerCondition(null)).toBe(true)
    expect(isKnownTriggerCondition('ALARM')).toBe(true)
    expect(isKnownTriggerCondition('NOALARM')).toBe(true)
    expect(isKnownTriggerCondition('OUT_OF_HOURS')).toBe(false)
  })

  it('reads a stored condition case- and space-insensitively', () => {
    // The column is free text; the Engine compares case-insensitively, so the console must
    // not report a rule as broken over a lower-case a.
    expect(isKnownTriggerCondition(' alarm ')).toBe(true)
    expect(normaliseTriggerCondition(' alarm ')).toBe('ALARM')
    expect(normaliseTriggerCondition(null)).toBe('')
  })
})

describe('hooks', () => {
  it('round-trips the comma-separated list the Engine parses', () => {
    expect(parseHooks('call.contact,alarm.complete')).toEqual(['call.contact', 'alarm.complete'])
    expect(serialiseHooks(['call.contact', 'alarm.complete'])).toBe('call.contact,alarm.complete')
  })

  it('survives the spacing a hand-written row arrives with', () => {
    expect(parseHooks(' call.contact , , alarm.delay ')).toEqual(['call.contact', 'alarm.delay'])
  })

  it('reads a missing list as empty, which the Engine reads as every hook', () => {
    // Not the same as "no hooks" — the editor has to say so, or an unticked set of boxes
    // reads as "this rule advises on nothing".
    expect(parseHooks(undefined)).toEqual([])
    expect(parseHooks(null)).toEqual([])
    expect(serialiseHooks([])).toBe('')
  })
})

describe('sortRelations', () => {
  it('orders by priority ascending, the way the Engine applies them', () => {
    const rows = [
      relation({ id: 'a', name: 'a', priority: 10 }),
      relation({ id: 'b', name: 'b', priority: 1 }),
      relation({ id: 'c', name: 'c', priority: 5 })
    ]
    expect(sortRelations(rows).map((r) => r.id)).toEqual(['b', 'c', 'a'])
  })

  it('breaks a priority tie by name so the order is stable', () => {
    const rows = [relation({ id: 'z', name: 'zebra' }), relation({ id: 'a', name: 'alfa' })]
    expect(sortRelations(rows).map((r) => r.id)).toEqual(['a', 'z'])
  })
})

describe('scopeSummary', () => {
  it('says all subscribers for a global rule regardless of its side list', () => {
    const scoped = relation({ global: true, sides: [{ id: 'sd-1', name: 'Abone' }] })
    expect(scopeSummary(scoped)).toEqual({ global: true, count: 1 })
  })
})

describe('isSystemType', () => {
  it('trusts the server flag', () => {
    expect(isSystemType({ id: 't', name: 'CUSTOM', isSystem: true })).toBe(true)
    expect(isSystemType({ id: 't', name: 'REMOVE', isSystem: false })).toBe(false)
  })

  it('falls back to the two names the Engine dispatches on', () => {
    expect(isSystemType({ id: 't', name: 'DELAY' })).toBe(true)
    expect(isSystemType({ id: 't', name: 'ESCALATE' })).toBe(false)
  })
})
