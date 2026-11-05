/**
 * The assistant answers in light Markdown (bold, bullet and numbered lists). Rendered as
 * structured nodes rather than HTML so model output can never inject markup.
 */
export interface TextSpan {
  text: string
  bold: boolean
  code: boolean
}

export interface TextBlock {
  kind: 'paragraph' | 'bullet' | 'numbered'
  spans: TextSpan[]
}

export function parseSpans(line: string): TextSpan[] {
  const spans: TextSpan[] = []
  const pattern = /(\*\*[^*]+\*\*|`[^`]+`)/g
  let last = 0
  for (const match of line.matchAll(pattern)) {
    if (match.index! > last) spans.push({ text: line.slice(last, match.index), bold: false, code: false })
    const token = match[0]
    if (token.startsWith('**')) spans.push({ text: token.slice(2, -2), bold: true, code: false })
    else spans.push({ text: token.slice(1, -1), bold: false, code: true })
    last = match.index! + token.length
  }
  if (last < line.length) spans.push({ text: line.slice(last), bold: false, code: false })
  return spans
}

export function parseAssistantText(text: string): TextBlock[] {
  const blocks: TextBlock[] = []
  for (const raw of text.replace(/\r/g, '').split('\n')) {
    const line = raw.trimEnd()
    if (!line.trim()) continue
    const bullet = /^\s*[-*•]\s+(.*)$/.exec(line)
    const numbered = /^\s*\d+[.)]\s+(.*)$/.exec(line)
    if (bullet) blocks.push({ kind: 'bullet', spans: parseSpans(bullet[1] ?? '') })
    else if (numbered) blocks.push({ kind: 'numbered', spans: parseSpans(numbered[1] ?? '') })
    else blocks.push({ kind: 'paragraph', spans: parseSpans(line.replace(/^#+\s*/, '')) })
  }
  return blocks
}
