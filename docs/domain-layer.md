# The domain layer — `@armikom/api-client/domain`

Companion to [`core-runtime.md`](core-runtime.md). That file explains layer 2, which came up
from the Voice.Cloud console. This one explains layer 4, which came up from the Vue operator
console (`Armikom.Open.Vue`) for the same reason: the React and Angular consoles that follow
it should be components over shared rules, not a second and third copy of the rules.

## 1. What is in it

Everything here is a pure function, a constant or a type. Nothing imports a UI framework,
nothing performs a request, and the only browser API touched is `localStorage` behind a
try/catch (the delay-preset memory). The test is the one `core-runtime.md` §5 states: could
another console use it without changing a line?

| Module | What it decides | Came from |
|---|---|---|
| `sideNo` · `phone` · `secret` · `turkishIds` | How a subscriber number, a phone, a withheld secret (D76) and a Turkish identity / tax number are read and shown | `src/utils/` |
| `color` | Legacy WinForms colour names → `#RRGGBB`, mirroring the server's `HexColor` | `src/utils/hexColor` |
| `schedule` | Work-schedule conventions (EDayOfWeek Sunday = 7, seconds of day, overnight spans) mirroring `ShiftChecker.cs` | `src/utils/` |
| `rtf` | The DevExpress/XAF RTF ↔ HTML round-trip, Turkish Unicode escapes included | `src/utils/` |
| `mobileUserPhoneConflict` | The operator-facing text for `MOBILE_USER.PHONE_EXISTS` | `src/utils/` |
| `advisory` | Hooks, effects and note ordering for AI advisories; the one place that decides what interrupts | `features/alarms` |
| `delayPresets` | The "Mesajı Ertele" preset set and its `{ delayTime, timeUnit }` encoding | `features/alarms` |
| `serviceStatus` | Terminal / overdue rules for service records | `features/service` |
| `holidayDates` | Holidays as calendar dates (D21), recurrence, range expansion | `features/holidays` |
| `protocolStudio` · `signalRelations` · `modelProtocols` | Chain resolution, the coverage audit, relation parameter schemas, brand/model/protocol link audit | `features/protocols` |
| `ruleExpression` · `ruleFields` | The signal-rule condition grammar ↔ the filter-expression wire form, and the fact catalogue labels | `features/signalRules` |
| `reportParameters` · `assistantText` | Saved-report parameter forms and the assistant's light-Markdown as nodes (never HTML) | `features/reports` |
| `sideSearch` · `deletePreview` | The subscriber advanced search as data (URL ↔ params ↔ tokens), and delete-preview side effects | `features/subscribers` |
| `fieldPolicyLabels` | Role field policy keys → label keys (D77) | `src/data/` |
| `theme/*` | The stored console theme (D88): tokens, palettes, parsing and the CSS it builds | `src/theme/` |
| `layout/*` | The screen-layout schema, tree algebra, field resolution, validation and migrations | `src/layout/` |
| `types/*` | The view-model types the screens are written against (`UserInfo`, realtime events, confirm tiers, reports, …) | `src/types/` |

`layout/catalogue.ts` is the one piece that changed shape on the way: `LayoutScreenDef` and
`PanelDef` are generic in the component type, so the Vue console binds `LayoutScreenDef<Component>`
and a React console `LayoutScreenDef<ComponentType>`, and the validator and designer algebra
serve both.

Two names were renamed to avoid a collision in the flat export: `ruleFields.LookupRow` is
`RuleLookupRow` and `modelProtocols.LookupRow` is `ProtocolLookupRow`. The Vue console's shims
re-export them under the old names.

## 2. What stayed in the console, and why

| Stayed | Reason |
|---|---|
| `utils/sse.ts` | The console's parser has a slightly different surface (`reset()`, `currentLastEventId`, `retry`) than `core/sse.ts`, and its consumer is the console's own stream composable. Unify when the consoles move onto `core/realtime.ts`. |
| `utils/datetime.ts` | Only the zone resolution (`window.__APP_CONFIG__` / `VITE_TIMEZONE`) — the formatting is `core/datetime.ts`. |
| `utils/diagLog.ts`, `confirmTrace.ts`, `viewportFit.ts`, `idleLock*.ts` | Vue, DOM or tab-local concerns. |
| `useArmikomClient.ts` (the `ArmikomClientInterface` facade and its mock) | Framework-free in principle, but 3 800 lines interleaved with the mock and the locale fallbacks; the right move is onto `ArmikomClient` rather than copying the facade. |
| Stores and composables | Pinia / Vue. Their framework-free parts are already in `core/` (session, realtime, i18n, reference cache). |
| `admin/collections.ts`, `data/permissions.json` | Descriptor data a React console would also want, but it drags the collection schema types and JSON into the build; next candidate. |

## 3. How the Vue console consumes it

Each moved file in `Armikom.Open.Vue` became a two-line shim that re-exports from
`@armikom/api-client/domain` (or from the package root for the pieces that went into `core/`:
`drainPages`, `safeFilename`, `formatFileSize`, `markTimestampsUtc`, `extractProblem`,
`createDateTimeFormatter`). Import sites did not change, and the console's own tests still run
against the shims. The corresponding tests were also ported here, under `checks/domain/`, on a
small `expect` over `node:assert` so the package stays dependency-free.

## 4. Adding to the domain layer

1. It must be usable from a console that is not Vue. No `ref`, no `inject`, no component.
2. It must not perform a request. Anything that talks to the API is layer 3's job.
3. Domain strings stay domain strings (V4): return i18n *keys* and raw server values, never a
   translated copy string.
4. Put the check in `checks/domain/`, written against `./_expect.js`.
5. Do not re-export it from the package root; keep the `/domain` entry the only door.
