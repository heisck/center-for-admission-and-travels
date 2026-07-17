/**
 * Admin Blog API
 * GET - List all blog posts (including drafts)
 * POST - Create new blog post
 */

import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath, revalidateTag } from 'next/cache'
import DOMPurify from 'isomorphic-dompurify'
import { prisma } from '@/lib/prisma'
import { verifyAdminSession } from '@/lib/auth-helpers'
import { hasAdminPermission } from '@/lib/admin-permissions'
import { logAdminAudit } from '@/lib/admin-audit'
import { ensureUniqueBlogSlug, slugifyBlogTitle } from '@/lib/blog-slug'

function sanitizeBlogContent(value: unknown): string {
  return DOMPurify.sanitize(String(value || '').trim().slice(0, 50_000), {
    USE_PROFILES: { html: true },
  })
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

    const body = await request.json()
    const { title, excerpt, content, imageUrl, packageId, published, slug: requestedSlug } = body

    if (!title?.trim()) {
      return NextResponse.json({ success: false, error: 'Title is required' }, { status: 400 })
    }

    const seed = (typeof requestedSlug === 'string' && requestedSlug.trim()) || title.trim()
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
        title: title.trim(),
        excerpt: (excerpt || '').trim(),
        content: sanitizeBlogContent(content),
        imageUrl: imageUrl || null,
        packageId: packageId || null,
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
