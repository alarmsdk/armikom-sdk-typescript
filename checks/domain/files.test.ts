// Ported from Armikom.Open.Vue tests/unit/utils/binary.test.ts; the implementation now lives in this package.
import { describe, it, expect } from './_expect.js'
import { filenameFromContentDisposition, safeFilename, formatFileSize } from '../../src/core/files.js'

describe('filenameFromContentDisposition', () => {
  it('reads a quoted filename', () => {
    expect(filenameFromContentDisposition('attachment; filename="report.pdf"')).toBe('report.pdf')
  })

  it('reads a bare filename', () => {
    expect(filenameFromContentDisposition('attachment; filename=report.pdf')).toBe('report.pdf')
  })

  it('prefers filename* over filename, and decodes it (RFC 5987)', () => {
    // Turkish names round-trip percent-encoded. Reading the plain `filename` here
    // would hand the operator the server's ASCII-folded fallback instead.
    const header =
      "attachment; filename=\"Ariza Raporu.pdf\"; filename*=UTF-8''Ar%C4%B1za%20Raporu.pdf"
    expect(filenameFromContentDisposition(header)).toBe('Arıza Raporu.pdf')
  })

  it('falls back to the raw value when the percent-encoding is malformed', () => {
    const header = "attachment; filename*=UTF-8''bad%ZZname.pdf"
    expect(filenameFromContentDisposition(header)).toBe('bad%ZZname.pdf')
  })

  it('unescapes backslash escapes inside a quoted name', () => {
    expect(filenameFromContentDisposition('attachment; filename="a\\"b.txt"')).toBe('a"b.txt')
  })

  it('returns null when there is no header or no filename', () => {
    expect(filenameFromContentDisposition(null)).toBeNull()
    expect(filenameFromContentDisposition('inline')).toBeNull()
  })
})

describe('safeFilename', () => {
  it('strips path separators so a name cannot escape the download folder', () => {
    expect(safeFilename('../../etc/passwd', 'dosya')).toBe('_.._etc_passwd')
  })

  it('falls back when the name is empty after cleaning', () => {
    expect(safeFilename('...', 'dosya')).toBe('dosya')
    expect(safeFilename('   ', 'dosya')).toBe('dosya')
  })

  it('leaves an ordinary Turkish name alone', () => {
    expect(safeFilename('Arıza Raporu.pdf', 'dosya')).toBe('Arıza Raporu.pdf')
  })
})

describe('formatFileSize', () => {
  it('formats bytes, kilobytes and megabytes', () => {
    expect(formatFileSize(512)).toBe('512 B')
    expect(formatFileSize(2048)).toBe('2.0 KB')
    expect(formatFileSize(5 * 1024 * 1024)).toBe('5.0 MB')
  })

  it('returns empty for a missing size rather than guessing one', () => {
    expect(formatFileSize(null)).toBe('')
    expect(formatFileSize(undefined)).toBe('')
  })
})
