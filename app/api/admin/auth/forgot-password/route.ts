/**
 * Admin Forgot Password
 * POST /api/admin/auth/forgot-password
 * Body: { email: string }
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendEmail } from '@/lib/email'
import { adminPasswordResetEmail } from '@/lib/email-templates'
import { checkRateLimit, rateLimitResponse } from '@/lib/rate-limit'
import crypto from 'crypto'

export async function POST(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
  const { allowed, retryAfterMs } = checkRateLimit(`admin-forgot:${ip}`, {
    maxRequests: 3,
    windowMs: 60_000,
  })
  if (!allowed) return rateLimitResponse(retryAfterMs)

  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ success: false, error: 'Email is required' }, { status: 400 })
    }

    const normalizedEmail = String(email).trim().toLowerCase()

    const adminUser = await prisma.adminUser.findFirst({
      where: {
        OR: [{ email: normalizedEmail }, { username: normalizedEmail }],
      },
    })

    if (!adminUser) {
      return NextResponse.json({
        success: true,
        message: 'If an admin account with that email exists, a reset link has been sent.',
      })
    }

    const targetEmail = adminUser.email || undefined
    if (!targetEmail) {
      return NextResponse.json(
        {
          success: false,
          error: 'This admin account has no email. Contact your system administrator.',
        },
        { status: 400 }
      )
    }

    const resetToken = crypto.randomBytes(32).toString('hex')
    const resetTokenExpiry = new Date(Date.now() + 1000 * 60 * 60) // 1 hour

    await prisma.adminUser.update({
      where: { id: adminUser.id },
      data: { resetToken, resetTokenExpiry },
    })

    const { getBaseUrl } = await import('@/lib/url')
    const baseUrl = getBaseUrl(request)
    const resetUrl = `${baseUrl}/admin-reset-password?token=${resetToken}`
    const template = adminPasswordResetEmail(adminUser.username, resetUrl)

    await sendEmail({ to: targetEmail, ...template })

    return NextResponse.json({
      success: true,
      message: 'If an admin account with that email exists, a reset link has been sent.',
    })
  } catch (error) {
    console.error('Admin forgot password error:', error)
    return NextResponse.json({ success: false, error: 'Something went wrong' }, { status: 500 })
  }
}
