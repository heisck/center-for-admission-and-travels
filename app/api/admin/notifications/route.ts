/**
 * Admin Notifications API
 * GET - Fetch counts for badge indicators (unread messages, unviewed payments, etc.)
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyAdminSession } from '@/lib/auth-helpers'
import { hasAdminPermission } from '@/lib/admin-permissions'
import { checkRateLimit, rateLimitResponse } from '@/lib/rate-limit'
import { getClientIp } from '@/lib/security'

export async function GET(request: NextRequest) {
  const ip = getClientIp(request)
  try {
    const session = await verifyAdminSession(request)
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }
    if (!hasAdminPermission(session.role, 'dashboard.read')) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })
    }

    const { allowed, retryAfterMs } = await checkRateLimit(`admin-notifications:${session.userId}:${ip}`, {
      maxRequests: 120,
      windowMs: 60_000,
    })
    if (!allowed) return rateLimitResponse(retryAfterMs)

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
  } catch (error) {
    console.error('Error fetching notifications:', error)
    return NextResponse.json({ success: false, error: 'Failed to fetch notifications' }, { status: 500 })
  }
}
