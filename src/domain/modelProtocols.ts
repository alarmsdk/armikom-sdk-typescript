/**
 * Pure logic behind the Protocol Studio's model ↔ protocol view.
 *
 * `ModelProtocol` is a junction table: a row says "a panel of this model can speak this
 * protocol", and the subscriber form's model → protocol cascade is built from it. The
 * table has no unique constraint and the API does not check for an existing pair on
 * create, so real installations carry duplicate pairs and rows whose model was deleted.
 * This module turns the flat link list into a pair index and reports those findings,
 * so the screen can show them and remove them.
 *
 * The list endpoint answers `LookupItem` — `id`, `name` (the protocol's name) and
 * `parentId` (the model id) — and nothing else. The protocol id is recovered by name,
 * which is unique in every installation seen so far; a name that is missing or matches
 * more than one protocol is reported as unresolved, and the composable reads those rows
 * back one by one from the detail endpoint.
 */

export interface ProtocolLookupRow {
  id: string
  name?: string | null
  parentId?: string | null
}

export interface LinkRow {
  id: string
  modelId: string | null
  protocolId: string | null
  protocolName: string
}

export interface PairIndex {
  /** modelId → protocolId → link ids (more than one is a duplicate). */
  byModel: Map<string, Map<string, string[]>>
  /** protocolId → set of model ids. */
  byProtocol: Map<string, Set<string>>
}

export interface ModelProtocolFindings {
  /** Link ids beyond the first for every pair stored more than once. */
  duplicateLinkIds: string[]
  duplicatePairCount: number
  /** Links whose model or protocol is missing or no longer exists. */
  orphanLinkIds: string[]
  modelsWithoutProtocol: string[]
  protocolsWithoutModel: string[]
}

export function nameKey(name: string | null | undefined): string {
  return (name ?? '').trim().toLocaleLowerCase('tr')
}

/**
 * Resolves each list row's protocol id by name. Rows whose name matches no protocol or
 * more than one are returned in `unresolved` with `protocolId: null`.
 */
export function resolveLinks(
  rows: ProtocolLookupRow[],
  protocols: ProtocolLookupRow[]
): { links: LinkRow[]; unresolved: string[] } {
  const byName = new Map<string, string | null>()
  for (const protocol of protocols) {
    // Exact (trimmed) match: the list's name is the server's own join on Protocol.Name,
    // and Turkish case folding would turn "ID" into "ıd".
    const key = (protocol.name ?? '').trim()
    // A second protocol with the same name makes the name useless as a key.
    byName.set(key, byName.has(key) ? null : protocol.id)
  }

  const links: LinkRow[] = []
  const unresolved: string[] = []
  for (const row of rows) {
    const protocolId = byName.get((row.name ?? '').trim()) ?? null
    if (!protocolId) unresolved.push(row.id)
    links.push({
      id: row.id,
      modelId: row.parentId ?? null,
      protocolId,
      protocolName: row.name ?? ''
    })
  }
  return { links, unresolved }
}

export function buildPairIndex(links: LinkRow[]): PairIndex {
  const byModel = new Map<string, Map<string, string[]>>()
  const byProtocol = new Map<string, Set<string>>()
  for (const link of links) {
    if (!link.modelId || !link.protocolId) continue
    let protocols = byModel.get(link.modelId)
    if (!protocols) byModel.set(link.modelId, (protocols = new Map()))
    const ids = protocols.get(link.protocolId)
    if (ids) ids.push(link.id)
    else protocols.set(link.protocolId, [link.id])

    let models = byProtocol.get(link.protocolId)
    if (!models) byProtocol.set(link.protocolId, (models = new Set()))
    models.add(link.modelId)
  }
  return { byModel, byProtocol }
}

export function auditLinks(
  links: LinkRow[],
  index: PairIndex,
  models: ProtocolLookupRow[],
  protocols: ProtocolLookupRow[]
): ModelProtocolFindings {
  const modelIds = new Set(models.map((m) => m.id))
  const protocolIds = new Set(protocols.map((p) => p.id))

  const duplicateLinkIds: string[] = []
  let duplicatePairCount = 0
  for (const pairs of index.byModel.values()) {
    for (const ids of pairs.values()) {
      if (ids.length < 2) continue
      duplicatePairCount++
      duplicateLinkIds.push(...ids.slice(1))
    }
  }

  const orphanLinkIds = links
    .filter(
      (l) => !l.modelId || !modelIds.has(l.modelId) || !l.protocolId || !protocolIds.has(l.protocolId)
    )
    .map((l) => l.id)

  return {
    duplicateLinkIds,
    duplicatePairCount,
    orphanLinkIds,
    modelsWithoutProtocol: models.filter((m) => !index.byModel.get(m.id)?.size).map((m) => m.id),
    protocolsWithoutModel: protocols.filter((p) => !index.byProtocol.get(p.id)?.size).map((p) => p.id)
  }
}

/** What has to be created and removed to turn `saved` into `draft`. */
export function diffSets(saved: Set<string>, draft: Set<string>): { add: string[]; remove: string[] } {
  return {
    add: [...draft].filter((id) => !saved.has(id)),
    remove: [...saved].filter((id) => !draft.has(id))
  }
}

export function sortByName<T extends { name?: string | null }>(rows: T[]): T[] {
  return [...rows].sort((a, b) => (a.name ?? '').localeCompare(b.name ?? '', 'tr', { sensitivity: 'base' }))
}

/** Runs `tasks` with at most `limit` in flight and reports how many failed. */
export async function runPool(
  tasks: Array<() => Promise<unknown>>,
  limit = 4
): Promise<{ done: number; failed: number; firstError: unknown }> {
  let next = 0
  let done = 0
  let failed = 0
  let firstError: unknown = null
  async function worker() {
    while (next < tasks.length) {
      const task = tasks[next++]
      if (!task) break
      try {
        await task()
        done++
      } catch (err) {
        failed++
        if (!firstError) firstError = err
      }
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, tasks.length) }, worker))
  return { done, failed, firstError }
}
