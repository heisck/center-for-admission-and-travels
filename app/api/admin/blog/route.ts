/**
 * Admin Blog API
 * GET - List all blog posts (including drafts)
 * POST - Create new blog post
 */

import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath, revalidateTag } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { verifyAdminSession } from '@/lib/auth-helpers'
import { hasAdminPermission } from '@/lib/admin-permissions'
import { logAdminAudit } from '@/lib/admin-audit'
import { ensureUniqueBlogSlug, slugifyBlogTitle } from '@/lib/blog-slug'
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

function sanitizeBlogContent(value: unknown): string {
  return contentToSafeHtml(String(value || '').trim().slice(0, 50_000))
}

function revalidateBlogPaths(slug?: string) {
  revalidatePath('/api/content')
  revalidatePath('/blog')
  revalidatePath('/', 'layout')
  revalidateTag('public-content', 'max')
  if (slug) {
    revalidatePath(`/blog/${slug}`)
    revalidatePath(`/api/blog/${slug}`)
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await verifyAdminSession(request)
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }
    if (!hasAdminPermission(session.role, 'dashboard.read')) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })
    }

    const posts = await prisma.blogPost.findMany({
      orderBy: [{ publishedAt: 'desc' }, { order: 'asc' }, { createdAt: 'desc' }],
      include: { package: { select: { id: true, name: true } } },
    })

    const formatted = posts.map((p) => ({
      id: p.id,
      slug: p.slug,
      title: p.title,
      excerpt: p.excerpt || '',
      content: p.content,
      imageUrl: p.imageUrl || null,
      packageId: p.packageId || null,
      package: p.package,
      published: p.published,
      publishedAt: p.publishedAt?.toISOString?.() || null,
      publicPath: `/blog/${p.slug}`,
      order: p.order,
      createdAt: p.createdAt.toISOString(),
      updatedAt: p.updatedAt.toISOString(),
    }))

    return NextResponse.json({ success: true, data: formatted })
  } catch (error: any) {
    console.error('Error fetching blog posts:', error)
    return NextResponse.json({ success: false, error: 'Failed to fetch blog posts' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await verifyAdminSession(request)
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }
    if (!hasAdminPermission(session.role, 'content.write')) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })
    }
    const { allowed, retryAfterMs } = await checkRateLimit(
      `admin-blog-write:${session.userId}:${getClientIp(request)}`,
      { maxRequests: 30, windowMs: 60_000 }
    )
    if (!allowed) return rateLimitResponse(retryAfterMs)

    const body = await request.json().catch(() => null)
    if (!body || typeof body !== 'object') {
      return NextResponse.json({ success: false, error: 'Invalid JSON body' }, { status: 400 })
    }
    const { title, excerpt, content, imageUrl, packageId, published, slug: requestedSlug } = body
    const normalizedTitle = String(title || '').trim().slice(0, 200)
    const rawContent = String(content || '')

    if (!normalizedTitle) {
      return NextResponse.json({ success: false, error: 'Title is required' }, { status: 400 })
    }
    if (rawContent.length > 50_000) {
      return NextResponse.json({ success: false, error: 'Blog content is too long' }, { status: 400 })
    }
    const normalizedImage = normalizeImageUrl(imageUrl)
    if (normalizedImage.error) {
      return NextResponse.json({ success: false, error: normalizedImage.error }, { status: 400 })
    }
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

    const seed = (typeof requestedSlug === 'string' && requestedSlug.trim()) || normalizedTitle
    const finalSlug = await ensureUniqueBlogSlug(seed, async (candidate) => {
      const existing = await prisma.blogPost.findUnique({
        where: { slug: candidate },
        select: { id: true },
      })
      return Boolean(existing)
    })

    // Guard: never persist empty slug
    if (!finalSlug || !slugifyBlogTitle(finalSlug)) {
      return NextResponse.json({ success: false, error: 'Could not generate a valid URL slug' }, { status: 400 })
    }

    const post = await prisma.blogPost.create({
      data: {
        slug: finalSlug,
        title: normalizedTitle,
        excerpt: String(excerpt || '').trim().slice(0, 1000),
        content: sanitizeBlogContent(rawContent),
        imageUrl: normalizedImage.value,
        packageId: normalizedPackageId || null,
        published: !!published,
        publishedAt: published ? new Date() : null,
      },
    })

    revalidateBlogPaths(post.slug)

    await logAdminAudit({
      request,
      session,
      action: 'blog.create',
      entityType: 'blog_post',
      entityId: post.id,
      metadata: { slug: post.slug, published: post.published },
    })

    return NextResponse.json({
      success: true,
      data: {
        ...post,
        publicPath: `/blog/${post.slug}`,
      },
    })
  } catch (error: any) {
    console.error('Error creating blog post:', error)
    return NextResponse.json({ success: false, error: 'Failed to create blog post' }, { status: 500 })
  }
}
