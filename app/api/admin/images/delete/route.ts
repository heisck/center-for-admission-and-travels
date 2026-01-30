/**
 * API Route: /api/admin/images/delete
 * 
 * Delete image from Cloudinary (admin only)
 * 
 * TODO: Replace with real Cloudinary delete when integrated
 */

import { NextRequest, NextResponse } from 'next/server'
import { verifyAdminSession } from '@/lib/auth-helpers'
import { deleteImage, extractPublicId } from '@/lib/cloudinary'

// DELETE /api/admin/images/delete
export async function DELETE(request: NextRequest) {
  try {
    const session = await verifyAdminSession(request)
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const url = searchParams.get('url')
    const publicId = searchParams.get('publicId')

    if (!url && !publicId) {
      return NextResponse.json(
        { success: false, error: 'URL or publicId required' },
        { status: 400 }
      )
    }

    const idToDelete = publicId || extractPublicId(url!) || url

    if (!idToDelete) {
      return NextResponse.json(
        { success: false, error: 'Invalid URL or publicId' },
        { status: 400 }
      )
    }

    const success = await deleteImage(idToDelete)

    if (!success) {
      return NextResponse.json(
        { success: false, error: 'Failed to delete image' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Image deleted successfully',
    })
  } catch (error: any) {
    console.error('Image delete error:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Delete failed' },
      { status: 500 }
    )
  }
}
