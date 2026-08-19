// D69 — every GET list under /v1/reference/ returns a BARE ARRAY, not a paged
// envelope. If the generated client wraps them, the generator is wrong, not the
// contract. Checked at the type level (tsc fails the build) and at runtime.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { Configuration, ReferenceDataApi } from '../../generated/index';
import type { LookupItem, SignalRelationItem } from '../../generated/index';
import { stubJsonFetch, repoRoot } from './_helpers';
import type { Expect, IsArrayOf } from './_helpers';

type GetBrandsResult = Awaited<ReturnType<ReferenceDataApi['getBrands']>>;
type ListSignalRelationsResult = Awaited<ReturnType<ReferenceDataApi['listSignalRelations']>>;

// If either of these ever becomes an envelope, tsc fails here.
type _brandsIsBareArray = Expect<IsArrayOf<GetBrandsResult, LookupItem>>;
type _relationsIsBareArray = Expect<IsArrayOf<ListSignalRelationsResult, SignalRelationItem>>;

test('D69: getBrands deserialises a bare array', async () => {
  const api = new ReferenceDataApi(
    new Configuration({
      fetchApi: stubJsonFetch([
        { id: 1, name: 'Bosch' },
        { id: 2, name: 'Paradox' },
      ]),
    }),
  );
  const result = await api.getBrands({});
  assert.ok(Array.isArray(result), 'getBrands must return an array, not an envelope');
  assert.equal(result.length, 2);
  assert.equal(result[0]?.name, 'Bosch');
  assert.ok(!('items' in (result as unknown as Record<string, unknown>)));
});

test('D69: listSignalRelations deserialises a bare array', async () => {
  const api = new ReferenceDataApi(new Configuration({ fetchApi: stubJsonFetch([{ id: 7 }]) }));
  const result = await api.listSignalRelations({});
  assert.ok(Array.isArray(result), 'listSignalRelations must return an array, not an envelope');
  assert.equal(result.length, 1);
});

test('D69: all 27 bare-array reference lists are typed as arrays in generated/', () => {
  // Guard against a partial regression: the count itself is part of the decision.
  const root = repoRoot();
  const spec = JSON.parse(
    readFileSync(join(root, 'openapi/armikom-api.v1.json'), 'utf8'),
  ) as { paths: Record<string, Record<string, any>> };

  const bare: string[] = [];
  for (const [path, ops] of Object.entries(spec.paths)) {
    if (!path.startsWith('/v1/reference/')) continue;
    const get = ops['get'];
    if (!get) continue;
    const schema = get.responses?.['200']?.content?.['application/json']?.schema;
    if (schema?.type === 'array') bare.push(get.operationId as string);
  }
  assert.equal(bare.length, 27, `expected 27 bare-array reference lists (D69), got ${bare.length}`);

  const src = readFileSync(join(root, 'generated/apis/ReferenceDataApi.ts'), 'utf8');
  const missing = bare.filter((opId) => {
    const method = opId.charAt(0).toLowerCase() + opId.slice(1);
    return !new RegExp(`async ${method}\\(.*\\): Promise<Array<`).test(src);
  });
  assert.deepEqual(missing, [], 'these reference lists are not typed Promise<Array<…>>');
});
