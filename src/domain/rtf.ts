/**
 * RTF ↔ HTML conversion for DevExpress/XAF-style RTF documents.
 *
 * These RTF documents use heavy stylesheet blocks, \uNNN\'xx Unicode escapes
 * (Turkish İ, Ş etc.), embedded \*\themedata binary, and \par for paragraphs.
 * Standard RTF libraries cannot handle them, so we parse manually.
 */

/** True when the string looks like an RTF document. */
export function isRtf(text: string | null | undefined): boolean {
  return typeof text === 'string' && text.trimStart().startsWith('{\\rtf')
}

/**
 * Extract readable text from an RTF string, returning simple HTML
 * with paragraph breaks preserved.  Falls back to the original
 * string when it is not RTF or when parsing fails.
 */
export function rtfToHtml(text: string | null | undefined): string {
  if (!text) return ''
  if (!isRtf(text)) return escapeHtml(text)
  try {
    return parseRtfToHtml(text)
  } catch {
    return escapeHtml(text)
  }
}

/**
 * If `originalText` was RTF, wrap the edited HTML back into a minimal
 * RTF envelope so the server stores it in the same format.
 * If it was plain text / HTML, return the value as-is.
 */
export function htmlToStorageFormat(html: string, originalText: string | null | undefined): string {
  if (isRtf(originalText)) {
    try {
      return htmlToRtf(html)
    } catch {
      return html
    }
  }
  return html
}

// ── Internal parser ──────────────────────────────────────────────────────────

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

/**
 * Core RTF parser.
 *
 * Strategy:
 *  1. Strip ignorable destinations: {\*\themedata ...}, {\*\colorschememapping ...},
 *     {\fonttbl ...}, {\colortbl ...}, {\stylesheet ...}, {\info ...},
 *     {\*\defchp ...}, {\*\defpap ...}, {\*\listoverridetable ...}, {\mmathPr ...}
 *  2. Walk remaining tokens, interpreting:
 *     - \uNNN  → Unicode codepoint (skip the \'xx fallback that follows)
 *     - \'xx   → charset-162 (Turkish Windows-1254) byte
 *     - \par   → paragraph break
 *     - \line  → line break
 *     - \tab   → tab
 *     - \b     → bold on,  \b0 → bold off
 *     - \i     → italic on, \i0 → italic off
 *     - \ul    → underline on, \ulnone → underline off
 *     - { }    → grouping (we track nesting depth)
 *     - Plain text segments are emitted directly
 *  3. Collapse and return HTML.
 */
function parseRtfToHtml(rtf: string): string {
  let cleaned = rtf

  // Remove \r\n inside the document (RTF line continuations)
  cleaned = cleaned.replace(/\r\n/g, '\n').replace(/\r/g, '\n')

  // Strip ignorable destination groups (balanced braces).
  // We do this iteratively because they can be nested.
  cleaned = stripDestinations(cleaned)

  // Now walk tokens
  const paragraphs: string[][] = [[]]
  let bold = false
  let italic = false
  let underline = false
  let uc = 1 // \ucN: number of fallback characters that follow each \uNNN
  let skip = 0 // fallback characters still to drop after \uNNN (\'xx or plain, e.g. '?')

  let i = 0
  const len = cleaned.length
  /** The character at `index`, or '' past the end — keeps the comparisons below total. */
  const at = (index: number): string => cleaned[index] ?? ''

  function currentParagraph(): string[] {
    return paragraphs[paragraphs.length - 1] as string[]
  }

  function pushText(s: string) {
    if (!s) return
    let out = escapeHtml(s)
    if (bold) out = `<strong>${out}</strong>`
    if (italic) out = `<em>${out}</em>`
    if (underline) out = `<u>${out}</u>`
    currentParagraph().push(out)
  }

  while (i < len) {
    const ch = cleaned[i]

    if (ch === '{' || ch === '}') {
      i++
      continue
    }

    if (ch === '\\') {
      // Control word or control symbol
      i++
      if (i >= len) break

      const next = cleaned[i]

      // Escaped literal characters
      if (next === '{' || next === '}' || next === '\\') {
        pushText(next)
        i++
        continue
      }

      // \'xx hex escape (Windows-1254 byte)
      if (next === '\'') {
        i++
        if (skip > 0) {
          // This is the fallback after \uNNN — skip it
          i += 2
          skip--
          continue
        }
        const hex = cleaned.substring(i, i + 2)
        i += 2
        const code = parseInt(hex, 16)
        if (!isNaN(code)) {
          pushText(windows1254ToChar(code))
        }
        continue
      }

      // \uNNNN — Unicode escape. The number can be negative (signed 16-bit).
      if (next === 'u' && i + 1 < len && (at(i + 1) >= '0' && at(i + 1) <= '9' || at(i + 1) === '-')) {
        i++ // skip 'u'
        let numStr = ''
        if (at(i) === '-') {
          numStr += '-'
          i++
        }
        while (i < len && at(i) >= '0' && at(i) <= '9') {
          numStr += at(i)
          i++
        }
        // A space after the number is the control-word delimiter, not text
        if (at(i) === ' ') i++
        let codepoint = parseInt(numStr, 10)
        if (codepoint < 0) codepoint += 65536
        pushText(LATIN1_TR[codepoint] ?? String.fromCodePoint(codepoint))
        skip = uc // the next uc characters are the ANSI fallback, skip them
        continue
      }

      // Read control word
      let word = ''
      while (i < len && /[a-zA-Z]/.test(at(i))) {
        word += at(i)
        i++
      }
      // Optional numeric parameter
      let param = ''
      if (i < len && (at(i) === '-' || (at(i) >= '0' && at(i) <= '9'))) {
        if (at(i) === '-') {
          param += '-'
          i++
        }
        while (i < len && at(i) >= '0' && at(i) <= '9') {
          param += cleaned[i]
          i++
        }
      }
      // Delimiter: a space following a control word is consumed
      if (i < len && cleaned[i] === ' ') {
        i++
      }

      // A control word ends any pending \uNNN fallback
      skip = 0

      // Interpret known control words
      switch (word) {
        case 'uc':
          uc = param === '' ? 1 : Number(param)
          break
        case 'par':
          paragraphs.push([])
          break
        case 'line':
          currentParagraph().push('<br>')
          break
        case 'tab':
          pushText('\t')
          break
        case 'b':
          bold = param !== '0'
          break
        case 'i':
          italic = param !== '0'
          break
        case 'ul':
          underline = true
          break
        case 'ulnone':
          underline = false
          break
        // Ignore control words we don't render:
        // fcs, af, ltrch, hich, dbch, loch, fs, cf, cgrid, lang, etc.
        default:
          break
      }

      continue
    }

    // Plain text character
    if (ch === '\n' || ch === '\r') {
      i++
      continue
    }

    if (skip > 0) {
      // Plain fallback characters after \uNNN (WordPad writes \u304? for İ)
      i++
      skip--
      continue
    }

    // Accumulate a run of plain text
    let run = ''
    while (i < len && cleaned[i] !== '\\' && cleaned[i] !== '{' && cleaned[i] !== '}' && cleaned[i] !== '\n' && cleaned[i] !== '\r') {
      run += cleaned[i]
      i++
    }
    if (run) {
      pushText(run)
    }
  }

  // Build HTML from paragraphs
  const htmlParts = paragraphs.map(segments => segments.join(''))

  // Trim trailing empty paragraphs
  while (htmlParts.length > 1 && (htmlParts[htmlParts.length - 1] ?? '').trim() === '') {
    htmlParts.pop()
  }

  if (htmlParts.length === 0) return ''
  if (htmlParts.length === 1) return htmlParts[0] || ''

  return htmlParts.map(p => `<p>${p || '&nbsp;'}</p>`).join('')
}

/**
 * Strip known ignorable RTF destination groups with balanced brace matching.
 * Handles: fonttbl, colortbl, stylesheet, info, defchp, defpap, listoverridetable,
 * mmathPr, themedata, colorschememapping, latentstyles, datastore, ...
 */
function stripDestinations(rtf: string): string {
  // Patterns that start ignorable groups — we match the opening and then
  // consume everything until the matching closing brace.
  const destPatterns = [
    /\{\\fonttbl\b/,
    /\{\\colortbl\b/,
    /\{\\\*\\defchp\b/,
    /\{\\\*\\defpap\b/,
    /\{\\stylesheet\b/,
    /\{\\\*\\listoverridetable\b/,
    /\{\\info\b/,
    /\{\\mmathPr\b/,
    /\{\\\*\\themedata\b/,
    /\{\\\*\\colorschememapping\b/,
    /\{\\\*\\latentstyles\b/,
    /\{\\\*\\datastore\b/,
  ]

  let result = rtf
  for (const pattern of destPatterns) {
    result = stripBalancedGroup(result, pattern)
  }

  // Strip the outermost {\rtf1 ... } wrapper. Only the group opener: the header control words
  // (\ansi\ansicpg1254\viewkind4\uc1 ...) are ignored by the walker, and the text may follow them
  // directly with no further '{' (WordPad/MyAlarmSis notes), so never consume up to the next brace.
  result = result.replace(/^\s*\{\\rtf1/, '')
  // Remove trailing }
  const lastBrace = result.lastIndexOf('}')
  if (lastBrace >= 0) {
    result = result.substring(0, lastBrace)
  }

  // Strip \htmautsp, \sectd, \pard, \plain, \ql, \widctlpar and similar
  // standalone control words that don't produce text
  result = result.replace(/\\(htmautsp|sectd|pard|plain|ql|qr|qc|qj|widctlpar|nowidctlpar|ltrpar|rtlpar|stshfdbch\d*|stshfloch\d*|stshfhich\d*|stshfbi\d*)\b\s?/g, '')

  return result
}

/**
 * Find and remove a balanced-brace group that starts at the match of `pattern`.
 * Handles nested braces correctly.
 */
function stripBalancedGroup(text: string, pattern: RegExp): string {
  let result = text
  let safety = 0
  while (safety++ < 50) {
    const match = pattern.exec(result)
    if (!match) break
    const start = match.index
    let depth = 0
    let j = start
    while (j < result.length) {
      if (result[j] === '{') depth++
      else if (result[j] === '}') {
        depth--
        if (depth === 0) {
          j++ // include closing brace
          break
        }
      }
      j++
    }
    result = result.substring(0, start) + result.substring(j)
  }
  return result
}

// ── Windows-1254 (Turkish) mapping for codes 0x80–0xFF ───────────────────────

const WIN1254_MAP: Record<number, string> = {
  0x80: '\u20AC', 0x82: '\u201A', 0x83: '\u0192', 0x84: '\u201E',
  0x85: '\u2026', 0x86: '\u2020', 0x87: '\u2021', 0x88: '\u02C6',
  0x89: '\u2030', 0x8A: '\u0160', 0x8B: '\u2039', 0x8C: '\u0152',
  0x8E: '\u017D', 0x91: '\u2018', 0x92: '\u2019', 0x93: '\u201C',
  0x94: '\u201D', 0x95: '\u2022', 0x96: '\u2013', 0x97: '\u2014',
  0x98: '\u02DC', 0x99: '\u2122', 0x9A: '\u0161', 0x9B: '\u203A',
  0x9C: '\u0153', 0x9E: '\u017E', 0x9F: '\u0178',
  // 0xC7 = Ç, 0xD0 = Ğ, 0xDD = İ, 0xDE = Ş, 0xE7 = ç, 0xF0 = ğ, 0xFD = ı (dotless), 0xFE = ş
  0xC7: '\u00C7', 0xD0: '\u011E', 0xDD: '\u0130', 0xDE: '\u015E',
  0xE7: '\u00E7', 0xF0: '\u011F', 0xFD: '\u0131', 0xFE: '\u015F',
}

// Some legacy notes store Turkish letters as their Latin-1 look-alikes (\u253 'ý' for 'ı', ...).
// These letters are not used in Turkish, so map them back.
const LATIN1_TR: Record<number, string> = {
  0xDD: '\u0130', 0xDE: '\u015E', 0xD0: '\u011E', 0xFD: '\u0131', 0xFE: '\u015F', 0xF0: '\u011F',
}

function windows1254ToChar(code: number): string {
  if (code < 0x80) return String.fromCharCode(code)
  if (WIN1254_MAP[code]) return WIN1254_MAP[code]
  // For 0xA0–0xFF range not in the map, Latin-1 is identical to Unicode
  return String.fromCharCode(code)
}

// ── HTML → minimal RTF ───────────────────────────────────────────────────────

function htmlToRtf(html: string): string {
  // Parse HTML to text runs with basic formatting
  const div = typeof document !== 'undefined' ? document.createElement('div') : null
  if (!div) {
    // SSR fallback: strip tags
    const plain = html.replace(/<br\s*\/?>/gi, '\n').replace(/<\/p>/gi, '\n').replace(/<[^>]+>/g, '')
    return wrapRtf(escapeRtfText(plain).replace(/\n/g, '\\par\n'))
  }

  div.innerHTML = html
  const rtfBody = domToRtf(div)
  return wrapRtf(rtfBody)
}

function domToRtf(node: Node): string {
  if (node.nodeType === 3 /* TEXT */) {
    return escapeRtfText(node.textContent || '')
  }

  if (node.nodeType !== 1 /* ELEMENT */) return ''

  const el = node as HTMLElement
  const tag = el.tagName.toLowerCase()
  let inner = ''
  for (let i = 0; i < el.childNodes.length; i++) {
    inner += domToRtf(el.childNodes[i] as ChildNode)
  }

  switch (tag) {
    case 'p':
    case 'div':
      return inner + '\\par\n'
    case 'br':
      return '\\line\n'
    case 'strong':
    case 'b':
      return `{\\b ${inner}}`
    case 'em':
    case 'i':
      return `{\\i ${inner}}`
    case 'u':
      return `{\\ul ${inner}}`
    case 's':
    case 'strike':
      return `{\\strike ${inner}}`
    case 'li':
      return `\\tab - ${inner}\\par\n`
    case 'h1':
      return `{\\b\\fs28 ${inner}}\\par\n`
    case 'h2':
      return `{\\b\\fs24 ${inner}}\\par\n`
    case 'h3':
      return `{\\b\\fs22 ${inner}}\\par\n`
    default:
      return inner
  }
}

function escapeRtfText(text: string): string {
  let out = ''
  for (const ch of text) {
    const code = ch.codePointAt(0)!
    if (ch === '\\') out += '\\\\'
    else if (ch === '{') out += '\\{'
    else if (ch === '}') out += '\\}'
    else if (code > 127) {
      // Emit as \uNNNN with a ? fallback
      out += `\\u${code}\\'3f`
    } else {
      out += ch
    }
  }
  return out
}

function wrapRtf(body: string): string {
  return `{\\rtf1\\ansi\\ansicpg1254\\deff0{\\fonttbl{\\f0\\fcharset162 MS Sans Serif;}}\\f0\\fs16 ${body}}`
}
