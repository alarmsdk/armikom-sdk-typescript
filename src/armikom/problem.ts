/**
 * Extract ProblemDetails from an SDK ResponseError.
 *
 * The generated SDK throws `ResponseError` with the generic message
 * "Response returned an error code" — it never parses the body. This utility
 * reads the ProblemDetails JSON from the response and returns a structured
 * result with `code`, `title`, `errors`, `correlationId` and a translated
 * `message`.
 *
 * The i18n lookup follows the convention from §20-sdk-integration:
 *   t('ERROR.' + code, params)  →  fallback to ProblemDetails.title  →  fallback to raw message
 */

import { isApiError } from '../core/errors.js'

export interface ProblemResult {
  code?: string
  title?: string
  message: string
  correlationId?: string
  errors?: Record<string, string[]>
  params?: Record<string, unknown>
  status?: number
}

export async function extractProblem(
  err: any,
  translate?: (key: string, params?: Record<string, unknown>) => string
): Promise<ProblemResult> {
  let body: any = null

  // A layer 2 `ApiError` (everything that went through `ArmikomClient`) already carries the
  // parsed problem; the body on its response was consumed by the pipeline.
  if (isApiError(err)) {
    body = { ...err.problem, status: err.problem.status ?? err.status }
  }

  if (err?.response && typeof err.response.clone === 'function') {
    try {
      body = await err.response.clone().json()
    } catch {
      // Response body is not JSON — fall through.
    }
  }

  if (!body && err && typeof err === 'object') {
    body = err
  }

  if (!body) {
    return { message: err?.message || '' }
  }

  const code: string | undefined =
    body.code || (typeof body.message === 'string' && /^[A-Z0-9_.-]+$/.test(body.message) ? body.message : undefined)
  const title: string | undefined = body.title
  const correlationId: string | undefined =
    body.correlationId || body.traceId || body.extensions?.traceId
  const errors: Record<string, string[]> | undefined = body.errors
  const params: Record<string, unknown> | undefined = body.params
  const status: number | undefined = body.status

  let message = ''
  if (code && translate) {
    const key = `ERROR.${code}`
    const translated = translate(key, params)
    // If the translation returns the key itself, it means no translation was found.
    message = translated !== key ? translated : ''
  }
  if (!message) message = title || err?.message || ''

  return { code, title, message, correlationId, errors, params, status }
}
