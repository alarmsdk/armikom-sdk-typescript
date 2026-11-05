/**
 * The domain layer — `@armikom/api-client/domain`.
 *
 * Framework-free logic the operator consoles share: what an advisory note means, how a
 * subscriber number or a phone is displayed, the signal-rule expression grammar, the protocol
 * studio's chain resolution and coverage audit, the stored theme and screen-layout schemas with
 * their validation, and the view-model types the screens are written against.
 *
 * It came up from the Vue console (`Armikom.Open.Vue`) so that a React or Angular console is a
 * set of components over the same rules rather than a second copy of them. Nothing here imports
 * a UI framework, touches the DOM beyond `localStorage` behind a try/catch, or performs a request
 * — it is pure functions, constants and types. Transport belongs to `src/core`, Armikom.Api
 * bindings to `src/armikom`.
 *
 * Deliberately **not** re-exported from the package root: several names (`UserInfo`,
 * `SessionState`, `PrincipalType`, …) are the console's view-model shapes and would collide
 * with the generated models and the core runtime. Import it by its own path.
 */
export * from './types/session.js'
export * from './types/realtime.js'
export * from './types/confirm.js'
export * from './types/i18n.js'
export * from './types/files.js'
export * from './types/ui.js'
export * from './types/reports.js'

export * from './sideNo.js'
export * from './phone.js'
export * from './color.js'
export * from './secret.js'
export * from './turkishIds.js'
export * from './schedule.js'
export * from './mobileUserPhoneConflict.js'
export * from './rtf.js'

export * from './advisory.js'
export * from './delayPresets.js'
export * from './serviceStatus.js'
export * from './assistantText.js'
export * from './reportParameters.js'
export * from './fieldPolicyLabels.js'
export * from './holidayDates.js'
export * from './protocolStudio.js'
export * from './signalRelations.js'
export * from './modelProtocols.js'
export * from './ruleExpression.js'
export * from './ruleFields.js'
export * from './deletePreview.js'
export * from './sideSearch.js'

export * from './theme/tokens.js'
export * from './theme/model.js'

export * from './layout/types.js'
export * from './layout/catalogue.js'
export * from './layout/tree.js'
export * from './layout/fields.js'
export * from './layout/validate.js'
