/**
 * Production-safe HTML helpers for SSR.
 *
 * Avoid isomorphic-dompurify/jsdom on the request path — it frequently 500s on
 * serverless hosts (missing canvas/workers/CSS parse). Use pure-JS escaping or
 * a lightweight allowlist sanitizer instead.
 */

import { looksLikeHtml, plainTextToHtml } from '@/lib/plain-text-to-html'

const ALLOWED_TAGS = new Set([
  'a',
  'b',
  'strong',
  'i',
  'em',
  'u',
  'p',
  'br',
  'ul',
  'ol',
  'li',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'blockquote',
  'code',
  'pre',
  'span',
  'div',
  'img',
  'hr',
  'table',
  'thead',
  'tbody',
  'tr',
  'th',
  'td',
  'figure',
  'figcaption',
])

/** Escape plain text for HTML contexts. */
export function escapeHtml(text: string): string {
  return String(text || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

/**
 * Lightweight allowlist sanitizer (no jsdom). Good enough for blog/legal bodies
 * authored by admins. Strips scripts, event handlers, and unknown tags.
 */
export function sanitizeHtmlBasic(dirty: string): string {
  if (!dirty) return ''

  let html = String(dirty)
    // Remove dangerous blocks entirely
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?>[\s\S]*?<\/style>/gi, '')
    .replace(/<iframe[\s\S]*?>[\s\S]*?<\/iframe>/gi, '')
    .replace(/<object[\s\S]*?>[\s\S]*?<\/object>/gi, '')
    .replace(/<embed[\s\S]*?>/gi, '')
    .replace(/<link[\s\S]*?>/gi, '')
    .replace(/<meta[\s\S]*?>/gi, '')
    // Strip inline event handlers and javascript: URLs
    .replace(/\son\w+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, '')
    .replace(/(href|src)\s*=\s*(['"])\s*javascript:[\s\S]*?\2/gi, '$1="#"')
    .replace(/(href|src)\s*=\s*javascript:[^\s>]*/gi, '$1="#"')

  // Drop tags that are not in the allowlist (keep their text content for closings we remove)
  html = html.replace(/<\/?([a-zA-Z][a-zA-Z0-9]*)\b([^>]*)>/g, (full, rawTag: string, attrs: string) => {
    const tag = rawTag.toLowerCase()
    const isClosing = full.startsWith('</')
    if (!ALLOWED_TAGS.has(tag)) {
      return ''
    }
    if (isClosing) return `</${tag}>`

    if (tag === 'br' || tag === 'hr') {
      return `<${tag} />`
    }

    if (tag === 'a') {
      const hrefMatch = attrs.match(/href\s*=\s*("([^"]*)"|'([^']*)'|([^\s>]+))/i)
      let href = hrefMatch ? hrefMatch[2] || hrefMatch[3] || hrefMatch[4] || '' : ''
      href = href.trim()
      if (!href || /^javascript:/i.test(href) || /^data:/i.test(href)) {
        return '<a>'
      }
      // Only allow http(s), mailto, relative, anchor
      if (!/^(https?:|mailto:|\/|#)/i.test(href)) {
        return '<a>'
      }
      const safeHref = escapeHtml(href)
      return `<a href="${safeHref}" target="_blank" rel="noopener noreferrer">`
    }

    if (tag === 'img') {
      const srcMatch = attrs.match(/src\s*=\s*("([^"]*)"|'([^']*)'|([^\s>]+))/i)
      let src = srcMatch ? srcMatch[2] || srcMatch[3] || srcMatch[4] || '' : ''
      src = src.trim()
      if (!src || /^javascript:/i.test(src) || !/^(https?:|\/)/i.test(src)) {
        return ''
      }
      const altMatch = attrs.match(/alt\s*=\s*("([^"]*)"|'([^']*)'|([^\s>]+))/i)
      const alt = escapeHtml((altMatch ? altMatch[2] || altMatch[3] || altMatch[4] || '' : '').trim())
      return `<img src="${escapeHtml(src)}" alt="${alt}" loading="lazy" />`
    }

    return `<${tag}>`
  })

  return html
}

/**
 * Prepare blog/admin content for safe HTML display.
 * Plain text → paragraphs + links. HTML-ish → basic sanitize.
 */
export function contentToSafeHtml(content: string | null | undefined): string {
  const raw = String(content || '')
  if (!raw.trim()) return ''

  try {
    if (looksLikeHtml(raw)) {
      return sanitizeHtmlBasic(raw)
    }
    // Plain text posts: convert newlines, escape entities, linkify
    return plainTextToHtml(raw)
  } catch (error) {
    console.error('[safe-html] contentToSafeHtml failed, using escaped fallback:', error)
    return `<p>${escapeHtml(raw).replace(/\n/g, '<br />')}</p>`
  }
}
