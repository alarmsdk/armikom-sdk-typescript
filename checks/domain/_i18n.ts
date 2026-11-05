/**
 * A `t` that is its own inverse: the key, plus the params when there are any. The checks that
 * build operator-facing text compare against the same `t`, so they assert which keys and params
 * were used, never a copy string (Rule 50: UI copy is localised data and changes freely).
 */
export function t(key: string, params?: Record<string, unknown>): string {
  return params ? `${key}${JSON.stringify(params)}` : key;
}
