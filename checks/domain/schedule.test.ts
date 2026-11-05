// Ported from Armikom.Open.Vue tests/unit/utils/schedule.test.ts; the implementation now lives in this package.
import { describe, it, expect } from './_expect.js'
import {
  toEDayOfWeek,
  eDayKey,
  secondsToTimeInput,
  timeInputToSeconds,
  isOvernight,
  spanMinutes,
  isWithinSchedule
} from '../../src/domain/index.js'

describe('schedule conversions (Pitfall 6, Pitfall 7)', () => {
  it('maps Date.getDay() to EDayOfWeek with Sunday = 7', () => {
    // The one that bites: JS Sunday is 0, EDayOfWeek Sunday is 7.
    expect(toEDayOfWeek(0)).toBe(7)
    expect(toEDayOfWeek(1)).toBe(1)
    expect(toEDayOfWeek(6)).toBe(6)
  })

  it('names each EDayOfWeek value with the right key', () => {
    expect(eDayKey(1)).toBe('ENUM.DayOfWeek.Monday')
    expect(eDayKey(7)).toBe('ENUM.DayOfWeek.Sunday')
  })

  it('converts seconds of day to HH:mm', () => {
    expect(secondsToTimeInput(0)).toBe('00:00')
    expect(secondsToTimeInput(8 * 3600)).toBe('08:00')
    expect(secondsToTimeInput(22 * 3600 + 30 * 60)).toBe('22:30')
  })

  it('renders a null time as empty, meaning "no shift this day"', () => {
    expect(secondsToTimeInput(null)).toBe('')
    expect(secondsToTimeInput(undefined)).toBe('')
  })

  it('converts HH:mm back to seconds, not minutes', () => {
    // 08:00 is 28800 seconds. 480 would be the minutes bug (Pitfall 6).
    expect(timeInputToSeconds('08:00')).toBe(28800)
    expect(timeInputToSeconds('00:30')).toBe(1800)
    expect(timeInputToSeconds('23:59')).toBe(86340)
  })

  it('treats empty or malformed input as no shift rather than midnight', () => {
    expect(timeInputToSeconds('')).toBeNull()
    expect(timeInputToSeconds(null)).toBeNull()
    expect(timeInputToSeconds('yarım')).toBeNull()
    expect(timeInputToSeconds('25:00')).toBeNull()
    expect(timeInputToSeconds('08:70')).toBeNull()
  })

  it('round-trips every half hour of the day', () => {
    for (let seconds = 0; seconds < 24 * 3600; seconds += 1800) {
      expect(timeInputToSeconds(secondsToTimeInput(seconds))).toBe(seconds)
    }
  })

  it('recognises an overnight span, including equal times', () => {
    expect(isOvernight(22 * 3600, 6 * 3600)).toBe(true)
    expect(isOvernight(8 * 3600, 18 * 3600)).toBe(false)
    // ShiftChecker takes the overnight branch whenever end > start is false.
    expect(isOvernight(8 * 3600, 8 * 3600)).toBe(true)
    expect(isOvernight(null, 6 * 3600)).toBe(false)
  })

  it('measures a span across midnight', () => {
    expect(spanMinutes(8 * 3600, 18 * 3600)).toBe(600)
    expect(spanMinutes(22 * 3600, 6 * 3600)).toBe(480)
    expect(spanMinutes(null, null)).toBeNull()
  })
})

describe('isWithinSchedule (mirrors ShiftChecker.IsWithinSchedule)', () => {
  const dayShift = [{ dayOfWeek: 1, startTime: 8 * 3600, endTime: 18 * 3600 }]
  const nightShift = [{ dayOfWeek: 1, startTime: 22 * 3600, endTime: 6 * 3600 }]

  it('accepts an instant inside a same-day span', () => {
    expect(isWithinSchedule(dayShift, 1, 12 * 3600)).toBe(true)
  })

  it('rejects an instant outside a same-day span', () => {
    expect(isWithinSchedule(dayShift, 1, 7 * 3600)).toBe(false)
    expect(isWithinSchedule(dayShift, 1, 19 * 3600)).toBe(false)
  })

  it('rejects the right time on the wrong day', () => {
    expect(isWithinSchedule(dayShift, 2, 12 * 3600)).toBe(false)
  })

  it('accepts the evening half of an overnight shift on its own day', () => {
    expect(isWithinSchedule(nightShift, 1, 23 * 3600)).toBe(true)
  })

  it('accepts the morning half of an overnight shift on the following day', () => {
    // Monday 22:00 → 06:00 covers Tuesday 05:00.
    expect(isWithinSchedule(nightShift, 2, 5 * 3600)).toBe(true)
    expect(isWithinSchedule(nightShift, 2, 7 * 3600)).toBe(false)
  })

  it('wraps the week boundary: a Sunday night shift covers Monday morning', () => {
    const sundayNight = [{ dayOfWeek: 7, startTime: 22 * 3600, endTime: 6 * 3600 }]
    expect(isWithinSchedule(sundayNight, 1, 5 * 3600)).toBe(true)
  })

  it('ignores an entry missing either endpoint', () => {
    expect(isWithinSchedule([{ dayOfWeek: 1, startTime: 8 * 3600, endTime: null }], 1, 12 * 3600)).toBe(
      false
    )
    expect(isWithinSchedule([{ dayOfWeek: 1, startTime: null, endTime: 18 * 3600 }], 1, 12 * 3600)).toBe(
      false
    )
  })

  it('treats an empty schedule as covering nothing', () => {
    expect(isWithinSchedule([], 1, 12 * 3600)).toBe(false)
  })
})
