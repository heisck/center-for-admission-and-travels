/**
 * Admin Newsletter API
 * GET /api/admin/newsletter - List all subscribers (admin only)
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyAdminSession } from '@/lib/auth-helpers'

export async function GET(request: NextRequest) {
  try {
    const session = await verifyAdminSession(request)
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const subscribers = await prisma.newsletterSubscriber.findMany({
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ success: true, subscribers })
  } catch (error) {
    console.error('Admin newsletter list error:', error)
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }
}
