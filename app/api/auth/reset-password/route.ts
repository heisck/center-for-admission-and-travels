import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hashPassword, createSessionToken, getUserSessionCookieName, pruneUserSessions } from '@/lib/user-auth'
import { getUserSessionHintCookieName } from '@/lib/user-session-cookies'
import { checkRateLimit, rateLimitResponse } from '@/lib/rate-limit'
import { hashResetToken } from '@/lib/reset-token'
import { getClientIp } from '@/lib/security'
import { validatePassword } from '@/lib/password-policy'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  const ip = getClientIp(request)
  const { allowed, retryAfterMs } = await checkRateLimit(`reset-password:${ip}`, { maxRequests: 5, windowMs: 60_000 })
  if (!allowed) return rateLimitResponse(retryAfterMs)

  try {
    const body = await request.json().catch(() => null)
    if (!body || typeof body !== 'object') {
      return NextResponse.json({ success: false, error: 'Invalid JSON body' }, { status: 400 })
    }
    const token = typeof body?.token === 'string' ? body.token.trim() : ''
    const passwordResult = validatePassword(body?.password)

    if (!token || !body?.password) {
      return NextResponse.json({ success: false, error: 'Token and new password are required' }, { status: 400 })
    }
    if (!/^[a-f0-9]{64}$/i.test(token)) {
      return NextResponse.json({ success: false, error: 'Invalid or expired reset link. Please request a new one.' }, { status: 400 })
    }

    if (!passwordResult.password) {
      return NextResponse.json({ success: false, error: passwordResult.error }, { status: 400 })
    }

    const tokenHash = hashResetToken(token)
    const user = await prisma.user.findUnique({ where: { resetToken: tokenHash } })

    if (!user || !user.resetTokenExpiry || user.resetTokenExpiry < new Date()) {
      return NextResponse.json({ success: false, error: 'Invalid or expired reset link. Please request a new one.' }, { status: 400 })
    }

    const passwordHash = await hashPassword(passwordResult.password)

    const consumed = await prisma.$transaction(async (tx) => {
      const result = await tx.user.updateMany({
        where: {
          id: user.id,
          resetToken: tokenHash,
          resetTokenExpiry: { gt: new Date() },
        },
        data: {
          passwordHash,
          emailVerifiedAt: user.emailVerifiedAt || new Date(),
          resetToken: null,
          resetTokenExpiry: null,
        },
      })
      if (result.count !== 1) return false
      await tx.userSession.deleteMany({ where: { userId: user.id } })
      return true
    })
    if (!consumed) {
      return NextResponse.json(
        { success: false, error: 'Invalid or expired reset link. Please request a new one.' },
        { status: 400 }
      )
    }

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
    await pruneUserSessions(user.id).catch((error) => {
      console.error('[Reset Password] Failed to prune user sessions:', error)
    })

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
    response.cookies.set(getUserSessionHintCookieName(), '1', {
      httpOnly: false,
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

