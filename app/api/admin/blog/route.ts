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

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
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

    if (!(prisma as any).blogPost) {
      return NextResponse.json({ success: true, data: [] })
    }

    const posts = await (prisma as any).blogPost.findMany({
      orderBy: [{ publishedAt: 'desc' }, { order: 'asc' }, { createdAt: 'desc' }],
      include: { package: { select: { id: true, name: true } } },
    })

    const formatted = posts.map((p: any) => ({
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

    if (!(prisma as any).blogPost) {
      return NextResponse.json(
        { success: false, error: 'Blog feature requires database migration. Run: npx prisma generate && npx prisma migrate deploy' },
        { status: 503 }
      )
    }

    const body = await request.json()
    const { title, excerpt, content, imageUrl, packageId, published } = body

    if (!title?.trim()) {
      return NextResponse.json({ success: false, error: 'Title is required' }, { status: 400 })
    }

    const slug = slugify(title)
    const existing = await (prisma as any).blogPost.findUnique({ where: { slug } })
    const finalSlug = existing ? `${slug}-${Date.now()}` : slug

    const post = await (prisma as any).blogPost.create({
      data: {
        slug: finalSlug,
        title: title.trim(),
        excerpt: (excerpt || '').trim(),
        content: (content || '').trim(),
        imageUrl: imageUrl || null,
        packageId: packageId || null,
        published: !!published,
        publishedAt: published ? new Date() : null,
      },
    })

    revalidatePath('/api/content')
    revalidatePath('/', 'layout')
    revalidateTag('public-content', 'max')

    await logAdminAudit({
      request,
      session,
      action: 'blog.create',
      entityType: 'blog_post',
      entityId: post.id,
      metadata: { slug: post.slug, published: post.published },
    })

    return NextResponse.json({ success: true, data: post })
  } catch (error: any) {
    console.error('Error creating blog post:', error)
    return NextResponse.json({ success: false, error: 'Failed to create blog post' }, { status: 500 })
  }
}
