import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyAdminSession } from '@/lib/auth-helpers'
import { checkRateLimit, rateLimitResponse } from '@/lib/rate-limit'
import { getClientIp } from '@/lib/security'

export async function GET(request: NextRequest) {
  try {
    const ip = getClientIp(request)
    const { allowed, retryAfterMs } = await checkRateLimit(`admin-session:${ip}`, {
      maxRequests: 60,
      windowMs: 60_000,
    })
    if (!allowed) return rateLimitResponse(retryAfterMs)

    const session = await verifyAdminSession(request)
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const adminUser = await prisma.adminUser.findUnique({
      where: { id: session.userId },
      select: {
        id: true,
        username: true,
        email: true,
      },
    })

    if (!adminUser) {
      return NextResponse.json({ success: false, error: 'Admin user not found' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      data: adminUser,
    })
  } catch (error) {
    console.error('Admin session check error:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}

