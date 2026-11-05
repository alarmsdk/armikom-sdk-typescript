/**
 * Resolving which fields a form-shaped panel shows, and in what order.
 *
 * The same shape of decision `useGrid` makes for columns, kept pure and in one place so it
 * can be tested without a DOM and so the panel, the designer's checklist and the validator
 * all agree about what a document means.
 *
 * Two rules are worth stating, because both are the difference between a feature and a trap:
 *
 *   · The catalogue is authoritative about what exists. An id in the document that the panel
 *     does not declare is dropped, not rendered — a layout written against a newer build,
 *     or hand-edited, must never put an empty row on an operator's screen.
 *   · `hidden` is all-or-nothing. When the document carries one, it *is* the answer, so an
 *     admin can switch on a field the panel hides by default. Without that, `hiddenByDefault`
 *     would be a field no document could ever turn on.
 *   · A `required` field shows whatever the document says. The designer already refuses to
 *     uncheck it, but a hand-edited or imported layout does not go through the designer —
 *     and a note editor without its note body is a form that cannot be submitted.
 */
import type { PanelFieldDef } from './catalogue.js'
import type { FieldPanelSettings } from './types.js'

export interface ResolvedField extends PanelFieldDef {
  visible: boolean
}

/**
 * The catalogue in the order the document asks for, each entry carrying whether it shows.
 * Hidden fields stay in the list so the designer can offer them back; callers that render
 * filter on `visible`.
 */
export function resolveFields(
  catalogue: PanelFieldDef[],
  settings?: FieldPanelSettings
): ResolvedField[] {
  const byId = new Map(catalogue.map((f) => [f.id, f]))

  // Ordered ids the catalogue knows, then everything the document did not mention — a field
  // added by a later build appears where its panel puts it rather than vanishing.
  const ordered: PanelFieldDef[] = []
  const taken = new Set<string>()
  for (const id of settings?.order ?? []) {
    const field = byId.get(id)
    if (!field || taken.has(id)) continue
    ordered.push(field)
    taken.add(id)
  }
  for (const field of catalogue) {
    if (!taken.has(field.id)) ordered.push(field)
  }

  const hidden = settings?.hidden ? new Set(settings.hidden) : null
  return ordered.map((field) => ({
    ...field,
    visible: field.required || (hidden ? !hidden.has(field.id) : !field.hiddenByDefault)
  }))
}

/** Just the ids that render, in order — what a panel's template iterates. */
export function visibleFieldIds(catalogue: PanelFieldDef[], settings?: FieldPanelSettings): string[] {
  return resolveFields(catalogue, settings).filter((f) => f.visible).map((f) => f.id)
}

/**
 * The settings a designer edit produces. Written out in full — both order and hidden, every
 * time — so the stored document says what it means rather than depending on what the build
 * that reads it happens to default to.
 */
export function fieldSettingsFrom(fields: ResolvedField[]): FieldPanelSettings {
  return {
    order: fields.map((f) => f.id),
    hidden: fields.filter((f) => !f.visible).map((f) => f.id)
  }
}

/** Moves a field one place up or down. Out-of-range moves are no-ops, not errors. */
export function moveField<T>(fields: T[], from: number, to: number): T[] {
  if (from < 0 || from >= fields.length || to < 0 || to >= fields.length || from === to) return fields
  const next = [...fields]
  const [moved] = next.splice(from, 1)
  next.splice(to, 0, moved as T)
  return next
}

/**
 * A panel's own field specs, put in the order a document asks for and filtered to what it
 * shows.
 *
 * The catalogue and the spec list are two views of the same fields: the catalogue is what an
 * admin arranges (an id and a label), the spec is what the editor needs to draw one (a type,
 * a width, options). Matching them on id here is what lets the subscriber screen's table
 * editors honour a layout without every editor learning about layouts.
 *
 * A spec the catalogue does not name is dropped, not appended: the catalogue is authoritative
 * about what exists (L11), and an unlisted spec is one an admin has no way to turn off.
 */
export function applyFieldLayout<T>(
  specs: T[],
  resolved: ResolvedField[],
  idOf: (spec: T) => string
): T[] {
  const bySpecId = new Map(specs.map((spec) => [idOf(spec), spec]))
  const ordered: T[] = []
  for (const field of resolved) {
    if (!field.visible) continue
    const spec = bySpecId.get(field.id)
    if (spec) ordered.push(spec)
  }
  return ordered
}
