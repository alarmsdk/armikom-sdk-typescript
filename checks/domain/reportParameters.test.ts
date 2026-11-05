// Ported from Armikom.Open.Vue tests/unit/features/reports/reportParameters.test.ts; the implementation now lives in this package.
import { describe, it, expect } from './_expect.js'
import { initialFormState, toRequestValues, validateForm, describeResolved } from '../../src/domain/index.js'
import { parseAssistantText } from '../../src/domain/index.js'
import type { ReportParameter } from '../../src/domain/index.js'

const params: ReportParameter[] = [
  { name: 'period', label: 'Dönem', type: 'daterange', required: true, default: 'last_month' },
  { name: 'dealerIds', type: 'lookup', source: 'dealers', multi: true },
  { name: 'sideNos', type: 'int', multi: true },
  { name: 'kind', type: 'enum', options: [{ value: 'a' }, { value: 'b' }] },
  { name: 'onlyActive', type: 'bool' },
  { name: 'text', type: 'text', required: true }
]

describe('report parameter form (S-621)', () => {
  it('leaves untouched fields out so the server applies its defaults', () => {
    const state = initialFormState(params)
    state.text = 'x'
    expect(toRequestValues(params, state)).toEqual({ text: 'x' })
  })

  it('sends a preset token or explicit local days for a daterange', () => {
    const state = initialFormState(params)
    state.period = { mode: 'preset', preset: 'this_week', from: '', to: '' }
    expect(toRequestValues(params, state).period).toBe('this_week')
    state.period = { mode: 'custom', preset: '', from: '2026-09-01', to: '2026-09-30' }
    expect(toRequestValues(params, state).period).toEqual({ from: '2026-09-01', to: '2026-09-30' })
  })

  it('splits free-text multi values and keeps lookup arrays', () => {
    const state = initialFormState(params)
    state.sideNos = '1001, 1002,'
    state.dealerIds = ['d1']
    state.onlyActive = false
    const values = toRequestValues(params, state)
    expect(values.sideNos).toEqual(['1001', '1002'])
    expect(values.dealerIds).toEqual(['d1'])
    expect(values.onlyActive).toBe(false)
  })

  it('validates required fields, number lists and reversed ranges', () => {
    const state = initialFormState(params)
    state.sideNos = '12, x'
    state.period = { mode: 'custom', preset: '', from: '2026-09-30', to: '2026-09-01' }
    expect(validateForm(params, state)).toEqual({ text: 'required', sideNos: 'number', period: 'range' })
  })

  it('a required parameter with a server default is not required in the form', () => {
    const state = initialFormState(params)
    state.text = 'ok'
    expect(validateForm(params, state)).toEqual({})
  })

  it('describes resolved values', () => {
    expect(describeResolved({ from: '2026-09-01', to: '2026-09-30' })).toBe('2026-09-01 – 2026-09-30')
    expect(describeResolved(['a', 'b'])).toBe('a, b')
    expect(describeResolved(null)).toBe('—')
  })
})

describe('assistant text rendering', () => {
  it('parses bold, code and lists without producing HTML', () => {
    const blocks = parseAssistantText('Kolonlar:\n- **Abone No**\n1. `SideNo` alanı\n<script>x</script>')
    expect(blocks.map((b) => b.kind)).toEqual(['paragraph', 'bullet', 'numbered', 'paragraph'])
    expect(blocks[1]!.spans[0]!).toEqual({ text: 'Abone No', bold: true, code: false })
    expect(blocks[2]!.spans[0]!).toEqual({ text: 'SideNo', bold: false, code: true })
    expect(blocks[3]!.spans[0]!.text).toBe('<script>x</script>')
  })
})
