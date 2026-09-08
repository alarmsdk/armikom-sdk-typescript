/**
 * §01 E-4 / E-5 / LO-5 — turning a typed error into something a person can act
 * on, without the SDK localising anything itself.
 *
 * This is the console's `ToastService.apiError` generalised. That version
 * looked up `errors.<code>` and fell back to a generic string; two things were
 * missing and both cost support time: the correlation id never reached the
 * screen (E-4 — support cannot trace an incident without it), and a 403 read as
 * a hard failure rather than as a missing capability.
 */
import {
  ApiError,
  ForbiddenError,
  isApiError,
  isNoopOutcome,
  OfflineError,
  RateLimitedError,
  RequestAbortedError,
  SessionExpiredError,
  TransportError,
  ValidationError,
} from './errors.js';

export type MessageKind = 'error' | 'warning' | 'info';

export interface ErrorPresentation {
  kind: MessageKind;
  /** Already localised where a catalogue entry existed; the server's title otherwise. */
  message: string;
  code: string | undefined;
  /** §01 E-4 — always shown, always copyable. */
  correlationId: string | undefined;
  /** Field → messages, for a form to attach to its inputs. */
  fieldErrors: Record<string, string[]> | undefined;
  /** True when a "try again" affordance makes sense. */
  retryable: boolean;
  /** True when the session is over and the UI should route to login. */
  sessionEnded: boolean;
}

export interface DescribeErrorOptions {
  /** Usually `i18n.t`. Omit and the server's own title is used verbatim. */
  t?: (key: string, params?: Record<string, unknown>) => string;
  /** `ERROR.` for Armikom.Api's bundle, `errors.` for the Voice.Cloud console. */
  keyPrefix?: string;
  /** Used when neither the catalogue nor the server produced anything. */
  fallbackKey?: string;
  fallbackMessage?: string;
}

export function describeError(error: unknown, options: DescribeErrorOptions = {}): ErrorPresentation {
  const prefix = options.keyPrefix ?? 'ERROR.';
  const translate = options.t;
  const fallback =
    (options.fallbackKey && translate ? lookup(translate, options.fallbackKey) : null) ??
    options.fallbackMessage ??
    'Something went wrong.';

  if (!isApiError(error)) {
    return {
      kind: 'error',
      message: error instanceof Error ? error.message : fallback,
      code: undefined,
      correlationId: undefined,
      fieldErrors: undefined,
      retryable: false,
      sessionEnded: false,
    };
  }

  const localised = error.code && translate ? lookup(translate, prefix + error.code, error.params) : null;
  const message = localised ?? error.problem.title ?? error.message ?? fallback;

  return {
    kind: kindOf(error),
    message,
    code: error.code,
    correlationId: error.correlationId,
    fieldErrors: error.validationErrors,
    retryable: error.retryable || error instanceof TransportError || error instanceof OfflineError,
    sessionEnded: error instanceof SessionExpiredError,
  };
}

function kindOf(error: ApiError): MessageKind {
  // §01 4.3 — "nothing changed" is not a failure. A red toast for it teaches
  // operators that red toasts can be ignored.
  if (isNoopOutcome(error)) return 'info';
  if (error instanceof RequestAbortedError) return 'info';
  if (error instanceof ForbiddenError) return 'warning';
  if (error instanceof RateLimitedError) return 'warning';
  if (error instanceof OfflineError) return 'warning';
  if (error instanceof ValidationError) return 'warning';
  return 'error';
}

/**
 * A translator that cannot find a key returns the key. That is the right
 * behaviour for a UI label and the wrong one for an error toast, where it puts
 * `ERROR.SIDE.NOT_FOUND` in front of an operator — so a result equal to the key
 * counts as "not found" here.
 */
function lookup(
  t: (key: string, params?: Record<string, unknown>) => string,
  key: string,
  params?: Record<string, unknown>,
): string | null {
  const result = t(key, params);
  return !result || result === key ? null : result;
}
