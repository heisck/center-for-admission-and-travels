import type { Metadata } from 'next'
import { BUSINESS_ENTITY, LOCAL_KEYWORDS } from '@/lib/seo-local'

const SITE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://catravels.com'
export const SITE_NAME = BUSINESS_ENTITY.legalName
export const SITE_SHORT_NAME = BUSINESS_ENTITY.shortName
export const SITE_ALT_NAMES = [...BUSINESS_ENTITY.brandNames]

export const DEFAULT_DESC =
  'CA Travels (CFAAT) in Accra, Ghana — study abroad, work abroad, and travel packages for clients across Ghana and West Africa. Admission support, visa guidance, and international tours.'

/** High-intent local + service keywords (metadata only; body copy stays natural). */
export const DEFAULT_KEYWORDS = Array.from(
  new Set([
    ...LOCAL_KEYWORDS,
    'CA Travels',
    'CA Travels Ghana',
    'CFAAT',
    'Center for Admission and Travels',
    'travel to Ghana',
    'study in UK from Ghana',
    'study in Canada from Ghana',
  ])
)

export function absoluteUrl(path = ''): string {
  if (!path) return SITE_URL
  if (path.startsWith('http')) return path
  return `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`
}

/** hreflang: primary market is English-speaking Ghana; x-default = same. */
export function languageAlternates(path = ''): Metadata['alternates'] {
  const url = absoluteUrl(path)
  return {
    canonical: url,
    languages: {
      'en-GH': url,
      'en': url,
      'x-default': url,
    },
  }
}

export function createMetadata({
  title,
  description = DEFAULT_DESC,
  path = '',
  image = '/images/ca-20logo.png',
  noIndex = false,
  keywords = DEFAULT_KEYWORDS,
  type = 'website',
}: {
  title: string
  description?: string
  path?: string
  image?: string
  noIndex?: boolean
  keywords?: string[]
  type?: 'website' | 'article'
}): Metadata {
  const url = absoluteUrl(path)
  const fullTitle =
    title.includes(SITE_NAME) ||
    title.includes(SITE_SHORT_NAME) ||
    title.includes('CA Travels')
      ? title
      : `${title} | CA Travels Ghana (${SITE_SHORT_NAME})`
  const imageUrl = absoluteUrl(image)

  return {
    title: fullTitle,
    description,
    keywords,
    applicationName: `${SITE_NAME} | CA Travels Ghana`,
    authors: [{ name: SITE_NAME, url: SITE_URL }],
    creator: SITE_NAME,
    publisher: SITE_NAME,
    category: 'travel',
    alternates: languageAlternates(path),
    openGraph: {
      title: fullTitle,
      description,
      url,
      siteName: `${SITE_NAME} | CA Travels Ghana`,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: `${SITE_NAME} — CA Travels Accra, Ghana`,
        },
      ],
      locale: BUSINESS_ENTITY.locale,
      type,
      countryName: BUSINESS_ENTITY.countryName,
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description,
      images: [imageUrl],
    },
    robots: noIndex
      ? { index: false, follow: false, googleBot: { index: false, follow: false } }
      : {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
            'max-image-preview': 'large',
            'max-snippet': -1,
            'max-video-preview': -1,
          },
        },
    other: {
      'geo.region': BUSINESS_ENTITY.country,
      'geo.placename': `${BUSINESS_ENTITY.city}, ${BUSINESS_ENTITY.countryName}`,
      'ICBM': '5.6037, -0.1870', // Accra fallback; real coords override via schema when available
      'content-language': BUSINESS_ENTITY.htmlLang,
    },
  }
}
