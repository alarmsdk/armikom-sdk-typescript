/**
 * The seam between the generated transport and layer 2's error model.
 *
 * `openapi-generator`'s `BaseAPI` has its own two error types: `ResponseError`
 * for a non-2xx and `FetchError` for anything thrown by the fetch function. Our
 * pipeline throws a typed `ApiError` from inside that fetch function, so it
 * arrives wrapped. §01 L-3 says a caller must never have to know layer 1
 * exists — so it is unwrapped here, once, rather than at 309 call sites.
 */
import { ApiError, isApiError, parseProblem, errorForStatus, transportError } from '../core/errors.js';
import { FetchError, RequiredError, ResponseError } from '../../generated/runtime.js';

/** Turns whatever the generated layer threw into a layer 2 error. */
export async function toApiError(error: unknown): Promise<ApiError> {
  if (isApiError(error)) return error;

  if (error instanceof FetchError) {
    return isApiError(error.cause) ? error.cause : transportError(error.cause);
  }

  if (error instanceof ResponseError) {
    // Reached only when something bypassed our pipeline — a client constructed
    // with a bare `Configuration`, or a test double. Parsed anyway so the error
    // shape stays the same either way.
    const body = await error.response.text().catch(() => '');
    const problem = parseProblem(error.response.status, body, error.response.statusText);
    return errorForStatus(error.response.status, problem, { url: error.response.url });
  }

  if (error instanceof RequiredError) {
    return new ApiError(error.message || `${error.field} is required`, {
      status: 0,
      problem: { status: 0, code: 'CLIENT.REQUIRED_PARAMETER', title: error.message, params: { field: error.field } },
    });
  }

  return transportError(error);
}

/**
 * Wraps a generated API instance so every method rejects with a layer 2
 * `ApiError`. A `Proxy` rather than 309 hand-written wrappers: the generated
 * surface changes with every contract bump, and a wrapper list would be stale
 * by the next regeneration.
 */
export function wrapApi<T extends object>(api: T): T {
  return new Proxy(api, {
    get(target, property, receiver) {
      const value = Reflect.get(target, property, receiver) as unknown;
      if (typeof value !== 'function') return value;
      return function wrapped(this: unknown, ...args: unknown[]) {
        let result: unknown;
        try {
          result = (value as (...a: unknown[]) => unknown).apply(target, args);
        } catch (error) {
          // A synchronous throw — `RequiredError` on a missing path parameter.
          return toApiError(error).then((mapped) => {
            throw mapped;
          });
        }
        if (!isPromise(result)) return result;
        return result.then(
          (v) => v,
          async (error: unknown) => {
            throw await toApiError(error);
          },
        );
      };
    },
  });
}

function isPromise(value: unknown): value is Promise<unknown> {
  return !!value && typeof (value as { then?: unknown }).then === 'function';
}
