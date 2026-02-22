/**
 * Admin Notifications API
 * GET - Fetch counts for badge indicators (unread messages, unviewed payments, etc.)
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

    const [unreadMessages, unviewedPayments, pendingPayments] = await Promise.all([
      prisma.contactMessage.count({ where: { read: false } }),
      prisma.payment.count({ where: { adminViewedAt: null, status: { in: ['success', 'processing'] } } }),
      prisma.payment.count({ where: { status: 'pending' } }),
    ])

    return NextResponse.json({
      success: true,
      data: {
        unreadMessages,
        unviewedPayments,
        pendingPayments,
      },
    })
  } catch (error: any) {
    console.error('Error fetching notifications:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
