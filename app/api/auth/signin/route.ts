import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createSessionToken, getUserSessionCookieName, verifyPassword } from '@/lib/user-auth'
import { checkRateLimit, rateLimitResponse } from '@/lib/rate-limit'

export async function POST(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
  const { allowed, retryAfterMs } = checkRateLimit(`signin:${ip}`, { maxRequests: 5, windowMs: 60_000 })
  if (!allowed) return rateLimitResponse(retryAfterMs)

  let step = 'parse-body'
  try {
    const body = await request.json()
    const { identifier, password, rememberMe } = body ?? {}

    if (!identifier || !password) {
      return NextResponse.json({ success: false, error: 'Email/username and password are required' }, { status: 400 })
    }

    const id = String(identifier).trim().toLowerCase()

    step = 'find-user'
    const user = await prisma.user.findFirst({
      where: {
        OR: [{ email: id }, { username: id }],
      },
    })

    if (!user) {
      return NextResponse.json({ success: false, error: 'Invalid credentials' }, { status: 401 })
    }

    step = 'verify-password'
    const ok = await verifyPassword(String(password), user.passwordHash)
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

    step = 'build-response'
    const response = NextResponse.json({
      success: true,
      user: { id: user.id, username: user.username, email: user.email, displayName: user.displayName },
    })

    response.cookies.set(getUserSessionCookieName(), token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      expires: expiresAt,
    })

    return response
  } catch (error: any) {
    console.error(`Signin error at step [${step}]:`, error)
    const message = process.env.NODE_ENV === 'production'
      ? `Signin failed at: ${step}`
      : `${step}: ${error?.message || error}`
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}

