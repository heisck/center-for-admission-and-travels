import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createSessionToken, pruneUserSessions, verifyPassword } from '@/lib/user-auth'
import { checkRateLimit, rateLimitResponse } from '@/lib/rate-limit'
import { getClientIp } from '@/lib/security'
import { getUserSessionCookieName, getUserSessionHintCookieName } from '@/lib/user-session-cookies'
import { validatePassword } from '@/lib/password-policy'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  const ip = getClientIp(request)
  const { allowed, retryAfterMs } = await checkRateLimit(`signin:${ip}`, { maxRequests: 5, windowMs: 60_000 })
  if (!allowed) return rateLimitResponse(retryAfterMs)

  let step = 'parse-body'
  try {
    const body = await request.json().catch(() => null)
    if (!body || typeof body !== 'object') {
      return NextResponse.json({ success: false, error: 'Invalid JSON body' }, { status: 400 })
    }
    const { identifier, password, rememberMe } = body ?? {}

    if (!identifier || !password) {
      return NextResponse.json({ success: false, error: 'Email/username and password are required' }, { status: 400 })
    }

    const id = String(identifier).trim().toLowerCase().slice(0, 254)
    const passwordResult = validatePassword(password)
    if (!passwordResult.password) {
      return NextResponse.json({ success: false, error: 'Invalid credentials' }, { status: 401 })
    }

    step = 'find-user'
    const user = await prisma.user.findFirst({
      where: {
        OR: [{ email: id }, { username: id }],
      },
    })

    if (!user) {
      return NextResponse.json({ success: false, error: 'Invalid credentials' }, { status: 401 })
    }

    if (!user.emailVerifiedAt) {
      return NextResponse.json(
        { success: false, error: 'Please verify your email before signing in. Check your inbox for the verification link.' },
        { status: 403 }
      )
    }

    step = 'verify-password'
    const ok = await verifyPassword(passwordResult.password, user.passwordHash)
    if (!ok) {
      return NextResponse.json({ success: false, error: 'Invalid credentials' }, { status: 401 })
    }

    step = 'create-token'
    const token = createSessionToken()
    const days = rememberMe ? 30 : 1
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * days)

    step = 'create-session'
    await prisma.userSession.create({
      data: {
        userId: user.id,
        token,
        expiresAt,
      },
    })
    await pruneUserSessions(user.id).catch((error) => {
      console.error('[Signin] Failed to prune user sessions:', error)
    })

    step = 'build-response'
    const response = NextResponse.json({
      success: true,
      user: { id: user.id, username: user.username, email: user.email, displayName: user.displayName },
    })

    response.cookies.set(getUserSessionCookieName(), token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      expires: expiresAt,
    })
    response.cookies.set(getUserSessionHintCookieName(), '1', {
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      expires: expiresAt,
    })

    return response
  } catch (error: any) {
    console.error(`Signin error at step [${step}]:`, error)
    const message = process.env.NODE_ENV === 'production'
      ? 'Sign in failed. Please try again.'
      : `${step}: ${error?.message || error}`
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}


