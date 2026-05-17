/**
 * Admin Forgot Password
 * POST /api/admin/auth/forgot-password
 * Body: { email: string }
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendEmailOrThrow } from '@/lib/email'
import { adminPasswordResetEmail } from '@/lib/email-templates'
import { checkRateLimit, rateLimitResponse } from '@/lib/rate-limit'
import { getSupportContact } from '@/lib/support-contact'
import { createResetTokenPair } from '@/lib/reset-token'
import { getClientIp } from '@/lib/security'

export async function POST(request: NextRequest) {
  const ip = getClientIp(request)
  const { allowed, retryAfterMs } = await checkRateLimit(`admin-forgot:${ip}`, {
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
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      return NextResponse.json({
        success: true,
        message: 'If an admin account with that email exists, a reset link has been sent.',
      })
    }

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
      return NextResponse.json({
        success: true,
        message: 'If an admin account with that email exists, a reset link has been sent.',
      })
    }

    const { token: resetToken, tokenHash: resetTokenHash } = createResetTokenPair()
    const resetTokenExpiry = new Date(Date.now() + 1000 * 60 * 60) // 1 hour

    await prisma.adminUser.update({
      where: { id: adminUser.id },
      data: { resetToken: resetTokenHash, resetTokenExpiry },
    })

    const { getBaseUrl } = await import('@/lib/url')
    const baseUrl = getBaseUrl(request)
    const resetUrl = `${baseUrl}/admin-reset-password?token=${resetToken}`
    const supportContact = await getSupportContact()
    const template = adminPasswordResetEmail(adminUser.username, resetUrl, supportContact)

    await sendEmailOrThrow({ to: targetEmail, ...template })

    return NextResponse.json({
      success: true,
      message: 'If an admin account with that email exists, a reset link has been sent.',
    })
  } catch (error) {
    console.error('Admin forgot password error:', error)
    return NextResponse.json({ success: false, error: 'Something went wrong' }, { status: 500 })
  }
}

