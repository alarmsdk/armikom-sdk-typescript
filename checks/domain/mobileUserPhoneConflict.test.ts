// Ported from Armikom.Open.Vue tests/unit/utils/mobileUserPhoneConflict.test.ts; the implementation now lives in this package.
import { describe, it, expect } from './_expect.js'
import { describePhoneExists } from '../../src/domain/index.js'
import { normalizePhoneSearch } from '../../src/domain/index.js'
import { t } from './_i18n.js'

const conflict = (params?: Record<string, unknown>) => ({
  code: 'MOBILE_USER.PHONE_EXISTS',
  message: 'A mobile user with this phone number already exists.',
  params
})

describe('describePhoneExists', () => {
  it('ignores other error codes', () => {
    expect(describePhoneExists({ code: 'MOBILE_USER.NOT_FOUND', message: '' }, t)).toBeNull()
  })

  it('falls back to the localized error when the API sent no params', () => {
    expect(describePhoneExists(conflict(), t)).toBe(t('ERROR.MOBILE_USER.PHONE_EXISTS'))
  })

  it('explains an unlinked old record without suggesting it be removed', () => {
    const text = describePhoneExists(
      conflict({ phone: '5323731986', linkedSideCount: 0, hiddenSideCount: 0, linkedSides: [], mobileUserName: 'OLD USER' }),
      t
    )
    expect(text).toBe(
      [
        t('UI.MOBILE_USER.PHONE_TAKEN', { phone: '(532) 373 19 86' }),
        t('UI.MOBILE_USER.PHONE_TAKEN_OWNER', { name: 'OLD USER' }),
        t('UI.MOBILE_USER.PHONE_TAKEN_UNLINKED')
      ].join(' ')
    )
  })

  it('names linked subscribers verbatim, marks deleted ones, and counts the rest', () => {
    const text = describePhoneExists(
      conflict({
        phone: '5323731986',
        linkedSideCount: 3,
        hiddenSideCount: 1,
        mobileUserName: 'OLD USER',
        linkedSides: [
          { sideNo: 4100, partNo: 2, name: 'ŞİŞLİ ŞUBE', deleted: false },
          { sideNo: 4000, partNo: 0, name: 'ESKİ ABONE', deleted: true }
        ]
      }),
      t
    )!
    const deleted = t('UI.MOBILE_USER.PHONE_TAKEN_SIDE_DELETED')
    const more = t('UI.MOBILE_USER.PHONE_TAKEN_SIDES_MORE', { count: 1 })
    expect(text).toContain(
      t('UI.MOBILE_USER.PHONE_TAKEN_SIDES', { sides: `4100-2 ŞİŞLİ ŞUBE, 4000 ESKİ ABONE (${deleted}), ${more}` })
    )
    expect(text).toContain(t('UI.MOBILE_USER.PHONE_TAKEN_HIDDEN', { count: 1 }))
    expect(text).toContain(t('UI.MOBILE_USER.PHONE_TAKEN_LINK_HINT'))
  })

  it('says search cannot find a user linked only to deleted subscribers', () => {
    const text = describePhoneExists(
      conflict({
        phone: '5323731986',
        linkedSideCount: 1,
        hiddenSideCount: 0,
        linkedSides: [{ sideNo: 4000, partNo: 0, name: 'ESKİ ABONE', deleted: true }]
      }),
      t
    )!
    expect(text).toContain(t('UI.MOBILE_USER.PHONE_TAKEN_ONLY_DELETED'))
    expect(text).not.toContain(t('UI.MOBILE_USER.PHONE_TAKEN_LINK_HINT'))
  })

  it('reports links outside the caller view by count only', () => {
    const text = describePhoneExists(
      conflict({ phone: '5323731986', linkedSideCount: 0, hiddenSideCount: 2, linkedSides: [] }),
      t
    )
    expect(text).toBe(
      [
        t('UI.MOBILE_USER.PHONE_TAKEN', { phone: '(532) 373 19 86' }),
        t('UI.MOBILE_USER.PHONE_TAKEN_HIDDEN', { count: 2 })
      ].join(' ')
    )
  })
})

describe('normalizePhoneSearch', () => {
  it.each([
    ['0532 373 19 86', '5323731986'],
    ['+90 (532) 373-1986', '5323731986'],
    ['905323731986', '5323731986'],
    ['0532', '532'],
    ['373 19', '37319'],
    ['  Ahmet Yılmaz ', 'Ahmet Yılmaz'],
    ['Ali 0532', 'Ali 0532']
  ])('%s → %s', (typed, expected) => {
    expect(normalizePhoneSearch(typed)).toBe(expected)
  })
})
