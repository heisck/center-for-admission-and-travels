import { MetadataRoute } from 'next'
import { prisma } from '@/lib/prisma'

export const revalidate = 3600

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://catravels.com'
  const now = new Date()

  const staticRoutes: {
    path: string
    changeFrequency: 'daily' | 'weekly' | 'monthly'
    priority: number
  }[] = [
    { path: '', changeFrequency: 'daily', priority: 1 },
    { path: '/packages', changeFrequency: 'daily', priority: 0.95 },
    { path: '/study-abroad', changeFrequency: 'weekly', priority: 0.9 },
    { path: '/work-abroad', changeFrequency: 'weekly', priority: 0.9 },
    { path: '/travel-tours', changeFrequency: 'weekly', priority: 0.9 },
    { path: '/blog', changeFrequency: 'daily', priority: 0.85 },
    { path: '/about', changeFrequency: 'monthly', priority: 0.75 },
    { path: '/contact', changeFrequency: 'monthly', priority: 0.75 },
    { path: '/global-network', changeFrequency: 'monthly', priority: 0.7 },
    { path: '/apply', changeFrequency: 'monthly', priority: 0.8 },
    { path: '/newsletter', changeFrequency: 'monthly', priority: 0.5 },
    { path: '/terms', changeFrequency: 'monthly', priority: 0.2 },
    { path: '/privacy', changeFrequency: 'monthly', priority: 0.2 },
    { path: '/refund-policy', changeFrequency: 'monthly', priority: 0.2 },
    { path: '/ghana', changeFrequency: 'weekly', priority: 0.85 },
    { path: '/study-abroad-ghana', changeFrequency: 'weekly', priority: 0.9 },
    { path: '/travel-abroad-ghana', changeFrequency: 'weekly', priority: 0.9 },
    // AI / LLM discovery helpers
    { path: '/llms.txt', changeFrequency: 'monthly', priority: 0.3 },
    { path: '/llms-full.txt', changeFrequency: 'monthly', priority: 0.2 },
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
        select: { id: true, updatedAt: true, name: true },
      }),
    ])

    dynamicEntries = [
      ...blogPosts.map((post) => ({
        url: `${baseUrl}/blog/${post.slug}`,
        lastModified: post.updatedAt,
        changeFrequency: 'weekly' as const,
        priority: 0.7,
      })),
      // Deep links that surface individual packages in search
      ...packages.map((pkg) => ({
        url: `${baseUrl}/packages?q=${encodeURIComponent(pkg.name)}`,
        lastModified: pkg.updatedAt,
        changeFrequency: 'weekly' as const,
        priority: 0.55,
      })),
    ]
  } catch {
    // If the database is unreachable at build/revalidate time, fall back to static routes only.
  }

  return [...staticEntries, ...dynamicEntries]
}
