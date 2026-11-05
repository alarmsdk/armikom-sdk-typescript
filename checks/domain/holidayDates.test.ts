// Ported from Armikom.Open.Vue tests/unit/features/holidays/holidayDates.test.ts; the implementation now lives in this package.
import { describe, it, expect } from './_expect.js'
import {
  compareByMonthDay,
  daysUntil,
  expandRange,
  holidayKey,
  MAX_RANGE_DAYS,
  monthDay,
  nextOccurrence,
  todayIn,
  toIsoDate,
  toWireDate
} from '../../src/domain/index.js'

describe('holidayDates', () => {
  it('reads a calendar date from UTC components, never local ones', () => {
    // Midnight UTC is the previous evening west of Greenwich; the date must not move.
    expect(toIsoDate(new Date('2026-01-01T00:00:00Z'))).toBe('2026-01-01')
    expect(toIsoDate('2026-10-29T00:00:00')).toBe('2026-10-29')
    expect(toIsoDate('')).toBe('')
    expect(toIsoDate('not a date')).toBe('')
    expect(toWireDate('2026-10-29').toISOString()).toBe('2026-10-29T00:00:00.000Z')
    expect(monthDay('2019-05-19')).toBe('05-19')
  })

  it('keys duplicates the way the server does: date and recurring', () => {
    expect(holidayKey('2026-01-01', true)).toBe(holidayKey(new Date('2026-01-01T00:00:00Z'), true))
    expect(holidayKey('2026-01-01', true)).not.toBe(holidayKey('2026-01-01', false))
  })

  it('finds the next occurrence of recurring and one-off holidays', () => {
    const today = '2026-09-23'
    expect(nextOccurrence('2019-10-29', true, today)).toBe('2026-10-29')
    expect(nextOccurrence('2019-01-01', true, today)).toBe('2027-01-01')
    expect(nextOccurrence('2026-09-23', false, today)).toBe('2026-09-23')
    expect(nextOccurrence('2026-01-01', false, today)).toBeNull()
    // Matched on month and day like the Engine: 29 February only recurs in leap years.
    expect(nextOccurrence('2024-02-29', true, today)).toBe('2028-02-29')
    expect(daysUntil('2026-10-29', today)).toBe(36)
  })

  it('expands a date range into one row per day, inclusive', () => {
    expect(expandRange('2026-05-26', '2026-05-29')).toEqual([
      '2026-05-26',
      '2026-05-27',
      '2026-05-28',
      '2026-05-29'
    ])
    expect(expandRange('2026-12-31', '2027-01-01')).toEqual(['2026-12-31', '2027-01-01'])
    expect(expandRange('2026-05-29', '2026-05-26')).toBeNull()
    expect(expandRange('2026-02-30', '2026-03-01')).toBeNull()
    expect(expandRange('2026-01-01', '2026-12-31')).toBeNull()
    expect(expandRange('2026-01-01', '2026-01-31')).toHaveLength(MAX_RANGE_DAYS)
  })

  it("reads today in the subscriber's zone, falling back to UTC", () => {
    const late = new Date('2026-09-23T22:30:00Z')
    expect(todayIn('Europe/Istanbul', late)).toBe('2026-09-24')
    expect(todayIn(null, late)).toBe('2026-09-23')
    expect(todayIn('Not/AZone', late)).toBe('2026-09-23')
  })

  it('sorts a calendar by month and day, ignoring the year', () => {
    const rows = ['2026-10-29', '2019-01-01', '2026-05-19'].sort(compareByMonthDay)
    expect(rows).toEqual(['2019-01-01', '2026-05-19', '2026-10-29'])
  })
})
