// D70 — these four operations are deliberately unbuilt. They are not gaps and
// must not be stubbed. If one appears in generated/, either the contract moved
// or somebody hand-wrote into the generated layer.
// Note: DeleteOperatorUser was removed from this list — it is now a real endpoint.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

import { repoRoot } from './_helpers';

const ABSENT = [
  'GetRole',
  'GetSideControl',
  'GetSideSimCard',
  'GetSideMail',
] as const;

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((entry) => {
    const p = join(dir, entry);
    return statSync(p).isDirectory() ? walk(p) : [p];
  });
}

test('D70: the four unbuilt operations are absent from the pinned contract', () => {
  const spec = JSON.parse(
    readFileSync(join(repoRoot(), 'openapi/armikom-api.v1.json'), 'utf8'),
  ) as { paths: Record<string, Record<string, { operationId?: string }>> };

  const ids = new Set<string>();
  for (const ops of Object.values(spec.paths)) {
    for (const op of Object.values(ops)) {
      if (op && typeof op === 'object' && op.operationId) ids.add(op.operationId);
    }
  }
  // The count is a fact about the pinned contract, not about D70 itself. It is
  // here so a re-pin is a deliberate edit rather than something that slips in.
  // 394 -> 399: the five signal-relation-type operations, added with the relation
  // type/scope work. Re-pinned deliberately.
  // 399 -> 404: the five UiLayout operations (GET/PUT/DELETE user layouts,
  // GET/PUT layout templates). Re-pinned deliberately.
  // 404 -> 405: GetAdvisories, the read side of the LLM signal relation.
  // Re-pinned deliberately.
  // 405 -> 411: additional operations added on master. Re-pinned deliberately.
  // 411 -> 412: GetAdvisories endpoint added. Re-pinned deliberately.
  // 412 -> 416: CityEmergencyContact CRUD + expanded search. Re-pinned deliberately.
  // 418 -> 422: UI layout template pool endpoints (list, save/delete by id, active). Re-pinned deliberately.
  // 422 -> 423: BatchLinkMobileUserToSides — one user to many subscribers in a single
  // request, so a console linking a search result stops spending one call per row.
  // 423 -> 424: PUT replaceActionText — replace (not append) action text on a signal event.
  // Re-pinned deliberately.
  assert.equal(ids.size, 424, 'operation count moved off the pinned contract');
  for (const opId of ABSENT) {
    assert.ok(!ids.has(opId), `${opId} is present in the spec — D70 says it must not be`);
  }
});

test('D70: nothing in generated/ references the four unbuilt operations', () => {
  const root = repoRoot();
  const files = walk(join(root, 'generated')).filter((f) => /\.(ts|md)$/.test(f));
  assert.ok(files.length > 300, `expected the full generated tree, saw ${files.length} files`);

  const hits: string[] = [];
  for (const file of files) {
    const src = readFileSync(file, 'utf8');
    for (const opId of ABSENT) {
      const method = opId.charAt(0).toLowerCase() + opId.slice(1);
      // Word-boundary match on both casings; avoids matching e.g. getRoles.
      if (new RegExp(`\\b(${opId}|${method})\\b`).test(src)) {
        hits.push(`${file.slice(root.length + 1)} :: ${opId}`);
      }
    }
  }
  assert.deepEqual(hits, [], 'D70 operations leaked into the generated layer');
});
