/**
 * API Route: /api/content
 *
 * GET: Fetch all public content for the frontend
 * POST: Update content (admin-only mock path)
 */

import { revalidatePath, revalidateTag } from 'next/cache'
import { NextRequest, NextResponse } from 'next/server'

import { logAdminAudit } from '@/lib/admin-audit'
import { hasAdminPermission } from '@/lib/admin-permissions'
import { verifyAdminSession } from '@/lib/auth-helpers'
import { getPublicContent } from '@/lib/public-content'
import { checkRateLimit, rateLimitResponse } from '@/lib/rate-limit'
import { getClientIp } from '@/lib/security'

const PUBLIC_CONTENT_EDGE_CACHE_SECONDS = 30
const PUBLIC_CONTENT_EDGE_STALE_SECONDS = 60

// GET /api/content - Fetch all content for frontend
export async function GET() {
  try {
    const content = await getPublicContent()

    return NextResponse.json(
      { success: true, data: content },
      {
        headers: {
          'Cache-Control': `public, max-age=0, s-maxage=${PUBLIC_CONTENT_EDGE_CACHE_SECONDS}, stale-while-revalidate=${PUBLIC_CONTENT_EDGE_STALE_SECONDS}`,
        },
      }
    )
  } catch (error) {
    console.error('Error fetching content:', error)
    return NextResponse.json({ success: false, error: 'Failed to fetch content' }, { status: 500 })
  }
}

// POST /api/content - Update content (admin only)
export async function POST(request: NextRequest) {
  const ip = getClientIp(request)
  try {
    const session = await verifyAdminSession(request)
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }
    if (!hasAdminPermission(session.role, 'content.write')) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })
    }

    const { allowed, retryAfterMs } = await checkRateLimit(`admin-content-update:${session.userId}:${ip}`, {
      maxRequests: 30,
      windowMs: 60_000,
    })
    if (!allowed) return rateLimitResponse(retryAfterMs)

    const body = await request.json()
    const section = typeof body?.section === 'string' ? body.section.trim().slice(0, 100) : ''
    const data = body?.data

    if (!section || data === undefined) {
      return NextResponse.json({ success: false, error: 'Section and data are required' }, { status: 400 })
    }

    revalidatePath('/api/content')
    revalidatePath('/', 'layout')
    revalidateTag('public-content', 'max')

    await logAdminAudit({
      request,
      session,
      action: 'public_content.update_request',
      entityType: 'content_section',
      entityId: section,
      metadata: {
        dataKeys: data && typeof data === 'object' ? Object.keys(data as Record<string, unknown>).slice(0, 25) : [],
      },
    })

    return NextResponse.json({ success: true, message: 'Content updated (mock)' })
  } catch (error) {
    console.error('Error updating content:', error)
    return NextResponse.json({ success: false, error: 'Failed to update content' }, { status: 500 })
  }
}
