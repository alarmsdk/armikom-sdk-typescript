/**
 * React bindings for `@armikom/api-client`. Copy into your app.
 *
 * As with Angular, the SDK ships no `react` dependency: the whole binding is a
 * context and two hooks over `useSyncExternalStore`, because the SDK's `Store`
 * was given exactly the shape React already knows how to read —
 * `subscribe(listener) => unsubscribe` plus a synchronous `get()`.
 */
import { createContext, useContext, useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react';
import type { ReactNode } from 'react';

import {
  ArmikomClient,
  PagedResource,
  WebStorageTokenStore,
  isApiError,
  type ArmikomClientOptions,
  type Page,
  type PageFetcher,
  type ReadableStore,
} from '@armikom/api-client';

const ArmikomContext = createContext<ArmikomClient | null>(null);

export function ArmikomProvider({ options, children }: { options: ArmikomClientOptions; children: ReactNode }) {
  // One client for the life of the app: it owns the session, the caches and the
  // stream, and a second one would mean two sessions refreshing each other's
  // rotating refresh token into the ground.
  const client = useMemo(
    () => new ArmikomClient({ tokenStore: new WebStorageTokenStore(localStorage), ...options }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );
  useEffect(() => () => void client.dispose(), [client]);
  return <ArmikomContext.Provider value={client}>{children}</ArmikomContext.Provider>;
}

export function useArmikom(): ArmikomClient {
  const client = useContext(ArmikomContext);
  if (!client) throw new Error('useArmikom must be used inside <ArmikomProvider>');
  return client;
}

/** Binds any SDK store — session state, connectivity, stream status, feed mode. */
export function useStore<T>(store: ReadableStore<T>): T {
  return useSyncExternalStore(store.subscribe, store.get, store.get);
}

export function useSession() {
  const client = useArmikom();
  const state = useStore(client.session.state);
  return {
    ...state,
    can: (scope: string) => client.session.can(scope),
    login: client.session.login.bind(client.session),
    logout: client.session.logout.bind(client.session),
  };
}

/** A paged list screen's whole state, including `isCapped` for the truncating endpoints. */
export function usePagedList<T>(fetcher: PageFetcher<T>, pageSize = 50) {
  const resource = useMemo(() => new PagedResource<T>({ fetch: fetcher, pageSize }), [fetcher, pageSize]);
  const state = useStore(resource.state);
  useEffect(() => {
    void resource.load();
    return () => resource.dispose();
  }, [resource]);
  return { ...state, items: state.data ?? [], resource };
}

/**
 * §01 S-3 / S-9 — a coalesced re-read per burst of nudges, plus one on every
 * reconnect, because the stream has no replay and the gap is simply lost.
 */
export function useAlarmQueue(reload: () => void) {
  const client = useArmikom();
  const latest = useRef(reload);
  latest.current = reload;

  useEffect(() => {
    const off = client.stream.onAlarmListChanged(() => latest.current());
    client.stream.start();
    return off;
  }, [client]);
}

/** One-shot loads, with the SDK's typed error surfaced rather than swallowed. */
export function useAsync<T>(load: (signal: AbortSignal) => Promise<T>, deps: unknown[]) {
  const [state, setState] = useState<{ data: T | null; error: unknown; loading: boolean }>({
    data: null,
    error: null,
    loading: true,
  });

  useEffect(() => {
    const controller = new AbortController();
    setState((s) => ({ ...s, loading: true }));
    load(controller.signal).then(
      (data) => setState({ data, error: null, loading: false }),
      (error) => {
        // A cancelled request is a screen that moved on, not a failure to show.
        if (isApiError(error) && error.code === 'CLIENT.ABORTED') return;
        setState({ data: null, error, loading: false });
      },
    );
    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return state;
}

/**
 * A screen, end to end:
 *
 *   function AlarmQueue() {
 *     const client = useArmikom();
 *     const { can } = useSession();
 *     const feed = useStore(client.stream.status);
 *     const { data, error, loading } = useAsync((signal) =>
 *       client.api(AlarmEventsApi).getAlarmEvents({}, { signal }), []);
 *
 *     if (!can('alarms:read')) return <NoAccess />;
 *     return <>
 *       <FeedBadge status={feed} />
 *       <Grid rows={data ?? []} loading={loading} error={error} />
 *     </>;
 *   }
 *
 * Note what is absent: no token handling, no refresh, no retry, no error
 * normalisation, no "is the stream alive" bookkeeping. All of it is layer 2,
 * and it is the same layer 2 the Angular console runs on.
 */
export type { Page };
