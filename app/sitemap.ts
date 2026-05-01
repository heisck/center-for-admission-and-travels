import { MetadataRoute } from 'next'
import { prisma } from '@/lib/prisma'

export const revalidate = 3600

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://catravels.com'
  const now = new Date()

  const staticRoutes: { path: string; changeFrequency: 'weekly' | 'monthly'; priority: number }[] = [
    { path: '', changeFrequency: 'weekly', priority: 1 },
    { path: '/about', changeFrequency: 'monthly', priority: 0.7 },
    { path: '/contact', changeFrequency: 'monthly', priority: 0.7 },
    { path: '/study-abroad', changeFrequency: 'monthly', priority: 0.8 },
    { path: '/work-abroad', changeFrequency: 'monthly', priority: 0.8 },
    { path: '/travel-tours', changeFrequency: 'monthly', priority: 0.8 },
    { path: '/global-network', changeFrequency: 'monthly', priority: 0.7 },
    { path: '/packages', changeFrequency: 'weekly', priority: 0.9 },
    { path: '/blog', changeFrequency: 'weekly', priority: 0.8 },
    { path: '/apply', changeFrequency: 'monthly', priority: 0.7 },
    { path: '/signin', changeFrequency: 'monthly', priority: 0.4 },
    { path: '/signup', changeFrequency: 'monthly', priority: 0.4 },
    { path: '/terms', changeFrequency: 'monthly', priority: 0.3 },
    { path: '/privacy', changeFrequency: 'monthly', priority: 0.3 },
    { path: '/refund-policy', changeFrequency: 'monthly', priority: 0.3 },
  ]

  const staticEntries: MetadataRoute.Sitemap = staticRoutes.map(({ path, changeFrequency, priority }) => ({
    url: `${baseUrl}${path}`,
    lastModified: now,
    changeFrequency,
    priority,
  }))

  let dynamicEntries: MetadataRoute.Sitemap = []
  try {
    const [blogPosts, packages] = await Promise.all([
      prisma.blogPost.findMany({
        where: { published: true },
        select: { slug: true, updatedAt: true },
      }),
      prisma.package.findMany({
        select: { id: true, updatedAt: true },
      }),
    ])

    dynamicEntries = [
      ...blogPosts.map((post) => ({
        url: `${baseUrl}/blog/${post.slug}`,
        lastModified: post.updatedAt,
        changeFrequency: 'monthly' as const,
        priority: 0.6,
      })),
      ...packages.map((pkg) => ({
        url: `${baseUrl}/packages?highlight=${pkg.id}`,
        lastModified: pkg.updatedAt,
        changeFrequency: 'monthly' as const,
        priority: 0.6,
      })),
    ]
  } catch {
    // If the database is unreachable at build/revalidate time, fall back to static routes only.
  }

  return [...staticEntries, ...dynamicEntries]
}
