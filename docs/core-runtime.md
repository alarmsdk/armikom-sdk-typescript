# The core runtime — what it is, and where it came from

Companion to [`01-sdk-specification.md`](https://github.com/alarmsdk/Armikom.Api/blob/master/docs/frontend/01-sdk-specification.md)
(the normative document) and to this repo's `README.md` (how to use it). This
file answers the two questions the other two do not: *why does layer 2 look like
this*, and *what changed in the applications that adopted it*.

---

## 1. The starting position

Before this work the SDK was layer 1 only. `src/` was empty by design, and the
README said so: transport and auth, errors, paging, cache, files, i18n and
realtime were each a task not yet started.

Meanwhile the Voice.Cloud console — a real Angular application in daily use —
had working versions of most of those concerns, arrived at by need rather than
by specification:

| Console file | Lines | What it had solved |
|---|---:|---|
| `services/api.service.ts` | 397 | Every operation, plus `HttpParams` assembly, blob downloads, an idempotency key |
| `models/api.models.ts` | 602 | The wire types |
| `services/runtime-test.service.ts` | 222 | A long-poll workflow |
| `services/logger.service.ts` | 140 | Batching, flush-on-error, `sendBeacon` on `visibilitychange` |
| `services/i18n.service.ts` | 140 | Culture fallback, `{{param}}` interpolation, DevExtreme locale loading |
| `services/toast.service.ts` | 68 | Turning a failed call into a message |
| `interceptors/auth.interceptor.ts` | 52 | Bearer header, refresh once on 401, replay |
| `services/auth.service.ts` | 79 | Two `localStorage` keys, login, refresh, logout |
| `services/version.service.ts` | 44 | Version with a fallback source |
| `interceptors/i18n.interceptor.ts` | 16 | `Accept-Language` |
| `guards/auth.guard.ts` | 15 | "Is there a token" |

Roughly **550 lines of cross-cutting behaviour**, none of it about voice
campaigns, all of it about talking to an HTTP API — and all of it Angular-shaped
purely because Angular was the only place to put it.

## 2. What moved, and what the specification added on the way

Nothing was copied verbatim. Each piece was reread against §01, and in most
cases the specification named a rule the console's version did not have. Those
gaps are the actual value of the exercise, so they are listed rather than
summarised.

| Console had | Now in | §01 rule the move added |
|---|---|---|
| Refresh **on** a 401 | `core/session.ts` | **A-2** refresh ~60 s *before* expiry. Reacting to a 401 costs a round trip and loses the destructive request that discovered it |
| One refresh per failing request | `core/session.ts` | **A-3 / C-03** single-flight. Refresh tokens rotate, so two concurrent refreshes invalidate the session the first one created — the "logged out while six widgets loaded" report |
| A failed refresh logged out | `core/session.ts` | **A-5** terminal codes (`REFRESH_TOKEN_INVALID`, `TOKEN_INVALID`, `ACCOUNT_LOCKED`) end the session with a *reason*; a locked account routes somewhere other than the generic login error |
| 401 handling only | `core/session.ts` | **A-6** a 403 is a capability problem: it must not refresh, must not log out |
| — | `core/session.ts` | **A-10** scopes re-read after every refresh, not only at login |
| `localStorage` by default | `core/tokens.ts` | **A-11** memory is the default; persistence is the host's explicit decision, made in one visible place |
| `err.error?.error` | `core/errors.ts` | **E-1/E-3/C-06** one class hierarchy carrying `code`, `params`, `errors` and `correlationId`, parsed from **both** RFC 7807 and the flat `{ error }` envelope |
| Generic fallback message | `core/messages.ts` | **E-4** the correlation id reaches the toast — support cannot trace an incident without it. **C-25** a "nothing changed" outcome is not red |
| A parse crash on an HTML 502 | `core/errors.ts` | **E-6 / C-08** any body shape still yields a typed error |
| No retry | `core/retry.ts` | **RT-1..RT-4** backoff with full jitter, `Retry-After`, and **no POST retry** — the only protection the API offers against a double `GenerateInvoices` |
| No deadline | `core/http-client.ts` | **RT-5 / C-12** one deadline bounding *all* attempts, not each |
| No cancellation | `core/http-client.ts` | **RT-6** an aborted navigation cancels its in-flight reads |
| Four hand-read page shapes | `core/paging.ts` | **P-1/P-3/C-15** one iterator; **P-2/C-24** `isCapped`, so a truncated alarm queue can say so |
| — | `core/cache.ts` | **CA-1/CA-3/C-13** ETag revalidation; **CA-4** indexed lookups instead of a linear scan per grid row |
| Blob download at each export button | `core/files.ts` | **F-4/C-16** object URLs that are actually revoked; **F-1** upload progress; **F-3** a streaming form |
| `t()` falling back to the key | `core/i18n.ts` | **LO-3** missing keys are *observable*. Silence is how the Armikom catalogues drifted to tr 552 / en 531 / az 508 (finding F15) |
| `toUpperCase()` | `core/text.ts` | **C-14** Turkish `i` → `İ`. `"ilk".toUpperCase()` is a different word, and upper-casing a name before a save corrupts the record |
| `new Date(value)` | `core/text.ts` | **R-4 / C-09** an offset-less timestamp is *refused* rather than silently read in the host zone |
| Batched log shipping | `core/telemetry.ts` | **O-3 / C-05** redaction before shipping, including token-shaped substrings inside message text |
| — | `core/realtime.ts` | All of **§12**: SSE over `fetch` so it can hold a bearer header, reconnect backoff, the keep-alive watchdog, `resync` on every open, nudge coalescing, and a polling fallback that **announces itself** |
| — | `core/connectivity.ts` | **OF-3** online/degraded/offline from real request outcomes, not `navigator.onLine`, which lies behind a captive portal |
| A loading/error/data triple per screen | `core/resource.ts` | Not in §01: a failed reload keeps the previous rows, and a slow response cannot overwrite a newer one |

Every row with a conformance id has a test in `checks/core/` named after it.

## 3. Why layer 2 knows nothing about the Armikom API

The two consumers talk to **different APIs**. Armikom.Api is the alarm platform;
the Voice.Cloud control plane is a separate service with its own paths, its own
snake_case payloads and its own error envelope. If layer 2 had been written
against Armikom.Api's operations, the console could not have used a line of it.

So the seams are injected rather than imported:

- **`AuthDriver`** — three calls and a payload mapping. `ArmikomAuthDriver`
  (~60 lines, layer 3) and the console's `VoiceAuthDriver` (~70 lines) are the
  only auth code either application owns. Everything else — proactive refresh,
  single-flight, replay-once, terminal codes, the capability API — is shared.
- **`Transport`** — one function from a request to a `Response`. Injecting it is
  what makes the entire conformance matrix runnable without a socket.
- **`Clock`** — §01 B-2. The keep-alive watchdog test costs microseconds
  instead of 62 seconds, which is the difference between a suite that runs and
  one that gets deleted.
- **`CacheStore` / `TokenStore` / `Logger`** — the host decides what persists
  and where logs go. The SDK never reads ambient global state (§01 B-3).

Layer 3 (`src/armikom/`) is where the Armikom-specific knowledge lives, and it
adds no behaviour: it wires the generated `Configuration.fetchApi` to the core
pipeline, so all 309 generated operations get auth, retry, deadlines and typed
errors without a line of generated code knowing.

## 4. Why there is no Angular package and no React package

There is one reactive primitive, `core/observable.ts`'s `Store`, and it was
given the shape both frameworks already read:

```ts
store.get()                      // synchronous snapshot
store.subscribe(listener)        // returns unsubscribe
store[Symbol.observable]()       // RxJS / Angular interop
```

Which makes the bindings this small:

```ts
// Angular
readonly session = toSignal(from(client.session.state));

// React
const session = useSyncExternalStore(store.subscribe, store.get);
```

A published `@armikom/api-client-angular` would add a peer-dependency version
matrix to maintain in exchange for those two lines. `examples/angular` and
`examples/react` carry the full glue — around sixty lines each, meant to be
copied and owned by the application.

## 5. Adding to the core

1. The rule goes into `01-sdk-specification.md` first, with a conformance id if
   it is testable. §01 is normative; this repo implements it.
2. The scenario goes into `checks/core/` next, named after the id.
3. Then the code. `make test` gates both halves.
4. Anything Armikom-API-specific belongs in `src/armikom/`, not `src/core/` —
   the test is whether the Voice.Cloud console could still use it.

Do not hand-edit `generated/`. `make check-drift` fails on it in CI, and the
next `make generate` would silently discard the change anyway.
