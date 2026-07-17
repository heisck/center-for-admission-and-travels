/**
 * GET /api/blog/[slug] - Fetch a single published blog post by slug (or id / title-like path)
 */

import { NextRequest, NextResponse } from 'next/server'
import { findBlogPostByParam } from '@/lib/blog-posts'

export const revalidate = 60

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> | { slug: string } }
) {
  try {
    const { slug } = await Promise.resolve(params)
    const post = await findBlogPostByParam(slug)

    if (!post || !post.published) {
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
  } catch (error) {
    console.error('Error fetching blog post:', error)
    return NextResponse.json({ success: false, error: 'Failed to fetch blog post' }, { status: 500 })
  }
}
