import { NextRequest, NextResponse } from 'next/server'
import { getUserFromSessionToken, getUserSessionCookieName, verifyPassword, hashPassword } from '@/lib/user-auth'
import { prisma } from '@/lib/prisma'
import { checkRateLimit, rateLimitResponse } from '@/lib/rate-limit'
import { getClientIp } from '@/lib/security'

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get(getUserSessionCookieName())?.value
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await getUserFromSessionToken(token)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const ip = getClientIp(request)
    const { allowed, retryAfterMs } = await checkRateLimit(`change-password:${user.id}:${ip}`, {
      maxRequests: 8,
      windowMs: 60_000,
    })
    if (!allowed) return rateLimitResponse(retryAfterMs)

    const body = await request.json()
    const currentPassword = typeof body?.currentPassword === 'string' ? body.currentPassword : ''
    const newPassword = typeof body?.newPassword === 'string' ? body.newPassword.trim() : ''

    if (!currentPassword || !newPassword) {
      return NextResponse.json({ error: 'Current password and new password are required' }, { status: 400 })
    }

    if (typeof newPassword !== 'string' || newPassword.length < 8) {
      return NextResponse.json({ error: 'New password must be at least 8 characters' }, { status: 400 })
    }

    const isValid = await verifyPassword(currentPassword, user.passwordHash)
    if (!isValid) {
      return NextResponse.json({ error: 'Current password is incorrect' }, { status: 400 })
    }

    const newHash = await hashPassword(newPassword)

    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash: newHash },
    })
    await prisma.userSession.deleteMany({
      where: {
        userId: user.id,
        token: { not: token },
      },
    })

    return NextResponse.json({ success: true, message: 'Password updated successfully' })
  } catch (error) {
    console.error('Change password error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

