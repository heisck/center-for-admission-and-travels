/**
 * API Route: /api/legal/[slug]
 *
 * GET: Fetch legal page content (public)
 * PUT: Update legal page (admin only)
 *
 * Slugs: privacy, terms, refund-policy
 */

import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { verifyAdminSession } from '@/lib/auth-helpers'

const VALID_SLUGS = ['privacy', 'terms', 'refund-policy'] as const
const SLUG_TO_PATH: Record<string, string> = {
  privacy: '/privacy',
  terms: '/terms',
  'refund-policy': '/refund-policy',
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> | { slug: string } }
) {
  try {
    const { slug } = await Promise.resolve(params)

    if (!VALID_SLUGS.includes(slug as any)) {
      return NextResponse.json({ success: false, error: 'Invalid page' }, { status: 404 })
    }

    const page = await prisma.legalPage.findUnique({
      where: { slug },
    })

    if (!page) {
      return NextResponse.json({ success: false, error: 'Page not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: page })
  } catch (error: any) {
    console.error('Error fetching legal page:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> | { slug: string } }
) {
  try {
    const session = await verifyAdminSession(request)
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const { slug } = await Promise.resolve(params)
    if (!VALID_SLUGS.includes(slug as any)) {
      return NextResponse.json({ success: false, error: 'Invalid page' }, { status: 400 })
    }

    const body = await request.json()
    const { title, content } = body

    const page = await prisma.legalPage.upsert({
      where: { slug },
      update: { title: title ?? undefined, content: content ?? undefined },
      create: {
        slug,
        title: title || slug.charAt(0).toUpperCase() + slug.slice(1).replace(/-/g, ' '),
        content: content || '',
      },
    })

    const path = SLUG_TO_PATH[slug]
    if (path) revalidatePath(path)

    return NextResponse.json({ success: true, data: page })
  } catch (error: any) {
    console.error('Error updating legal page:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
