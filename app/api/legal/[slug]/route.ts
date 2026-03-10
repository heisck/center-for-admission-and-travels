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
import { hasAdminPermission } from '@/lib/admin-permissions'
import { checkRateLimit, rateLimitResponse } from '@/lib/rate-limit'
import { getClientIp } from '@/lib/security'
import { logAdminAudit } from '@/lib/admin-audit'

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
  } catch (error) {
    console.error('Error fetching legal page:', error)
    return NextResponse.json({ success: false, error: 'Failed to fetch legal page' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> | { slug: string } }
) {
  const ip = getClientIp(request)
  try {
    const session = await verifyAdminSession(request)
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }
    if (!hasAdminPermission(session.role, 'content.write')) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })
    }

    const { allowed, retryAfterMs } = await checkRateLimit(`admin-legal-update:${session.userId}:${ip}`, {
      maxRequests: 20,
      windowMs: 60_000,
    })
    if (!allowed) return rateLimitResponse(retryAfterMs)

    const { slug } = await Promise.resolve(params)
    if (!VALID_SLUGS.includes(slug as any)) {
      return NextResponse.json({ success: false, error: 'Invalid page' }, { status: 400 })
    }

    const body = await request.json()
    const { title, content } = body
    const normalizedTitle = typeof title === 'string' ? title.trim().slice(0, 200) : undefined
    const normalizedContent = typeof content === 'string' ? content.trim() : undefined
    if (!normalizedTitle && normalizedContent === undefined) {
      return NextResponse.json({ success: false, error: 'Title or content is required' }, { status: 400 })
    }
    if (normalizedContent && normalizedContent.length > 100_000) {
      return NextResponse.json({ success: false, error: 'Content is too long' }, { status: 400 })
    }

    const page = await prisma.legalPage.upsert({
      where: { slug },
      update: { title: normalizedTitle, content: normalizedContent },
      create: {
        slug,
        title: normalizedTitle || slug.charAt(0).toUpperCase() + slug.slice(1).replace(/-/g, ' '),
        content: normalizedContent || '',
      },
    })

    const path = SLUG_TO_PATH[slug]
    if (path) revalidatePath(path)

    await logAdminAudit({
      request,
      session,
      action: 'legal.update',
      entityType: 'legal_page',
      entityId: slug,
      metadata: {
        titleUpdated: Boolean(normalizedTitle),
        contentLength: normalizedContent?.length ?? null,
      },
    })

    return NextResponse.json({ success: true, data: page })
  } catch (error) {
    console.error('Error updating legal page:', error)
    return NextResponse.json({ success: false, error: 'Failed to update legal page' }, { status: 500 })
  }
}
