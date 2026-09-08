/**
 * @armikom/api-client
 *
 * Three layers (`docs/frontend/01-sdk-specification.md` §1):
 *
 *   1. `generated/`   transport — models and one function per operationId, never hand-edited
 *   2. `src/core/`    the core runtime — auth, errors, retry, paging, cache, files, i18n, SSE
 *   3. `src/armikom/` ergonomics — the composition root and the Armikom-specific bindings
 *
 * The root entry point re-exports all three, so an application that imports
 * `Configuration` or a generated API from this package keeps working while it
 * migrates onto `ArmikomClient`.
 *
 * Layer 2 is API-agnostic: import it on its own from `@armikom/api-client/core`
 * when you are talking to a different Armikom service, and
 * `@armikom/api-client/generated` for the transport alone.
 */
export * from './core/index.js';
export * from './armikom/index.js';
export * from '../generated/index.js';

/**
 * Both layers define a `ProblemDetails` and an `ErrorContext`, and an ambiguous
 * `export *` name is dropped from the public surface entirely rather than
 * resolved. Layer 2's win here: `ProblemDetails` is what `ApiError.problem` is
 * typed as and it carries `code`, `correlationId` and `params`, which the
 * generated model does not. Both generated shapes stay reachable from
 * `@armikom/api-client/generated`.
 */
export type { ProblemDetails, ErrorContext } from './core/errors.js';
