import { describe, expect, it } from 'vitest'

import { plainTextToHtml } from '@/lib/plain-text-to-html'
import { contentToSafeHtml } from '@/lib/safe-html'

describe('plainTextToHtml', () => {
  it('formats pasted blog sections, benefit lists, numbered lists, and links', () => {
    const input = `Finance Your Dream to Study Abroad

Studying abroad is one of the best investments you can make in your future.

1. MPOWER Financing

MPOWER Financing provides loans to international students.

1. a) Why Choose MPOWER?
No cosigner or collateral required
Fixed interest rates
Scholarships and career support services

Best for: Students who want independent financing.

Learn More: https://www.mpowerfinancing.com

Our Services Include:
1. University admissions guidance
2. Student visa assistance
3. International student loan guidance`

    const html = plainTextToHtml(input)

    expect(html).toContain('<h2>Finance Your Dream to Study Abroad</h2>')
    expect(html).toContain('<h2>MPOWER Financing</h2>')
    expect(html).toContain('<h3>Why Choose MPOWER?</h3>')
    expect(html).toContain('<ul data-list-style="disc">')
    expect(html).toContain('<strong>Best for:</strong>')
    expect(html).toContain(
      '<a href="https://www.mpowerfinancing.com" target="_blank" rel="noopener noreferrer"><em>https://www.mpowerfinancing.com</em></a>'
    )
    expect(html).toContain('<h3>Our Services Include:</h3><ol>')
  })
})

describe('contentToSafeHtml', () => {
  it('keeps supported rich-text alignment and list styles while stripping unsafe attributes', () => {
    const html = contentToSafeHtml(
      '<p style="text-align: center; color: red" onclick="alert(1)">Centered</p>' +
        '<ul data-list-style="circle" class="unsafe"><li>Item</li></ul>'
    )

    expect(html).toBe(
      '<p style="text-align: center">Centered</p>' +
        '<ul data-list-style="circle"><li>Item</li></ul>'
    )
  })
})
