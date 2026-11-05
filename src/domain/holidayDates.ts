/**
 * Calendar-date helpers for holidays.
 *
 * A holiday is a calendar date, not an instant: the server stores `StartDate` as a bare
 * midnight with no zone conversion (D21), and the Engine compares it with the subscriber's
 * wall-clock day. After the G-74 middleware that midnight arrives as a `Date` at 00:00 UTC,
 * so every helper here reads UTC components. Reading local components would move a holiday
 * to the previous day for any operator west of Greenwich.
 */

const ISO_DATE = /^(\d{4})-(\d{2})-(\d{2})/

/** Longest span the range builder expands. Longer than any real holiday, short enough to catch a typo'd year. */
export const MAX_RANGE_DAYS = 31

/** `YYYY-MM-DD` for a server date, a `Date`, or an ISO string; `''` when unreadable. */
export function toIsoDate(value: unknown): string {
  if (value === null || value === undefined || value === '') return ''
  if (typeof value === 'string') {
    const match = ISO_DATE.exec(value)
    if (match) return `${match[1]}-${match[2]}-${match[3]}`
  }
  const date = value instanceof Date ? value : new Date(value as string)
  if (Number.isNaN(date.getTime())) return ''
  return date.toISOString().slice(0, 10)
}

/** `MM-DD`, the key the Engine matches recurring and reference holidays on. */
export function monthDay(value: unknown): string {
  return toIsoDate(value).slice(5)
}

/** The wire value for a calendar date: midnight UTC, which the server stores verbatim. */
export function toWireDate(iso: string): Date {
  return new Date(`${iso}T00:00:00Z`)
}

/**
 * The server's duplicate rule for `SideHoliday` (`SIDE_HOLIDAY.DUPLICATE`): same date and
 * same `recurring` flag. Bulk create rejects the whole batch on one duplicate, so callers
 * filter with this key before sending.
 */
export function holidayKey(date: unknown, recurring: boolean | null | undefined): string {
  return `${toIsoDate(date)}|${recurring ? '1' : '0'}`
}

/** Today's calendar date in an IANA zone; UTC when the zone is missing or unknown. */
export function todayIn(timeZone: string | null | undefined, now: Date = new Date()): string {
  if (timeZone) {
    try {
      const parts = new Intl.DateTimeFormat('en-CA', {
        timeZone,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      }).formatToParts(now)
      const get = (type: string) => parts.find((p) => p.type === type)?.value
      const y = get('year')
      const m = get('month')
      const d = get('day')
      if (y && m && d) return `${y}-${m}-${d}`
    } catch {
      // An unknown zone falls through to UTC, which is labelled as such by the caller.
    }
  }
  return now.toISOString().slice(0, 10)
}

function isValidIso(iso: string): boolean {
  const date = toWireDate(iso)
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === iso
}

/**
 * The next date on or after `today` the holiday falls on, or `null` when a one-off holiday
 * has passed. Recurring holidays match month and day, as the Engine does; a 29 February
 * holiday recurs only in leap years for the same reason.
 */
export function nextOccurrence(date: unknown, recurring: boolean | null | undefined, today: string): string | null {
  const iso = toIsoDate(date)
  if (!iso) return null
  if (!recurring) return iso >= today ? iso : null
  const md = iso.slice(5)
  const year = Number(today.slice(0, 4))
  for (let y = year; y <= year + 8; y++) {
    const candidate = `${y}-${md}`
    if (isValidIso(candidate) && candidate >= today) return candidate
  }
  return null
}

/** Whole days from `today` to `iso`, both calendar dates. */
export function daysUntil(iso: string, today: string): number {
  return Math.round((toWireDate(iso).getTime() - toWireDate(today).getTime()) / 86_400_000)
}

/**
 * Every date from `from` to `to` inclusive. `SideHoliday` has no end date, so a three-day
 * holiday is three rows; this is what turns "Kurban Bayramı, 4 days" into those rows.
 * Returns `null` for a reversed, unreadable or over-long range.
 */
export function expandRange(from: string, to: string): string[] | null {
  if (!isValidIso(from) || !isValidIso(to) || to < from) return null
  const days: string[] = []
  const cursor = toWireDate(from)
  const end = toWireDate(to).getTime()
  while (cursor.getTime() <= end) {
    days.push(cursor.toISOString().slice(0, 10))
    if (days.length > MAX_RANGE_DAYS) return null
    cursor.setUTCDate(cursor.getUTCDate() + 1)
  }
  return days
}

/** A calendar date for display. UTC on purpose: it is a date, not an instant. */
export function formatCalendarDate(iso: string, locale = 'tr-TR'): string {
  if (!iso) return ''
  return new Intl.DateTimeFormat(locale, {
    timeZone: 'UTC',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).format(toWireDate(iso))
}

/** Day and month only, for recurring holidays where the stored year carries no meaning. */
export function formatMonthDay(iso: string, locale = 'tr-TR'): string {
  if (!iso) return ''
  return new Intl.DateTimeFormat(locale, { timeZone: 'UTC', day: '2-digit', month: 'long' }).format(
    toWireDate(iso)
  )
}

/** Sort key for a calendar view: month and day first, so the year a row was entered in does not scatter it. */
export function compareByMonthDay(a: unknown, b: unknown): number {
  return monthDay(a).localeCompare(monthDay(b)) || toIsoDate(a).localeCompare(toIsoDate(b))
}
