import { formatPhone } from './phone.js'
import { formatSideNo } from './sideNo.js'

/**
 * A parsed API problem, as `extractProblem` (`@armikom/api-client`) returns it. Only `code`
 * and `params` are read here; the rest is listed so a `ProblemResult` passes through unchanged.
 */
export interface PhoneConflictProblem {
  code?: string
  params?: Record<string, unknown>
  title?: string
  message?: string
  correlationId?: string
  errors?: Record<string, string[]>
  status?: number
}

type Translate = (key: string, params?: Record<string, unknown>) => string

interface ConflictSide {
  sideNo?: number | null
  partNo?: number | null
  name?: string | null
  deleted?: boolean
}

export const PHONE_EXISTS_CODE = 'MOBILE_USER.PHONE_EXISTS'

/**
 * The operator-facing text for a 409 MOBILE_USER.PHONE_EXISTS: which record holds the number
 * and where it is linked, from the `params` the API attaches. Old records are kept on purpose,
 * so the text explains the record in the way rather than suggesting it be removed.
 *
 * Returns null for any other error. Without params (the unique-violation race path, or an older
 * API) it falls back to the plain localized ERROR.MOBILE_USER.PHONE_EXISTS.
 */
export function describePhoneExists(problem: PhoneConflictProblem, t: Translate): string | null {
  if (problem.code !== PHONE_EXISTS_CODE) return null

  const params = problem.params
  if (!params || typeof params.phone !== 'string') return t(`ERROR.${PHONE_EXISTS_CODE}`)

  const sides = Array.isArray(params.linkedSides) ? (params.linkedSides as ConflictSide[]) : []
  const linkedCount = Number(params.linkedSideCount) || 0
  const hiddenCount = Number(params.hiddenSideCount) || 0
  const name = typeof params.mobileUserName === 'string' ? params.mobileUserName : ''

  const parts = [t('UI.MOBILE_USER.PHONE_TAKEN', { phone: formatPhone(params.phone) })]
  if (name) parts.push(t('UI.MOBILE_USER.PHONE_TAKEN_OWNER', { name }))

  if (linkedCount === 0 && hiddenCount === 0) {
    parts.push(t('UI.MOBILE_USER.PHONE_TAKEN_UNLINKED'))
    return parts.join(' ')
  }

  if (sides.length) {
    // Subscriber names are domain data: shown verbatim.
    const labels = sides.map((s) => {
      const label = [formatSideNo(s.sideNo, s.partNo), s.name].filter(Boolean).join(' ')
      return s.deleted ? `${label} (${t('UI.MOBILE_USER.PHONE_TAKEN_SIDE_DELETED')})` : label
    })
    if (linkedCount > sides.length) {
      labels.push(t('UI.MOBILE_USER.PHONE_TAKEN_SIDES_MORE', { count: linkedCount - sides.length }))
    }
    parts.push(t('UI.MOBILE_USER.PHONE_TAKEN_SIDES', { sides: labels.join(', ') }))
  }

  if (hiddenCount > 0) parts.push(t('UI.MOBILE_USER.PHONE_TAKEN_HIDDEN', { count: hiddenCount }))

  // Only a live subscriber in the caller's view makes the user findable in search.
  if (sides.some((s) => !s.deleted)) parts.push(t('UI.MOBILE_USER.PHONE_TAKEN_LINK_HINT'))
  else if (sides.length) parts.push(t('UI.MOBILE_USER.PHONE_TAKEN_ONLY_DELETED'))

  return parts.join(' ')
}
