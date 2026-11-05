/**
 * What a customisable screen is — the framework-free half.
 *
 * The layout engine renders a `LayoutScreenDef`: the panels a screen can show, their field and
 * column catalogues, the shipped default and the designer presets. The only framework-specific
 * part of that description is the panel *component*, so the type is generic in it: the Vue
 * console instantiates `LayoutScreenDef<Component>`, a React console `LayoutScreenDef<ComponentType>`,
 * and the validator, the tree algebra and the field resolver work on either without knowing.
 */
import type { ScreenLayout } from './types.js'

/**
 * One panel a screen can show, and the rules about it.
 *
 * Two fields exist purely to stop a layout from doing harm:
 *   `scope`    — the panel is unavailable to an operator who lacks it. The panel re-checks
 *                this for itself; the registry entry is only what the designer's palette
 *                filters on, so an admin never publishes a layout full of panels their
 *                operators cannot see.
 *   `required` — the designer will not let the node be deleted, and a document missing one
 *                is refused. The alarm workspace's action-text editor is how an alarm gets
 *                completed; a layout without it is not a workspace.
 */
export interface PanelDef<TComponent = unknown> {
  id: string
  /** i18n key for the default title. A node's own `title` overrides it. */
  titleKey: string
  /** i18n key for the one-line description shown in the designer's palette. */
  descriptionKey?: string
  component: TComponent
  /** Capability required to see this panel at all (V5, P6). */
  scope?: string
  /** The designer refuses to delete this node, and validation rejects a layout without it. */
  required?: boolean
  /** The panel may appear at most once in a layout. */
  singleton?: boolean
  /** Hints the split container honours so a panel is never squeezed into uselessness. */
  minWidth?: number
  minHeight?: number
  /**
   * Runtime availability, beyond capabilities — the alarm workspace's copilot column follows
   * the call rather than the layout. A panel placed by the layout but unavailable right now
   * renders nothing.
   */
  isAvailable?: (ctx: any) => boolean
  /**
   * The panel renders help text, so the designer offers to hide it — on a dense layout those
   * lines cost a row of space an operator who knows the screen does not need.
   */
  hasHints?: boolean
  /** A count shown on the panel's tab, when one is meaningful. */
  badge?: (ctx: any) => number | undefined
}

/**
 * One entry in a panel's field or column catalogue.
 *
 * A catalogue is the list of fields a panel *can* render, in the order it renders them by
 * default. A stored layout may reorder them and hide them, but it can never name one that is
 * not here — the panel's template is what knows how to draw a field, so the catalogue is the
 * boundary between "the admin arranges it" and "the code provides it".
 */
export interface PanelFieldDef {
  id: string
  /** i18n key for the field's label. Our string, not customer data — so V4 does not apply. */
  labelKey: string
  /** Off unless a layout asks for it: available on the record, not shown by default. */
  hiddenByDefault?: boolean
  /**
   * The field cannot be hidden — the panel is not usable without it. The designer renders its
   * checkbox disabled and `resolveFields` shows it whatever a document says, so a hand-edited
   * or imported layout cannot take it away either.
   */
  required?: boolean
}

/** A starting point the designer offers beyond the shipped default. */
export interface LayoutPreset {
  id: string
  name: string
  build: () => ScreenLayout
}

export interface LayoutScreenDef<TComponent = unknown> {
  /**
   * Stable id. It names the screen in the API (`/v1/ui-layouts/{screen}`), keys every
   * localStorage bucket, and prefixes the grid ids of the panels it hosts — so changing it
   * orphans stored customer data. Treat it as permanent once shipped.
   */
  id: string
  /** i18n key for the screen's name in the designer's screen picker. */
  titleKey: string
  /** Everything this screen can show, by panel id. */
  panels: Record<string, PanelDef<TComponent>>
  /** Form-shaped panels' field catalogues, by panel id. */
  fields?: Record<string, PanelFieldDef[]>
  /** Grid panels' column catalogues, by panel id. */
  gridColumns?: Record<string, PanelFieldDef[]>
  /** The arrangement the screen ships with, and the fallback for a document that fails. */
  defaultLayout: () => ScreenLayout
  presets?: LayoutPreset[]
  /**
   * The designer's preview for this screen: a component taking `designer`, providing the
   * screen's own context with fixture data, and rendering the real layout renderer. Screen
   * specific because the context is — the engine has no idea what an alarm is.
   */
  canvas?: TComponent
}

// ── Catalogue lookups ────────────────────────────────────────────────────────

export function getPanelDef<C>(screen: LayoutScreenDef<C>, panelId: string): PanelDef<C> | undefined {
  return screen.panels[panelId]
}

/** Panel ids a layout must contain to be publishable. */
export function requiredPanelIds(screen: LayoutScreenDef<any>): string[] {
  return Object.values(screen.panels).filter((p) => p.required).map((p) => p.id)
}

/**
 * What the designer's palette offers. `can` is passed in rather than read here so the
 * designer can preview the palette as a different role.
 */
export function availablePanels<C>(screen: LayoutScreenDef<C>, can: (scope: string) => boolean): PanelDef<C>[] {
  return Object.values(screen.panels).filter((p) => !p.scope || can(p.scope))
}

/** A panel's field catalogue, or an empty list for one that is not form-shaped. */
export function panelFields(screen: LayoutScreenDef<any>, panelId: string): PanelFieldDef[] {
  return screen.fields?.[panelId] ?? []
}

/** A grid panel's column catalogue, or an empty list for a panel that hosts no grid. */
export function gridColumns(screen: LayoutScreenDef<any>, panelId: string): PanelFieldDef[] {
  return screen.gridColumns?.[panelId] ?? []
}

/** Ids this panel will not let a document hide. */
export function requiredFieldIds(screen: LayoutScreenDef<any>, panelId: string): string[] {
  return panelFields(screen, panelId).filter((f) => f.required).map((f) => f.id)
}
