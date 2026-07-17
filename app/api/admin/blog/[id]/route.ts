/**
 * Admin Blog Post API
 * PUT - Update blog post
 * DELETE - Delete blog post
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

    const { id } = await Promise.resolve(params)
    const body = await request.json()
    const { title, excerpt, content, imageUrl, packageId, published, slug, regenerateSlug } = body

    const existing = await prisma.blogPost.findUnique({
      where: { id },
      select: { id: true, slug: true, published: true },
    })
    if (!existing) {
      return NextResponse.json({ success: false, error: 'Post not found' }, { status: 404 })
    }

    const updateData: Record<string, unknown> = {}
    if (title !== undefined) updateData.title = String(title).trim()
    if (excerpt !== undefined) updateData.excerpt = String(excerpt || '').trim()
    if (content !== undefined) updateData.content = sanitizeBlogContent(content)
    if (imageUrl !== undefined) updateData.imageUrl = imageUrl || null
    if (packageId !== undefined) updateData.packageId = packageId || null
    if (published !== undefined) {
      updateData.published = !!published
      if (published) {
        updateData.publishedAt = new Date()
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

    revalidateBlogPaths(existing.slug)
    if (post.slug !== existing.slug) {
      revalidateBlogPaths(post.slug)
    }

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

    const { id } = await Promise.resolve(params)
    const existingPost = await prisma.blogPost.findUnique({
      where: { id },
      select: { slug: true },
    })

    await prisma.blogPost.delete({ where: { id } })

    revalidateBlogPaths(existingPost?.slug)

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
