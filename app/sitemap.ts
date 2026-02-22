import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://catravels.com'

  const staticRoutes = [
    '',
    '/about',
    '/contact',
    '/study-abroad',
    '/work-abroad',
    '/travel-tours',
    '/global-network',
    '/packages',
    '/apply',
    '/signin',
    '/signup',
    '/terms',
    '/privacy',
    '/refund-policy',
  ]

  return staticRoutes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: route === '' ? 'weekly' : 'monthly',
    priority: route === '' ? 1 : route === '/packages' ? 0.9 : 0.7,
  }))
}
