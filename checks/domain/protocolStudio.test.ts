// Ported from Armikom.Open.Vue tests/unit/features/protocols/protocolStudio.test.ts; the implementation now lives in this package.
import { describe, it, expect } from './_expect.js'
import {
  CLEAR_GUID,
  auditDictionary,
  mappingPatch,
  relationsTargeting,
  resolveChain,
  type DictionaryRow,
  type SignalDetailRow,
  type SignalRelationRow,
  type SignalTypeRow
} from '../../src/domain/index.js'

/**
 * The rules S-808 is built on.
 *
 * Each of these is a claim the screen makes to an operator about what will happen
 * when a packet arrives, so each is asserted rather than inspected by eye.
 */

const BURGLARY: SignalTypeRow = {
  id: 'st-bur',
  name: 'HIRSIZ ALARMI',
  signalCode: 'BUR',
  alert: true,
  soundAlert: true,
  priority: 1
}

const RESTORE: SignalTypeRow = {
  id: 'st-bur-r',
  name: 'HIRSIZ ALARMI GERİ YÜKLEME',
  signalCode: 'BUR_R',
  alert: false,
  soundAlert: false,
  priority: 50
}

const OPENING: SignalTypeRow = {
  id: 'st-open',
  name: 'AÇILIŞ',
  signalCode: 'OPN',
  alert: false,
  soundAlert: false,
  priority: 90
}

const TYPES = new Map<string, SignalTypeRow>([
  [BURGLARY.id, BURGLARY],
  [RESTORE.id, RESTORE],
  [OPENING.id, OPENING]
])

/** `R130` closes an open `E130` alarm — the restore pair from §5.6. */
const RESTORE_RELATION: SignalRelationRow = {
  id: 'sr-1',
  name: 'HIRSIZ KARŞILAMA',
  typeId: 'srt-remove',
  typeName: 'REMOVE',
  global: true,
  priority: 0,
  sourceSignalTypes: [{ id: RESTORE.id, name: RESTORE.name }],
  targetSignalTypes: [{ id: BURGLARY.id, name: BURGLARY.name }],
  sides: []
}

/** A DELAY rule over the same pair: it defers the alarm, it does not close it. */
const DELAY_RELATION: SignalRelationRow = {
  id: 'sr-2',
  name: 'AÇILIŞ HIRSIZ ERTELER',
  typeId: 'srt-delay',
  typeName: 'DELAY',
  global: true,
  parameters: '[{"delayTime":300}]',
  priority: 10,
  sourceSignalTypes: [{ id: OPENING.id, name: OPENING.name }],
  targetSignalTypes: [{ id: BURGLARY.id, name: BURGLARY.name }],
  sides: []
}

function signal(overrides: Partial<SignalDetailRow> & { id: string }): SignalDetailRow {
  return {
    eventCode: 'E130',
    userCode: null,
    userNo: null,
    protocolId: 'pr-1',
    protocolName: 'Contact ID',
    signalTypeId: BURGLARY.id,
    signalTypeName: BURGLARY.name,
    signalTypeCode: BURGLARY.signalCode,
    alarmCategoryId: 'ac-1',
    alarmCategoryName: 'HIRSIZLIK',
    ...overrides
  }
}

function readyRow(detail: SignalDetailRow): DictionaryRow {
  return { id: detail.id, eventCode: detail.eventCode ?? '', state: 'ready', detail }
}

describe('resolveChain', () => {
  it('reports the runtime outcome an alert signal type produces', () => {
    const chain = resolveChain(signal({ id: 'sg-1' }), TYPES, [RESTORE_RELATION])

    expect(chain.signalType).toBe(BURGLARY)
    expect(chain.runtime?.entersAlarmQueue).toBe(true)
    expect(chain.runtime?.soundsAlarm).toBe(true)
    expect(chain.runtime?.priority).toBe(1)
    // The half of the model no other screen shows: this alarm closes itself.
    expect(chain.runtime?.closedBy.map((r) => r.id)).toEqual(['sr-1'])
  })

  it('stops at the dictionary when no signal type is mapped', () => {
    const chain = resolveChain(signal({ id: 'sg-2', signalTypeId: null }), TYPES, [RESTORE_RELATION])

    // Not "false" — unresolved. The Engine has nothing to classify the packet
    // with, which is a different state from "classified as non-alarm".
    expect(chain.signalType).toBeNull()
    expect(chain.runtime).toBeNull()
  })

  it('reports the alarms a restore signal closes when it arrives', () => {
    const chain = resolveChain(
      signal({ id: 'sg-3', eventCode: 'R130', signalTypeId: RESTORE.id }),
      TYPES,
      [RESTORE_RELATION]
    )

    expect(chain.runtime?.entersAlarmQueue).toBe(false)
    expect(chain.runtime?.closes.map((r) => r.id)).toEqual(['sr-1'])
  })

  it('resolves to no chain when the mapped signal type is missing from the catalogue', () => {
    const chain = resolveChain(signal({ id: 'sg-4', signalTypeId: 'st-gone' }), TYPES, [])
    expect(chain.signalType).toBeNull()
    expect(chain.runtime).toBeNull()
  })

  it('separates a rule that closes the alarm from one that only defers it', () => {
    const chain = resolveChain(signal({ id: 'sg-5' }), TYPES, [RESTORE_RELATION, DELAY_RELATION])

    // A DELAY rule brings the alarm back. Counting it as a restore path would tell
    // the operator this alarm closes itself, which is the opposite of what happens.
    expect(chain.runtime?.closedBy.map((r) => r.id)).toEqual(['sr-1'])
    expect(chain.runtime?.delayedBy.map((r) => r.id)).toEqual(['sr-2'])
  })

  it('reads an untyped relation as one that closes, the way the Engine does', () => {
    const untyped: SignalRelationRow = { ...RESTORE_RELATION, typeId: null, typeName: null }
    const chain = resolveChain(signal({ id: 'sg-6' }), TYPES, [untyped])

    expect(chain.runtime?.closedBy.map((r) => r.id)).toEqual(['sr-1'])
    expect(chain.runtime?.delayedBy).toEqual([])
  })
})

describe('relationsTargeting', () => {
  it('matches on the target side only', () => {
    expect(relationsTargeting(BURGLARY.id, [RESTORE_RELATION])).toHaveLength(1)
    // The restore type is the *source*; nothing closes it, it does the closing.
    expect(relationsTargeting(RESTORE.id, [RESTORE_RELATION])).toHaveLength(0)
  })
})

describe('auditDictionary', () => {
  it('reports an unmapped code as an error and does not also report it as unrouted', () => {
    const rows = [readyRow(signal({ id: 'sg-1', eventCode: 'E301', signalTypeId: null, alarmCategoryId: null }))]

    const report = auditDictionary(rows, TYPES, [RESTORE_RELATION])
    const codes = report.findings.map((f) => f.code)

    expect(codes).toContain('no-signal-type')
    // A row with no signal type has no routing question to answer yet; listing it
    // twice would double-count the same defect.
    expect(codes).not.toContain('no-alarm-category')
    expect(report.withSignalType).toBe(0)
  })

  it('reports an alarm no restore relation can close', () => {
    const rows = [readyRow(signal({ id: 'sg-1' }))]

    const report = auditDictionary(rows, TYPES, [])
    const finding = report.findings.find((f) => f.code === 'alert-without-restore')

    expect(finding).toBeDefined()
    expect(finding?.severity).toBe('warning')
    expect(finding?.signalIds).toEqual(['sg-1'])
  })

  it('does not report a restore-covered alarm', () => {
    const rows = [readyRow(signal({ id: 'sg-1' }))]

    const report = auditDictionary(rows, TYPES, [RESTORE_RELATION])
    expect(report.findings.map((f) => f.code)).not.toContain('alert-without-restore')
  })

  it('still reports an alarm whose only relation defers it', () => {
    const rows = [readyRow(signal({ id: 'sg-1' }))]

    // The alarm comes back when the delay expires; an operator still has to work it.
    const report = auditDictionary(rows, TYPES, [DELAY_RELATION])
    expect(report.findings.map((f) => f.code)).toContain('alert-without-restore')
  })

  it('treats a non-alert type as needing no restore relation', () => {
    const rows = [readyRow(signal({ id: 'sg-1', eventCode: 'E401', signalTypeId: OPENING.id }))]

    const report = auditDictionary(rows, TYPES, [])
    expect(report.findings.map((f) => f.code)).not.toContain('alert-without-restore')
  })

  it('flags two rows competing for the same lookup key', () => {
    const rows = [
      readyRow(signal({ id: 'sg-1', eventCode: 'E130' })),
      readyRow(signal({ id: 'sg-2', eventCode: 'E130' }))
    ]

    const finding = auditDictionary(rows, TYPES, [RESTORE_RELATION]).findings.find(
      (f) => f.code === 'duplicate-code'
    )
    expect(finding?.signalIds.sort()).toEqual(['sg-1', 'sg-2'])
  })

  it('does not treat the same event code with different user codes as a duplicate', () => {
    const rows = [
      readyRow(signal({ id: 'sg-1', eventCode: 'E401', userCode: '01' })),
      readyRow(signal({ id: 'sg-2', eventCode: 'E401', userCode: '02' }))
    ]

    expect(auditDictionary(rows, TYPES, [RESTORE_RELATION]).findings.map((f) => f.code)).not.toContain(
      'duplicate-code'
    )
  })

  /**
   * The audit's honesty rule. A row still loading is not evidence of anything, and
   * counting it as a defect would tell an operator to fix rows that are fine.
   */
  it('judges only the rows it could read, and says how many it could not', () => {
    const rows: DictionaryRow[] = [
      readyRow(signal({ id: 'sg-1' })),
      { id: 'sg-2', eventCode: 'E110', state: 'pending', detail: null },
      { id: 'sg-3', eventCode: 'E120', state: 'failed', detail: null }
    ]

    const report = auditDictionary(rows, TYPES, [RESTORE_RELATION])

    expect(report.total).toBe(3)
    expect(report.analysed).toBe(1)
    expect(report.failed).toBe(1)
    for (const finding of report.findings) {
      expect(finding.signalIds).not.toContain('sg-2')
      expect(finding.signalIds).not.toContain('sg-3')
    }
  })

  it('orders findings by severity so the blocking ones are read first', () => {
    const rows = [
      readyRow(signal({ id: 'sg-1', signalTypeId: null, alarmCategoryId: null })),
      readyRow(signal({ id: 'sg-2', alarmCategoryId: null })),
      readyRow(signal({ id: 'sg-3' }))
    ]

    const severities = auditDictionary(rows, TYPES, []).findings.map((f) => f.severity)
    expect(severities).toEqual([...severities].sort((a, b) => {
      const order = { error: 0, warning: 1, info: 2 } as const
      return order[a] - order[b]
    }))
    expect(severities[0]).toBe('error')
  })
})

describe('mappingPatch', () => {
  /**
   * The one that silently corrupts data if it is wrong: `UpdateSignalRequest`
   * reads an omitted property as "leave alone", so clearing a mapping has to send
   * the empty guid. Sending `null` would keep the old signal type while the UI
   * showed it as cleared.
   */
  it('clears a mapping with the empty guid rather than null', () => {
    expect(mappingPatch({ signalTypeId: null })).toEqual({ signalTypeId: CLEAR_GUID })
    expect(mappingPatch({ alarmCategoryId: '' })).toEqual({ alarmCategoryId: CLEAR_GUID })
  })

  it('omits a field that was not supplied', () => {
    expect(mappingPatch({ signalTypeId: 'st-bur' })).toEqual({ signalTypeId: 'st-bur' })
    expect(Object.keys(mappingPatch({ signalTypeId: 'st-bur' }))).not.toContain('alarmCategoryId')
  })
})
