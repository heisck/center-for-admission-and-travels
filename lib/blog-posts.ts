import { prisma } from '@/lib/prisma'
import { slugifyBlogTitle } from '@/lib/blog-slug'

const packageSelect = { select: { id: true, name: true } } as const

export type BlogPostWithPackage = NonNullable<Awaited<ReturnType<typeof findBlogPostByParam>>>

/**
 * Resolve a public blog URL segment to a post.
 * Real public URLs are always: /blog/{slug}
 * where slug is the stored BlogPost.slug (e.g. student-loans-for-international-students).
 */
export async function findBlogPostByParam(param: string) {
  let raw = String(param || '').trim()
  try {
    raw = decodeURIComponent(raw)
  } catch {
    // keep raw
  }
  // Strip accidental leading/trailing slashes or query noise
  raw = raw.replace(/^\/+|\/+$/g, '').trim()
  if (!raw) return null

  try {
    // 1) Exact slug (canonical path)
    const bySlug = await prisma.blogPost.findUnique({
      where: { slug: raw },
      include: { package: packageSelect },
    })
    if (bySlug) return bySlug

    // 2) Post id (cuid) — e.g. admin preview links
    if (/^[a-z0-9]{20,}$/i.test(raw)) {
      const byId = await prisma.blogPost.findUnique({
        where: { id: raw },
        include: { package: packageSelect },
      })
      if (byId) return byId
    }

    // 3) Title-like URL → slugify
    const fromTitle = slugifyBlogTitle(raw)
    if (fromTitle && fromTitle !== raw) {
      const byTitleSlug = await prisma.blogPost.findUnique({
        where: { slug: fromTitle },
        include: { package: packageSelect },
      })
      if (byTitleSlug) return byTitleSlug
    }

    // 4) Case-insensitive slug match (Postgres)
    try {
      const rows = await prisma.blogPost.findMany({
        where: { slug: { equals: raw, mode: 'insensitive' } },
        include: { package: packageSelect },
        take: 1,
      })
      if (rows[0]) return rows[0]
    } catch {
      // ignore if mode unsupported
    }

    // 5) Loose: slug starts with / contains the param (handles truncated links)
    try {
      const loose = await prisma.blogPost.findFirst({
        where: {
          OR: [
            { slug: { contains: raw, mode: 'insensitive' } },
            { title: { contains: raw.replace(/-/g, ' '), mode: 'insensitive' } },
          ],
        },
        include: { package: packageSelect },
      })
      if (loose) return loose
    } catch {
      // ignore
    }

    return null
  } catch (error) {
    console.error('[blog-posts] findBlogPostByParam failed:', error)
    return null
  }
}

/** All published posts for generateStaticParams / sitemaps */
export async function listPublishedBlogSlugs(): Promise<string[]> {
  try {
    const posts = await prisma.blogPost.findMany({
      where: { published: true },
      select: { slug: true },
      orderBy: { publishedAt: 'desc' },
    })
    return posts.map((p) => p.slug).filter(Boolean)
  } catch (error) {
    console.error('[blog-posts] listPublishedBlogSlugs failed:', error)
    return []
  }
}
