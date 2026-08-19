// D70 — these five operations are deliberately unbuilt. They are not gaps and
// must not be stubbed. If one appears in generated/, either the contract moved
// or somebody hand-wrote into the generated layer.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

import { repoRoot } from './_helpers';

const ABSENT = [
  'DeleteOperatorUser',
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

test('D70: the five unbuilt operations are absent from the frozen contract', () => {
  const spec = JSON.parse(
    readFileSync(join(repoRoot(), 'openapi/armikom-api.v1.json'), 'utf8'),
  ) as { paths: Record<string, Record<string, { operationId?: string }>> };

  const ids = new Set<string>();
  for (const ops of Object.values(spec.paths)) {
    for (const op of Object.values(ops)) {
      if (op && typeof op === 'object' && op.operationId) ids.add(op.operationId);
    }
  }
  assert.equal(ids.size, 309, 'operation count moved off the api-v1.0 freeze');
  for (const opId of ABSENT) {
    assert.ok(!ids.has(opId), `${opId} is present in the spec — D70 says it must not be`);
  }
});

test('D70: nothing in generated/ references the five unbuilt operations', () => {
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
