/**
 * Column-level security (API D76): a side's safe password and each contact's password reach a
 * caller without `sides:secrets` as `null`, next to a `has…` flag (`hasSafePassword`,
 * `hasPassword`). This tells "stored but not yours to see" apart from "not set".
 */
export function isSecretHidden(value: unknown, has: unknown): boolean {
  return (value === null || value === undefined || value === '') && has === true
}
