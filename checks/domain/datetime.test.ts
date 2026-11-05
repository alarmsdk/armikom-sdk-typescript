// Ported from Armikom.Open.Vue tests/unit/utils/datetime.test.ts; the implementation now lives in this package.
import { describe, it, expect } from './_expect.js'
import { toDate, countdownTo, createDateTimeFormatter } from '../../src/core/datetime.js'

const { formatUtc } = createDateTimeFormatter({ timeZone: 'Europe/Istanbul' })

describe('datetime rendering (V6, Pitfall 8, G-52 class)', () => {
  it('renders an instant in UTC regardless of the host zone, and labels it', () => {
    const formatted = formatUtc('2026-08-20T14:30:00Z')
    // The hour must be the UTC hour. Under Europe/Istanbul a local render would
    // read 17:30 and look entirely plausible.
    expect(formatted).toContain('14:30')
    expect(formatted).toContain('20.08.2026')
    // An unlabelled timestamp is indistinguishable from a local one.
    expect(formatted).toContain('UTC')
  })

  it('accepts a Date as well as a string, because the SDK deserialises to Date', () => {
    expect(formatUtc(new Date('2026-08-20T14:30:00Z'))).toBe(formatUtc('2026-08-20T14:30:00Z'))
  })

  it('returns null for an absent or unparseable value rather than "Invalid Date"', () => {
    expect(formatUtc(null)).toBeNull()
    expect(formatUtc(undefined)).toBeNull()
    expect(formatUtc('')).toBeNull()
    expect(formatUtc('not a date')).toBeNull()
    expect(toDate('not a date')).toBeNull()
  })

  it('counts down to a future instant', () => {
    const now = Date.parse('2026-08-20T14:00:00Z')
    const result = countdownTo('2026-08-20T14:03:20Z', now)!
    expect(result.expired).toBe(false)
    expect(result.minutes).toBe(3)
    expect(result.seconds).toBe(20)
  })

  it('reports a past instant as expired, with how long ago', () => {
    const now = Date.parse('2026-08-20T14:00:00Z')
    const result = countdownTo('2026-08-20T13:55:30Z', now)!
    expect(result.expired).toBe(true)
    expect(result.minutes).toBe(4)
    expect(result.seconds).toBe(30)
  })

  it('treats the exact instant as expired, not as remaining', () => {
    const now = Date.parse('2026-08-20T14:00:00Z')
    expect(countdownTo('2026-08-20T14:00:00Z', now)!.expired).toBe(true)
  })

  it('returns null for a missing instant so callers render a dash, not a countdown', () => {
    expect(countdownTo(null, Date.now())).toBeNull()
  })
})
