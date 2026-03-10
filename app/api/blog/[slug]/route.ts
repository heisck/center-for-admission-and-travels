/**
 * GET /api/blog/[slug] - Fetch a single published blog post by slug
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const revalidate = 60

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> | { slug: string } }
) {
  try {
    const { slug } = await Promise.resolve(params)

    const post = await prisma.blogPost.findFirst({
      where: { slug, published: true },
      include: { package: true },
    })

    if (!post) {
      return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 })
    }

    return NextResponse.json(
      {
        success: true,
        data: {
          id: post.id,
          slug: post.slug,
          title: post.title,
          excerpt: post.excerpt || '',
          content: post.content,
          imageUrl: post.imageUrl || null,
          packageId: post.packageId || null,
          package: post.package
            ? {
                id: post.package.id,
                name: post.package.name,
                slug: post.package.id,
              }
            : null,
          publishedAt: post.publishedAt?.toISOString?.() || null,
        },
      },
      {
        headers: {
          'Cache-Control': 'public, max-age=0, s-maxage=60, must-revalidate',
        },
      }
    )
  } catch (error: any) {
    console.error('Error fetching blog post:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
