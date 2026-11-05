/**
 * Validation, migration and repair for stored layouts.
 *
 * A layout is customer data that outlives the build that wrote it, so three things have to
 * be true before the runtime will touch one: it is shaped like a layout at all (it may have
 * been hand-edited, or imported from a different install), it has been brought up to the
 * current schema version, and it still satisfies the rules this screen cannot do without.
 *
 * Every entry point takes the `LayoutScreenDef` the document belongs to. Validation is about
 * a document against *a* screen's panels and catalogues — the same JSON is a valid subscriber
 * layout and a nonsense alarm one — so there is nothing sensible to default to.
 *
 * The distinction that matters here is between *errors* and *repairs*. An error means the
 * document cannot be used and the caller falls back to the default — the operator gets a
 * working screen and a toast, never a blank one. A repair is something we can fix silently:
 * a duplicated panel, a stale `active` key, a sizes array that drifted out of step.
 */
import type { PanelFieldDef, LayoutScreenDef } from './catalogue.js'
import { getPanelDef, requiredPanelIds, panelFields, gridColumns, requiredFieldIds } from './catalogue.js'
import {
  type LayoutNode,
  type ScreenLayout,
  type SplitNode,
  type TabsNode,
  type PanelNode,
  LAYOUT_SCHEMA_VERSION,
  isContainer,
  isSplit,
  isPanel,
  isValidPanelZoom,
  newNodeKey
} from './types.js'
import { normalize, collectPanels } from './tree.js'

export interface LayoutIssue {
  level: 'error' | 'repair'
  code: string
  message: string
  nodeKey?: string
}

export interface ValidationResult {
  ok: boolean
  /** The usable document: repaired when `ok`, untouched when not. */
  layout: ScreenLayout | null
  issues: LayoutIssue[]
}

// ── Shape checks ─────────────────────────────────────────────────────────────

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

/** Structural check only — whether this could be a node, not whether it is a good one. */
function looksLikeNode(value: unknown): boolean {
  if (!isPlainObject(value)) return false
  const type = value.type
  if (type === 'panel') return typeof value.panelId === 'string'
  if (type === 'split' || type === 'tabs') return Array.isArray(value.children)
  return false
}

function checkShape(node: unknown, issues: LayoutIssue[], depth = 0): boolean {
  if (depth > 32) {
    issues.push({ level: 'error', code: 'TOO_DEEP', message: 'Layout ağacı çok derin.' })
    return false
  }
  if (!looksLikeNode(node)) {
    issues.push({ level: 'error', code: 'BAD_NODE', message: 'Tanınmayan düğüm.' })
    return false
  }
  const n = node as Record<string, unknown>
  if (n.type === 'split' || n.type === 'tabs') {
    const children = n.children as unknown[]
    if (children.length === 0) {
      issues.push({ level: 'error', code: 'EMPTY_CONTAINER', message: 'Boş kapsayıcı.' })
      return false
    }
    return children.every((c) => checkShape(c, issues, depth + 1))
  }
  return true
}

// ── Migration ────────────────────────────────────────────────────────────────

type Migration = (layout: ScreenLayout) => ScreenLayout

/**
 * One entry per version step: `MIGRATIONS[n]` takes a document at version `n` to `n + 1`.
 * Empty today because version 1 is the first published schema — the machinery is here so
 * that the first breaking change is a one-function commit rather than a redesign, and so
 * that layouts written today keep working after it.
 */
const MIGRATIONS: Record<number, Migration> = {}

export function migrate(layout: ScreenLayout): { layout: ScreenLayout; issues: LayoutIssue[] } {
  const issues: LayoutIssue[] = []
  let current = layout
  let guard = 0

  while (current.version < LAYOUT_SCHEMA_VERSION) {
    const step = MIGRATIONS[current.version]
    if (!step) {
      issues.push({
        level: 'error',
        code: 'NO_MIGRATION',
        message: `Sürüm ${current.version} için geçiş tanımlı değil.`
      })
      return { layout: current, issues }
    }
    current = step(current)
    issues.push({
      level: 'repair',
      code: 'MIGRATED',
      message: `Düzen sürüm ${current.version} biçimine taşındı.`
    })
    if (++guard > 32) break
  }

  if (current.version > LAYOUT_SCHEMA_VERSION) {
    // Written by a newer build. Rendering it would silently drop whatever it added, so we
    // decline rather than guess.
    issues.push({
      level: 'error',
      code: 'FROM_FUTURE',
      message: 'Düzen bu sürümden daha yeni bir biçimde kaydedilmiş.'
    })
  }

  return { layout: current, issues }
}

// ── Repair ───────────────────────────────────────────────────────────────────

/**
 * Drops ids the panel's catalogues do not declare, and un-hides the ones it will not let go.
 *
 * Without this a typo, or a document written against a build that had a field this one does
 * not, survives into the renderer — where it is ignored anyway, but silently. Pruning it here
 * means the admin is told once, at save time, instead of wondering why a field never appears.
 *
 * `resolveFields` already shows a required field whatever the document says, so stripping it
 * from `hidden` changes no pixel. It is done anyway: a stored document that claims to hide
 * the note body is a lie the next reader has to see through.
 *
 * Grid settings go through the same sieve but only for `order` and `hidden`. `widths` and
 * `pinned` are keyed by column id too, yet an unknown key there is inert and harmless — and
 * dropping it would throw away the width of a column that a later build may well bring back.
 */
function pruneIds(
  settings: { order?: string[]; hidden?: string[] } | undefined,
  catalogue: PanelFieldDef[],
  locked: Set<string>
): { changed: boolean; order?: string[]; hidden?: string[] } {
  if (!settings) return { changed: false }

  const known = new Set(catalogue.map((f) => f.id))
  const order = settings.order?.filter((id) => known.has(id))
  const hidden = settings.hidden?.filter((id) => known.has(id) && !locked.has(id))

  const changed =
    (settings.order?.length ?? 0) !== (order?.length ?? 0) ||
    (settings.hidden?.length ?? 0) !== (hidden?.length ?? 0)

  return { changed, ...(order ? { order } : {}), ...(hidden ? { hidden } : {}) }
}

function pruneSettings(screen: LayoutScreenDef, node: PanelNode, issues: LayoutIssue[]): PanelNode {
  if (!node.settings) return node

  const locked = new Set(requiredFieldIds(screen, node.panelId))
  const fields = pruneIds(node.settings.fields, panelFields(screen, node.panelId), locked)
  const grid = pruneIds(node.settings.grid, gridColumns(screen, node.panelId), new Set())

  // Strip an invalid density value.
  const VALID_DENSITIES = new Set(['compact', 'normal', 'comfortable'])
  let densityChanged = false
  if (node.settings.grid?.density && !VALID_DENSITIES.has(node.settings.grid.density)) {
    densityChanged = true
  }

  // Strip a zoom that is not one of the published steps.
  const zoomChanged = node.settings.zoom !== undefined && !isValidPanelZoom(node.settings.zoom)

  if (!fields.changed && !grid.changed && !densityChanged && !zoomChanged) return node

  if (fields.changed || grid.changed) {
    issues.push({
      level: 'repair',
      code: 'UNKNOWN_FIELD',
      message: `Geçersiz alan ayarı düzeltildi: ${node.panelId}`,
      nodeKey: node.key
    })
  }
  if (densityChanged) {
    issues.push({
      level: 'repair',
      code: 'INVALID_DENSITY',
      message: `Geçersiz tablo yoğunluğu kaldırıldı: ${node.panelId}`,
      nodeKey: node.key
    })
  }

  if (zoomChanged) {
    issues.push({
      level: 'repair',
      code: 'INVALID_ZOOM',
      message: `Geçersiz panel yakınlaştırması kaldırıldı: ${node.panelId}`,
      nodeKey: node.key
    })
  }

  const { changed: _f, ...fieldSettings } = fields
  const { changed: _g, ...gridSettings } = grid

  const repairedGrid = node.settings.grid
    ? { ...node.settings.grid, ...gridSettings, ...(densityChanged ? { density: undefined } : {}) }
    : undefined

  return {
    ...node,
    settings: {
      ...node.settings,
      ...(node.settings.fields ? { fields: fieldSettings } : {}),
      // `widths` and `pinned` are carried through untouched.
      ...(repairedGrid ? { grid: repairedGrid } : {}),
      ...(zoomChanged ? { zoom: undefined } : {})
    }
  }
}

/**
 * Fixes what can be fixed, in place of the caller having to reject the document:
 *   · missing or duplicated node keys get fresh ones
 *   · panels this build does not know are dropped
 *   · a panel appearing twice when the registry calls it a singleton loses the later copy
 *   · field ids the panel's catalogue does not declare are pruned
 *   · `active` keys pointing nowhere fall back to the first child
 *   · `sizes` arrays out of step with their children are dropped so the split shares evenly
 */
function repairNode(screen: LayoutScreenDef, input: LayoutNode, seenKeys: Set<string>, seenPanels: Set<string>, issues: LayoutIssue[]): LayoutNode | null {
  let node = input
  if (isPanel(node)) {
    const def = getPanelDef(screen, node.panelId)
    if (!def) {
      issues.push({
        level: 'repair',
        code: 'UNKNOWN_PANEL',
        message: `Bilinmeyen panel kaldırıldı: ${node.panelId}`,
        nodeKey: node.key
      })
      return null
    }
    if (def.singleton && seenPanels.has(node.panelId)) {
      issues.push({
        level: 'repair',
        code: 'DUPLICATE_PANEL',
        message: `Yinelenen panel kaldırıldı: ${node.panelId}`,
        nodeKey: node.key
      })
      return null
    }
    seenPanels.add(node.panelId)
    node = pruneSettings(screen, node, issues)
  }

  let key = typeof node.key === 'string' && node.key.length > 0 ? node.key : newNodeKey()
  if (seenKeys.has(key)) {
    key = newNodeKey()
    issues.push({ level: 'repair', code: 'DUPLICATE_KEY', message: 'Yinelenen düğüm kimliği yenilendi.', nodeKey: node.key })
  }
  seenKeys.add(key)

  if (!isContainer(node)) {
    return { ...node, key } as PanelNode
  }

  const children = node.children
    .map((child) => repairNode(screen, child, seenKeys, seenPanels, issues))
    .filter((child): child is LayoutNode => child !== null)

  if (children.length === 0) {
    issues.push({ level: 'repair', code: 'EMPTY_AFTER_REPAIR', message: 'İçi boşalan kapsayıcı kaldırıldı.', nodeKey: key })
    return null
  }

  if (isSplit(node)) {
    const sizes = Array.isArray(node.sizes) && node.sizes.length === children.length && node.sizes.every((s) => typeof s === 'number' && s > 0)
      ? node.sizes
      : undefined
    if (node.sizes && !sizes) {
      issues.push({ level: 'repair', code: 'BAD_SIZES', message: 'Geçersiz boyut dizisi sıfırlandı.', nodeKey: key })
    }
    return { ...node, key, children, sizes } as SplitNode
  }

  const active = children.some((c) => c.key === (node as TabsNode).active)
    ? (node as TabsNode).active
    : children[0]?.key
  return { ...node, key, children, active } as TabsNode
}

// ── Rules the screen cannot do without ───────────────────────────────────────

function checkRequiredPanels(screen: LayoutScreenDef, root: LayoutNode, issues: LayoutIssue[]): boolean {
  const present = new Set(collectPanels(root).map((p) => p.panelId))
  let ok = true
  for (const id of requiredPanelIds(screen)) {
    if (!present.has(id)) {
      issues.push({
        level: 'error',
        code: 'MISSING_REQUIRED_PANEL',
        message: `Zorunlu panel eksik: ${id}`
      })
      ok = false
    }
  }
  return ok
}

// ── Entry point ──────────────────────────────────────────────────────────────

export function validateLayout(raw: unknown, screen: LayoutScreenDef<any>): ValidationResult {
  const issues: LayoutIssue[] = []

  if (!isPlainObject(raw)) {
    return { ok: false, layout: null, issues: [{ level: 'error', code: 'NOT_AN_OBJECT', message: 'Düzen belgesi okunamadı.' }] }
  }
  if (typeof raw.version !== 'number' || !isPlainObject(raw.root)) {
    return { ok: false, layout: null, issues: [{ level: 'error', code: 'MISSING_FIELDS', message: 'Düzen belgesinde sürüm veya kök düğüm yok.' }] }
  }
  if (!checkShape(raw.root, issues)) {
    return { ok: false, layout: null, issues }
  }

  const candidate: ScreenLayout = {
    version: raw.version,
    screen: typeof raw.screen === 'string' && raw.screen ? raw.screen : screen.id,
    id: typeof raw.id === 'string' && raw.id ? raw.id : 'custom',
    name: typeof raw.name === 'string' && raw.name ? raw.name : 'Adsız düzen',
    updatedAt: typeof raw.updatedAt === 'string' ? raw.updatedAt : undefined,
    root: raw.root as unknown as LayoutNode
  }

  const migrated = migrate(candidate)
  issues.push(...migrated.issues)
  if (migrated.issues.some((i) => i.level === 'error')) {
    return { ok: false, layout: null, issues }
  }

  const repaired = repairNode(screen, migrated.layout.root, new Set(), new Set(), issues)
  if (!repaired) {
    issues.push({ level: 'error', code: 'NOTHING_LEFT', message: 'Onarımdan sonra geriye düzen kalmadı.' })
    return { ok: false, layout: null, issues }
  }

  const root = normalize(repaired)
  if (!checkRequiredPanels(screen, root, issues)) {
    return { ok: false, layout: null, issues }
  }

  return {
    ok: true,
    layout: { ...migrated.layout, version: LAYOUT_SCHEMA_VERSION, screen: screen.id, root },
    issues
  }
}

/**
 * What the designer calls before letting an admin publish. Same rules as loading, but the
 * caller wants the issues in order to show them rather than to decide a fallback — and a
 * repair is worth surfacing here, since publishing silently altered work is worse than
 * saying what changed.
 */
export function validateForPublish(layout: ScreenLayout, screen: LayoutScreenDef<any>): ValidationResult {
  return validateLayout(layout, screen)
}

/** Panels the screen knows that this layout does not place — the designer's "unused" list. */
export function unplacedPanelIds(root: LayoutNode, screen: LayoutScreenDef<any>): string[] {
  const placed = new Set(collectPanels(root).map((p) => p.panelId))
  return Object.keys(screen.panels).filter((id) => !placed.has(id))
}
