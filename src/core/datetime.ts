/**
 * Centralised timestamp formatting for an operator console (§01 §5, V6 / P9).
 *
 * Every API timestamp is an absolute UTC instant (see `text.ts` for how an offset-less wire
 * value is labelled as one). It is *displayed* in the operator's configured zone — an IANA id
 * the host application resolves once, from its build or runtime configuration — and never in
 * whatever zone the browser happens to be in. The zone is a constructor argument rather than
 * ambient state (§01 B-3), so a React or Angular console configures it the same way the Vue
 * console does, and a test can pin it.
 *
 * Subscriber-relative times (a closing delay, a timetable) still resolve the subscriber's own
 * zone chain (`Side → Customer → MC`) through `formatInZone`; the formatter's zone is the
 * *operator* display zone used by grids, detail views and registers.
 */

/**
 * Common Windows → IANA timezone mapping.
 *
 * The database stores Windows timezone IDs (e.g. "Turkey Standard Time") because the original
 * apps are .NET and use `TimeZoneInfo`. `Intl.DateTimeFormat` only accepts IANA ids. This map
 * covers the zones actually used in production monitoring centres; a value that is already an
 * IANA id (contains '/') passes through unchanged.
 */
export const WINDOWS_TO_IANA: Record<string, string> = {
  'Turkey Standard Time': 'Europe/Istanbul',
  'Azerbaijan Standard Time': 'Asia/Baku',
  'Georgian Standard Time': 'Asia/Tbilisi',
  'Arabic Standard Time': 'Asia/Baghdad',
  'Arab Standard Time': 'Asia/Riyadh',
  'E. Europe Standard Time': 'Europe/Chisinau',
  'GTB Standard Time': 'Europe/Bucharest',
  'FLE Standard Time': 'Europe/Kiev',
  'Russian Standard Time': 'Europe/Moscow',
  'Jordan Standard Time': 'Asia/Amman',
  'Middle East Standard Time': 'Asia/Beirut',
  'Egypt Standard Time': 'Africa/Cairo',
  'Libya Standard Time': 'Africa/Tripoli',
  'Iran Standard Time': 'Asia/Tehran',
  'Pakistan Standard Time': 'Asia/Karachi',
  'Central Europe Standard Time': 'Europe/Budapest',
  'Central European Standard Time': 'Europe/Warsaw',
  'W. Europe Standard Time': 'Europe/Berlin',
  'Romance Standard Time': 'Europe/Paris',
  'GMT Standard Time': 'Europe/London',
  UTC: 'UTC',
};

/**
 * Normalise a timezone identifier for use with `Intl.DateTimeFormat`.
 *
 * Accepts both IANA ids ("Europe/Istanbul") and Windows ids ("Turkey Standard Time"). Returns
 * the IANA id, or `null` when the input is unknown — callers fall back to UTC and label it (V6).
 */
export function normalizeTimeZone(tz: string | null | undefined): string | null {
  if (!tz) return null;
  if (tz.includes('/') || tz === 'UTC') return tz;
  return WINDOWS_TO_IANA[tz] ?? null;
}

/** A `Date`, an ISO string or anything `new Date()` reads → `Date`, or null when unreadable or empty. */
export function toDate(value: unknown): Date | null {
  if (value === null || value === undefined || value === '') return null;
  const date = value instanceof Date ? value : new Date(value as string);
  return Number.isNaN(date.getTime()) ? null : date;
}

export interface Countdown {
  /** Whole minutes remaining; counts up again once the instant has passed. */
  minutes: number;
  seconds: number;
  expired: boolean;
}

/** Time remaining until `value`, relative to `now` (milliseconds since the epoch). */
export function countdownTo(value: unknown, now: number): Countdown | null {
  const date = toDate(value);
  if (!date) return null;
  const deltaMs = date.getTime() - now;
  const expired = deltaMs <= 0;
  const absSeconds = Math.floor(Math.abs(deltaMs) / 1000);
  return {
    minutes: Math.floor(absSeconds / 60),
    seconds: absSeconds % 60,
    expired,
  };
}

export interface DateTimeFormatterOptions {
  /** IANA id the operator sees times in. Defaults to UTC, which is at least honest. */
  timeZone?: string;
  /** BCP 47 tag for digit order and separators. Defaults to `tr-TR` (dd.MM.yyyy HH:mm:ss). */
  locale?: string;
}

export interface DateTimeFormatter {
  readonly timeZone: string;
  readonly locale: string;
  /** Full date+time in the operator zone. Used by most grids and detail views. */
  formatDateTime(value: unknown): string;
  /**
   * Time only when the instant falls on today (in the operator zone), otherwise full date+time.
   * For alarm queues, where today's events dominate and the date is visual noise.
   */
  formatDateTimeSmart(value: unknown, now?: Date): string;
  /** Date+time without seconds. Detail lists and forms. */
  formatDateTimeShort(value: unknown): string;
  formatDate(value: unknown): string;
  formatTime(value: unknown): string;
  /** Absolute instant, always in UTC and always labelled. Registers, and anywhere the label is a safety matter. */
  formatUtc(value: unknown): string | null;
  /**
   * Format in a specific zone (subscriber-relative display). Accepts IANA and Windows ids; an
   * unknown zone falls back to labelled UTC rather than to the operator zone.
   */
  formatInZone(value: unknown, timeZone: string): string;
}

const DATE_PARTS: Intl.DateTimeFormatOptions = { day: '2-digit', month: '2-digit', year: 'numeric' };
const TIME_PARTS: Intl.DateTimeFormatOptions = { hour: '2-digit', minute: '2-digit', second: '2-digit' };
const SHORT_TIME_PARTS: Intl.DateTimeFormatOptions = { hour: '2-digit', minute: '2-digit' };

/**
 * Builds the formatter once per application, with the operator zone resolved by the host.
 * The Vue console reads it from `window.__APP_CONFIG__.timeZone` / `VITE_TIMEZONE`; an
 * Angular or React console does the equivalent and hands the result in here.
 */
export function createDateTimeFormatter(options: DateTimeFormatterOptions = {}): DateTimeFormatter {
  const timeZone = options.timeZone ?? 'UTC';
  const locale = options.locale ?? 'tr-TR';

  const fmt = (parts: Intl.DateTimeFormatOptions, zone = timeZone) =>
    new Intl.DateTimeFormat(locale, { ...parts, timeZone: zone });

  const dateTime = fmt({ ...DATE_PARTS, ...TIME_PARTS });
  const date = fmt(DATE_PARTS);
  const time = fmt(TIME_PARTS);
  const dateTimeShort = fmt({ ...DATE_PARTS, ...SHORT_TIME_PARTS });
  const utc = fmt({ ...DATE_PARTS, ...TIME_PARTS }, 'UTC');

  const formatUtc = (value: unknown): string | null => {
    const d = toDate(value);
    return d ? `${utc.format(d)} UTC` : null;
  };

  return {
    timeZone,
    locale,
    formatDateTime(value) {
      const d = toDate(value);
      return d ? dateTime.format(d) : '';
    },
    formatDateTimeSmart(value, now = new Date()) {
      const d = toDate(value);
      if (!d) return '';
      return date.format(d) === date.format(now) ? time.format(d) : dateTime.format(d);
    },
    formatDateTimeShort(value) {
      const d = toDate(value);
      return d ? dateTimeShort.format(d) : '';
    },
    formatDate(value) {
      const d = toDate(value);
      return d ? date.format(d) : '';
    },
    formatTime(value) {
      const d = toDate(value);
      return d ? time.format(d) : '';
    },
    formatUtc,
    formatInZone(value, zone) {
      const d = toDate(value);
      if (!d) return '';
      const iana = normalizeTimeZone(zone);
      if (!iana) return formatUtc(value) ?? '';
      try {
        return fmt({ ...DATE_PARTS, ...SHORT_TIME_PARTS }, iana).format(d);
      } catch {
        return formatUtc(value) ?? '';
      }
    },
  };
}
