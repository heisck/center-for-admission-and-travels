import { NextRequest, NextResponse } from 'next/server'

import {
  GOOGLE_OAUTH_ERROR_PATH_COOKIE,
  GOOGLE_OAUTH_REDIRECT_COOKIE,
  GOOGLE_OAUTH_STATE_COOKIE,
  buildGoogleAuthorizationUrl,
  buildOAuthErrorRedirect,
  sanitizeAuthRedirect,
  sanitizeOAuthErrorPath,
} from '@/lib/google-oauth'
import { createSessionToken } from '@/lib/user-auth'
import { checkRateLimit, rateLimitResponse } from '@/lib/rate-limit'
import { getClientIp } from '@/lib/security'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const url = new URL(request.url)
  const errorPath = sanitizeOAuthErrorPath(url.searchParams.get('errorPath'))

  try {
    const { allowed, retryAfterMs } = await checkRateLimit(`google-oauth-start:${getClientIp(request)}`, {
      maxRequests: 20,
      windowMs: 60_000,
    })
    if (!allowed) return rateLimitResponse(retryAfterMs)

    const state = createSessionToken()
    const redirectPath = sanitizeAuthRedirect(url.searchParams.get('redirect'))
    const googleUrl = buildGoogleAuthorizationUrl(request, state)
    const response = NextResponse.redirect(googleUrl)

    response.cookies.set(GOOGLE_OAUTH_STATE_COOKIE, state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 10,
    })
    response.cookies.set(GOOGLE_OAUTH_REDIRECT_COOKIE, redirectPath, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 10,
    })
    response.cookies.set(GOOGLE_OAUTH_ERROR_PATH_COOKIE, errorPath, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 10,
    })

    return response
  } catch (error: any) {
    console.error('Google OAuth start error:', error)
    return buildOAuthErrorRedirect(request, error?.message || 'Google sign-in is unavailable right now.', errorPath)
  }
}
