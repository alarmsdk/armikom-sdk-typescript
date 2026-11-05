import type { SideEffect } from './types/confirm.js'

/**
 * What the API says a delete will do (`GET /v1/sides/{id}/delete-preview`,
 * `GET /v1/sides/{id}/contacts/{id}/delete-preview`). Subscribers, contacts and customers
 * are soft-deleted: the row is hidden, not removed, and history keeps pointing at it.
 */
export interface DeletePreview {
  id: string
  title?: string | null
  /** Error codes that stop the delete, e.g. `SIDE.DELETE_REQUIRES_PASSIVE`. */
  blockers?: string[]
  /** The row itself can be restored later (subscribers). */
  restorable?: boolean
  /** Linked rows removed for good with the delete. */
  willDelete?: DeletePreviewCount[]
  /** Linked rows kept as history. */
  kept?: DeletePreviewCount[]
}

export interface DeletePreviewCount {
  kind: string
  count: number
}

type Translate = (key: string, params?: Record<string, unknown>) => string

/** `signalEvents` → `SIGNAL_EVENTS`, the i18n key segment. */
function kindKey(kind: string): string {
  return kind.replace(/([a-z0-9])([A-Z])/g, '$1_$2').toUpperCase()
}

/**
 * Confirmation-dialog lines for a delete preview: first what goes for good, then what
 * stays. A kind the UI has no text for still shows, under its raw name, rather than
 * silently dropping a count the user should see.
 */
export function previewEffects(preview: DeletePreview | null | undefined, t: Translate): SideEffect[] {
  if (!preview) return []
  const line = (group: 'DELETED' | 'KEPT', c: DeletePreviewCount): SideEffect => {
    const key = `UI.DELETE_PREVIEW.${group}.${kindKey(c.kind)}`
    const text = t(key)
    return {
      type: group === 'DELETED' ? 'delete' : 'keep',
      description: text === key ? t(`UI.DELETE_PREVIEW.${group}.OTHER`, { kind: c.kind }) : text,
      count: c.count
    }
  }
  return [
    ...(preview.willDelete ?? []).filter((c) => c.count > 0).map((c) => line('DELETED', c)),
    ...(preview.kept ?? []).filter((c) => c.count > 0).map((c) => line('KEPT', c))
  ]
}
