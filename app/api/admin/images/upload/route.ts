/**
 * API Route: /api/admin/images/upload
 * 
 * Upload image to Cloudinary (admin only)
 * 
 * TODO: Replace with real Cloudinary upload when integrated
 */

import { NextRequest, NextResponse } from 'next/server'
import { verifyAdminSession } from '@/lib/auth-helpers'
import { uploadImage, validateImageFileBytes, isCloudinaryConfigured, extractPublicId } from '@/lib/cloudinary'
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

    // Bound multipart payload size to prevent memory exhaustion
    const contentLength = Number(request.headers.get('content-length') || 0)
    if (contentLength > 6 * 1024 * 1024) {
      return NextResponse.json(
        { success: false, error: 'Payload too large (max 5MB)' },
        { status: 413 }
      )
    }

    const formData = await request.formData()
    const file = formData.get('file')
    const folder = formData.get('folder') as string | null

    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { success: false, error: 'No file provided or invalid file format' },
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

    // Validate file type, extension, size, and magic bytes
    const validation = await validateImageFileBytes(file, 5)
    if (!validation.valid) {
      return NextResponse.json(
        { success: false, error: validation.error },
        { status: 400 }
      )
    }

    // Sanitize folder path parameter to prevent directory traversal
    let safeFolder: string | undefined = undefined
    if (folder && typeof folder === 'string') {
      const sanitized = folder
        .replace(/[^a-zA-Z0-9_\-\/]/g, '')
        .split('/')
        .filter(Boolean)
        .filter((part) => part !== '.' && part !== '..')
        .join('/')
      if (sanitized) {
        safeFolder = `center-for-admission-and-travels/${sanitized}`
      }
    }

    // Upload to Cloudinary
    const url = await uploadImage(file, safeFolder)
    
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
