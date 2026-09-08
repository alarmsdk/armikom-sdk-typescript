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
 * §01 R-4 / C-09 — parses a wire timestamp to an absolute instant, and refuses
 * an offset-less one.
 *
 * `new Date("2026-08-16T11:22:33")` is read in the *host* zone. Under
 * `TZ=Europe/Istanbul` that is three hours away from what the server meant, and
 * under `TZ=UTC` — which is what CI usually runs — the bug is invisible. Every
 * wire value is UTC ISO-8601, so a value without a zone is a contract
 * violation, and the SDK says so instead of quietly shifting it.
 */
export function parseInstant(value: string | null | undefined): Date | null {
  if (!value) return null;
  if (!/[zZ]$|[+-]\d{2}:?\d{2}$/.test(value.trim())) return null;
  const parsed = new Date(value);
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
