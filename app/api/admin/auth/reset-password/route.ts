/**
 * Admin Reset Password
 * POST /api/admin/auth/reset-password
 * Body: { token: string, password: string }
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hashPassword } from '@/lib/user-auth'
import { checkRateLimit, rateLimitResponse } from '@/lib/rate-limit'
import { hashResetToken } from '@/lib/reset-token'
import { getClientIp } from '@/lib/security'
import { validatePassword } from '@/lib/password-policy'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  const ip = getClientIp(request)
  const { allowed, retryAfterMs } = await checkRateLimit(`admin-reset:${ip}`, {
    maxRequests: 5,
    windowMs: 60_000,
  })
  if (!allowed) return rateLimitResponse(retryAfterMs)

  try {
    const body = await request.json().catch(() => null)
    if (!body || typeof body !== 'object') {
      return NextResponse.json({ success: false, error: 'Invalid JSON body' }, { status: 400 })
    }
    const token = typeof body?.token === 'string' ? body.token.trim() : ''
    const passwordResult = validatePassword(body?.password)

    if (!token || !body?.password) {
      return NextResponse.json(
        { success: false, error: 'Token and new password are required' },
        { status: 400 }
      )
    }
    if (!/^[a-f0-9]{64}$/i.test(token)) {
      return NextResponse.json(
        { success: false, error: 'Invalid or expired reset link. Please request a new one.' },
        { status: 400 }
      )
    }

    if (!passwordResult.password) {
      return NextResponse.json(
        { success: false, error: passwordResult.error },
        { status: 400 }
      )
    }

    const tokenHash = hashResetToken(token)
    const adminUser = await prisma.adminUser.findUnique({
      where: { resetToken: tokenHash },
    })

    if (
      !adminUser ||
      !adminUser.resetTokenExpiry ||
      adminUser.resetTokenExpiry < new Date()
    ) {
      return NextResponse.json(
        { success: false, error: 'Invalid or expired reset link. Please request a new one.' },
        { status: 400 }
      )
    }

    const passwordHash = await hashPassword(passwordResult.password)
    const consumed = await prisma.$transaction(async (tx) => {
      const result = await tx.adminUser.updateMany({
        where: {
          id: adminUser.id,
          resetToken: tokenHash,
          resetTokenExpiry: { gt: new Date() },
        },
        data: {
          password: passwordHash,
          resetToken: null,
          resetTokenExpiry: null,
        },
      })
      if (result.count !== 1) return false
      await tx.adminSession.deleteMany({ where: { userId: adminUser.id } })
      return true
    })
    if (!consumed) {
      return NextResponse.json(
        { success: false, error: 'Invalid or expired reset link. Please request a new one.' },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Password reset successfully. You can now sign in with your new password.',
    })
  } catch (error) {
    console.error('Admin reset password error:', error)
    return NextResponse.json({ success: false, error: 'Something went wrong' }, { status: 500 })
  }
}

