/**
 * Checksums for Turkish identity and tax numbers, so a mistyped digit is caught at
 * entry rather than on the first invoice. Both checks ignore surrounding spaces; an
 * empty value is not checked here (the fields are optional).
 */

function digits(value: string): number[] | null {
  const s = value.trim()
  return /^\d+$/.test(s) ? Array.from(s, Number) : null
}

/** `d[i]` for an index the length check above already proved present. */
const nth = (d: number[], i: number): number => d[i] as number

/** T.C. Kimlik No: 11 digits, no leading zero, two check digits. */
export function isValidTcKimlikNo(value: string): boolean {
  const d = digits(value)
  if (!d || d.length !== 11 || d[0] === 0) return false
  const odd = nth(d, 0) + nth(d, 2) + nth(d, 4) + nth(d, 6) + nth(d, 8)
  const even = nth(d, 1) + nth(d, 3) + nth(d, 5) + nth(d, 7)
  if ((((odd * 7 - even) % 10) + 10) % 10 !== d[9]) return false
  return d.slice(0, 10).reduce((a, b) => a + b, 0) % 10 === d[10]
}

/** Vergi Kimlik No (VKN): 10 digits, the last a check digit. */
export function isValidVergiNo(value: string): boolean {
  const d = digits(value)
  if (!d || d.length !== 10) return false
  let sum = 0
  for (let i = 0; i < 9; i++) {
    const tmp = (nth(d, i) + 9 - i) % 10
    sum += tmp === 9 ? 9 : (tmp * 2 ** (9 - i)) % 9
  }
  return (10 - (sum % 10)) % 10 === d[9]
}

/** A tax number field holds a VKN for companies and a TCKN for individuals. */
export function isValidTaxNo(value: string): boolean {
  return isValidVergiNo(value) || isValidTcKimlikNo(value)
}
