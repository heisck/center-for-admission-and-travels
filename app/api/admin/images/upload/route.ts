/**
 * API Route: /api/admin/images/upload
 * 
 * Upload image to Cloudinary (admin only)
 * 
 * TODO: Replace with real Cloudinary upload when integrated
 */

import { NextRequest, NextResponse } from 'next/server'
import { verifyAdminSession } from '@/lib/auth-helpers'
import { uploadImage, validateImageFile } from '@/lib/cloudinary'

// POST /api/admin/images/upload
export async function POST(request: NextRequest) {
  try {
    const session = await verifyAdminSession(request)
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    const folder = formData.get('folder') as string | null

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
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

    return NextResponse.json({
      success: true,
      url,
      publicId: url, // TODO: Extract actual public ID from Cloudinary response
    })
  } catch (error: any) {
    console.error('Image upload error:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Upload failed' },
      { status: 500 }
    )
  }
}
