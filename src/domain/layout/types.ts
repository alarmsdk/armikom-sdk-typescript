/**
 * The screen layout schema.
 *
 * This is the whole point of the system: the arrangement of a customisable screen is data,
 * not markup. A customer's admin authors one of these in the layout designer, it is stored,
 * validated and migrated like any other record, and the runtime renders it.
 *
 * One schema serves every customisable screen. What differs between the alarm workspace, the
 * alarm summary and the subscriber screen is which panels exist — and a document names panels
 * by id, so the schema never has to know.
 *
 * Three node kinds, deliberately no more:
 *   `split` — a row or column of children, with draggable dividers between them
 *   `tabs`  — a tab group; exactly one child on screen at a time
 *   `panel` — a leaf, naming an entry in the panel registry
 *
 * Anything the schema cannot express is a decision that belongs in code, not in customer
 * data. In particular the schema never carries capabilities: a layout may place a panel,
 * but the panel still checks `can()` for itself (V5, P6).
 */

export type LayoutDirection = 'row' | 'col'

/** The three grid row densities, matching `GridDensity` in `types/grid.ts`. */
export type LayoutGridDensity = 'compact' | 'normal' | 'comfortable'

/** Per-column preferences for a panel that renders a grid. Mirrors TanStack's state shape. */
export interface GridPanelSettings {
  /** Column ids in display order. Ids the grid does not know are ignored. */
  order?: string[]
  /** Column ids to hide. */
  hidden?: string[]
  /** Column id → pixel width. */
  widths?: Record<string, number>
  /** Column ids pinned to the left edge. */
  pinned?: string[]
  /**
   * Grid row density the admin published. An operator who has never touched the density
   * toggle sees this; one who has keeps their own choice in localStorage.
   */
  density?: LayoutGridDensity
}

/**
 * Which of a form-shaped panel's fields are shown, and in what order.
 *
 * The same split as `GridPanelSettings` makes for a grid's columns: the panel's code owns
 * what a field *is* (where the value comes from, how it renders, what it is called), and the
 * document owns only which of them appear and in which order. A field id the panel does not
 * declare is ignored rather than rendered — a layout written against a newer build must not
 * put an empty row on an operator's screen.
 */
export interface FieldPanelSettings {
  /** Field ids in display order. Ids the panel does not declare are ignored. */
  order?: string[]
  /** Field ids to hide. */
  hidden?: string[]
}

/** The zoom steps a panel can be published at, in percent — the same ladder as the global font scale. */
export const PANEL_ZOOM_STEPS = [50, 60, 70, 80, 90, 100, 110, 120, 130, 140, 150] as const

export function isValidPanelZoom(value: unknown): value is number {
  return typeof value === 'number' && (PANEL_ZOOM_STEPS as readonly number[]).includes(value)
}

export interface PanelSettings {
  grid?: GridPanelSettings
  fields?: FieldPanelSettings
  /**
   * Percent the panel's content is scaled by, on top of the operator's global font scale.
   * Absent (or 100) renders the panel as is. Some panels are read from across the room,
   * others are dense reference tables an admin wants smaller.
   */
  zoom?: number
  /**
   * Hide the panel's explanatory one-liners ("Sıra, arama sırasıdır.", the subscriber's time
   * zone note, …). Only `true` hides them; anything else shows them, so a layout written
   * before this existed renders as it did. Offered only for panels that declare `hasHints`.
   */
  hideHints?: boolean
  [key: string]: unknown
}

interface LayoutNodeBase {
  /**
   * Stable identity for this node. Vue keys off it, the designer's drag-and-drop moves it,
   * and undo/redo snapshots compare by it. Generated once, never reused.
   */
  key: string
  /**
   * A title the customer typed, overriding the panel registry's default. Free text, so it
   * is customer data and never goes through i18n (V4) — the same rule that keeps signal
   * names and dealer names untranslated.
   */
  title?: string
  /**
   * How this node claims space inside its parent split. `1` (the default) shares the
   * remaining room; `0` means the node sizes itself and does not stretch — used by the
   * action-text column, which carries its own drag-to-resize width.
   */
  flex?: number
  /**
   * Pixels along the parent's main axis, honoured only when `flex` is 0. Omit it to let the
   * node size itself — which is what the action-text column does, since it carries its own
   * drag-to-resize width.
   */
  basis?: number
  /** Collapsed nodes render only their header. Runtime state the operator can toggle. */
  collapsed?: boolean
}

export interface SplitNode extends LayoutNodeBase {
  type: 'split'
  dir: LayoutDirection
  /**
   * Percentage of the split's main axis per child, same length and order as `children`.
   * Omitted means "share equally". Children with `flex: 0` are skipped in the share-out.
   */
  sizes?: number[]
  children: LayoutNode[]
}

export interface TabsNode extends LayoutNodeBase {
  type: 'tabs'
  /** `key` of the child on screen. Falls back to the first child when unset or stale. */
  active?: string
  children: LayoutNode[]
}

export interface PanelNode extends LayoutNodeBase {
  type: 'panel'
  /** Names an entry in the panel registry. An unknown id renders a placeholder, not a crash. */
  panelId: string
  settings?: PanelSettings
}

export type LayoutNode = SplitNode | TabsNode | PanelNode

export type ContainerNode = SplitNode | TabsNode

/** The current schema version. Bump it whenever a migration is added. */
export const LAYOUT_SCHEMA_VERSION = 1

export interface ScreenLayout {
  version: number
  /** Which screen this document arranges, e.g. `alarm-workspace`. Absent in pre-multi-screen documents. */
  screen?: string
  /** Stable id of this layout profile, e.g. `default`, or a generated id for a custom one. */
  id: string
  /** Display name the admin gave it. Customer data — not translated. */
  name: string
  /** ISO 8601, UTC. Set by the designer on save (V6: timestamps are UTC). */
  updatedAt?: string
  root: LayoutNode
}

/**
 * A per-user override laid over a published layout. Operators get to adjust sizes and grid
 * columns without being able to restructure a safety-critical screen — the structure is the
 * admin's call, the ergonomics are theirs. Stored per screen, so arranging one screen never
 * disturbs another's dividers.
 */
export interface ScreenLayoutOverride {
  version: number
  /** Which layout this override applies to; a mismatch discards it. */
  layoutId: string
  /** Node key → sizes array, for splits the operator dragged. */
  sizes?: Record<string, number[]>
  /** Node key → active child key, for tab groups. */
  active?: Record<string, string>
  /** Node key → collapsed. */
  collapsed?: Record<string, boolean>
  /** Node key → grid column preferences. */
  grid?: Record<string, GridPanelSettings>
}

// ── Type guards ──────────────────────────────────────────────────────────────

export function isSplit(node: LayoutNode): node is SplitNode {
  return node.type === 'split'
}

export function isTabs(node: LayoutNode): node is TabsNode {
  return node.type === 'tabs'
}

export function isPanel(node: LayoutNode): node is PanelNode {
  return node.type === 'panel'
}

export function isContainer(node: LayoutNode): node is ContainerNode {
  return node.type === 'split' || node.type === 'tabs'
}

// ── Identity ─────────────────────────────────────────────────────────────────

let keyCounter = 0

/**
 * Node keys only have to be unique within one layout document, and they end up in stored
 * customer data, so they are short and readable rather than UUIDs — easier to eyeball in an
 * exported JSON when someone is debugging a customer's layout over the phone.
 */
export function newNodeKey(prefix = 'n'): string {
  keyCounter += 1
  return `${prefix}${keyCounter.toString(36)}${Math.random().toString(36).slice(2, 6)}`
}
