const HEX_PATTERN = /^#[0-9a-fA-F]{6}$/

/**
 * Legacy DevExpress/WinForms colour names found in the database, mapped to CSS hex.
 * Mirrors the server-side HexColor.NamedColors dictionary (Armikom.Api.Domain.Sides.HexColor).
 */
const NAMED_COLORS: Record<string, string> = {
  aqua: '#00FFFF',
  background: '#FFFFFF',
  black: '#000000',
  blue: '#0000FF',
  btnshadow: '#A0A0A0',
  btntext: '#000000',
  cream: '#FFFDD0',
  darkgreen: '#006400',
  fuchsia: '#FF00FF',
  gray: '#808080',
  green: '#008000',
  lime: '#00FF00',
  maroon: '#800000',
  medgray: '#A0A0A0',
  moneygreen: '#C0DCC0',
  navy: '#000080',
  nullcolor: '#FFFFFF',
  orange: '#FFA500',
  purple: '#800080',
  red: '#FF0000',
  silver: '#C0C0C0',
  skyblue: '#87CEEB',
  teal: '#008080',
  white: '#FFFFFF',
  window: '#FFFFFF',
  yellow: '#FFFF00',
}

/**
 * Normalises a colour value to #RRGGBB hex format.
 * Accepts hex codes (returned as-is), known named colours, and null/empty (returned as null).
 * Unknown names are returned as-is so the server can reject them with a clear error.
 */
export function normalizeColor(value: string | null | undefined): string | null {
  if (value == null || value === '') return null
  if (HEX_PATTERN.test(value)) return value
  return NAMED_COLORS[value.toLowerCase()] ?? value
}

export function isValidHexColor(value: string | null | undefined): boolean {
  return value == null || value === '' || HEX_PATTERN.test(value)
}

/**
 * Reads what an operator types or pastes into a colour field: `#RRGGBB`,
 * `RRGGBB`, the `#RGB` shorthand, or a legacy WinForms name. Returns
 * `#RRGGBB`, or null when the text is not (yet) a colour.
 */
export function parseColorInput(value: string | null | undefined): string | null {
  if (value == null) return null
  const text = value.trim()
  if (text === '') return null
  const named = NAMED_COLORS[text.toLowerCase()]
  if (named) return named
  const match = /^#?([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.exec(text)
  if (!match?.[1]) return null
  const hex = match[1].length === 3 ? match[1].replace(/./g, (c) => c + c) : match[1]
  return `#${hex.toUpperCase()}`
}
