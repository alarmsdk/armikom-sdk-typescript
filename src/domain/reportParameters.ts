import type { ReportParameter, ReportParameterValue, ReportParameterValues } from './types/reports.js'

/**
 * Parameter form state ↔ request values for saved reports (S-621).
 *
 * The engine resolves defaults and relative tokens itself (`last_month`, `today-7d`…), so a
 * field the user leaves untouched is sent as nothing and the server applies the default. The
 * form shows the default as a hint, not as a pre-filled value, so "last month" stays last month
 * however long the tab stays open.
 */

/** Presets for a daterange field; each value is an engine token. */
export const DATE_RANGE_PRESETS = [
  'today',
  'yesterday',
  'last_7_days',
  'last_30_days',
  'this_week',
  'last_week',
  'this_month',
  'last_month',
  'this_year'
] as const

export type DateRangeMode = 'default' | 'preset' | 'custom'

/** What the form edits for one daterange parameter. */
export interface DateRangeState {
  mode: DateRangeMode
  preset: string
  from: string
  to: string
}

export type FormValue = string | boolean | string[] | DateRangeState | null

export type FormState = Record<string, FormValue>

export function initialFormState(parameters: ReportParameter[]): FormState {
  const state: FormState = {}
  for (const p of parameters) {
    if (p.type === 'daterange') {
      const isPreset = !!p.default && (DATE_RANGE_PRESETS as readonly string[]).includes(p.default)
      state[p.name] = { mode: p.default ? 'default' : 'preset', preset: isPreset ? p.default! : 'last_7_days', from: '', to: '' }
    } else if (p.type === 'bool') {
      state[p.name] = null
    } else if (p.multi && (p.type === 'enum' || p.type === 'lookup')) {
      state[p.name] = []
    } else {
      state[p.name] = ''
    }
  }
  return state
}

/** Values for `POST /v1/reports/definitions/{id}/run`. Empty fields are omitted (server default). */
export function toRequestValues(parameters: ReportParameter[], state: FormState): ReportParameterValues {
  const values: ReportParameterValues = {}
  for (const p of parameters) {
    const v = state[p.name]
    let out: ReportParameterValue | undefined
    if (p.type === 'daterange') {
      const r = v as DateRangeState | undefined
      if (!r || r.mode === 'default') out = undefined
      else if (r.mode === 'preset') out = r.preset
      else if (r.from && r.to) out = { from: r.from, to: r.to }
    } else if (p.type === 'bool') {
      out = typeof v === 'boolean' ? v : undefined
    } else if (Array.isArray(v)) {
      out = v.length ? v : undefined
    } else if (typeof v === 'string' && v.trim() !== '') {
      // Free-text multi values (numbers, codes) are typed comma separated.
      out = p.multi ? v.split(',').map((x) => x.trim()).filter(Boolean) : v.trim()
    }
    if (out !== undefined) values[p.name] = out
  }
  return values
}

/** Field errors the console can catch before the round trip. Keys are parameter names. */
export function validateForm(parameters: ReportParameter[], state: FormState): Record<string, 'required' | 'range' | 'number'> {
  const errors: Record<string, 'required' | 'range' | 'number'> = {}
  for (const p of parameters) {
    const v = state[p.name]
    if (p.type === 'daterange') {
      const r = v as DateRangeState
      if (r?.mode === 'custom') {
        if (!r.from || !r.to) errors[p.name] = 'required'
        else if (r.to < r.from) errors[p.name] = 'range'
      } else if (r?.mode === 'default' && p.required && !p.default) {
        errors[p.name] = 'required'
      }
      continue
    }
    const empty = v == null || v === '' || (Array.isArray(v) && v.length === 0)
    if (empty) {
      if (p.required && !p.default) errors[p.name] = 'required'
      continue
    }
    if ((p.type === 'int' || p.type === 'decimal') && typeof v === 'string') {
      const pattern = p.type === 'int' ? /^-?\d+$/ : /^-?\d+(\.\d+)?$/
      const parts = p.multi ? v.split(',').map((x) => x.trim()).filter(Boolean) : [v.trim()]
      if (!parts.every((x) => pattern.test(x))) errors[p.name] = 'number'
    }
  }
  return errors
}

/** Short human text for a resolved value echoed back by the engine. */
export function describeResolved(value: unknown): string {
  if (value == null) return '—'
  if (Array.isArray(value)) return value.join(', ')
  if (typeof value === 'object') {
    const r = value as { from?: string; to?: string }
    if (r.from || r.to) return `${r.from ?? '…'} – ${r.to ?? '…'}`
    return JSON.stringify(value)
  }
  return String(value)
}
