/**
 * Angular bindings for `@armikom/api-client`. Copy into your app; it is ~60
 * lines and it is the *only* Angular-aware file you need.
 *
 * The SDK deliberately ships no `@angular/*` dependency. Angular's part is DI
 * and change detection, and both are three lines each — a published adapter
 * package would add a version matrix to maintain and buy nothing.
 *
 * In use:
 *
 *   // app.config.ts
 *   providers: [provideArmikom({ baseUrl: environment.apiUrl })]
 *
 *   // a component
 *   private readonly client = inject(ARMIKOM_CLIENT);
 *   readonly session = toSignal(from(this.client.session.state));
 *   readonly canComplete = computed(() => this.client.session.can('alarms:write'));
 */
import { InjectionToken, Provider, inject } from '@angular/core';

import {
  ArmikomClient,
  ConsoleLogger,
  MemoryCacheStore,
  MemoryTokenStore,
  MultiLogger,
  WebStorageCacheStore,
  WebStorageTokenStore,
  type ArmikomClientOptions,
} from '@armikom/api-client';

export const ARMIKOM_CLIENT = new InjectionToken<ArmikomClient>('ARMIKOM_CLIENT');

export interface ArmikomAngularOptions extends Omit<ArmikomClientOptions, 'tokenStore' | 'cache'> {
  /**
   * §01 A-11 — the SDK will not persist a refresh token for you. Say so here,
   * once, deliberately. `false` keeps the session in memory only, which means a
   * page reload logs the user out.
   */
  persistSession?: boolean;
  /** §01 CA-2 — persist the reference and localisation bundles across cold starts. */
  persistCache?: boolean;
}

export function provideArmikom(options: ArmikomAngularOptions): Provider[] {
  return [
    {
      provide: ARMIKOM_CLIENT,
      useFactory: () =>
        new ArmikomClient({
          ...options,
          tokenStore: options.persistSession
            ? new WebStorageTokenStore(localStorage)
            : new MemoryTokenStore(),
          cache: options.persistCache ? new WebStorageCacheStore(localStorage) : new MemoryCacheStore(),
          logger: options.logger ?? new MultiLogger([new ConsoleLogger({ prefix: '[armikom]' })]),
        }),
    },
  ];
}

/**
 * Routing:
 *
 *   export const authGuard: CanActivateFn = () => {
 *     const client = inject(ARMIKOM_CLIENT);
 *     const router = inject(Router);
 *     if (client.session.isAuthenticated) return true;
 *     return router.createUrlTree(['/login']);
 *   };
 *
 * There is no HTTP interceptor to register. The bearer header, the proactive
 * and single-flight refresh, the replay-once on 401, `Accept-Language`, retry
 * with backoff and the per-call deadline are all inside the SDK's pipeline, and
 * they apply to every one of the generated operations without any of them
 * knowing.
 *
 * Reading SDK state in a template — the interop on `Store` means RxJS `from()`
 * accepts it directly, so `toSignal` works with no glue:
 *
 *   readonly connectivity = toSignal(from(client.connectivity.status), { initialValue: 'online' });
 *   readonly feedMode     = toSignal(from(feed.mode), { initialValue: 'polling' });
 *
 * Cancelling on navigation (§01 RT-6) — pass the component's abort signal:
 *
 *   private readonly ac = new AbortController();
 *   ngOnDestroy() { this.ac.abort(); }
 *   load() { return this.client.reference.bundle(this.ac.signal); }
 */
