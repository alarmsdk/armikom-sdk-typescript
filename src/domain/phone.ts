/**
 * Phone number display formatter.
 *
 * Storage format: 10-digit local number (e.g. "5551234567")
 * Display format: "(555) 123 45 67"
 *
 * Numbers that are not exactly 10 digits are returned as-is.
 */
export function formatPhone(phone: string | null | undefined): string {
  if (!phone) return ''
  const digits = phone.replace(/\D/g, '')
  if (digits.length !== 10) return phone
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)} ${digits.slice(6, 8)} ${digits.slice(8, 10)}`
}

/**
 * Strip a phone string to its normalised 10-digit local form for storage.
 * Handles +90, 0090, or leading-0 prefixes.
 * Numbers shorter than 10 digits are returned as-is (stripped of non-digits).
 */
export function normalizePhone(phone: string | null | undefined): string {
  if (!phone) return ''
  let digits = phone.replace(/\D/g, '')
  if (digits.length < 10) return digits

  if (digits.startsWith('90') && digits.length === 12) digits = digits.slice(2)
  else if (digits.startsWith('0090') && digits.length === 14) digits = digits.slice(4)
  else if (digits.startsWith('0') && digits.length === 11) digits = digits.slice(1)

  return digits
}

/**
 * A search box entry reduced to the form phones are stored in, so "0532 373 19 86" or
 * "+90 (532) 373-1986" matches the stored "5323731986". Mirrors the API's own search
 * normalisation (the server does it too; this keeps an older API answering the same way).
 * Anything with a letter is a name and is only trimmed. A partial number loses its trunk
 * zero, which the stored form never carries.
 */
export function normalizePhoneSearch(query: string): string {
  const trimmed = query.trim()
  if (!/^[\d\s+()\-./]*\d[\d\s+()\-./]*$/.test(trimmed)) return trimmed

  const digits = trimmed.replace(/\D/g, '')
  if (digits.length >= 10) return digits.slice(-10)

  const withoutTrunk = digits.replace(/^0+/, '')
  return withoutTrunk || digits
}
