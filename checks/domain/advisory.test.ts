// Ported from Armikom.Open.Vue tests/unit/features/alarms/advisory.test.ts; the implementation now lives in this package.
import { describe, expect, it } from './_expect.js'
import {
  allNotes,
  hasOutstanding,
  interrupts,
  normaliseEffect,
  notesFor,
  parseEvidence,
  reference,
  requiresReason,
  sortNotes,
  strongestEffect,
  type Advisory,
  type AdvisoryNote
} from '../../src/domain/index.js'

/**
 * Advisory notes decide whether an operator is interrupted mid-alarm, so the matching rules
 * are worth pinning down: a note bound to one contact must not warn about the other two, and
 * an effect this build does not recognise must not silently become a blocking dialog.
 */

const CONTACT_A = 'contact:aaaa'
const CONTACT_B = 'contact:bbbb'

describe('notesFor', () => {
  it('matches on the hook', () => {
    const advisories = [advisory([note({ hook: 'call.contact' }), note({ hook: 'alarm.complete' })])]

    expect(notesFor(advisories, 'call.contact', CONTACT_A)).toHaveLength(1)
    expect(notesFor(advisories, 'call.dealer', CONTACT_A)).toHaveLength(0)
  })

  it('keeps a targeted note on its own row only', () => {
    // The reason targetRef exists: "this person does not want to be called" belongs on one
    // row of the contacts panel, not on all three.
    const advisories = [advisory([note({ targetRef: CONTACT_A })])]

    expect(notesFor(advisories, 'call.contact', CONTACT_A)).toHaveLength(1)
    expect(notesFor(advisories, 'call.contact', CONTACT_B)).toHaveLength(0)
  })

  it('applies an untargeted note to every target of its hook', () => {
    const advisories = [advisory([note({ targetRef: null })])]

    expect(notesFor(advisories, 'call.contact', CONTACT_A)).toHaveLength(1)
    expect(notesFor(advisories, 'call.contact', CONTACT_B)).toHaveLength(1)
    expect(notesFor(advisories, 'call.contact')).toHaveLength(1)
  })

  it('does not leak a targeted note to a caller with no target', () => {
    const advisories = [advisory([note({ targetRef: CONTACT_A })])]

    expect(notesFor(advisories, 'call.contact', null)).toHaveLength(0)
  })

  it('gathers notes across several advisories', () => {
    const advisories = [advisory([note({ id: '1' })]), advisory([note({ id: '2' })])]

    expect(notesFor(advisories, 'call.contact', CONTACT_A)).toHaveLength(2)
  })
})

describe('effects', () => {
  it('reads an unknown effect as inform', () => {
    // Quieter is the safe direction to be wrong in: the observation may be right and only
    // the volume wrong.
    expect(normaliseEffect('explode')).toBe('inform')
    expect(normaliseEffect(null)).toBe('inform')
    expect(normaliseEffect('CONFIRM')).toBe('confirm')
  })

  it('interrupts only for confirm and require-reason', () => {
    expect(interrupts('confirm')).toBe(true)
    expect(interrupts('require-reason')).toBe(true)
    expect(interrupts('warn')).toBe(false)
    expect(interrupts('suggest')).toBe(false)
    expect(interrupts('inform')).toBe(false)
    // An unrecognised effect must never become a blocking dialog by accident.
    expect(interrupts('block')).toBe(false)
  })

  it('demands a reason only for require-reason', () => {
    expect(requiresReason('require-reason')).toBe(true)
    expect(requiresReason('confirm')).toBe(false)
  })

  it('takes the strongest effect among the matching notes', () => {
    const notes = [note({ effect: 'inform' }), note({ effect: 'confirm' }), note({ effect: 'warn' })]

    expect(strongestEffect(notes)).toBe('confirm')
    expect(strongestEffect([])).toBe('inform')
  })
})

describe('sortNotes', () => {
  it('puts the strongest first, then the most severe', () => {
    // A dialog stacks several notes and an operator reads the top one mid-call, so the one
    // that changes what they do has to be there.
    const sorted = sortNotes([
      note({ id: 'inform', effect: 'inform', severity: 5 }),
      note({ id: 'confirm-low', effect: 'confirm', severity: 1 }),
      note({ id: 'confirm-high', effect: 'confirm', severity: 4 })
    ])

    expect(sorted.map((n) => n.id)).toEqual(['confirm-high', 'confirm-low', 'inform'])
  })
})

describe('hasOutstanding', () => {
  it('is true while anything is still being produced', () => {
    expect(hasOutstanding([advisory([], 'pending')])).toBe(true)
    expect(hasOutstanding([advisory([], 'running')])).toBe(true)
    expect(hasOutstanding([advisory([], 'succeeded')])).toBe(false)
    // Skipped and failed are answers too — there is nothing more coming.
    expect(hasOutstanding([advisory([], 'skipped'), advisory([], 'failed')])).toBe(false)
  })
})

describe('parseEvidence', () => {
  it('returns the citations', () => {
    const parsed = parseEvidence('[{"kind":"sideContact.note","id":"contact:a","quote":"aramayın"}]')

    expect(parsed).toHaveLength(1)
    expect(parsed[0]!.quote).toBe('aramayın')
  })

  it('survives unparseable evidence', () => {
    // The note still shows; it just shows without its citations. Losing a true warning over
    // a malformed field would be the worse trade.
    expect(parseEvidence('not json')).toEqual([])
    expect(parseEvidence(null)).toEqual([])
  })
})

describe('reference', () => {
  it('builds the kind:id the server uses', () => {
    expect(reference('contact', 'abc')).toBe('contact:abc')
    expect(reference('contact', null)).toBeUndefined()
  })
})

describe('allNotes', () => {
  it('gathers every note for the panel, ordered like a dialog', () => {
    const advisories = [
      advisory([note({ id: 'a', effect: 'inform' })]),
      advisory([note({ id: 'b', effect: 'require-reason' })])
    ]

    expect(allNotes(advisories).map((n) => n.id)).toEqual(['b', 'a'])
  })
})

// ── helpers ────────────────────────────────────────────────────────────────

function advisory(notes: AdvisoryNote[], status: Advisory['status'] = 'succeeded'): Advisory {
  return { id: `adv-${Math.random()}`, status, notes }
}

function note(overrides: Partial<AdvisoryNote> = {}): AdvisoryNote {
  return {
    id: 'note-1',
    hook: 'call.contact',
    effect: 'confirm',
    severity: 3,
    title: 'Bu kişi aranmak istemiyor',
    message: "22:00'dan sonra aramayın.",
    targetRef: CONTACT_A,
    evidence: null,
    ...overrides
  }
}
