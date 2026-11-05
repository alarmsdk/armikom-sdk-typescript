// Ported from Armikom.Open.Vue tests/unit/utils/turkishIds.test.ts; the implementation now lives in this package.
import { describe, it, expect } from './_expect.js'
import { isValidTcKimlikNo, isValidVergiNo, isValidTaxNo } from '../../src/domain/index.js'

describe('turkishIds', () => {
  it('accepts a valid T.C. Kimlik No and rejects a single-digit typo', () => {
    expect(isValidTcKimlikNo('10000000146')).toBe(true)
    expect(isValidTcKimlikNo('10000000147')).toBe(false)
    expect(isValidTcKimlikNo('01234567890')).toBe(false)
    expect(isValidTcKimlikNo('1000000014')).toBe(false)
  })

  it('accepts a valid VKN and rejects a wrong check digit', () => {
    expect(isValidVergiNo('1234567890')).toBe(true)
    expect(isValidVergiNo('1234567891')).toBe(false)
    expect(isValidVergiNo('0010010010')).toBe(true)
    expect(isValidVergiNo('0010010011')).toBe(false)
    expect(isValidVergiNo('12345abcde')).toBe(false)
  })

  it('takes either form in the tax number field', () => {
    expect(isValidTaxNo(' 10000000146 ')).toBe(true)
    expect(isValidTaxNo('0010010010')).toBe(true)
    expect(isValidTaxNo('123')).toBe(false)
  })
})
