// Ported from Armikom.Open.Vue tests/unit/utils/rtf.test.ts; the implementation now lives in this package.
import { describe, it, expect } from './_expect.js'
import { isRtf, rtfToHtml } from '../../src/domain/index.js'

const SAMPLE_RTF_1 = String.raw`{\rtf1\deff0 \stshfdbch3\stshfloch2\stshfhich2\stshfbi1{\fonttbl{\f0\fcharset162 Calibri;}{\fbiminor\f1\fcharset162 Times New Roman;}{\fhiminor\f2\fcharset162 Calibri;}{\fdbminor\f3\fcharset162 Times New Roman;}{\f4\fcharset162 Cambria Math;}{\f5\fcharset162 MS Sans Serif;}}{\colortbl ;\red0\green0\blue255 ;}{\*\defchp \fcs1\f1\fcs1\f1\hich\af2\loch\af2\dbch\af3\cgrid1\fs24}{\*\defpap \widctlpar}{\stylesheet {\ql\fcs1\af1\ltrch\fcs0\hich\af2\dbch\af3\loch\f2\fs24 Normal;}{\*\cs1\fcs1\af1\ltrch\fcs0\hich\af2\dbch\af3\loch\f2\fs24 Default Paragraph Font;}{\*\cs2\sbasedon1\fcs1\af1\ltrch\fcs0\hich\af2\dbch\af3\loch\f2\fs24 Line Number;}{\*\cs3\fcs1\af1\ltrch\fcs0\hich\af2\dbch\af3\loch\f2\fs24\ul\cf1 Hyperlink;}{\*\ts4\tsrowd\fcs1\af1\ltrch\fcs0\hich\af2\dbch\af3\loch\f2\fs24\ql\tscellpaddfl3\tscellpaddl108\tscellpaddfb3\tscellpaddfr3\tscellpaddr108\tscellpaddft3\tsvertalt\cltxlrtb Normal Table;}{\*\ts5\tsrowd\sbasedon4\fcs1\af1\ltrch\fcs0\hich\af2\dbch\af3\loch\f2\fs24\ql\trbrdrt\brdrs\brdrw10\trbrdrl\brdrs\brdrw10\trbrdrb\brdrs\brdrw10\trbrdrr\brdrs\brdrw10\trbrdrh\brdrs\brdrw10\trbrdrv\brdrs\brdrw10\tscellpaddfl3\tscellpaddl108\tscellpaddfr3\tscellpaddr108\tsvertalt\cltxlrtb Table Simple 1;}}{\*\listoverridetable}{\info{\creatim\yr2026\mo7\dy22\hr8\min13}{\version1}}{\mmathPr\mbrkBin0\mbrkBinSub0\mdefJc0\minterSp0\mintLim1\mintraSp0\mmathFont4\mnaryLim1\mpostSp0\mpreSp0\mrMargin0\msmallFrac0\mwrapIndent0\mwrapRight0}\htmautsp\sectd\pard\plain\ql{\fcs1\af5\ltrch\fcs0\hich\af5\dbch\af3\loch\f5\fs16\cf0 SABAH 8 AK\u350\'deAM 19:00 GELEN ALARMDAN SONRA HEMEN A\u199\'c7ILIRSA KULLANICI HATASI D\u304\'ddYEB\u304\'ddL\u304\'ddR\u304\'ddZ.}\fcs1\af5\ltrch\fcs0\hich\af5\dbch\af3\loch\f5\fs16\par\pard\plain\ql\fcs1\af5\ltrch\fcs0\hich\af5\dbch\af3\loch\f5\fs16\par\pard\plain\ql{\fcs1\af5\alang1055\ltrch\fcs0\hich\af5\dbch\af3\loch\f5\fs16\lang1055\langfe1055\langnp1055\langfenp1055\cf0 GECE 12 DEN SONRA GPRS KES\u304\'ddL\u304\'ddRSE ARAMAYIN SMS ATABILIRSINIZ.}\fcs1\af5\ltrch\fcs0\hich\af5\dbch\af3\loch\f5\fs16\par\pard\plain\ql\fcs1\af5\ltrch\fcs0\hich\af5\dbch\af3\loch\f5\fs16\par\pard\plain\ql{\fcs1\af5\ltrch\fcs0\hich\af5\dbch\af3\loch\f5\fs16\cf0 ELEKT\u304\'ddR\u304\'ddK KES\u304\'ddNT\u304\'ddLER\u304\'ddNDE ARANACAK}\fcs1\af5\ltrch\fcs0\hich\af5\dbch\af3\loch\f5\fs16\par\pard\plain\ql{\fcs1\af5\ltrch\fcs0\hich\af5\dbch\af3\loch\f5\fs16\cf0 PAROLA SORULACAK}\fcs1\af5\ltrch\fcs0\hich\af5\dbch\af3\loch\f5\fs16\par\pard\plain\ql{\fcs1\af5\ltrch\fcs0\hich\af5\dbch\af3\loch\f5\fs16\cf0 TAMPER PANEL SABOTAJ}\fcs1\af5\ltrch\fcs0\hich\af5\dbch\af3\loch\f5\fs16\par}`

describe('rtf.ts', () => {
  it('detects RTF', () => {
    expect(isRtf(SAMPLE_RTF_1)).toBe(true)
    expect(isRtf('plain text')).toBe(false)
    expect(isRtf(null)).toBe(false)
  })

  it('extracts Turkish text with correct Unicode from DevExpress RTF', () => {
    const html = rtfToHtml(SAMPLE_RTF_1)
    // Must contain the actual Turkish characters, not the RTF escapes
    expect(html).toContain('AKŞAM')
    expect(html).toContain('AÇILIRSA')
    expect(html).toContain('DİYEBİLİRİZ')
    expect(html).toContain('KESİLİRSE')
    expect(html).toContain('ELEKTİRİK')
    expect(html).toContain('KESİNTİLERİNDE')
    expect(html).toContain('PAROLA SORULACAK')
    expect(html).toContain('TAMPER PANEL SABOTAJ')
  })

  it('does not contain stylesheet noise', () => {
    const html = rtfToHtml(SAMPLE_RTF_1)
    expect(html).not.toContain('Normal')
    expect(html).not.toContain('Default Paragraph Font')
    expect(html).not.toContain('Hyperlink')
    expect(html).not.toContain('Table Simple 1')
    expect(html).not.toContain('\\fcs1')
    expect(html).not.toContain('themedata')
  })

  it('preserves paragraph breaks', () => {
    const html = rtfToHtml(SAMPLE_RTF_1)
    // Multiple paragraphs should produce <p> tags
    expect(html).toContain('<p>')
  })

  it('renders WordPad/MyAlarmSis RTF whose text follows the header with no further group', () => {
    // Senka/HKM legacy notes: \u304? (plain '?' fallback), \uc1, no stylesheet group after the font table
    const rtf = String.raw`{\rtf1\ansi\ansicpg1254\deff0{\fonttbl{\f0\fswiss\fcharset162 Arial;}}\viewkind4\uc1\pard\f0\fs20 10.12.2025 TAR\u304?H\u304?NDE AK\u220?S\u220? DE\u286?\u304?\u350?T\u304?R\u304?LD\u304?.\par \par !!!KAPANI\u350?TA ARA!!!\par}`
    const html = rtfToHtml(rtf)
    expect(html).toContain('10.12.2025 TARİHİNDE AKÜSÜ DEĞİŞTİRİLDİ.')
    expect(html).toContain('!!!KAPANIŞTA ARA!!!')
    expect(html).not.toContain('?')
    expect(html).not.toContain('ansicpg')
  })

  it('honours \\ucN when skipping fallback characters', () => {
    expect(rtfToHtml(String.raw`{\rtf1\uc2 A\u304??B}`)).toBe('AİB')
    expect(rtfToHtml(String.raw`{\rtf1\uc0 A\u304 B}`)).toBe('AİB')
  })

  it('maps Latin-1 look-alikes back to Turkish letters', () => {
    const rtf = String.raw`{\rtf1\deff0{\fonttbl{\f0\fcharset162 Calibri;}}\uc1 yap\u253\'79lam\u253\'79yor HABERLE\u222\'3fME}`
    expect(rtfToHtml(rtf)).toBe('yapılamıyor HABERLEŞME')
  })

  it('passes through plain text unchanged', () => {
    const result = rtfToHtml('Hello world')
    expect(result).toBe('Hello world')
  })

  it('returns empty string for null/undefined', () => {
    expect(rtfToHtml(null)).toBe('')
    expect(rtfToHtml(undefined)).toBe('')
    expect(rtfToHtml('')).toBe('')
  })
})
