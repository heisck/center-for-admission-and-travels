import type { Metadata } from 'next'

const SITE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://catravels.com'
const SITE_NAME = 'Center for Admission and Travels'
const DEFAULT_DESC = 'Your gateway to global education, travel, and work opportunities. Study abroad, work abroad, and travel the world with CFAAT.'

export function createMetadata({
  title,
  description = DEFAULT_DESC,
  path = '',
  image = '/images/ca-20logo.png',
  noIndex = false,
}: {
  title: string
  description?: string
  path?: string
  image?: string
  noIndex?: boolean
}): Metadata {
  const url = path ? `${SITE_URL}${path}` : SITE_URL
  const fullTitle = title.includes(SITE_NAME) ? title : `${title} | ${SITE_NAME}`

  return {
    title: fullTitle,
    description,
    openGraph: {
      title: fullTitle,
      description,
      url,
      siteName: SITE_NAME,
      images: [{ url: image.startsWith('http') ? image : `${SITE_URL}${image}`, width: 512, height: 512, alt: SITE_NAME }],
      locale: 'en_GH',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description,
      images: [image.startsWith('http') ? image : `${SITE_URL}${image}`],
    },
    ...(noIndex && { robots: { index: false, follow: false } }),
  }
}
