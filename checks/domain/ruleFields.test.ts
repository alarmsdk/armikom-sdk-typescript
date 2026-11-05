// Ported from Armikom.Open.Vue tests/unit/features/signalRules/ruleFields.test.ts; the implementation now lives in this package.
import { describe, it, expect } from './_expect.js'
import { scopeLookupRows } from '../../src/domain/index.js'

/**
 * A rule for centre A only ever sees centre A's signals, so its pickers must not offer
 * another centre's rows; a global rule sees every centre's.
 */
describe('scopeLookupRows', () => {
  const receivers = [
    { id: 'a', name: 'A', monitoringCenterId: 'mc-a' },
    { id: 'b', name: 'B', monitoringCenterId: 'mc-b' },
    { id: 's', name: 'Shared', monitoringCenterId: null },
    { id: '', name: 'no id' }
  ]

  it("keeps a centre's own rows and the shared ones", () => {
    expect(scopeLookupRows('receivers', receivers, 'mc-a').map((r) => r.id)).toEqual(['a', 's'])
  })

  it('narrows nothing in the global scope', () => {
    expect(scopeLookupRows('receivers', receivers, null).map((r) => r.id)).toEqual(['a', 'b', 's'])
  })

  it('offers only the centre itself for mc.id', () => {
    const centres = [
      { id: 'mc-a', name: 'A' },
      { id: 'mc-b', name: 'B' }
    ]
    expect(scopeLookupRows('monitoringCenters', centres, 'mc-a')).toEqual([{ id: 'mc-a', name: 'A' }])
    expect(scopeLookupRows('monitoringCenters', centres, null)).toHaveLength(2)
  })

  it('falls back to a signal code, then the id, for rows without a name', () => {
    expect(scopeLookupRows('signalTypes', [{ id: 'st', signalCode: 'FA' }, { id: 'x' }], null)).toEqual([
      { id: 'st', name: 'FA' },
      { id: 'x', name: 'x' }
    ])
  })

  it('returns nothing for a collection the bundle does not have', () => {
    expect(scopeLookupRows('dealers', undefined, 'mc-a')).toEqual([])
  })
})
