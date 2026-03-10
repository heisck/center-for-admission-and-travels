/**
 * API Route: /api/admin/images/delete
 * 
 * Delete image from Cloudinary (admin only)
 */

import { NextRequest, NextResponse } from 'next/server'
import { verifyAdminSession } from '@/lib/auth-helpers'
import { deleteImage, extractPublicId } from '@/lib/cloudinary'
import { hasAdminPermission } from '@/lib/admin-permissions'
import { checkRateLimit, rateLimitResponse } from '@/lib/rate-limit'
import { getClientIp } from '@/lib/security'
import { logAdminAudit } from '@/lib/admin-audit'

// DELETE /api/admin/images/delete
export async function DELETE(request: NextRequest) {
  const ip = getClientIp(request)
  try {
    const session = await verifyAdminSession(request)
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }
    if (!hasAdminPermission(session.role, 'media.manage')) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })
    }

    const { allowed, retryAfterMs } = await checkRateLimit(`admin-image-delete:${session.userId}:${ip}`, {
      maxRequests: 30,
      windowMs: 60_000,
    })
    if (!allowed) return rateLimitResponse(retryAfterMs)

    const { searchParams } = new URL(request.url)
    const url = searchParams.get('url')
    const publicId = searchParams.get('publicId')

    if (!url && !publicId) {
      return NextResponse.json(
        { success: false, error: 'URL or publicId required' },
        { status: 400 }
      )
    }

    // Extract public ID from URL if provided
    let idToDelete = publicId
    if (!idToDelete && url) {
      idToDelete = extractPublicId(url)
    }

    // If still no public ID, try using the URL as-is (might be a public ID already)
    if (!idToDelete) {
      idToDelete = url || publicId || ''
    }

    if (!idToDelete) {
      return NextResponse.json(
        { success: false, error: 'Invalid URL or publicId' },
        { status: 400 }
      )
    }

    // If it's not a Cloudinary URL, we can't delete it
    if (url && !url.includes('cloudinary.com')) {
      await logAdminAudit({
        request,
        session,
        action: 'media.delete.skip',
        entityType: 'image',
        entityId: idToDelete,
        metadata: { reason: 'non-cloudinary-url', url },
      })
      return NextResponse.json({
        success: true,
        message: 'Image is not stored in Cloudinary, skipping deletion',
      })
    }

    const success = await deleteImage(idToDelete)

    if (!success) {
      return NextResponse.json(
        { success: false, error: 'Failed to delete image' },
        { status: 500 }
      )
    }

    await logAdminAudit({
      request,
      session,
      action: 'media.delete',
      entityType: 'image',
      entityId: idToDelete,
      metadata: { url: url || null },
    })

    return NextResponse.json({
      success: true,
      message: 'Image deleted successfully',
    })
  } catch (error) {
    console.error('Image delete error:', error)
    return NextResponse.json(
      { success: false, error: 'Delete failed' },
      { status: 500 }
    )
  }
}
