/**
 * API Route: /api/admin/images/upload
 * 
 * Upload image to Cloudinary (admin only)
 * 
 * TODO: Replace with real Cloudinary upload when integrated
 */

import { NextRequest, NextResponse } from 'next/server'
import { verifyAdminSession } from '@/lib/auth-helpers'
import { uploadImage, validateImageFile, isCloudinaryConfigured, extractPublicId } from '@/lib/cloudinary'
import { hasAdminPermission } from '@/lib/admin-permissions'
import { checkRateLimit, rateLimitResponse } from '@/lib/rate-limit'
import { getClientIp } from '@/lib/security'
import { logAdminAudit } from '@/lib/admin-audit'

// POST /api/admin/images/upload
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

    const { allowed, retryAfterMs } = await checkRateLimit(`admin-image-upload:${session.userId}:${ip}`, {
      maxRequests: 15,
      windowMs: 60_000,
    })
    if (!allowed) return rateLimitResponse(retryAfterMs)

    const formData = await request.formData()
    const file = formData.get('file') as File
    const folder = formData.get('folder') as string | null

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      )
    }

    // Check if Cloudinary is configured
    if (!isCloudinaryConfigured()) {
      return NextResponse.json(
        {
          success: false,
          error:
            'Cloudinary is not configured. Please set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in your .env file.',
        },
        { status: 500 }
      )
    }

    // Validate file
    const validation = validateImageFile(file)
    if (!validation.valid) {
      return NextResponse.json(
        { success: false, error: validation.error },
        { status: 400 }
      )
    }

    // Upload to Cloudinary
    const url = await uploadImage(file, folder || undefined)
    
    // Extract public ID from URL
    const publicId = extractPublicId(url)

    await logAdminAudit({
      request,
      session,
      action: 'media.upload',
      entityType: 'image',
      entityId: publicId || null,
      metadata: {
        folder: folder || null,
        fileName: file.name,
        fileSize: file.size,
        mimeType: file.type,
      },
    })

    return NextResponse.json({
      success: true,
      url,
      publicId: publicId || url,
    })
  } catch (error: any) {
    console.error('Image upload error:', error)
    return NextResponse.json(
      { success: false, error: 'Upload failed' },
      { status: 500 }
    )
  }
}
