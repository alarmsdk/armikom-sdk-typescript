/**
 * §01 §7 — the reference bundle as a cached, indexed catalogue.
 *
 * CA-3: screens call this, never `GetReferenceBundle`. CA-4: lookups are maps,
 * because `SignalTypeItem` is resolved once per row when rendering the alarm
 * and signal grids and a linear scan per row is O(n·m) on the hottest screen in
 * the product.
 */
import { ETagResource, indexBy, type CacheStore } from '../core/cache.js';
import type { Clock } from '../core/clock.js';
import type { HttpClient } from '../core/http-client.js';
import type { ReferenceBundleResponse } from '../../generated/models/ReferenceBundleResponse.js';
import type { LookupItem } from '../../generated/models/LookupItem.js';
import type { SignalTypeItem } from '../../generated/models/SignalTypeItem.js';

export interface ReferenceCatalogueOptions {
  http: HttpClient;
  store: CacheStore;
  clock?: Clock;
  cacheKey?: string;
}

/** The indexed view. Rebuilt only when the bundle actually changes. */
export class ReferenceIndex {
  readonly bundle: ReferenceBundleResponse;
  readonly signalTypesById: Map<string, SignalTypeItem>;
  readonly brandsById: Map<string, LookupItem>;
  readonly countriesById: Map<string, LookupItem>;
  readonly regionsById: Map<string, LookupItem>;
  readonly citiesById: Map<string, LookupItem>;
  readonly accountTypesById: Map<string, LookupItem>;
  readonly sideTypesById: Map<string, LookupItem>;
  readonly serviceTypesById: Map<string, LookupItem>;
  readonly accountItemsById: Map<string, LookupItem>;
  readonly alarmCategoriesById: Map<string, LookupItem>;

  constructor(bundle: ReferenceBundleResponse) {
    this.bundle = bundle;
    const byId = <T extends { id?: string }>(items: T[] | null | undefined) => indexBy(items ?? [], (i) => i.id);
    this.signalTypesById = byId(bundle.signalTypes);
    this.brandsById = byId(bundle.brands);
    this.countriesById = byId(bundle.countries);
    this.regionsById = byId(bundle.regions);
    this.citiesById = byId(bundle.cities);
    this.accountTypesById = byId(bundle.accountTypes);
    this.sideTypesById = byId(bundle.sideTypes);
    this.serviceTypesById = byId(bundle.serviceTypes);
    this.accountItemsById = byId(bundle.accountItems);
    this.alarmCategoriesById = byId(bundle.alarmCategories);
  }

  signalType(id: string | null | undefined): SignalTypeItem | undefined {
    return id ? this.signalTypesById.get(id) : undefined;
  }
}

export class ReferenceCatalogue {
  private readonly resource: ETagResource<ReferenceBundleResponse>;
  private index: ReferenceIndex | null = null;
  private indexedBundle: ReferenceBundleResponse | null = null;

  constructor(options: ReferenceCatalogueOptions) {
    this.resource = new ETagResource<ReferenceBundleResponse>({
      key: options.cacheKey ?? 'reference.bundle',
      store: options.store,
      ...(options.clock ? { clock: options.clock } : {}),
      fetch: async (etag, signal) => {
        const response = await options.http.request<ReferenceBundleResponse>({
          method: 'GET',
          path: '/v1/reference/bundle',
          operationId: 'GetReferenceBundle',
          ...(etag ? { ifNoneMatch: etag } : {}),
          allowNotModified: true,
          ...(signal ? { signal } : {}),
        });
        return {
          ...(response.notModified ? {} : { value: response.data }),
          etag: response.etag,
          notModified: response.notModified,
        };
      },
    });
  }

  /** §01 CA-3 — transparently revalidating accessor. */
  bundle(signal?: AbortSignal): Promise<ReferenceBundleResponse> {
    return this.resource.get(signal);
  }

  /** §01 CA-4 — the indexed view, rebuilt only when the bundle identity changes. */
  async indexed(signal?: AbortSignal): Promise<ReferenceIndex> {
    const bundle = await this.bundle(signal);
    if (this.index && this.indexedBundle === bundle) return this.index;
    this.index = new ReferenceIndex(bundle);
    this.indexedBundle = bundle;
    return this.index;
  }

  /** Hook for the `reference-bundle-changed` stream event. */
  async invalidate(): Promise<void> {
    this.index = null;
    this.indexedBundle = null;
    await this.resource.invalidate();
  }

  refresh(signal?: AbortSignal): Promise<ReferenceBundleResponse> {
    this.index = null;
    this.indexedBundle = null;
    return this.resource.refresh(signal);
  }
}
