/**
 * API Route: /api/admin/images/cleanup
 *
 * Scan Cloudinary for images not referenced by CMS content.
 * GET  → dry-run report
 * POST → { dryRun?: boolean } — delete orphans when dryRun is false
 */

import { NextRequest, NextResponse } from 'next/server'

import { logAdminAudit } from '@/lib/admin-audit'
import { hasAdminPermission } from '@/lib/admin-permissions'
import { verifyAdminSession } from '@/lib/auth-helpers'
import { cleanupOrphanCloudinaryImages } from '@/lib/cloudinary-orphans'
import { checkRateLimit, rateLimitResponse } from '@/lib/rate-limit'
import { getClientIp } from '@/lib/security'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const ip = getClientIp(request)
  try {
    const session = await verifyAdminSession(request)
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }
    if (!hasAdminPermission(session.role, 'media.manage')) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })
    }

    const { allowed, retryAfterMs } = await checkRateLimit(`admin-image-cleanup:${session.userId}:${ip}`, {
      maxRequests: 10,
      windowMs: 60_000,
    })
    if (!allowed) return rateLimitResponse(retryAfterMs)

    const result = await cleanupOrphanCloudinaryImages({ dryRun: true })

    return NextResponse.json({
      success: true,
      data: {
        ...result,
        orphanCount: result.orphans.length,
        // Cap payload size in report
        orphans: result.orphans.slice(0, 100),
      },
    })
  } catch (error) {
    console.error('Image cleanup scan error:', error)
    return NextResponse.json({ success: false, error: 'Cleanup scan failed' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const ip = getClientIp(request)
  try {
    const session = await verifyAdminSession(request)
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }
    if (!hasAdminPermission(session.role, 'media.manage')) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })
    }

    const { allowed, retryAfterMs } = await checkRateLimit(`admin-image-cleanup-run:${session.userId}:${ip}`, {
      maxRequests: 5,
      windowMs: 60_000,
    })
    if (!allowed) return rateLimitResponse(retryAfterMs)

    let dryRun = true
    try {
      const body = await request.json()
      dryRun = body?.dryRun !== false
    } catch {
      dryRun = true
    }

    const result = await cleanupOrphanCloudinaryImages({ dryRun })

    await logAdminAudit({
      request,
      session,
      action: dryRun ? 'media.cleanup.scan' : 'media.cleanup.delete',
      entityType: 'image',
      metadata: {
        dryRun,
        scanned: result.scanned,
        orphanCount: result.orphans.length,
        deletedCount: result.deleted.length,
        failedCount: result.failed.length,
      },
    })

    return NextResponse.json({
      success: true,
      data: {
        ...result,
        orphanCount: result.orphans.length,
        orphans: result.orphans.slice(0, 100),
      },
    })
  } catch (error) {
    console.error('Image cleanup error:', error)
    return NextResponse.json({ success: false, error: 'Cleanup failed' }, { status: 500 })
  }
}
