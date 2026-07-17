/**
 * JSON-LD structured data for Google Search + AI answer engines.
 * Follows Google Local Business + Organization guidance:
 * https://developers.google.com/search/docs/appearance/structured-data/local-business
 */

import { normalizePhoneForTel } from '@/lib/contact-utils'
import { absoluteUrl, SITE_ALT_NAMES, SITE_NAME, SITE_SHORT_NAME } from '@/lib/metadata'
import {
  BUSINESS_ENTITY,
  buildAreaServedSchema,
  buildOpeningHoursSpec,
} from '@/lib/seo-local'
import type { ContactContent, FooterContent, PackageCardContent } from '@/lib/public-content'

const SITE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://catravels.com'

function JsonLd({ data }: { data: Record<string, unknown> | Record<string, unknown>[] }) {
  return (
    <script
      type="application/ld+json"
      // JSON-LD must be raw JSON in a script tag (Google recommendation)
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  )
}

interface OrganizationStructuredDataProps {
  contact: ContactContent
  footer: FooterContent
}

export function OrganizationStructuredData({ contact, footer }: OrganizationStructuredDataProps) {
  const phone = normalizePhoneForTel(contact.phone)
  const social = footer.socialLinks
    .map((link) => {
      // Collapse "https://https://..." and bare hosts so sameAs stays valid for Google
      let url = String(link.url || '').trim()
      if (!url) return ''
      url = url.replace(/^(https?:\/\/)+/i, (match) =>
        /https/i.test(match) ? 'https://' : 'http://'
      )
      if (!/^https?:\/\//i.test(url)) url = `https://${url.replace(/^\/\//, '')}`
      return url
    })
    .filter(Boolean)
  const areaServed = buildAreaServedSchema()
  const openingHours = buildOpeningHoursSpec()

  const street = contact.address.street || undefined
  const city = contact.address.city || BUSINESS_ENTITY.city
  const region = contact.address.region || BUSINESS_ENTITY.region

  const postalAddress = {
    '@type': 'PostalAddress',
    streetAddress: street,
    addressLocality: city,
    addressRegion: region,
    // ISO 3166-1 alpha-2 preferred by Google for LocalBusiness
    addressCountry: BUSINESS_ENTITY.country,
  }

  const hasGeo =
    contact.location?.latitude != null &&
    contact.location?.longitude != null &&
    Number.isFinite(contact.location.latitude) &&
    Number.isFinite(contact.location.longitude)

  const geo = hasGeo
    ? {
        '@type': 'GeoCoordinates',
        latitude: contact.location!.latitude,
        longitude: contact.location!.longitude,
      }
    : {
        // Accra city-center fallback so Google still has a Ghana anchor
        '@type': 'GeoCoordinates',
        latitude: 5.6037,
        longitude: -0.187,
      }

  const logo = {
    '@type': 'ImageObject',
    url: absoluteUrl('/images/ca-20logo.png'),
    width: 512,
    height: 512,
  }

  // Specific subtype TravelAgency (Google: use most specific LocalBusiness type)
  const travelAgency = {
    '@context': 'https://schema.org',
    '@type': 'TravelAgency',
    '@id': `${SITE_URL}/#travelagency`,
    name: SITE_NAME,
    legalName: SITE_NAME,
    alternateName: SITE_ALT_NAMES,
    url: SITE_URL,
    logo,
    image: [absoluteUrl('/images/ca-20logo.png'), absoluteUrl('/images/travel.jpg')],
    description:
      'CA Travels (CFAAT) is a travel and education consultancy in Accra, Ghana. We help clients across Ghana and West Africa study abroad, work abroad, and book international travel packages with admission and visa support.',
    slogan: 'Unlock the world, enrich your future',
    priceRange: BUSINESS_ENTITY.priceRange,
    currenciesAccepted: 'GHS, USD, EUR, GBP',
    paymentAccepted: 'Cash, Credit Card, Mobile Money, Paystack',
    address: postalAddress,
    geo,
    hasMap: hasGeo
      ? `https://www.google.com/maps/search/?api=1&query=${contact.location!.latitude},${contact.location!.longitude}`
      : `https://www.google.com/maps/search/?api=1&query=Accra+Ghana+Center+for+Admission+and+Travels`,
    ...(phone ? { telephone: phone } : {}),
    ...(contact.email ? { email: contact.email } : {}),
    openingHoursSpecification: openingHours,
    areaServed,
    knowsAbout: [
      'Study abroad from Ghana',
      'Work abroad from Ghana',
      'Travel abroad from Ghana',
      'University admissions',
      'Visa guidance',
      'International tours',
      'Travel packages Ghana',
    ],
    sameAs: social,
    parentOrganization: { '@id': `${SITE_URL}/#organization` },
  }

  const organization = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${SITE_URL}/#organization`,
    name: SITE_NAME,
    legalName: SITE_NAME,
    alternateName: SITE_ALT_NAMES,
    url: SITE_URL,
    logo,
    image: absoluteUrl('/images/ca-20logo.png'),
    description:
      'Center for Admission and Travels (CA Travels / CFAAT) — Ghana-based study abroad, work abroad, and travel consultancy serving West Africa.',
    foundingLocation: {
      '@type': 'Place',
      name: 'Accra, Ghana',
      address: {
        '@type': 'PostalAddress',
        addressLocality: 'Accra',
        addressCountry: 'GH',
      },
    },
    areaServed,
    ...(phone
      ? {
          telephone: phone,
          contactPoint: [
            {
              '@type': 'ContactPoint',
              telephone: phone,
              contactType: 'customer service',
              areaServed: ['GH', 'West Africa'],
              availableLanguage: ['English'],
            },
            {
              '@type': 'ContactPoint',
              telephone: phone,
              contactType: 'sales',
              areaServed: ['GH', 'West Africa'],
              availableLanguage: ['English'],
            },
          ],
        }
      : {}),
    ...(contact.email ? { email: contact.email } : {}),
    address: postalAddress,
    sameAs: social,
  }

  // ProfessionalService entity for education consulting (helps non-tour queries)
  const educationService = {
    '@context': 'https://schema.org',
    '@type': 'ProfessionalService',
    '@id': `${SITE_URL}/#educationservice`,
    name: `${SITE_SHORT_NAME} Study Abroad & Admissions`,
    url: absoluteUrl('/study-abroad'),
    image: absoluteUrl('/images/study-abroad.jpg'),
    description:
      'Study abroad counselling and university admission support for applicants in Ghana and West Africa.',
    provider: { '@id': `${SITE_URL}/#organization` },
    areaServed,
    ...(phone ? { telephone: phone } : {}),
    address: postalAddress,
  }

  return (
    <>
      <JsonLd data={organization} />
      <JsonLd data={travelAgency} />
      <JsonLd data={educationService} />
    </>
  )
}

export function WebSiteStructuredData() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${SITE_URL}/#website`,
    name: SITE_NAME,
    alternateName: SITE_ALT_NAMES,
    url: SITE_URL,
    description:
      'Official website of Center for Admission and Travels (CA Travels / CFAAT) in Ghana — study abroad, work abroad, and travel packages for West Africa.',
    inLanguage: BUSINESS_ENTITY.htmlLang,
    publisher: { '@id': `${SITE_URL}/#organization` },
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${SITE_URL}/packages?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  }

  return <JsonLd data={schema} />
}

export function BreadcrumbStructuredData({
  items,
}: {
  items: Array<{ name: string; path: string }>
}) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  }
  return <JsonLd data={schema} />
}

export function FaqStructuredData({
  faqs,
}: {
  faqs: Array<{ question: string; answer: string }>
}) {
  if (!faqs.length) return null
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  }
  return <JsonLd data={schema} />
}

export function PackagesItemListStructuredData({ packages }: { packages: PackageCardContent[] }) {
  if (!packages.length) return null

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Study, work, and travel packages from Ghana — CA Travels',
    description:
      'Packages from Center for Admission and Travels (CFAAT) for study abroad, work abroad, and international travel from Ghana.',
    numberOfItems: packages.length,
    itemListElement: packages.slice(0, 50).map((pkg, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: pkg.name,
      url: absoluteUrl(`/checkout?id=${pkg.id}`),
      item: {
        '@type': 'Product',
        name: pkg.name,
        description: pkg.description,
        category: pkg.category,
        image: pkg.images?.[0] ? absoluteUrl(pkg.images[0]) : absoluteUrl('/images/ca-20logo.png'),
        brand: { '@type': 'Brand', name: SITE_NAME },
        ...(pkg.price > 0
          ? {
              offers: {
                '@type': 'Offer',
                price: pkg.price,
                priceCurrency: (pkg.currency || 'GHS').toUpperCase(),
                availability: 'https://schema.org/InStock',
                url: absoluteUrl(`/checkout?id=${pkg.id}`),
                seller: { '@id': `${SITE_URL}/#travelagency` },
                areaServed: { '@type': 'Country', name: 'Ghana' },
              },
            }
          : {}),
      },
    })),
  }

  return <JsonLd data={schema} />
}

export function ServiceStructuredData({
  name,
  description,
  path,
  serviceType,
}: {
  name: string
  description: string
  path: string
  serviceType: string
}) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name,
    serviceType,
    description,
    url: absoluteUrl(path),
    provider: { '@id': `${SITE_URL}/#travelagency` },
    areaServed: buildAreaServedSchema(),
    audience: {
      '@type': 'Audience',
      geographicArea: {
        '@type': 'AdministrativeArea',
        name: 'Ghana and West Africa',
      },
    },
  }
  return <JsonLd data={schema} />
}

export function ArticleStructuredData({
  title,
  description,
  path,
  image,
  datePublished,
  dateModified,
}: {
  title: string
  description: string
  path: string
  image?: string | null
  datePublished?: string | null
  dateModified?: string | null
}) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: title,
    description,
    url: absoluteUrl(path),
    mainEntityOfPage: absoluteUrl(path),
    image: image ? absoluteUrl(image) : absoluteUrl('/images/ca-20logo.png'),
    inLanguage: BUSINESS_ENTITY.htmlLang,
    author: {
      '@type': 'Organization',
      name: SITE_NAME,
      url: SITE_URL,
    },
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME,
      logo: {
        '@type': 'ImageObject',
        url: absoluteUrl('/images/ca-20logo.png'),
      },
    },
    ...(datePublished ? { datePublished } : {}),
    ...(dateModified ? { dateModified } : datePublished ? { dateModified: datePublished } : {}),
  }
  return <JsonLd data={schema} />
}
