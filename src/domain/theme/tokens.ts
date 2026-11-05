/**
 * The console theme vocabulary (D88): what an admin may change, and nothing else.
 *
 * Three kinds of token:
 *
 * - **Palettes** swap a whole Tailwind scale. `neutral` re-tints every `slate-*` utility in
 *   the app (the bulk of its greys) and `accent` every `primary-*` utility. Both scales are CSS
 *   variables (`--n-*`, `--p-*`, see `tailwind.config.ts`), so no component changes.
 * - **Colours** have a light and a dark value. The `--color-*` ones feed the existing
 *   `theme-*` utilities; the grid ones only take effect where a theme sets them.
 * - **Sizes** are picked from a fixed list, never typed, so a theme cannot break a layout.
 *
 * Alarm colours are deliberately absent: red, amber, rose, emerald and `alarm.*` mean a
 * state, and an operator must read them the same way on every console. The accent choices
 * leave out red, amber and green for the same reason.
 *
 * "Gated" tokens override per-component styling (cell padding, header background…). They
 * apply only when a theme sets them, so the default theme looks exactly like the console did
 * before themes existed. The applied theme lists them in `<html data-ui-theme="…">` and
 * `style.css` scopes each rule to its name.
 */

export type ThemeMode = 'light' | 'dark'

export interface Palette {
  id: string
  /** i18n key of the palette name. */
  labelKey: string
  /** Shades 50…950 as hex. */
  shades: Record<Shade, string>
}

export const SHADES = ['50', '100', '200', '300', '400', '500', '600', '700', '800', '900', '950'] as const
export type Shade = (typeof SHADES)[number]

function scale(values: string[]): Record<Shade, string> {
  return Object.fromEntries(SHADES.map((s, i) => [s, values[i]])) as Record<Shade, string>
}

/** Neutral scales for `slate-*`. `slate` is the shipped look. */
export const NEUTRAL_PALETTES: Palette[] = [
  { id: 'slate', labelKey: 'UI.THEMES.PALETTE_SLATE', shades: scale(['#f8fafc', '#f1f5f9', '#e2e8f0', '#cbd5e1', '#94a3b8', '#64748b', '#475569', '#334155', '#1e293b', '#0f172a', '#020617']) },
  { id: 'gray', labelKey: 'UI.THEMES.PALETTE_GRAY', shades: scale(['#f9fafb', '#f3f4f6', '#e5e7eb', '#d1d5db', '#9ca3af', '#6b7280', '#4b5563', '#374151', '#1f2937', '#111827', '#030712']) },
  { id: 'zinc', labelKey: 'UI.THEMES.PALETTE_ZINC', shades: scale(['#fafafa', '#f4f4f5', '#e4e4e7', '#d4d4d8', '#a1a1aa', '#71717a', '#52525b', '#3f3f46', '#27272a', '#18181b', '#09090b']) },
  { id: 'neutral', labelKey: 'UI.THEMES.PALETTE_NEUTRAL', shades: scale(['#fafafa', '#f5f5f5', '#e5e5e5', '#d4d4d4', '#a3a3a3', '#737373', '#525252', '#404040', '#262626', '#171717', '#0a0a0a']) },
  { id: 'stone', labelKey: 'UI.THEMES.PALETTE_STONE', shades: scale(['#fafaf9', '#f5f5f4', '#e7e5e4', '#d6d3d1', '#a8a29e', '#78716c', '#57534e', '#44403c', '#292524', '#1c1917', '#0c0a09']) }
]

/** Accent scales for `primary-*`. `armikom` is the logo blue the console ships with. */
export const ACCENT_PALETTES: Palette[] = [
  { id: 'armikom', labelKey: 'UI.THEMES.PALETTE_ARMIKOM', shades: scale(['#eef5ff', '#dae8fd', '#bdd6fb', '#90bcf7', '#5c9bf0', '#3a7fe3', '#2866cc', '#2152a6', '#1f4687', '#1f3d6f', '#16274a']) },
  { id: 'blue', labelKey: 'UI.THEMES.PALETTE_BLUE', shades: scale(['#eff6ff', '#dbeafe', '#bfdbfe', '#93c5fd', '#60a5fa', '#3b82f6', '#2563eb', '#1d4ed8', '#1e40af', '#1e3a8a', '#172554']) },
  { id: 'indigo', labelKey: 'UI.THEMES.PALETTE_INDIGO', shades: scale(['#eef2ff', '#e0e7ff', '#c7d2fe', '#a5b4fc', '#818cf8', '#6366f1', '#4f46e5', '#4338ca', '#3730a3', '#312e81', '#1e1b4b']) },
  { id: 'sky', labelKey: 'UI.THEMES.PALETTE_SKY', shades: scale(['#f0f9ff', '#e0f2fe', '#bae6fd', '#7dd3fc', '#38bdf8', '#0ea5e9', '#0284c7', '#0369a1', '#075985', '#0c4a6e', '#082f49']) },
  { id: 'cyan', labelKey: 'UI.THEMES.PALETTE_CYAN', shades: scale(['#ecfeff', '#cffafe', '#a5f3fc', '#67e8f9', '#22d3ee', '#06b6d4', '#0891b2', '#0e7490', '#155e75', '#164e63', '#083344']) },
  { id: 'violet', labelKey: 'UI.THEMES.PALETTE_VIOLET', shades: scale(['#f5f3ff', '#ede9fe', '#ddd6fe', '#c4b5fd', '#a78bfa', '#8b5cf6', '#7c3aed', '#6d28d9', '#5b21b6', '#4c1d95', '#2e1065']) }
]

export const DEFAULT_NEUTRAL = 'slate'
export const DEFAULT_ACCENT = 'armikom'

export type TokenGroup = 'surface' | 'text' | 'accent' | 'grid' | 'quickComplete'

export interface ColorToken {
  key: string
  /** The CSS custom property. */
  cssVar: string
  group: TokenGroup
  labelKey: string
  /** `triplet`: "r g b" for `rgb(var(--x) / <alpha>)` utilities. `color`: a plain CSS colour. */
  format: 'triplet' | 'color'
  /** Shipped values, shown as the editor's placeholder and used by the preview. */
  defaults: Record<ThemeMode, string>
  gated: boolean
}

export interface SizeToken {
  key: string
  cssVar: string
  group: TokenGroup
  labelKey: string
  /** The only values a theme may hold. The first entry is not special; `defaultValue` is. */
  options: readonly string[]
  defaultValue: string
  gated: true
}

const PADDINGS = ['0', '0.125rem', '0.25rem', '0.375rem', '0.5rem', '0.625rem', '0.75rem', '1rem', '1.25rem'] as const
const FONT_SIZES = ['0.625rem', '0.6875rem', '0.75rem', '0.8125rem', '0.875rem', '0.9375rem', '1rem', '1.125rem'] as const

export const COLOR_TOKENS: ColorToken[] = [
  { key: 'bg-base', cssVar: '--color-bg-base', group: 'surface', labelKey: 'UI.THEMES.TOKEN_BG_BASE', format: 'triplet', defaults: { light: '#f8fafc', dark: '#050a18' }, gated: false },
  { key: 'bg-surface', cssVar: '--color-bg-surface', group: 'surface', labelKey: 'UI.THEMES.TOKEN_BG_SURFACE', format: 'triplet', defaults: { light: '#ffffff', dark: '#0d1528' }, gated: false },
  { key: 'bg-elevated', cssVar: '--color-bg-elevated', group: 'surface', labelKey: 'UI.THEMES.TOKEN_BG_ELEVATED', format: 'triplet', defaults: { light: '#f1f5f9', dark: '#1a253d' }, gated: false },
  { key: 'bg-hover', cssVar: '--color-bg-hover', group: 'surface', labelKey: 'UI.THEMES.TOKEN_BG_HOVER', format: 'triplet', defaults: { light: '#e2e8f0', dark: '#2b3854' }, gated: false },
  { key: 'border', cssVar: '--color-border', group: 'surface', labelKey: 'UI.THEMES.TOKEN_BORDER', format: 'triplet', defaults: { light: '#cbd5e1', dark: '#334155' }, gated: false },
  { key: 'border-muted', cssVar: '--color-border-muted', group: 'surface', labelKey: 'UI.THEMES.TOKEN_BORDER_MUTED', format: 'triplet', defaults: { light: '#e2e8f0', dark: '#1e293b' }, gated: false },
  { key: 'text-primary', cssVar: '--color-text-primary', group: 'text', labelKey: 'UI.THEMES.TOKEN_TEXT_PRIMARY', format: 'triplet', defaults: { light: '#0f172a', dark: '#f8fafc' }, gated: false },
  { key: 'text-secondary', cssVar: '--color-text-secondary', group: 'text', labelKey: 'UI.THEMES.TOKEN_TEXT_SECONDARY', format: 'triplet', defaults: { light: '#475569', dark: '#cbd5e1' }, gated: false },
  { key: 'text-muted', cssVar: '--color-text-muted', group: 'text', labelKey: 'UI.THEMES.TOKEN_TEXT_MUTED', format: 'triplet', defaults: { light: '#64748b', dark: '#94a3b8' }, gated: false },
  { key: 'accent', cssVar: '--color-accent', group: 'accent', labelKey: 'UI.THEMES.TOKEN_ACCENT', format: 'triplet', defaults: { light: '#2866cc', dark: '#5c9bf0' }, gated: false },
  { key: 'accent-hover', cssVar: '--color-accent-hover', group: 'accent', labelKey: 'UI.THEMES.TOKEN_ACCENT_HOVER', format: 'triplet', defaults: { light: '#2152a6', dark: '#3a7fe3' }, gated: false },
  { key: 'accent-text', cssVar: '--color-accent-text', group: 'accent', labelKey: 'UI.THEMES.TOKEN_ACCENT_TEXT', format: 'triplet', defaults: { light: '#1f4687', dark: '#90bcf7' }, gated: false },
  { key: 'grid-header-bg', cssVar: '--grid-header-bg', group: 'grid', labelKey: 'UI.THEMES.TOKEN_GRID_HEADER_BG', format: 'color', defaults: { light: '#f1f5f9', dark: '#1e293b' }, gated: true },
  { key: 'grid-header-text', cssVar: '--grid-header-text', group: 'grid', labelKey: 'UI.THEMES.TOKEN_GRID_HEADER_TEXT', format: 'color', defaults: { light: '#64748b', dark: '#94a3b8' }, gated: true },
  { key: 'grid-border', cssVar: '--grid-border', group: 'grid', labelKey: 'UI.THEMES.TOKEN_GRID_BORDER', format: 'color', defaults: { light: '#e2e8f0', dark: '#334155' }, gated: true },
  { key: 'grid-vline', cssVar: '--grid-vline', group: 'grid', labelKey: 'UI.THEMES.TOKEN_GRID_VLINE', format: 'color', defaults: { light: '#e2e8f0', dark: '#334155' }, gated: true },
  { key: 'grid-stripe', cssVar: '--grid-stripe', group: 'grid', labelKey: 'UI.THEMES.TOKEN_GRID_STRIPE', format: 'color', defaults: { light: '#f8fafc', dark: '#111a2e' }, gated: true },
  { key: 'grid-row-hover', cssVar: '--grid-row-hover', group: 'grid', labelKey: 'UI.THEMES.TOKEN_GRID_ROW_HOVER', format: 'color', defaults: { light: '#eef5ff', dark: '#1f3d6f' }, gated: true }
]

export const SIZE_TOKENS: SizeToken[] = [
  { key: 'grid-cell-py', cssVar: '--grid-cell-py', group: 'grid', labelKey: 'UI.THEMES.TOKEN_GRID_CELL_PY', options: PADDINGS, defaultValue: '0.375rem', gated: true },
  { key: 'grid-cell-px', cssVar: '--grid-cell-px', group: 'grid', labelKey: 'UI.THEMES.TOKEN_GRID_CELL_PX', options: PADDINGS, defaultValue: '0.5rem', gated: true },
  { key: 'grid-header-py', cssVar: '--grid-header-py', group: 'grid', labelKey: 'UI.THEMES.TOKEN_GRID_HEADER_PY', options: PADDINGS, defaultValue: '0.375rem', gated: true },
  { key: 'grid-font-size', cssVar: '--grid-font-size', group: 'grid', labelKey: 'UI.THEMES.TOKEN_GRID_FONT_SIZE', options: FONT_SIZES, defaultValue: '0.875rem', gated: true },
  { key: 'grid-header-font-size', cssVar: '--grid-header-font-size', group: 'grid', labelKey: 'UI.THEMES.TOKEN_GRID_HEADER_FONT_SIZE', options: FONT_SIZES, defaultValue: '0.6875rem', gated: true },
  { key: 'grid-header-transform', cssVar: '--grid-header-transform', group: 'grid', labelKey: 'UI.THEMES.TOKEN_GRID_HEADER_TRANSFORM', options: ['uppercase', 'none'], defaultValue: 'uppercase', gated: true },
  { key: 'grid-header-weight', cssVar: '--grid-header-weight', group: 'grid', labelKey: 'UI.THEMES.TOKEN_GRID_HEADER_WEIGHT', options: ['400', '500', '600', '700'], defaultValue: '500', gated: true },
  { key: 'qc-row-py', cssVar: '--qc-row-py', group: 'quickComplete', labelKey: 'UI.THEMES.TOKEN_QC_ROW_PY', options: PADDINGS, defaultValue: '0.375rem', gated: true },
  { key: 'qc-row-px', cssVar: '--qc-row-px', group: 'quickComplete', labelKey: 'UI.THEMES.TOKEN_QC_ROW_PX', options: PADDINGS, defaultValue: '0.75rem', gated: true },
  { key: 'qc-gap', cssVar: '--qc-gap', group: 'quickComplete', labelKey: 'UI.THEMES.TOKEN_QC_GAP', options: PADDINGS, defaultValue: '0.25rem', gated: true }
]

export const COLOR_TOKEN_BY_KEY = new Map(COLOR_TOKENS.map((t) => [t.key, t]))
export const SIZE_TOKEN_BY_KEY = new Map(SIZE_TOKENS.map((t) => [t.key, t]))

export function findPalette(list: Palette[], id: string | undefined, fallback: string): Palette {
  return list.find((p) => p.id === id) ?? list.find((p) => p.id === fallback)!
}

/** `#RRGGBB` → `"r g b"`, the form `rgb(var(--x) / <alpha-value>)` utilities need. */
export function hexToTriplet(hex: string): string {
  const h = hex.replace('#', '')
  return `${parseInt(h.slice(0, 2), 16)} ${parseInt(h.slice(2, 4), 16)} ${parseInt(h.slice(4, 6), 16)}`
}
