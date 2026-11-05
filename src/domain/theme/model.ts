import {
  ACCENT_PALETTES,
  COLOR_TOKENS,
  COLOR_TOKEN_BY_KEY,
  DEFAULT_ACCENT,
  DEFAULT_NEUTRAL,
  NEUTRAL_PALETTES,
  SHADES,
  SIZE_TOKENS,
  SIZE_TOKEN_BY_KEY,
  findPalette,
  hexToTriplet,
  type ThemeMode
} from './tokens.js'

/**
 * A console theme as stored (D88): `ApiUiLayout` row, screen `ui-theme`, one pool entry per
 * theme. Everything is optional; a missing value means "as shipped".
 */
export interface ThemeDefinition {
  schema: 1
  id: string
  name: string
  description?: string
  neutral?: string
  accent?: string
  light?: Record<string, string>
  dark?: Record<string, string>
  sizes?: Record<string, string>
  updatedAt?: string
}

export const THEME_SCHEMA = 1
export const BUILTIN_PREFIX = 'builtin:'
export const DEFAULT_THEME_ID = `${BUILTIN_PREFIX}default`

export function isBuiltinTheme(id: string): boolean {
  return id.startsWith(BUILTIN_PREFIX)
}

const HEX = /^#[0-9a-fA-F]{6}$/
const MAX_NAME = 80
const MAX_DESCRIPTION = 300

function cleanColors(raw: unknown): Record<string, string> | undefined {
  if (!raw || typeof raw !== 'object') return undefined
  const out: Record<string, string> = {}
  for (const [key, value] of Object.entries(raw as Record<string, unknown>)) {
    if (COLOR_TOKEN_BY_KEY.has(key) && typeof value === 'string' && HEX.test(value)) out[key] = value.toLowerCase()
  }
  return Object.keys(out).length ? out : undefined
}

function cleanSizes(raw: unknown): Record<string, string> | undefined {
  if (!raw || typeof raw !== 'object') return undefined
  const out: Record<string, string> = {}
  for (const [key, value] of Object.entries(raw as Record<string, unknown>)) {
    const token = SIZE_TOKEN_BY_KEY.get(key)
    if (token && typeof value === 'string' && token.options.includes(value)) out[key] = value
  }
  return Object.keys(out).length ? out : undefined
}

/**
 * Reads a stored theme, keeping only known tokens with allowed values.
 *
 * This is what makes it safe to turn a theme into CSS text: an unknown key, a colour that is
 * not `#rrggbb` or a size outside its list is dropped, never interpolated.
 */
export function parseTheme(raw: unknown, id: string): ThemeDefinition | null {
  let value = raw
  if (typeof value === 'string') {
    try {
      value = JSON.parse(value)
    } catch {
      return null
    }
  }
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null
  const v = value as Record<string, unknown>
  const name = typeof v.name === 'string' && v.name.trim() ? v.name.trim().slice(0, MAX_NAME) : id
  const theme: ThemeDefinition = { schema: THEME_SCHEMA, id, name }
  if (typeof v.description === 'string' && v.description.trim()) theme.description = v.description.trim().slice(0, MAX_DESCRIPTION)
  if (typeof v.neutral === 'string' && NEUTRAL_PALETTES.some((p) => p.id === v.neutral)) theme.neutral = v.neutral
  if (typeof v.accent === 'string' && ACCENT_PALETTES.some((p) => p.id === v.accent)) theme.accent = v.accent
  const light = cleanColors(v.light)
  const dark = cleanColors(v.dark)
  const sizes = cleanSizes(v.sizes)
  if (light) theme.light = light
  if (dark) theme.dark = dark
  if (sizes) theme.sizes = sizes
  if (typeof v.updatedAt === 'string') theme.updatedAt = v.updatedAt
  return theme
}

/** The JSON stored on the server: the theme without its id (the template id is the id). */
export function serializeTheme(theme: ThemeDefinition): string {
  const { id: _id, updatedAt: _updatedAt, ...rest } = parseTheme(theme, theme.id) ?? theme
  return JSON.stringify(rest)
}

/**
 * Shipped themes. They cannot be edited or deleted, only duplicated, so every tenant always has
 * the console's own look to fall back on.
 */
export const BUILTIN_THEMES: ThemeDefinition[] = [
  { schema: 1, id: DEFAULT_THEME_ID, name: 'Armikom' },
  {
    schema: 1,
    id: `${BUILTIN_PREFIX}compact`,
    name: 'Compact',
    sizes: {
      'grid-cell-py': '0.125rem',
      'grid-cell-px': '0.375rem',
      'grid-header-py': '0.25rem',
      'grid-font-size': '0.75rem',
      'grid-header-font-size': '0.625rem',
      'qc-row-py': '0.125rem',
      'qc-row-px': '0.5rem',
      'qc-gap': '0'
    }
  },
  {
    schema: 1,
    id: `${BUILTIN_PREFIX}comfortable`,
    name: 'Comfortable',
    sizes: {
      'grid-cell-py': '0.625rem',
      'grid-cell-px': '0.75rem',
      'grid-header-py': '0.5rem',
      'grid-font-size': '0.9375rem',
      'grid-header-font-size': '0.75rem',
      'qc-row-py': '0.75rem',
      'qc-row-px': '1rem',
      'qc-gap': '0.5rem'
    }
  },
  {
    schema: 1,
    id: `${BUILTIN_PREFIX}contrast`,
    name: 'High contrast grids',
    light: {
      'grid-header-bg': '#e2e8f0',
      'grid-header-text': '#0f172a',
      'grid-border': '#94a3b8',
      'grid-vline': '#cbd5e1',
      'grid-stripe': '#f1f5f9',
      'text-muted': '#475569'
    },
    dark: {
      'grid-header-bg': '#1e293b',
      'grid-header-text': '#f8fafc',
      'grid-border': '#64748b',
      'grid-vline': '#334155',
      'grid-stripe': '#0f172a',
      'text-muted': '#cbd5e1'
    },
    sizes: { 'grid-header-transform': 'none', 'grid-header-weight': '700' }
  }
]

/** Names of the built-in themes are shown translated. */
export const BUILTIN_NAME_KEYS: Record<string, string> = {
  [DEFAULT_THEME_ID]: 'UI.THEMES.BUILTIN_DEFAULT',
  [`${BUILTIN_PREFIX}compact`]: 'UI.THEMES.BUILTIN_COMPACT',
  [`${BUILTIN_PREFIX}comfortable`]: 'UI.THEMES.BUILTIN_COMFORTABLE',
  [`${BUILTIN_PREFIX}contrast`]: 'UI.THEMES.BUILTIN_CONTRAST'
}

/**
 * Surface and text colours derived from a non-default neutral palette, so picking "stone"
 * does not leave the navy dark surfaces of the shipped theme behind. Explicit colours win.
 */
function derivedFromNeutral(neutralId: string | undefined): Record<ThemeMode, Record<string, string>> {
  if (!neutralId || neutralId === DEFAULT_NEUTRAL) return { light: {}, dark: {} }
  const n = findPalette(NEUTRAL_PALETTES, neutralId, DEFAULT_NEUTRAL).shades
  return {
    light: {
      'bg-base': n['50'], 'bg-surface': '#ffffff', 'bg-elevated': n['100'], 'bg-hover': n['200'],
      border: n['300'], 'border-muted': n['200'],
      'text-primary': n['900'], 'text-secondary': n['600'], 'text-muted': n['500']
    },
    dark: {
      'bg-base': n['950'], 'bg-surface': n['900'], 'bg-elevated': n['800'], 'bg-hover': n['700'],
      border: n['700'], 'border-muted': n['800'],
      'text-primary': n['50'], 'text-secondary': n['300'], 'text-muted': n['400']
    }
  }
}

function derivedFromAccent(accentId: string | undefined): Record<ThemeMode, Record<string, string>> {
  if (!accentId || accentId === DEFAULT_ACCENT) return { light: {}, dark: {} }
  const p = findPalette(ACCENT_PALETTES, accentId, DEFAULT_ACCENT).shades
  return {
    light: { accent: p['600'], 'accent-hover': p['700'], 'accent-text': p['800'] },
    dark: { accent: p['400'], 'accent-hover': p['500'], 'accent-text': p['300'] }
  }
}

export interface ThemeCss {
  css: string
  /** Token keys that switch on their gated rule in `style.css`. */
  gated: string[]
}

/**
 * The stylesheet for a theme: variables on `:root` (palettes, sizes), `:root:not(.dark)`
 * (light colours) and `:root.dark` (dark colours).
 *
 * Only values the theme actually sets (or derives from its palettes) are written; everything
 * else keeps the `style.css` default, so the default theme produces an empty sheet.
 */
export function buildThemeCss(theme: ThemeDefinition | null | undefined): ThemeCss {
  if (!theme) return { css: '', gated: [] }
  const t = parseTheme(theme, theme.id)
  if (!t) return { css: '', gated: [] }

  // Palettes and sizes hold in both modes; light colours must not leak into dark mode, where
  // style.css's own `.dark` values would otherwise lose to this later sheet.
  const root: string[] = []
  const light: string[] = []
  const dark: string[] = []
  const gated = new Set<string>()

  if (t.neutral && t.neutral !== DEFAULT_NEUTRAL) {
    const n = findPalette(NEUTRAL_PALETTES, t.neutral, DEFAULT_NEUTRAL).shades
    for (const s of SHADES) root.push(`--n-${s}: ${hexToTriplet(n[s])};`)
  }
  if (t.accent && t.accent !== DEFAULT_ACCENT) {
    const p = findPalette(ACCENT_PALETTES, t.accent, DEFAULT_ACCENT).shades
    for (const s of SHADES) root.push(`--p-${s}: ${hexToTriplet(p[s])};`)
  }

  const fromNeutral = derivedFromNeutral(t.neutral)
  const fromAccent = derivedFromAccent(t.accent)
  for (const mode of ['light', 'dark'] as const) {
    const values = { ...fromNeutral[mode], ...fromAccent[mode], ...(t[mode] ?? {}) }
    const target = mode === 'light' ? light : dark
    for (const token of COLOR_TOKENS) {
      const hex = values[token.key]
      if (!hex) continue
      target.push(`${token.cssVar}: ${token.format === 'triplet' ? hexToTriplet(hex) : hex};`)
      if (token.gated) gated.add(token.key)
    }
  }

  for (const token of SIZE_TOKENS) {
    const value = t.sizes?.[token.key]
    if (!value) continue
    root.push(`${token.cssVar}: ${value};`)
    gated.add(token.key)
  }

  const blocks: string[] = []
  if (root.length) blocks.push(`:root { ${root.join(' ')} }`)
  if (light.length) blocks.push(`:root:not(.dark) { ${light.join(' ')} }`)
  if (dark.length) blocks.push(`:root.dark { ${dark.join(' ')} }`)
  return { css: blocks.join('\n'), gated: [...gated].sort() }
}
