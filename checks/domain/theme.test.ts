// Ported from Armikom.Open.Vue tests/unit/theme/model.test.ts; the implementation now lives in this package.
import { describe, it, expect } from './_expect.js'
import { BUILTIN_THEMES, DEFAULT_THEME_ID, buildThemeCss, parseTheme, serializeTheme } from '../../src/domain/index.js'
import { COLOR_TOKENS, SIZE_TOKENS } from '../../src/domain/index.js'

/** D88: themes are turned into CSS text, so parsing is the safety boundary. */
describe('parseTheme', () => {
  it('keeps known tokens with allowed values only', () => {
    const theme = parseTheme({
      name: 'Gece',
      neutral: 'stone',
      accent: 'red',
      light: { 'grid-header-bg': '#ABCDEF', 'grid-border': 'red; } body { display:none', 'alarm-red': '#000000' },
      sizes: { 'grid-cell-py': '0.125rem', 'grid-cell-px': '3px', 'qc-gap': '0' }
    }, 't1')!

    expect(theme.name).toBe('Gece')
    expect(theme.neutral).toBe('stone')
    expect(theme.accent).toBeUndefined() // red is not an accent: it means alarm
    expect(theme.light).toEqual({ 'grid-header-bg': '#abcdef' })
    expect(theme.sizes).toEqual({ 'grid-cell-py': '0.125rem', 'qc-gap': '0' })
  })

  it('rejects content that is not an object', () => {
    expect(parseTheme('not json', 'x')).toBeNull()
    expect(parseTheme('[1]', 'x')).toBeNull()
    expect(parseTheme(null, 'x')).toBeNull()
  })

  it('round-trips through serializeTheme without the id', () => {
    const original = parseTheme({ name: 'A', sizes: { 'grid-cell-py': '0.25rem' } }, 'a')!
    const json = serializeTheme(original)
    expect(JSON.parse(json).id).toBeUndefined()
    expect(parseTheme(json, 'a')).toEqual(original)
  })

  it('has no token for alarm colours', () => {
    const keys = [...COLOR_TOKENS, ...SIZE_TOKENS].map((t) => t.key).join(' ')
    expect(keys).not.toMatch(/alarm|red|amber|rose|emerald/)
  })
})

describe('buildThemeCss', () => {
  it('produces nothing for the shipped default, so the console looks unchanged', () => {
    const def = BUILTIN_THEMES.find((t) => t.id === DEFAULT_THEME_ID)!
    expect(buildThemeCss(def)).toEqual({ css: '', gated: [] })
  })

  it('keeps light colours out of dark mode', () => {
    const { css } = buildThemeCss({ schema: 1, id: 'x', name: 'x', light: { 'bg-base': '#ffffff' }, dark: { 'bg-base': '#000000' } })
    expect(css).toContain(':root:not(.dark) { --color-bg-base: 255 255 255; }')
    expect(css).toContain(':root.dark { --color-bg-base: 0 0 0; }')
  })

  it('lists gated tokens so only their rules switch on', () => {
    const { css, gated } = buildThemeCss({ schema: 1, id: 'x', name: 'x', sizes: { 'qc-row-py': '0.75rem' }, light: { 'grid-header-bg': '#eeeeee' } })
    expect(gated).toEqual(['grid-header-bg', 'qc-row-py'])
    expect(css).toContain('--qc-row-py: 0.75rem;')
    expect(css).toContain('--grid-header-bg: #eeeeee;')
  })

  it('re-tints the slate scale and derives surfaces from a neutral palette', () => {
    const { css, gated } = buildThemeCss({ schema: 1, id: 'x', name: 'x', neutral: 'stone' })
    expect(css).toContain('--n-500: 120 113 108;')
    expect(css).toMatch(/:root\.dark \{[^}]*--color-bg-surface: 28 25 23;/)
    expect(gated).toEqual([])
  })

  it('lets explicit colours win over palette-derived ones', () => {
    const { css } = buildThemeCss({ schema: 1, id: 'x', name: 'x', accent: 'violet', light: { accent: '#123456' } })
    expect(css).toContain('--p-600: 124 58 237;')
    expect(css).toContain('--color-accent: 18 52 86;')
  })
})
