/**
 * Admin Reset Password
 * POST /api/admin/auth/reset-password
 * Body: { token: string, password: string }
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hashPassword, verifyPassword } from '@/lib/user-auth'
import { checkRateLimit, rateLimitResponse } from '@/lib/rate-limit'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
  const { allowed, retryAfterMs } = checkRateLimit(`admin-reset:${ip}`, {
    maxRequests: 5,
    windowMs: 60_000,
  })
  if (!allowed) return rateLimitResponse(retryAfterMs)

  try {
    const body = await request.json()
    const token = typeof body?.token === 'string' ? body.token.trim() : ''
    const password = typeof body?.password === 'string' ? body.password.trim() : ''

    if (!token || !password) {
      return NextResponse.json(
        { success: false, error: 'Token and new password are required' },
        { status: 400 }
      )
    }

    if (password.length < 8) {
      return NextResponse.json(
        { success: false, error: 'Password must be at least 8 characters' },
        { status: 400 }
      )
    }

    const adminUser = await prisma.adminUser.findUnique({
      where: { resetToken: token },
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

    const passwordHash = await hashPassword(password)

    // Use raw SQL to ensure the update persists (avoids Prisma/connection pooling issues)
    await prisma.$executeRaw`
      UPDATE admin_users
      SET password = ${passwordHash}, "resetToken" = NULL, "resetTokenExpiry" = NULL, "updatedAt" = NOW()
      WHERE id = ${adminUser.id}
    `

    await prisma.adminSession.deleteMany({ where: { userId: adminUser.id } })

    // Verify the update persisted
    const updated = await prisma.adminUser.findUnique({
      where: { id: adminUser.id },
      select: { password: true },
    })
    if (!updated) {
      return NextResponse.json({ success: false, error: 'Update failed. Please try again.' }, { status: 500 })
    }
    const verified = await verifyPassword(password, updated.password)
    if (!verified) {
      console.error('Admin reset password: verification failed after update - possible DB replication/pooling issue')
      return NextResponse.json({
        success: false,
        error: 'Password update did not persist. Please try again in a few seconds.',
      }, { status: 500 })
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
