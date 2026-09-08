/**
 * @armikom/api-client
 *
 * Three layers (`docs/frontend/01-sdk-specification.md` §1):
 *
 *   1. `generated/`   transport — models and one function per operationId, never hand-edited
 *   2. `src/core/`    the core runtime — auth, errors, retry, paging, cache, files, i18n, SSE
 *   3. `src/armikom/` ergonomics — the composition root and the Armikom-specific bindings
 *
 * Layer 2 is API-agnostic: it is also what the Voice.Cloud console runs on.
 * Import it on its own from `@armikom/api-client/core` when you are talking to
 * a different Armikom service.
 */
export * from './core/index.js';
export * from './armikom/index.js';
