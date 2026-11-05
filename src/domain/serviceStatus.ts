/** Status rules for a service record, shared by every screen that lists them. */

const TERMINAL_STATUSES = ['completed', 'cancelled']

/** Completed or cancelled: the record can no longer change. */
export function isServiceTerminal(status?: string | null): boolean {
  return TERMINAL_STATUSES.includes((status || '').toLowerCase())
}

/** Planned in the past while not terminal: the row the dispatcher must see first. */
export function isServiceOverdue(row: { plannedDate?: any; status?: string | null }): boolean {
  return !!row.plannedDate && !isServiceTerminal(row.status) && new Date(row.plannedDate).getTime() < Date.now()
}

/** How many records are still open — the panel badge. */
export function openServiceCount(rows: Array<{ status?: string | null }> | null | undefined): number {
  return (rows ?? []).filter((r) => !isServiceTerminal(r.status)).length
}
