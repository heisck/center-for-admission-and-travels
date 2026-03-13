import { NextRequest, NextResponse } from 'next/server'
import { getUserFromSessionToken } from '@/lib/user-auth'
import { checkRateLimit, rateLimitResponse } from '@/lib/rate-limit'
import { getClientIp } from '@/lib/security'
import { getUserSessionCookieName, getUserSessionHintCookieName } from '@/lib/user-session-cookies'

function clearUserSessionHints(response: NextResponse) {
  response.cookies.set(getUserSessionCookieName(), '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: 0,
  })
  response.cookies.set(getUserSessionHintCookieName(), '', {
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: 0,
  })
  return response
}

export async function GET(request: NextRequest) {
  try {
    const ip = getClientIp(request)
    const { allowed, retryAfterMs } = await checkRateLimit(`auth-me:${ip}`, {
      maxRequests: 120,
      windowMs: 60_000,
    })
    if (!allowed) return rateLimitResponse(retryAfterMs)

    const token = request.cookies.get(getUserSessionCookieName())?.value
    if (!token) return clearUserSessionHints(NextResponse.json({ user: null }))

    const user = await getUserFromSessionToken(token)
    if (!user) return clearUserSessionHints(NextResponse.json({ user: null }))

    return NextResponse.json({
      user: { id: user.id, username: user.username, email: user.email, displayName: user.displayName, phone: user.phone },
    })
  } catch (error) {
    console.error('Me error:', error)
    return NextResponse.json({ user: null }, { status: 500 })
  }
}


