/**
 * JSON-LD structured data for SEO
 * Helps search engines understand your organization and services
 */

const SITE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://catravels.com'

export function OrganizationStructuredData() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Center for Admission and Travels',
    alternateName: 'CFAAT',
    url: SITE_URL,
    logo: `${SITE_URL}/images/ca-20logo.png`,
    description: 'Your gateway to global education, travel, and work opportunities. Study abroad, work abroad, and travel the world.',
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Tamale',
      addressRegion: 'Northern Region',
      streetAddress: 'BA14 Chinkara Street, Gumani',
      addressCountry: 'GH',
    },
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+233-248-422-663',
      contactType: 'customer service',
      areaServed: 'GH',
      availableLanguage: 'English',
    },
    sameAs: [] as string[],
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
