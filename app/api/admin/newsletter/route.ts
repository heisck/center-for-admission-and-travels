/**
 * Admin Newsletter API
 * GET /api/admin/newsletter - List all subscribers (admin only)
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
    if (!hasAdminPermission(session.role, 'support.manage')) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })
    }

    const { allowed, retryAfterMs } = await checkRateLimit(`admin-newsletter:${session.userId}:${ip}`, {
      maxRequests: 30,
      windowMs: 60_000,
    })
    if (!allowed) return rateLimitResponse(retryAfterMs)

    const subscribers = await prisma.newsletterSubscriber.findMany({
      orderBy: { createdAt: 'desc' },
    })

    const emails = subscribers.map((s) => s.email)
    const usersWithEmail = await prisma.user.findMany({
      where: { email: { in: emails } },
      select: { email: true, username: true },
    })
    const userEmailSet = new Set(usersWithEmail.map((u) => u.email.toLowerCase()))

    const subscribersWithUser = subscribers.map((s) => ({
      ...s,
      isRegisteredUser: userEmailSet.has(s.email.toLowerCase()),
      userUsername: usersWithEmail.find((u) => u.email.toLowerCase() === s.email.toLowerCase())?.username,
    }))

    return NextResponse.json({ success: true, subscribers: subscribersWithUser })
  } catch (error) {
    console.error('Admin newsletter list error:', error)
    return NextResponse.json({ success: false, error: 'Failed to fetch subscribers' }, { status: 500 })
  }
}
