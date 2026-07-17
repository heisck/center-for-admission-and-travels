import { prisma } from '@/lib/prisma'
import { slugifyBlogTitle } from '@/lib/blog-slug'

export type BlogPostWithPackage = NonNullable<Awaited<ReturnType<typeof findBlogPostByParam>>>

/**
 * Resolve a public blog URL param to a post.
 * Accepts:
 * - stored slug (my-cool-post)
 * - post id (cuid)
 * - title-like path (My Cool Post) → slugified then matched
 */
export async function findBlogPostByParam(param: string) {
  let raw = String(param || '').trim()
  try {
    raw = decodeURIComponent(raw)
  } catch {
    // keep raw
  }
  raw = raw.trim()
  if (!raw) return null

  try {
    // 1) Exact slug
    let post = await prisma.blogPost.findUnique({
      where: { slug: raw },
      include: { package: { select: { id: true, name: true } } },
    })
    if (post) return post

    // 2) Post id (admin / accidental id links)
    post = await prisma.blogPost.findUnique({
      where: { id: raw },
      include: { package: { select: { id: true, name: true } } },
    })
    if (post) return post

    // 3) Title-ish URL → slugify and match
    const fromTitle = slugifyBlogTitle(raw)
    if (fromTitle && fromTitle !== raw) {
      post = await prisma.blogPost.findUnique({
        where: { slug: fromTitle },
        include: { package: { select: { id: true, name: true } } },
      })
      if (post) return post
    }

    // 4) Case-insensitive slug (Postgres)
    const rows = await prisma.blogPost.findMany({
      where: {
        slug: { equals: raw, mode: 'insensitive' },
      },
      include: { package: { select: { id: true, name: true } } },
      take: 1,
    })
    if (rows[0]) return rows[0]

    return null
  } catch (error) {
    console.error('[blog-posts] findBlogPostByParam failed:', error)
    return null
  }
}
