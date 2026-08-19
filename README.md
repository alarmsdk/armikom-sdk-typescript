# @armikom/api-client

TypeScript client for the Armikom API. Generated from the **frozen v1 contract**
(`api-v1.0` on `Armikom.Api`: 196 paths · 309 operations · 297 schemas, `info.version` `v1`).

Apache-2.0. Node ≥ 20. Dual ESM/CJS.

> **Status: W-10 — generated layer only.** `src/` is intentionally empty. Transport and auth
> (W-11), errors (W-12), paging, cache, files, i18n and realtime (W-13…W-18) and the conformance
> suite (W-19) each land in their own task. Until W-11, the package entry point is the raw
> generated client.

## Layout

```
openapi/     pinned spec + its recorded sha256, and the generator config
generated/   layer 1 — produced by `make generate`, NEVER hand-edited, committed
src/         layer 2/3 — hand-written core + ergonomics (W-11 onwards)
checks/      contract checks that prove the generated layer matches the frozen decisions
conformance/ the shared language-neutral suite (W-19)
examples/    end-to-end examples (later)
```

## Commands

| | |
|---|---|
| `make verify-spec` | the pinned spec still matches its recorded sha256 |
| `make generate` | regenerate `generated/` (deterministic; refuses on hash mismatch) |
| `make build` | dual ESM/CJS build under `tsc --strict` |
| `make test` | contract checks (runs under `TZ=Europe/Istanbul` — see below) |
| `make check-drift` | regenerate and fail on any diff under `generated/` |

Generation needs **Java 21** (openapi-generator is a JVM tool) and network access on first run to
fetch the pinned generator jar.

## What is pinned, and why it is pinned twice

- **`openapi/armikom-api.v1.json`** is copied from `git show api-v1.0:openapi/armikom-api.v1.frozen.json`.
  Its sha256 is recorded in `openapi/armikom-api.v1.json.sha256` and enforced by `make verify-spec`.
- **openapi-generator `7.24.0`** is pinned exactly (never `latest`) in `Makefile`, `openapitools.json`
  and `package.json`. Bumping it rewrites `generated/` and CI will fail until the result is committed.

CI checks both halves independently (`.github/workflows/contract.yml`): the *drift* job catches a
hand-edit of generated code, the *pin* job catches this repo drifting off `api-v1.0`.

## Contract decisions the generated layer must honour

- **D69** — all 27 `GET` lists under `/v1/reference/` return **bare arrays**, not a paged envelope.
- **D70** — `DeleteOperatorUser`, `GetRole`, `GetSideControl`, `GetSideSimCard`, `GetSideMail` are
  deliberately absent. They are not gaps; do not stub them.
- **D71** — `info.version` is `v1`; this package is `1.x`.
- **D72** — path parameter names drive generated method-group names.

`checks/contract/` asserts all four, at the type level and at runtime.

## Timestamps

§01 R-4: every wire timestamp is UTC ISO-8601 and must parse to an **absolute instant**.
`typescript-fetch` deserialises with `new Date(...)`, which reads an offset-less string in the *host*
zone. The check suite therefore runs under `TZ=Europe/Istanbul`, not UTC — under UTC that leniency is
invisible. `checks/contract/r4-instants.test.ts` pins both the correct behaviour and the known
hazard; the hand-written transport layer (W-11) is where offset-less values must be rejected.
