import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendEmail } from '@/lib/email'
import { passwordResetEmail } from '@/lib/email-templates'
import { checkRateLimit, rateLimitResponse } from '@/lib/rate-limit'
import crypto from 'crypto'

export async function POST(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
  const { allowed, retryAfterMs } = checkRateLimit(`forgot:${ip}`, { maxRequests: 3, windowMs: 60_000 })
  if (!allowed) return rateLimitResponse(retryAfterMs)

  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ success: false, error: 'Email is required' }, { status: 400 })
    }

    const normalizedEmail = String(email).trim().toLowerCase()

    const user = await prisma.user.findUnique({ where: { email: normalizedEmail } })

    if (!user) {
      // Don't reveal whether the email exists
      return NextResponse.json({ success: true, message: 'If an account with that email exists, a reset link has been sent.' })
    }

    const resetToken = crypto.randomBytes(32).toString('hex')
    const resetTokenExpiry = new Date(Date.now() + 1000 * 60 * 60) // 1 hour

    await prisma.user.update({
      where: { id: user.id },
      data: { resetToken, resetTokenExpiry },
    })

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
    const resetUrl = `${baseUrl}/reset-password?token=${resetToken}`
    const template = passwordResetEmail(user.displayName || user.username, resetUrl)

    await sendEmail({ to: user.email, ...template })

    return NextResponse.json({ success: true, message: 'If an account with that email exists, a reset link has been sent.' })
  } catch (error) {
    console.error('Forgot password error:', error)
    return NextResponse.json({ success: false, error: 'Something went wrong' }, { status: 500 })
  }
}
