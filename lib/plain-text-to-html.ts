/**
 * Converts plain text to safe HTML for display.
 * - Double newlines become paragraph breaks
 * - Single newlines become line breaks
 * - URLs become clickable links
 * - HTML entities are escaped for XSS safety
 */
export function plainTextToHtml(text: string): string {
  if (!text || typeof text !== 'string') return ''
  const escaped = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
  const urlRegex = /(https?:\/\/[^\s]+)/g
  const linkify = (s: string) =>
    s.replace(urlRegex, (url) => `<a href="${url}" target="_blank" rel="noopener noreferrer">${url}</a>`)
  const paragraphs = escaped.split(/\n\n+/)
  return paragraphs
    .map((p) => {
      const withBreaks = p.trim().replace(/\n/g, '<br />')
      return withBreaks ? `<p>${linkify(withBreaks)}</p>` : ''
    })
    .filter(Boolean)
    .join('')
}

/**
 * Detects if content appears to be HTML (e.g. from before plain-text migration).
 */
export function looksLikeHtml(content: string): boolean {
  if (!content || typeof content !== 'string') return false
  const trimmed = content.trim()
  return trimmed.startsWith('<') || /<[a-z][\s\S]*>/i.test(trimmed)
}
