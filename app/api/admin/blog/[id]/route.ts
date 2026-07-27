/**
 * Admin Blog Post API
 * PUT - Update blog post
 * DELETE - Delete blog post
 */

import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath, revalidateTag } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { verifyAdminSession } from '@/lib/auth-helpers'
import { hasAdminPermission } from '@/lib/admin-permissions'
import { logAdminAudit } from '@/lib/admin-audit'
import { ensureUniqueBlogSlug, slugifyBlogTitle } from '@/lib/blog-slug'
import { deleteUnreferencedCloudinaryUrls } from '@/lib/cloudinary-orphans'
import { contentToSafeHtml } from '@/lib/safe-html'
import { checkRateLimit, rateLimitResponse } from '@/lib/rate-limit'
import { getClientIp } from '@/lib/security'

const ID_PATTERN = /^[A-Za-z0-9_-]{1,128}$/

function normalizeImageUrl(value: unknown) {
  const imageUrl = String(value || '').trim().slice(0, 2000)
  if (!imageUrl) return { value: null }
  if (!imageUrl.startsWith('/') && !/^https:\/\/[^\s]+$/i.test(imageUrl)) {
    return { error: 'Image must use an HTTPS URL or a local /public path' }
  }
  return { value: imageUrl }
}

async function enforceBlogWriteLimit(request: NextRequest, userId: string) {
  const { allowed, retryAfterMs } = await checkRateLimit(
    `admin-blog-write:${userId}:${getClientIp(request)}`,
    { maxRequests: 30, windowMs: 60_000 }
  )
  return allowed ? null : rateLimitResponse(retryAfterMs)
}

function sanitizeBlogContent(value: unknown): string {
  return contentToSafeHtml(String(value || '').trim().slice(0, 50_000))
}

function revalidateBlogPaths(slug?: string | null) {
  revalidatePath('/api/content')
  revalidatePath('/blog')
  revalidatePath('/', 'layout')
  revalidateTag('public-content', 'max')
  if (slug) {
    revalidatePath(`/blog/${slug}`)
    revalidatePath(`/api/blog/${slug}`)
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const session = await verifyAdminSession(request)
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }
    if (!hasAdminPermission(session.role, 'content.write')) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })
    }
    const limited = await enforceBlogWriteLimit(request, session.userId)
    if (limited) return limited

    const { id } = await Promise.resolve(params)
    if (!ID_PATTERN.test(id)) {
      return NextResponse.json({ success: false, error: 'Invalid post ID' }, { status: 400 })
    }
    const body = await request.json().catch(() => null)
    if (!body || typeof body !== 'object') {
      return NextResponse.json({ success: false, error: 'Invalid JSON body' }, { status: 400 })
    }
    const { title, excerpt, content, imageUrl, packageId, published, slug, regenerateSlug } = body

    const existing = await prisma.blogPost.findUnique({
      where: { id },
      select: { id: true, slug: true, published: true, publishedAt: true, imageUrl: true },
    })
    if (!existing) {
      return NextResponse.json({ success: false, error: 'Post not found' }, { status: 404 })
    }

    const updateData: Record<string, unknown> = {}
    if (title !== undefined) {
      const normalizedTitle = String(title).trim().slice(0, 200)
      if (!normalizedTitle) {
        return NextResponse.json({ success: false, error: 'Title is required' }, { status: 400 })
      }
      updateData.title = normalizedTitle
    }
    if (excerpt !== undefined) updateData.excerpt = String(excerpt || '').trim().slice(0, 1000)
    if (content !== undefined) {
      const rawContent = String(content || '')
      if (rawContent.length > 50_000) {
        return NextResponse.json({ success: false, error: 'Blog content is too long' }, { status: 400 })
      }
      updateData.content = sanitizeBlogContent(rawContent)
    }
    if (imageUrl !== undefined) {
      const normalizedImage = normalizeImageUrl(imageUrl)
      if (normalizedImage.error) {
        return NextResponse.json({ success: false, error: normalizedImage.error }, { status: 400 })
      }
      updateData.imageUrl = normalizedImage.value
    }
    if (packageId !== undefined) {
      const normalizedPackageId = String(packageId || '').trim()
      if (normalizedPackageId && !ID_PATTERN.test(normalizedPackageId)) {
        return NextResponse.json({ success: false, error: 'Invalid package ID' }, { status: 400 })
      }
      if (normalizedPackageId) {
        const linkedPackage = await prisma.package.findUnique({
          where: { id: normalizedPackageId },
          select: { id: true },
        })
        if (!linkedPackage) {
          return NextResponse.json({ success: false, error: 'Linked package not found' }, { status: 400 })
        }
      }
      updateData.packageId = normalizedPackageId || null
    }
    if (published !== undefined) {
      updateData.published = !!published
      if (published) {
        updateData.publishedAt = existing.publishedAt || new Date()
      } else {
        updateData.publishedAt = null
      }
    }

    // Slug rules:
    // - Keep stable by default (SEO-safe) when title changes
    // - If admin sends slug or regenerateSlug=true, update carefully with uniqueness
    if (typeof slug === 'string' && slug.trim()) {
      const nextSlug = await ensureUniqueBlogSlug(slug, async (candidate) => {
        const hit = await prisma.blogPost.findFirst({
          where: { slug: candidate, NOT: { id } },
          select: { id: true },
        })
        return Boolean(hit)
      })
      updateData.slug = nextSlug
    } else if (regenerateSlug && title !== undefined) {
      const nextSlug = await ensureUniqueBlogSlug(String(title), async (candidate) => {
        const hit = await prisma.blogPost.findFirst({
          where: { slug: candidate, NOT: { id } },
          select: { id: true },
        })
        return Boolean(hit)
      })
      updateData.slug = nextSlug
    } else if (existing.slug === '' || !slugifyBlogTitle(existing.slug)) {
      // Repair broken empty/invalid slugs
      const seed = title !== undefined ? String(title) : `post-${id.slice(-6)}`
      updateData.slug = await ensureUniqueBlogSlug(seed, async (candidate) => {
        const hit = await prisma.blogPost.findFirst({
          where: { slug: candidate, NOT: { id } },
          select: { id: true },
        })
        return Boolean(hit)
      })
    }

    const post = await prisma.blogPost.update({
      where: { id },
      data: updateData,
    })

    // Drop replaced blog cover only if nothing else still references it
    if (
      imageUrl !== undefined &&
      existing.imageUrl &&
      existing.imageUrl !== (imageUrl || null) &&
      existing.imageUrl.includes('cloudinary.com')
    ) {
      void deleteUnreferencedCloudinaryUrls([existing.imageUrl])
    }

    revalidateBlogPaths(existing.slug)
    if (post.slug !== existing.slug) {
      revalidateBlogPaths(post.slug)
    }
    revalidatePath('/')

    await logAdminAudit({
      request,
      session,
      action: 'blog.update',
      entityType: 'blog_post',
      entityId: post.id,
      metadata: { slug: post.slug, published: post.published },
    })

    return NextResponse.json({
      success: true,
      data: { ...post, publicPath: `/blog/${post.slug}` },
    })
  } catch (error: any) {
    console.error('Error updating blog post:', error)
    return NextResponse.json({ success: false, error: 'Failed to update blog post' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const session = await verifyAdminSession(request)
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }
    if (!hasAdminPermission(session.role, 'content.write')) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })
    }
    const limited = await enforceBlogWriteLimit(request, session.userId)
    if (limited) return limited

    const { id } = await Promise.resolve(params)
    if (!ID_PATTERN.test(id)) {
      return NextResponse.json({ success: false, error: 'Invalid post ID' }, { status: 400 })
    }
    const existingPost = await prisma.blogPost.findUnique({
      where: { id },
      select: { slug: true, imageUrl: true },
    })

    if (!existingPost) {
      return NextResponse.json({ success: false, error: 'Post not found' }, { status: 404 })
    }

    await prisma.blogPost.delete({ where: { id } })

    if (existingPost?.imageUrl) {
      void deleteUnreferencedCloudinaryUrls([existingPost.imageUrl])
    }

    revalidateBlogPaths(existingPost?.slug)
    revalidatePath('/')

    await logAdminAudit({
      request,
      session,
      action: 'blog.delete',
      entityType: 'blog_post',
      entityId: id,
      metadata: { slug: existingPost?.slug || null },
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error deleting blog post:', error)
    return NextResponse.json({ success: false, error: 'Failed to delete blog post' }, { status: 500 })
  }
}
