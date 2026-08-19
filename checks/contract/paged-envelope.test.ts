// The asymmetry is deliberate: reference lists are bare arrays (D69) while the
// real collections stay wrapped. Both shapes must exist in the generated types.
import test from 'node:test';
import assert from 'node:assert/strict';

import { Configuration, SubscribersApi } from '../../generated/index';
import type { SideListItemPagedResult } from '../../generated/index';
import { stubJsonFetch } from './_helpers';
import type { Expect } from './_helpers';

type GetSidesResult = Awaited<ReturnType<SubscribersApi['getSides']>>;

// getSides must be the envelope, and must NOT be a bare array.
type _sidesIsEnvelope = Expect<[GetSidesResult] extends [SideListItemPagedResult] ? true : false>;
type _sidesIsNotArray = Expect<[GetSidesResult] extends [Array<unknown>] ? false : true>;

test('/v1/sides returns SideListItemPagedResult, not a bare array', async () => {
  const api = new SubscribersApi(
    new Configuration({
      fetchApi: stubJsonFetch({
        items: [{ id: 11 }, { id: 12 }],
        totalCount: 2,
        cursor: null,
        hasMore: false,
      }),
    }),
  );
  const result = await api.getSides({});
  assert.ok(!Array.isArray(result), '/v1/sides must stay wrapped');
  assert.equal(result.totalCount, 2);
  assert.equal(result.items?.length, 2);
  assert.equal(result.hasMore, false);
});
