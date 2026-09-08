/**
 * `ArmikomClient` — the composition root.
 *
 * It is the only place the three layers meet: the generated transport
 * (`generated/`), the core runtime (`src/core/`), and the small amount of
 * Armikom-specific ergonomics in this folder. Constructing one is the whole
 * setup a host application does; everything else is a method on it.
 */
import { Configuration } from '../../generated/runtime.js';
import { AuthenticationApi } from '../../generated/apis/AuthenticationApi.js';
import type { LocalizationBundleResponse } from '../../generated/models/LocalizationBundleResponse.js';

import { ETagResource, MemoryCacheStore, type CacheStore } from '../core/cache.js';
import type { Clock } from '../core/clock.js';
import { Connectivity } from '../core/connectivity.js';
import { FileClient } from '../core/files.js';
import { HttpClient, type HttpClientOptions } from '../core/http-client.js';
import { I18n } from '../core/i18n.js';
import { noopLogger, type Logger } from '../core/logger.js';
import { EventStream, PollingFallback } from '../core/realtime.js';
import type { RetryPolicy } from '../core/retry.js';
import { AuthSession } from '../core/session.js';
import { MemoryTokenStore, type TokenStore } from '../core/tokens.js';
import type { Transport } from '../core/transport.js';

import { ArmikomAuthDriver, type ArmikomCredentials } from './auth.js';
import { wrapApi } from './errors.js';
import { ReferenceCatalogue } from './reference.js';
import { ArmikomStream } from './stream.js';

/** §01 V-4 — reported at runtime so support can tell which client is talking. */
export const CONTRACT_VERSION = 'api-v1.2';

export interface ArmikomClientOptions {
  baseUrl: string;
  /** §01 A-11 — defaults to memory. Persisting is the host's decision. */
  tokenStore?: TokenStore;
  culture?: string;
  /** §01 §8 — IANA id, e.g. `Europe/Istanbul`. */
  timeZone?: string;
  /** §01 R-3 — `<sdk>/<version> (<host-app>/<version>)`. */
  userAgent?: string;
  transport?: Transport;
  clock?: Clock;
  logger?: Logger;
  retryPolicy?: RetryPolicy;
  /** §01 CA-2 — pass a persistent store and the bundles survive a cold start. */
  cache?: CacheStore;
  connectivity?: Connectivity;
  credentials?: RequestCredentials;
  defaultHeaders?: Record<string, string>;
  random?: () => number;
  /** Path of the SSE endpoint. Overridable for a proxy that remounts it. */
  streamPath?: string;
}

type ApiConstructor<T> = new (configuration: Configuration) => T;

export class ArmikomClient {
  readonly http: HttpClient;
  readonly session: AuthSession<ArmikomCredentials>;
  readonly files: FileClient;
  readonly i18n: I18n;
  readonly reference: ReferenceCatalogue;
  readonly stream: ArmikomStream;
  readonly connectivity: Connectivity;
  readonly cache: CacheStore;
  readonly logger: Logger;
  readonly contractVersion = CONTRACT_VERSION;

  /** The generated layer's configuration, routed through the core pipeline. */
  readonly configuration: Configuration;

  private readonly apiCache = new Map<unknown, unknown>();
  private readonly localizationBundles = new Map<string, ETagResource<LocalizationBundleResponse>>();

  constructor(options: ArmikomClientOptions) {
    this.logger = options.logger ?? noopLogger;
    this.cache = options.cache ?? new MemoryCacheStore();
    this.connectivity = options.connectivity ?? new Connectivity();

    const httpOptions: HttpClientOptions = {
      baseUrl: options.baseUrl,
      connectivity: this.connectivity,
      logger: this.logger,
      contractVersion: CONTRACT_VERSION,
      ...(options.transport ? { transport: options.transport } : {}),
      ...(options.clock ? { clock: options.clock } : {}),
      ...(options.retryPolicy ? { retryPolicy: options.retryPolicy } : {}),
      ...(options.culture ? { culture: options.culture } : {}),
      ...(options.timeZone ? { timeZone: options.timeZone } : {}),
      ...(options.userAgent ? { userAgent: options.userAgent } : {}),
      ...(options.defaultHeaders ? { defaultHeaders: options.defaultHeaders } : {}),
      ...(options.credentials ? { credentials: options.credentials } : {}),
      ...(options.random ? { random: options.random } : {}),
    };
    this.http = new HttpClient(httpOptions);

    // The generated APIs talk to the pipeline, not to `fetch`. Auth, retry,
    // deadlines, error mapping and telemetry therefore apply to all 309
    // operations without a line of generated code knowing about any of it.
    this.configuration = new Configuration({ basePath: options.baseUrl, fetchApi: this.http.fetch });

    // `Login` and `RefreshToken` go through the same pipeline: the anonymous
    // path list in `isAnonymousPath` keeps them from asking the session for a
    // token, which is what would otherwise make refresh recursive.
    const authApi = wrapApi(new AuthenticationApi(this.configuration));

    this.session = new AuthSession<ArmikomCredentials>({
      driver: new ArmikomAuthDriver(authApi),
      tokenStore: options.tokenStore ?? new MemoryTokenStore(),
      ...(options.clock ? { clock: options.clock } : {}),
    });
    this.http.setSession(this.session as unknown as AuthSession<unknown>);

    this.files = new FileClient(this.http);
    this.i18n = new I18n({
      culture: options.culture ?? 'tr',
      defaultCulture: 'tr',
      onMissingKey: (key, culture) =>
        // §01 LO-3 — silent fallback is how tr 552 / en 531 / az 508 stayed invisible.
        this.logger.log({
          level: 'debug',
          message: `missing localisation key ${key}`,
          event: 'i18n.missing',
          timestamp: new Date().toISOString(),
          data: { key, culture },
        }),
    });
    this.reference = new ReferenceCatalogue({
      http: this.http,
      store: this.cache,
      ...(options.clock ? { clock: options.clock } : {}),
    });

    this.stream = new ArmikomStream(
      new EventStream({
        path: options.streamPath ?? '/v1/stream',
        baseUrl: options.baseUrl,
        getAccessToken: () => this.session.getAccessToken(),
        connectivity: this.connectivity,
        logger: this.logger,
        ...(options.transport ? { transport: options.transport } : {}),
        ...(options.clock ? { clock: options.clock } : {}),
        ...(options.culture ? { culture: options.culture } : {}),
        ...(options.random ? { random: options.random } : {}),
      }),
    );

    // The two cached bundles announce their own staleness over the stream;
    // honouring that is cheaper and fresher than any TTL (§01 CA-5).
    this.stream.onReferenceBundleChanged(() => void this.reference.invalidate());
    this.stream.onLocalizationBundleChanged(() => {
      for (const resource of this.localizationBundles.values()) void resource.invalidate();
    });

    // §01 S-6 — a stream that will not authenticate must not reconnect-loop
    // after the session ends.
    this.session.onSessionEnded(() => this.stream.stop());
  }

  /**
   * Returns a generated API, memoised, wrapped so its failures are layer 2
   * errors: `client.api(SidesApi).getSides({ ... })`.
   */
  api<T extends object>(ctor: ApiConstructor<T>): T {
    const existing = this.apiCache.get(ctor);
    if (existing) return existing as T;
    const instance = wrapApi(new ctor(this.configuration));
    this.apiCache.set(ctor, instance);
    return instance;
  }

  /** §01 CA-3 — the cached, revalidating localisation bundle for a culture. */
  async localizationBundle(culture = this.i18n.culture.get(), signal?: AbortSignal): Promise<LocalizationBundleResponse> {
    let resource = this.localizationBundles.get(culture);
    if (!resource) {
      resource = new ETagResource<LocalizationBundleResponse>({
        key: `i18n.bundle.${culture}`,
        store: this.cache,
        fetch: async (etag, innerSignal) => {
          const response = await this.http.request<LocalizationBundleResponse>({
            method: 'GET',
            path: `/v1/i18n/${encodeURIComponent(culture)}`,
            operationId: 'GetLocalizationBundle',
            anonymous: true,
            ...(etag ? { ifNoneMatch: etag } : {}),
            allowNotModified: true,
            ...(innerSignal ? { signal: innerSignal } : {}),
          });
          return {
            ...(response.notModified ? {} : { value: response.data }),
            etag: response.etag,
            notModified: response.notModified,
          };
        },
      });
      this.localizationBundles.set(culture, resource);
    }
    const bundle = await resource.get(signal);
    if (bundle.keys) this.i18n.setBundle(culture, bundle.keys as Record<string, unknown>);
    return bundle;
  }

  /** Loads the bundle and switches the client and its headers to that culture. */
  async useCulture(culture: string, signal?: AbortSignal): Promise<void> {
    this.http.setCulture(culture);
    this.i18n.setCulture(culture);
    await this.localizationBundle(culture, signal);
  }

  /**
   * §01 S-10 — polling that runs only while the stream is down and says so.
   * The caller supplies the re-read; the SDK supplies the "which mode am I in"
   * signal the UI must show.
   */
  pollingFallback(poll: () => void | Promise<void>, intervalMs = 5_000): PollingFallback {
    return new PollingFallback({ stream: this.stream.events, poll, intervalMs, logger: this.logger });
  }

  /** Releases timers, sockets and object URLs. Safe to call twice. */
  async dispose(): Promise<void> {
    await this.stream.dispose();
    this.files.urls.revokeAll();
  }
}
