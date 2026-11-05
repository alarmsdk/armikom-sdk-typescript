/**
 * Work-schedule time conversions (S-810).
 *
 * Two conventions from the API that are easy to get wrong, and both were confirmed
 * against `ShiftChecker.cs` rather than inferred from the screen contract:
 *
 *  - `dayOfWeek` is **EDayOfWeek**: Monday = 1 … Saturday = 6, **Sunday = 7**.
 *    `Date.getDay()` gives Sunday = 0, so the two never line up by accident (Pitfall 7).
 *  - `startTime` / `endTime` are **seconds of day**, as on `SideTimeTable` — not
 *    minutes, and not a time string (Pitfall 6).
 *
 * An entry whose end is at or before its start is an **overnight** span: the API
 * treats 22:00 → 06:00 as running into the following day. It is a supported shape,
 * not a validation error, so nothing here rejects it.
 */

/** EDayOfWeek values in display order, Monday first — the order a rota is read in. */
export const E_DAYS_OF_WEEK = [1, 2, 3, 4, 5, 6, 7] as const

/** Localization keys for EDayOfWeek, indexed by the EDayOfWeek value itself. */
const E_DAY_KEYS: Record<number, string> = {
  1: 'ENUM.DayOfWeek.Monday',
  2: 'ENUM.DayOfWeek.Tuesday',
  3: 'ENUM.DayOfWeek.Wednesday',
  4: 'ENUM.DayOfWeek.Thursday',
  5: 'ENUM.DayOfWeek.Friday',
  6: 'ENUM.DayOfWeek.Saturday',
  7: 'ENUM.DayOfWeek.Sunday'
}

export function eDayKey(dayOfWeek: number): string {
  return E_DAY_KEYS[dayOfWeek] ?? String(dayOfWeek)
}

/** `Date.getDay()` (Sunday = 0) → EDayOfWeek (Sunday = 7). */
export function toEDayOfWeek(jsDay: number): number {
  return jsDay === 0 ? 7 : jsDay
}

/**
 * Seconds of day → `HH:mm` for an `<input type="time">`.
 * Returns `''` for null, which is how "this day has no shift" is represented.
 */
export function secondsToTimeInput(seconds: number | null | undefined): string {
  if (seconds === null || seconds === undefined) return ''
  const total = Math.max(0, Math.floor(seconds))
  const hours = Math.floor(total / 3600) % 24
  const minutes = Math.floor((total % 3600) / 60)
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`
}

/**
 * `HH:mm` → seconds of day. Returns null for empty input, so an untouched day is
 * sent as a genuine "no shift" rather than as midnight.
 */
export function timeInputToSeconds(value: string | null | undefined): number | null {
  if (!value) return null
  const match = /^(\d{1,2}):(\d{2})$/.exec(value.trim())
  if (!match) return null
  const hours = Number(match[1])
  const minutes = Number(match[2])
  if (hours > 23 || minutes > 59) return null
  return hours * 3600 + minutes * 60
}

/**
 * True when the span wraps past midnight. Equal times are treated as overnight
 * because that is what `ShiftChecker` does: it takes the `else` branch whenever
 * `end > start` is false.
 */
export function isOvernight(startSeconds: number | null, endSeconds: number | null): boolean {
  if (startSeconds === null || endSeconds === null) return false
  return endSeconds <= startSeconds
}

/** Duration in minutes, counting an overnight span across the midnight boundary. */
export function spanMinutes(startSeconds: number | null, endSeconds: number | null): number | null {
  if (startSeconds === null || endSeconds === null) return null
  const dayInSeconds = 24 * 3600
  const delta = isOvernight(startSeconds, endSeconds)
    ? dayInSeconds - startSeconds + endSeconds
    : endSeconds - startSeconds
  return Math.round(delta / 60)
}

/**
 * Mirrors `ShiftChecker.IsWithinSchedule` so the UI can say whether a schedule
 * covers a given instant without asking the server.
 *
 * This is a convenience for display only — the server's answer is the one that
 * decides what scopes a token carries, and this must never be used to enable a
 * write the server would refuse.
 */
export function isWithinSchedule(
  entries: Array<{ dayOfWeek?: number; startTime?: number | null; endTime?: number | null }>,
  eDay: number,
  secondsOfDay: number
): boolean {
  for (const entry of entries) {
    const { dayOfWeek, startTime, endTime } = entry
    if (startTime === null || startTime === undefined) continue
    if (endTime === null || endTime === undefined) continue

    if (endTime > startTime) {
      if (dayOfWeek === eDay && secondsOfDay >= startTime && secondsOfDay <= endTime) return true
    } else {
      // Overnight: the tail belongs to the following day.
      if (dayOfWeek === eDay && secondsOfDay >= startTime) return true
      const previousDay = eDay === 1 ? 7 : eDay - 1
      if (dayOfWeek === previousDay && secondsOfDay <= endTime) return true
    }
  }
  return false
}

/**
 * "HH:mm" moved by a number of minutes, wrapping round midnight. Null when either side is
 * missing — an early-open time without an opening time is not a time.
 */
export function shiftTime(time: string | null | undefined, minutes: number | null | undefined): string | null {
  if (!time || minutes === null || minutes === undefined) return null
  const match = /^(\d{1,2}):(\d{2})/.exec(time)
  if (!match) return null
  const total = (((Number(match[1]) * 60 + Number(match[2]) + minutes) % 1440) + 1440) % 1440
  return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`
}
