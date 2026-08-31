// D69 — most GET lists under /v1/reference/ return a BARE ARRAY, not a paged
// envelope. Three signal-dictionary endpoints (GetSignals, GetSignalTypes,
// ListSignalRelations) were promoted to PagedResult to support the admin UI's
// pagination and search. The remaining 26 stay bare arrays.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { Configuration, ReferenceDataApi } from '../../generated/index';
import type { LookupItem } from '../../generated/index';
import { stubJsonFetch, repoRoot } from './_helpers';
import type { Expect, IsArrayOf } from './_helpers';

type GetBrandsResult = Awaited<ReturnType<ReferenceDataApi['getBrands']>>;

// Brands (and the other 25 lookup lists) are still bare arrays.
type _brandsIsBareArray = Expect<IsArrayOf<GetBrandsResult, LookupItem>>;

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

test('D69: listSignalRelations returns a paged envelope', async () => {
  const api = new ReferenceDataApi(
    new Configuration({ fetchApi: stubJsonFetch({ items: [{ id: 7 }], totalCount: 1, hasMore: false }) }),
  );
  const result = await api.listSignalRelations({});
  assert.ok(!Array.isArray(result), 'listSignalRelations now returns a paged envelope');
  assert.ok(Array.isArray(result.items));
  assert.equal(result.items!.length, 1);
});

const PAGINATED_OPS = new Set(['GetSignals', 'GetSignalTypes', 'ListSignalRelations']);

test('D69: 26 bare-array + 3 paginated reference lists in generated/', () => {
  const root = repoRoot();
  const spec = JSON.parse(
    readFileSync(join(root, 'openapi/armikom-api.v1.json'), 'utf8'),
  ) as { paths: Record<string, Record<string, any>> };

  const bare: string[] = [];
  const paged: string[] = [];
  for (const [path, ops] of Object.entries(spec.paths)) {
    if (!path.startsWith('/v1/reference/')) continue;
    const get = ops['get'];
    if (!get) continue;
    const schema = get.responses?.['200']?.content?.['application/json']?.schema;
    if (schema?.type === 'array') {
      bare.push(get.operationId as string);
    } else if (schema?.['$ref'] || schema?.properties?.items) {
      paged.push(get.operationId as string);
    }
  }

  assert.equal(bare.length, 26, `expected 26 bare-array reference lists, got ${bare.length}`);

  for (const op of PAGINATED_OPS) {
    assert.ok(paged.includes(op), `${op} should be a paginated endpoint`);
  }

  const src = readFileSync(join(root, 'generated/apis/ReferenceDataApi.ts'), 'utf8');
  const missing = bare.filter((opId) => {
    const method = opId.charAt(0).toLowerCase() + opId.slice(1);
    return !new RegExp(`async ${method}\\(.*\\): Promise<Array<`).test(src);
  });
  assert.deepEqual(missing, [], 'these reference lists are not typed Promise<Array<…>>');
});
