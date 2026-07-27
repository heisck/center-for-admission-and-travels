import { describe, expect, it } from 'vitest'

import { contentToSafeHtml, sanitizeHtmlBasic } from '@/lib/safe-html'

describe('safe HTML rendering', () => {
  it('removes executable markup and event handlers', () => {
    const result = sanitizeHtmlBasic(
      '<script>alert(1)</script><img src="/safe.png" onerror="alert(2)"><p onclick=alert(3)>Safe</p>'
    )

    expect(result).not.toMatch(/script|onerror|onclick/i)
    expect(result).toContain('<img src="/safe.png" alt="" loading="lazy" />')
    expect(result).toContain('<p>Safe</p>')
  })

  it('rejects unsafe and encoded link protocols', () => {
    const result = sanitizeHtmlBasic(
      '<a href="javascript:alert(1)">one</a><a href="java&#x73;cript:alert(2)">two</a><a href="https://example.com">safe</a>'
    )

    expect(result).not.toMatch(/javascript:/i)
    expect(result).toContain('<a href="#" target="_blank" rel="noopener noreferrer">one</a>')
    expect(result).toContain('<a>two</a>')
    expect(result).toContain(
      '<a href="https://example.com" target="_blank" rel="noopener noreferrer">safe</a>'
    )
  })

  it('preserves supported editor formatting while stripping arbitrary styles', () => {
    const result = contentToSafeHtml(
      '<h2 style="color:red;text-align:center">Heading</h2><ul data-list-style="circle"><li><strong>Item</strong></li></ul>'
    )

    expect(result).toContain('<h2 style="text-align: center">Heading</h2>')
    expect(result).toContain('<ul data-list-style="circle">')
    expect(result).not.toContain('color:red')
  })
})
