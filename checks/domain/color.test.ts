// Ported from Armikom.Open.Vue tests/unit/utils/parseColorInput.test.ts; the implementation now lives in this package.
import { describe, it, expect } from './_expect.js'
import { parseColorInput } from '../../src/domain/index.js'

describe('parseColorInput', () => {
  it.each([
    ['#dc2626', '#DC2626'],
    ['DC2626', '#DC2626'],
    ['#f00', '#FF0000'],
    ['abc', '#AABBCC'],
    ['  #00ff00 ', '#00FF00'],
    ['Red', '#FF0000']
  ])('reads %s as %s', (input, expected) => {
    expect(parseColorInput(input)).toBe(expected)
  })

  it.each([null, undefined, '', '#12', '#12345', 'not-a-colour', '#gggggg'])('rejects %s', (input) => {
    expect(parseColorInput(input as string | null | undefined)).toBeNull()
  })
})
