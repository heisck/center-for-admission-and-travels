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
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }
}
