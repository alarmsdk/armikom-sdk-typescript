/** Shared view-model shapes for the generic shell components (TabNav, DetailList). */

export interface TabItem {
  id: string
  label: string
  /** Capability the tab needs; a tab whose scope is absent is not rendered at all (V5, P6). */
  scope?: string
  badge?: number | string
  disabled?: boolean
}

export interface DetailEntry {
  label: string
  /** Raw domain value. Never translated on the client (V4) — rendered as received. */
  value?: string | number | boolean | Date | null
  /** Free-form note explaining what the value drives; used by the config screen. */
  hint?: string
  mono?: boolean
  /** When set to `'phone'`, renders a DialButton (S-503) instead of plain text. */
  type?: 'text' | 'phone' | 'date' | 'boolean'
  /** Context forwarded to DialButton for signal action notes and subscriber tracking. */
  phoneContext?: { sideId?: string; signalEventId?: string; contactName?: string }
  /** Optional field identifier for scoped slot matching; not rendered. */
  _fid?: string
}

/** One editable column in the generic subscriber sub-resource editor. */
export interface EditorField {
  key: string
  label: string
  type?: 'text' | 'number' | 'checkbox' | 'date' | 'time' | 'color' | 'select' | 'textarea' | 'rtf' | 'phone'
  required?: boolean
  /** Rendered as bullets until the operator explicitly reveals it (verbal safe-words). */
  masked?: boolean
  /**
   * Row key of the "stored" flag for a column the API may withhold (D76, e.g. `hasPassword`).
   * When the value is null but the flag is set, the cell says the value is hidden, and the
   * edit input leaves it untouched unless the operator types a new one.
   */
  secretFlag?: string
  mono?: boolean
  placeholder?: string
  options?: Array<{ value: string; label: string }>
  /** Column is shown but never submitted — server-derived display values. */
  readOnly?: boolean
  width?: string
}

/**
 * One active criterion, restated above a grid so the operator can see — and clear —
 * what the rows have been filtered by.
 *
 * It exists for the exclusions. An include is visible in the result: you asked for
 * dealer ACME and every row says ACME. An exclusion is invisible — the rows that would
 * have told you are the ones that are gone, so a filter left on from an hour ago reads
 * as "the data is missing" and becomes a support call.
 */
export interface FilterToken {
  /** Stable key: `${kind}:${chipId ?? ''}`. */
  id: string
  /** Which filter this came from, so the parent knows what to clear. */
  kind: string
  /** The chip's id when the token is one value of a multi-value filter. */
  chipId?: string
  /** Field name, already localised. */
  group: string
  /** The value as the operator typed or picked it. */
  value: string
  exclude?: boolean
  /** A criterion that always has a value — a date range — is stated but not removable. */
  removable?: boolean
}

/**
 * One value picked in a multi-value filter field (the autocomplete chip input). A chip carries
 * its own polarity so include and exclude can be mixed in one field: "these two dealers, but
 * not this one". Absent means include, which is what keeps already-shared URLs and stored
 * filters reading the same.
 */
export interface ChipItem {
  id: string
  label: string
  exclude?: boolean
}
