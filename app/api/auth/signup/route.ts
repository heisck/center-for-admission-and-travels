import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hashPassword } from '@/lib/user-auth'
import { checkRateLimit, rateLimitResponse } from '@/lib/rate-limit'
import { sendEmailOrThrow } from '@/lib/email'
import { emailVerificationEmail } from '@/lib/email-templates'
import { getSupportContact } from '@/lib/support-contact'
import { getClientIp } from '@/lib/security'
import { createResetTokenPair } from '@/lib/reset-token'
import { getBaseUrl } from '@/lib/url'
import { validatePassword } from '@/lib/password-policy'

export async function POST(request: NextRequest) {
  const ip = getClientIp(request)
  const { allowed, retryAfterMs } = await checkRateLimit(`signup:${ip}`, { maxRequests: 3, windowMs: 60_000 })
  if (!allowed) return rateLimitResponse(retryAfterMs)

  try {
    const body = await request.json().catch(() => null)
    if (!body || typeof body !== 'object') {
      return NextResponse.json({ success: false, error: 'Invalid JSON body' }, { status: 400 })
    }
    const { username, email, password, displayName } = body ?? {}

    if (!username || !email || !password) {
      return NextResponse.json({ success: false, error: 'Username, email and password are required' }, { status: 400 })
    }

    const normalizedEmail = String(email).trim().toLowerCase()
    const normalizedUsername = String(username).trim().toLowerCase()

    if (!/^[a-z0-9_]{3,30}$/.test(normalizedUsername)) {
      return NextResponse.json(
        { success: false, error: 'Username must be 3-30 characters using letters, numbers, or underscores' },
        { status: 400 }
      )
    }

    if (normalizedEmail.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      return NextResponse.json({ success: false, error: 'Valid email is required' }, { status: 400 })
    }

    const passwordResult = validatePassword(password)
    if (!passwordResult.password) {
      return NextResponse.json({ success: false, error: passwordResult.error }, { status: 400 })
    }

    const existing = await prisma.user.findFirst({
      where: {
        OR: [{ email: normalizedEmail }, { username: normalizedUsername }],
      },
      select: { id: true },
    })

    if (existing) {
      return NextResponse.json({ success: false, error: 'Email or username already in use' }, { status: 409 })
    }

    const passwordHash = await hashPassword(passwordResult.password)
    const { token: verificationToken, tokenHash: verificationTokenHash } = createResetTokenPair()
    const verificationTokenExpiry = new Date(Date.now() + 1000 * 60 * 60 * 24)

    const user = await prisma.user.create({
      data: {
        username: normalizedUsername,
        email: normalizedEmail,
        passwordHash,
        displayName: displayName ? String(displayName).trim().slice(0, 120) : null,
        emailVerificationToken: verificationTokenHash,
        emailVerificationTokenExpiry: verificationTokenExpiry,
      },
      select: { id: true, username: true, email: true, displayName: true, createdAt: true },
    })

    const supportContact = await getSupportContact()
    const verificationUrl = `${getBaseUrl(request)}/api/auth/verify-email?token=${verificationToken}`
    const template = emailVerificationEmail(user.displayName || user.username, verificationUrl, supportContact)
    try {
      await sendEmailOrThrow({ to: user.email, ...template })
    } catch (error) {
      await prisma.user.delete({ where: { id: user.id } }).catch((deleteError) => {
        console.error('[Signup] Failed to roll back unverified user after email failure:', deleteError)
      })
      throw error
    }

    return NextResponse.json({
      success: true,
      needsEmailVerification: true,
      message: 'Account created. Please check your email to verify your account before signing in.',
      user,
    })
  } catch (error) {
    console.error('Signup error:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}


