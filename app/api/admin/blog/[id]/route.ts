/**
 * Admin Blog Post API
 * PUT - Update blog post
 * DELETE - Delete blog post
 */

import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath, revalidateTag } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { verifyAdminSession } from '@/lib/auth-helpers'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const session = await verifyAdminSession(request)
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await Promise.resolve(params)
    const body = await request.json()
    const { title, excerpt, content, imageUrl, packageId, published, slug } = body

    const updateData: Record<string, unknown> = {}
    if (title !== undefined) updateData.title = title.trim()
    if (excerpt !== undefined) updateData.excerpt = excerpt?.trim() || ''
    if (content !== undefined) updateData.content = content?.trim() || ''
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
    if (slug !== undefined) updateData.slug = slug.trim()

    const post = await prisma.blogPost.update({
      where: { id },
      data: updateData,
    })

    revalidatePath('/api/content')
    revalidatePath(`/api/blog/${post.slug}`)
    revalidatePath('/', 'layout')
    revalidateTag('public-content', 'max')

    return NextResponse.json({ success: true, data: post })
  } catch (error: any) {
    console.error('Error updating blog post:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
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

    const { id } = await Promise.resolve(params)

    await prisma.blogPost.delete({ where: { id } })

    revalidatePath('/api/content')
    revalidatePath('/', 'layout')
    revalidateTag('public-content', 'max')

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error deleting blog post:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
