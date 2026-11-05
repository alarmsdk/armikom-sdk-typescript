# The console layer — `@armikom/api-client/console`

Companion to [`domain-layer.md`](domain-layer.md). Layer 4 is what the consoles *decide*;
layer 5 is what they *call*.

## 1. What it is

`ArmikomClientInterface` (`src/console/types.ts`) is the client facade the Vue operator
console was written against: one section per screen family (`alarmEvents`, `sides`,
`services`, `admin`, `referenceAdmin`, `uiLayouts`, …), every list as a `Page<T>`, every
download as a `BinaryContent`, and the console's own view models (`UserInfo`, `ClientConfig`)
rather than the generated ones. The console's in-memory mock implements the same interface,
which is what lets the whole console run with no backend.

`createConsoleClient` (`src/console/client.ts`) is the real implementation, on `ArmikomClient`:

| Was, in the Vue console (`createRealArmikomClient`, 2 200 lines) | Is now |
|---|---|
| A proactive-refresh `pre` middleware reading the Pinia session store | `AuthSession.getAccessToken()` (§01 A-2, A-3) |
| A reactive-401 `post` middleware with its own replay header | The pipeline's replay-once (§01 A-4), body encoded once (A-8) |
| A `FATAL_AUTH_CODES` set and an `onUnauthorized` singleton | `AuthSession` terminal codes (A-5) and `session.onEnded(reason)` |
| A network-zone `post` middleware (D83) | `onResponse` on the pipeline → `onNetworkZone`, and `session.terminate('remote-access-denied')` on the 403 |
| A UTC timestamp-repair `post` middleware (G-74) | The pipeline's R-4 repair, on by default |
| A module-level token the session store had to keep in step | The host's `TokenStore` (§01 A-11); `session.onTokensChanged` for a mirror |
| 25 hand-written `fetch` calls with a hand-set bearer, no retry, no typed error | `client.http.fetch` / `client.http.json`: same pipeline as the generated operations |
| `extractProblem(err)` reading `err.response` | The same function, reading the `ApiError`'s own `problem` |

What stayed hand-written is the console's shape only: the section layout, the `Page<T>` and
`BinaryContent` normalisation, the `UserInfo` mapping, and `shiftRestricted` (D42), which the
core session has no room for — `ConsoleAuthDriver` (`src/console/auth.ts`) remembers it and
emits it on every refresh.

## 2. The session surface

```ts
client.session.login(username, password, type?)   // → LoginResult, tokens adopted
client.session.restore()                          // boot: refresh if expiring, read user; null = no session
client.session.getCurrentUser()                   // UserInfo
client.session.logout(refreshToken?)              // revokes server-side, clears the store (A-7)
client.session.refresh()                          // on demand, single-flight
client.session.getTokens() / setTokens(tokens | null)
client.session.onTokensChanged(cb) / onChanged(cb) / onRefreshed(cb) / onEnded(cb)
client.sdk                                        // the ArmikomClient underneath
```

A host wires three things: a `TokenStore` (where tokens persist), `onEnded` (where to go when
the session is over for a reason other than `logout`), and optionally `onNetworkZone` and an
`ExplanationCache`. The Vue console's `useArmikomClient.ts` is the worked example.

## 3. Checks

`checks/console/client.test.ts` drives the facade through a scripted transport: login adopts
tokens and reports `shiftRestricted`; a refresh re-reads the user and scopes; logout revokes the
stored (or the given) refresh token and clears the store even on a server error; a terminal
401 ends the session with its reason; D83's zone header and `REMOTE_ACCESS_DENIED`; the
reference bundle sends `cache: no-cache`; `uiLayouts` treats 404 as "nothing stored"; the
hand-written endpoints carry the bearer and the pipeline headers.

## 4. Adding to the facade

1. A new section or operation goes into `ArmikomClientInterface` first, typed against the
   generated models (or a domain view model when the screen should not see the generated shape).
2. Implement it in `createConsoleClient` with `client.api(XApi)` — or `client.http.json` when
   the generated layer does not have the operation yet, with an `operationId` so logs can name it.
3. Never set `Authorization`, retry, or parse a problem body by hand: the pipeline does.
4. Add the mock's implementation in the console that owns the mock.
