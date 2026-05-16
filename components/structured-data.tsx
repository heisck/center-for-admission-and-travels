/**
 * JSON-LD structured data for SEO
 * Helps search engines understand your organization and services
 */

import { normalizePhoneForTel } from '@/lib/contact-utils'
import type { ContactContent, FooterContent } from '@/lib/public-content'

const SITE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://catravels.com'

interface OrganizationStructuredDataProps {
  contact: ContactContent
  footer: FooterContent
}

export function OrganizationStructuredData({ contact, footer }: OrganizationStructuredDataProps) {
  const phone = normalizePhoneForTel(contact.phone)
  const address = {
    '@type': 'PostalAddress',
    addressLocality: contact.address.city || undefined,
    addressRegion: contact.address.region || undefined,
    streetAddress: contact.address.street || undefined,
    addressCountry: contact.address.country || undefined,
  }
  const hasAddress = Boolean(
    address.addressLocality ||
      address.addressRegion ||
      address.streetAddress ||
      address.addressCountry
  )

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Center for Admission and Travels',
    alternateName: 'CFAAT',
    url: SITE_URL,
    logo: `${SITE_URL}/images/ca-20logo.png`,
    description: 'Your gateway to global education, travel, and work opportunities. Study abroad, work abroad, and travel the world.',
    ...(hasAddress ? { address } : {}),
    ...(phone
      ? {
          contactPoint: {
            '@type': 'ContactPoint',
            telephone: phone,
            contactType: 'customer service',
            availableLanguage: 'English',
          },
        }
      : {}),
    sameAs: footer.socialLinks.map((link) => link.url).filter(Boolean),
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}

export function WebSiteStructuredData() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Center for Admission and Travels',
    url: SITE_URL,
    potentialAction: {
      '@type': 'SearchAction',
      target: { '@type': 'EntryPoint', urlTemplate: `${SITE_URL}/packages?q={search_term_string}` },
      'query-input': 'required name=search_term_string',
    },
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}
