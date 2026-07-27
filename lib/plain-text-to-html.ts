const URL_PATTERN = /https?:\/\/[^\s<]+/gi
const ORDERED_ITEM_PATTERN = /^\s*(\d+)[.)]\s+(.+)$/
const BULLET_ITEM_PATTERN = /^\s*([-*•○◦])\s+(.+)$/
const SUBHEADING_PATTERN = /^\s*\d+\.\s*[a-z]\)\s+(.+)$/i
const NUMBERED_HEADING_PATTERN = /^\s*\d+\.\s+(.+)$/

function escapeHtml(text: string): string {
  return String(text || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

function linkify(text: string): string {
  return text.replace(URL_PATTERN, (candidate) => {
    const trailing = candidate.match(/[),.;!?]+$/)?.[0] || ''
    const url = trailing ? candidate.slice(0, -trailing.length) : candidate
    if (!url) return candidate

    return `<a href="${url}" target="_blank" rel="noopener noreferrer"><em>${url}</em></a>${trailing}`
  })
}

function formatInline(text: string): string {
  const escaped = escapeHtml(text.trim())
  const withLabel = escaped.replace(
    /^([A-Z][A-Za-z0-9 &'/-]{1,40}:)(\s*)/,
    '<strong>$1</strong>$2'
  )
  return linkify(withLabel)
}

function formatHeading(text: string): string {
  return linkify(escapeHtml(text.trim()))
}

function isImplicitList(lines: string[]): boolean {
  if (lines.length < 2) return false

  return lines.every((line) => {
    const trimmed = line.trim()
    const words = trimmed.split(/\s+/).filter(Boolean)
    return (
      trimmed.length >= 3 &&
      trimmed.length <= 140 &&
      words.length <= 18 &&
      !/[.!]$/.test(trimmed)
    )
  })
}

function isHeadingLike(line: string): boolean {
  const trimmed = line.trim()
  if (!trimmed || trimmed.length > 90 || /[.,;!]$/.test(trimmed)) return false

  const words = trimmed.match(/[A-Za-z][A-Za-z'-]*/g) || []
  if (words.length < 2 || words.length > 12) return false

  const titleCaseWords = words.filter((word) => /^[A-Z]/.test(word)).length
  return titleCaseWords / words.length >= 0.55
}

function renderBulletList(lines: string[], listStyle: 'disc' | 'circle' = 'disc'): string {
  const items = lines
    .map((line) => line.match(BULLET_ITEM_PATTERN)?.[2] || line)
    .map((line) => `<li>${formatInline(line)}</li>`)
    .join('')

  return `<ul data-list-style="${listStyle}">${items}</ul>`
}

function renderOrderedList(lines: string[]): string {
  const items = lines
    .map((line) => line.match(ORDERED_ITEM_PATTERN)?.[2] || line)
    .map((line) => `<li>${formatInline(line)}</li>`)
    .join('')

  return `<ol>${items}</ol>`
}

function renderBlock(lines: string[], blockIndex: number): string {
  if (lines.length === 0) return ''

  const bulletMatches = lines.map((line) => line.match(BULLET_ITEM_PATTERN))
  if (bulletMatches.every(Boolean)) {
    const circle = bulletMatches.some((match) => match?.[1] === '○' || match?.[1] === '◦')
    return renderBulletList(lines, circle ? 'circle' : 'disc')
  }

  const orderedMatches = lines.map((line) => line.match(ORDERED_ITEM_PATTERN))
  if (lines.length > 1 && orderedMatches.every(Boolean)) {
    return renderOrderedList(lines)
  }

  const [firstLine, ...remainingLines] = lines
  const subheading = firstLine.match(SUBHEADING_PATTERN)
  if (subheading) {
    const list = remainingLines.length > 0
      ? isImplicitList(remainingLines)
        ? renderBulletList(remainingLines)
        : `<p>${formatInline(remainingLines.join(' '))}</p>`
      : ''
    return `<h3>${formatHeading(subheading[1])}</h3>${list}`
  }

  if (firstLine.endsWith(':') && remainingLines.length > 0) {
    const body = remainingLines.every((line) => ORDERED_ITEM_PATTERN.test(line))
      ? renderOrderedList(remainingLines)
      : isImplicitList(remainingLines)
        ? renderBulletList(remainingLines)
        : `<p>${formatInline(remainingLines.join(' '))}</p>`
    return `<h3>${formatHeading(firstLine)}</h3>${body}`
  }

  if (lines.length === 1) {
    const numberedHeading = firstLine.match(NUMBERED_HEADING_PATTERN)
    if (numberedHeading) {
      return `<h2>${formatHeading(numberedHeading[1])}</h2>`
    }

    if (blockIndex === 0 || isHeadingLike(firstLine)) {
      return `<h2>${formatHeading(firstLine)}</h2>`
    }
  }

  if (isImplicitList(lines)) {
    return renderBulletList(lines)
  }

  return `<p>${formatInline(lines.join(' '))}</p>`
}

/**
 * Converts plain-text blog drafts into safe, structured HTML.
 *
 * In addition to paragraphs and links, this recognizes common pasted-document
 * patterns: standalone headings, numbered section headings, "1. a)" subheads,
 * explicit lists, and compact groups of benefit lines.
 */
export function plainTextToHtml(text: string): string {
  if (!text || typeof text !== 'string') return ''

  const normalized = text.replace(/\r\n?/g, '\n').trim()
  if (!normalized) return ''

  const blocks = normalized
    .split(/\n\s*\n+/)
    .map((block) => block.split('\n').map((line) => line.trim()).filter(Boolean))
    .filter((block) => block.length > 0)

  return blocks.map(renderBlock).filter(Boolean).join('')
}

/**
 * Detects if content appears to be HTML (e.g. from before plain-text migration).
 */
export function looksLikeHtml(content: string): boolean {
  if (!content || typeof content !== 'string') return false
  const trimmed = content.trim()
  return trimmed.startsWith('<') || /<[a-z][\s\S]*>/i.test(trimmed)
}
