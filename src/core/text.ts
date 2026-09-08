/**
 * §01 §9 "Turkish casing hazard" / C-14.
 *
 * `ClientConfigResponse.forceUppercase` makes the operator console upper-case
 * what the operator types. In Turkish, `i` upper-cases to `İ` and `ı`
 * upper-cases to `I`; `"ilk".toUpperCase()` gives `"ILK"`, which is a different
 * word. Getting this wrong corrupts subscriber names on save — it is a data
 * bug, not a display bug.
 *
 * `toLocaleUpperCase('tr')` is correct on a full-ICU runtime, but Node can be
 * built with small-icu and then silently falls back to the invariant mapping.
 * The dotted/dotless pairs are therefore mapped explicitly first, so the result
 * does not depend on how the runtime was compiled.
 */

const DOTTED_LOCALES = /^(tr|az)\b/i;

export function toUpperCulture(value: string, culture?: string): string {
  if (!value) return value;
  if (culture && DOTTED_LOCALES.test(culture)) {
    return value.replace(/i/g, 'İ').replace(/ı/g, 'I').toLocaleUpperCase(culture);
  }
  return culture ? value.toLocaleUpperCase(culture) : value.toUpperCase();
}

export function toLowerCulture(value: string, culture?: string): string {
  if (!value) return value;
  if (culture && DOTTED_LOCALES.test(culture)) {
    return value.replace(/I/g, 'ı').replace(/İ/g, 'i').toLocaleLowerCase(culture);
  }
  return culture ? value.toLocaleLowerCase(culture) : value.toLowerCase();
}

/**
 * ISO-8601 date-time carrying no zone designator. Deliberately strict:
 *  - a plain date (`2026-08-20`) is left alone; ECMAScript already reads it as UTC
 *  - anything ending in `Z` or `±HH:MM` is unambiguous and is left alone
 */
const OFFSETLESS_ISO = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2}(\.\d+)?)?$/;

export function isOffsetlessInstant(value: unknown): value is string {
  return typeof value === 'string' && OFFSETLESS_ISO.test(value);
}

/**
 * §01 R-4 — labels an offset-less wire timestamp as the UTC it actually is.
 *
 * **The API sends these.** Verified against a live instance on 2026-08-20 by
 * the Vue console: every timestamp sampled came back as
 * `"2026-08-20T19:09:48.991674"` — no offset, no `Z`. `new Date(value)` then
 * reads it in the *host* zone, which under `Europe/Istanbul` is three hours
 * early, and under a UTC CI host is silently correct — which is why no test
 * ever caught it. Alarm age, lock age, signal time and every countdown in the
 * console were wrong by the host offset.
 *
 * R-4 says the wire is UTC, so appending `Z` is the reading the contract
 * intends. Applying it twice is impossible: a value that already carries a
 * designator does not match.
 */
export function markInstantUtc(value: string): string {
  return isOffsetlessInstant(value) ? `${value}Z` : value;
}

/**
 * Walks a parsed JSON body and labels every offset-less timestamp as UTC.
 *
 * This is the response-side half of R-4, and it has to happen *before* the
 * generated `FromJSON` runs: after that the value is already a shifted `Date`
 * and the original text is gone.
 */
export function markTimestampsUtc<T>(value: T): T {
  if (isOffsetlessInstant(value)) return `${value}Z` as unknown as T;
  if (Array.isArray(value)) return value.map(markTimestampsUtc) as unknown as T;
  if (value && typeof value === 'object') {
    const out: Record<string, unknown> = {};
    for (const [key, item] of Object.entries(value as Record<string, unknown>)) {
      out[key] = markTimestampsUtc(item);
    }
    return out as unknown as T;
  }
  return value;
}

/**
 * §01 R-4 / C-09 — parses a wire timestamp to an absolute instant.
 *
 * Strict by default: an offset-less value returns null rather than being read
 * in the host zone. Pass `{ assumeUtc: true }` to accept one as the UTC the
 * contract says it is — which is what the response pipeline does, because the
 * API sends them (see `markInstantUtc`). The strict form stays the default so
 * that a value reaching this function by another route still has to say what
 * zone it is in.
 */
export function parseInstant(
  value: string | null | undefined,
  options: { assumeUtc?: boolean } = {},
): Date | null {
  if (!value) return null;
  const trimmed = value.trim();
  const labelled = /[zZ]$|[+-]\d{2}:?\d{2}$/.test(trimmed)
    ? trimmed
    : options.assumeUtc && isOffsetlessInstant(trimmed)
      ? `${trimmed}Z`
      : null;
  if (labelled === null) return null;
  const parsed = new Date(labelled);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export function parseInstantOrThrow(value: string, field = 'timestamp'): Date {
  const parsed = parseInstant(value);
  if (!parsed) {
    throw new RangeError(`${field} is not a UTC ISO-8601 instant: ${JSON.stringify(value)}`);
  }
  return parsed;
}

export function toIsoInstant(value: Date): string {
  return value.toISOString();
}

/**
 * §01 R-5 — ids are GUIDs as strings, and the SDK must not assume a canonical
 * casing or dash format when comparing.
 */
export function guidEquals(left: string | null | undefined, right: string | null | undefined): boolean {
  if (!left || !right) return false;
  return normalizeGuid(left) === normalizeGuid(right);
}

export function normalizeGuid(value: string): string {
  return value.replace(/[{}\s-]/g, '').toLowerCase();
}
