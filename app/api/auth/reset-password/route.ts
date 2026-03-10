import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hashPassword, createSessionToken, getUserSessionCookieName, pruneUserSessions } from '@/lib/user-auth'
import { checkRateLimit, rateLimitResponse } from '@/lib/rate-limit'
import { hashResetToken } from '@/lib/reset-token'
import { getClientIp } from '@/lib/security'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  const ip = getClientIp(request)
  const { allowed, retryAfterMs } = await checkRateLimit(`reset-password:${ip}`, { maxRequests: 5, windowMs: 60_000 })
  if (!allowed) return rateLimitResponse(retryAfterMs)

  try {
    const body = await request.json()
    const token = typeof body?.token === 'string' ? body.token.trim() : ''
    const password = typeof body?.password === 'string' ? body.password.trim() : ''

    if (!token || !password) {
      return NextResponse.json({ success: false, error: 'Token and new password are required' }, { status: 400 })
    }
    if (!/^[a-f0-9]{64}$/i.test(token)) {
      return NextResponse.json({ success: false, error: 'Invalid or expired reset link. Please request a new one.' }, { status: 400 })
    }

    if (password.length < 8) {
      return NextResponse.json({ success: false, error: 'Password must be at least 8 characters' }, { status: 400 })
    }

    const tokenHash = hashResetToken(token)
    const user = await prisma.user.findUnique({ where: { resetToken: tokenHash } })

    if (!user || !user.resetTokenExpiry || user.resetTokenExpiry < new Date()) {
      return NextResponse.json({ success: false, error: 'Invalid or expired reset link. Please request a new one.' }, { status: 400 })
    }

    const passwordHash = await hashPassword(password)

    await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: user.id },
        data: {
          passwordHash,
          resetToken: null,
          resetTokenExpiry: null,
        },
      })
      await tx.userSession.deleteMany({ where: { userId: user.id } })
    })

    // Auto sign-in: create session so user doesn't have to re-enter password
    const sessionToken = createSessionToken()
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30) // 30 days
    await prisma.userSession.create({
      data: {
        userId: user.id,
        token: sessionToken,
        expiresAt,
      },
    })
    await pruneUserSessions(user.id).catch(() => {})

    const response = NextResponse.json({
      success: true,
      message: 'Password reset successfully. You are now signed in.',
      user: { id: user.id, username: user.username, email: user.email, displayName: user.displayName },
    })

    response.cookies.set(getUserSessionCookieName(), sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      expires: expiresAt,
    })

    return response
  } catch (error) {
    console.error('Reset password error:', error)
    return NextResponse.json({ success: false, error: 'Something went wrong' }, { status: 500 })
  }
}

