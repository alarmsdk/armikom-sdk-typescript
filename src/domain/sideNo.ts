/**
 * Formats a subscriber number for display.
 *
 * The database stores `sideNo` (int) and `partNo` (int) separately.
 * When `partNo` is 0 or absent the subscriber has no partition and the
 * display should read just the side number (e.g. "2345"), not "2345-0".
 *
 * When `partNo` > 0 the separator is included: "2345-2".
 */
export function formatSideNo(
  sideNo: number | string | null | undefined,
  partNo?: number | string | null
): string {
  if (sideNo == null || sideNo === '') return ''

  const part = Number(partNo)
  if (part && Number.isFinite(part)) {
    return `${sideNo}-${part}`
  }
  return String(sideNo)
}
