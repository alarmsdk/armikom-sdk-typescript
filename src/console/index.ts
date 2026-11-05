/**
 * The console layer — `@armikom/api-client/console`.
 *
 * `ArmikomClientInterface` is the facade the operator consoles are written against, and
 * `createConsoleClient` is its implementation on `ArmikomClient`. Reached by its own path,
 * like `/domain`: its types collide with generated model names at the package root.
 */
export * from './types.js'
export * from './client.js'
export * from './auth.js'
export * from './binary.js'
export * from './signalRules.js'
export * from './reports.js'
