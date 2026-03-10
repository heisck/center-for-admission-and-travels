import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createSessionToken, getUserSessionCookieName, hashPassword, pruneUserSessions } from '@/lib/user-auth'
import { checkRateLimit, rateLimitResponse } from '@/lib/rate-limit'
import { sendEmail } from '@/lib/email'
import { welcomeEmail } from '@/lib/email-templates'
import { getSupportContact } from '@/lib/support-contact'
import { getClientIp } from '@/lib/security'

export async function POST(request: NextRequest) {
  const ip = getClientIp(request)
  const { allowed, retryAfterMs } = await checkRateLimit(`signup:${ip}`, { maxRequests: 3, windowMs: 60_000 })
  if (!allowed) return rateLimitResponse(retryAfterMs)

  try {
    const body = await request.json()
    const { username, email, password, displayName } = body ?? {}

    if (!username || !email || !password) {
      return NextResponse.json({ success: false, error: 'Username, email and password are required' }, { status: 400 })
    }

    const normalizedEmail = String(email).trim().toLowerCase()
    const normalizedUsername = String(username).trim().toLowerCase()

    if (normalizedUsername.length < 3) {
      return NextResponse.json({ success: false, error: 'Username must be at least 3 characters' }, { status: 400 })
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      return NextResponse.json({ success: false, error: 'Valid email is required' }, { status: 400 })
    }

    if (String(password).length < 8) {
      return NextResponse.json({ success: false, error: 'Password must be at least 8 characters' }, { status: 400 })
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

    const passwordHash = await hashPassword(String(password))

    const user = await prisma.user.create({
      data: {
        username: normalizedUsername,
        email: normalizedEmail,
        passwordHash,
        displayName: displayName ? String(displayName).trim().slice(0, 120) : null,
      },
      select: { id: true, username: true, email: true, displayName: true, createdAt: true },
    })

    // Auto sign-in after signup
    const token = createSessionToken()
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30) // 30 days
    await prisma.userSession.create({
      data: {
        userId: user.id,
        token,
        expiresAt,
      },
    })
    await pruneUserSessions(user.id).catch(() => {})

    // Send welcome email (non-blocking)
    const supportContact = await getSupportContact()
    const template = welcomeEmail(user.displayName || user.username, supportContact)
    sendEmail({ to: user.email, ...template }).catch(() => {})

    const response = NextResponse.json({ success: true, user })
    response.cookies.set(getUserSessionCookieName(), token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      expires: expiresAt,
    })

    return response
  } catch (error) {
    console.error('Signup error:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}


