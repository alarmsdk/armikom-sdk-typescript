// Ported from Armikom.Open.Vue tests/unit/features/signalRules/ruleExpression.test.ts; the implementation now lives in this package.
import { describe, it, expect } from './_expect.js'
import {
  toFilterExpression,
  toRuleCondition,
  operationsFor,
  UnrepresentableConditionError,
  type FactType,
  type RuleNode
} from '../../src/domain/index.js'

/**
 * The stored rule tree is the only thing saved; the FilterBuilder's array syntax is an
 * editing format. These tests pin the mapping both ways, and that a rule written by the
 * rule tool survives a trip through the editor unchanged.
 */

const FACTS = new Map<string, FactType>([
  ['side.brandId', 'String'],
  ['signal.eventCode', 'String'],
  ['side.no', 'Number'],
  ['time.minuteOfDay', 'Number'],
  ['time.localDate', 'String'],
  ['signal.isReal', 'Bool'],
  ['dealer.tags', 'StringSet'],
  ['side.cityId', 'String']
])

const DSC = 'b1c4b0a6-0000-4000-8000-000000000001'
const AJAX = 'b1c4b0a6-0000-4000-8000-000000000002'

describe('toRuleCondition', () => {
  it('reads a single condition without wrapping it in a group', () => {
    const { condition, problems } = toRuleCondition(['side.brandId', '=', DSC], FACTS)
    expect(problems).toEqual([])
    expect(condition).toEqual({ fact: 'side.brandId', op: 'eq', value: DSC })
  })

  it('reads an "and" group into all and an "or" group into any', () => {
    const { condition } = toRuleCondition(
      [['side.brandId', 'anyof', [DSC, AJAX]], 'and', [['side.no', '>=', 10], 'or', ['signal.isReal', '=', true]]],
      FACTS
    )
    expect(condition).toEqual({
      all: [
        { fact: 'side.brandId', op: 'in', value: [DSC, AJAX] },
        {
          any: [
            { fact: 'side.no', op: 'gte', value: 10 },
            { fact: 'signal.isReal', op: 'eq', value: true }
          ]
        }
      ]
    })
  })

  it('maps anyof / noneof to in / nin on a scalar and to containsAny on a set', () => {
    expect(toRuleCondition(['side.brandId', 'noneof', [DSC]], FACTS).condition).toEqual({
      fact: 'side.brandId',
      op: 'nin',
      value: [DSC]
    })
    expect(toRuleCondition(['dealer.tags', 'anyof', ['vip', 'test']], FACTS).condition).toEqual({
      fact: 'dealer.tags',
      op: 'containsAny',
      value: ['vip', 'test']
    })
    expect(toRuleCondition(['dealer.tags', 'noneof', ['vip']], FACTS).condition).toEqual({
      not: { fact: 'dealer.tags', op: 'containsAny', value: ['vip'] }
    })
    expect(toRuleCondition(['dealer.tags', 'allof', ['vip', 'gold']], FACTS).condition).toEqual({
      fact: 'dealer.tags',
      op: 'containsAll',
      value: ['vip', 'gold']
    })
  })

  it('reads a negated group as not', () => {
    const { condition } = toRuleCondition(
      ['!', [['signal.eventCode', '=', 'E130'], 'or', ['signal.eventCode', '=', 'E131']]],
      FACTS
    )
    expect(condition).toEqual({
      not: {
        any: [
          { fact: 'signal.eventCode', op: 'eq', value: 'E130' },
          { fact: 'signal.eventCode', op: 'eq', value: 'E131' }
        ]
      }
    })
  })

  it('writes numbers as numbers, even when the editor hands over text', () => {
    const { condition } = toRuleCondition(['time.minuteOfDay', 'between', ['1320', 1439]], FACTS)
    expect(condition).toEqual({ fact: 'time.minuteOfDay', op: 'between', value: [1320, 1439] })
  })

  it('reads the presence operations as exists true / false', () => {
    expect(toRuleCondition(['side.cityId', 'exists'], FACTS).condition).toEqual({
      fact: 'side.cityId',
      op: 'exists',
      value: true
    })
    expect(toRuleCondition(['side.cityId', 'notexists'], FACTS).condition).toEqual({
      fact: 'side.cityId',
      op: 'exists',
      value: false
    })
  })

  it('reports every incomplete condition and unknown fact, and returns no condition', () => {
    const { condition, problems } = toRuleCondition(
      [['side.brandId', '=', null], 'and', ['side.shoeSize', '=', 42], 'and', ['side.no', 'between', [1]]],
      FACTS
    )
    expect(condition).toBeNull()
    expect(problems.map((p) => p.key)).toEqual([
      'UI.SIGNAL_RULES.ERR_INCOMPLETE',
      'UI.SIGNAL_RULES.ERR_UNKNOWN_FACT',
      'UI.SIGNAL_RULES.ERR_INCOMPLETE'
    ])
  })

  it('refuses an empty expression: a rule with no condition would match every signal', () => {
    for (const empty of [null, [], [[]]]) {
      const { condition, problems } = toRuleCondition(empty, FACTS)
      expect(condition).toBeNull()
      expect(problems.map((p) => p.key)).toEqual(['UI.SIGNAL_RULES.ERR_NO_CONDITION'])
    }
  })

  it('refuses an operation the engine has no operator for', () => {
    const { problems } = toRuleCondition(['signal.eventCode', 'endswith', '30'], FACTS)
    expect(problems).toEqual([
      { key: 'UI.SIGNAL_RULES.ERR_UNSUPPORTED_OPERATION', params: { fact: 'signal.eventCode', operation: 'endswith' } }
    ])
  })
})

describe('toFilterExpression', () => {
  it('writes the readable form of a negated condition', () => {
    expect(toFilterExpression({ not: { fact: 'signal.eventCode', op: 'contains', value: '13' } }, FACTS)).toEqual([
      'signal.eventCode',
      'notcontains',
      '13'
    ])
    expect(toFilterExpression({ not: { fact: 'side.cityId', op: 'exists', value: true } }, FACTS)).toEqual([
      'side.cityId',
      'notexists'
    ])
  })

  it('throws for an operator this build cannot show, rather than dropping it', () => {
    expect(() => toFilterExpression({ fact: 'side.no', op: 'matchesRegex', value: '^1' }, FACTS)).toThrow(
      UnrepresentableConditionError
    )
  })

  it('returns null for no condition', () => {
    expect(toFilterExpression(null, FACTS)).toBeNull()
  })
})

describe('round trip', () => {
  const rules: Array<[string, RuleNode]> = [
    [
      'R1-style: dealer tagged, test signals, not technicians',
      {
        all: [
          { fact: 'dealer.tags', op: 'contains', value: 'test-dealer' },
          { fact: 'signal.eventCode', op: 'in', value: ['E602', 'R602'] },
          { not: { fact: 'dealer.tags', op: 'containsAny', value: ['technician'] } }
        ]
      }
    ],
    [
      'overnight window',
      {
        any: [
          { fact: 'time.minuteOfDay', op: 'gte', value: 1320 },
          { fact: 'time.minuteOfDay', op: 'lt', value: 360 }
        ]
      }
    ],
    [
      'brand and date range',
      {
        all: [
          { fact: 'side.brandId', op: 'eq', value: DSC },
          { fact: 'time.localDate', op: 'between', value: ['2026-12-31', '2027-01-01'] },
          { fact: 'side.cityId', op: 'exists', value: false },
          { not: { all: [{ fact: 'signal.isReal', op: 'eq', value: false }, { fact: 'side.no', op: 'nin', value: [1, 2] }] } }
        ]
      }
    ]
  ]

  it.each(rules)('%s', (_name, rule) => {
    const expression = toFilterExpression(rule, FACTS)
    const { condition, problems } = toRuleCondition(expression, FACTS)
    expect(problems).toEqual([])
    expect(condition).toEqual(rule)
  })
})

describe('operationsFor', () => {
  it('offers only what the engine accepts for the type', () => {
    expect(operationsFor('Bool', false, 'signal.isReal')).toEqual(['=', '<>', 'exists', 'notexists'])
    expect(operationsFor('StringSet', true, 'dealer.tags')).not.toContain('=')
    expect(operationsFor('String', true, 'side.brandId')).not.toContain('contains')
    expect(operationsFor('String', false, 'signal.eventCode')).not.toContain('endswith')
    expect(operationsFor('String', false, 'time.localDate')).toContain('between')
  })
})
