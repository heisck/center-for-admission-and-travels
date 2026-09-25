import { NextRequest } from 'next/server'
import crypto from 'crypto'

import {
  GOOGLE_OAUTH_ERROR_PATH_COOKIE,
  GOOGLE_OAUTH_REDIRECT_COOKIE,
  GOOGLE_OAUTH_STATE_COOKIE,
  buildOAuthErrorRedirect,
  createSignedInUserResponse,
  exchangeGoogleCodeForTokens,
  fetchGoogleProfile,
  findOrCreateGoogleUser,
  sanitizeAuthRedirect,
  sanitizeOAuthErrorPath,
} from '@/lib/google-oauth'

export const dynamic = 'force-dynamic'

function timingSafeEqualStr(a: string, b: string): boolean {
  const bufA = Buffer.from(a)
  const bufB = Buffer.from(b)
  if (bufA.length !== bufB.length) return false
  return crypto.timingSafeEqual(bufA, bufB)
}

export async function GET(request: NextRequest) {
  const url = new URL(request.url)
  const code = url.searchParams.get('code')
  const state = url.searchParams.get('state')
  const expectedState = request.cookies.get(GOOGLE_OAUTH_STATE_COOKIE)?.value
  const redirectPath = sanitizeAuthRedirect(request.cookies.get(GOOGLE_OAUTH_REDIRECT_COOKIE)?.value)
  const errorPath = sanitizeOAuthErrorPath(request.cookies.get(GOOGLE_OAUTH_ERROR_PATH_COOKIE)?.value)

  try {
    if (!code || !state || !expectedState || !timingSafeEqualStr(state, expectedState)) {
      throw new Error('Google sign-in expired. Please try again.')
    }

    const tokens = await exchangeGoogleCodeForTokens(request, code)
    const profile = await fetchGoogleProfile(tokens.access_token!)
    const { user } = await findOrCreateGoogleUser(profile)
    const response = await createSignedInUserResponse(request, user, redirectPath)

    response.cookies.set(GOOGLE_OAUTH_STATE_COOKIE, '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 0,
    })
    response.cookies.set(GOOGLE_OAUTH_REDIRECT_COOKIE, '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 0,
    })
    response.cookies.set(GOOGLE_OAUTH_ERROR_PATH_COOKIE, '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 0,
    })

    return response
  } catch (error: any) {
    console.error('Google OAuth callback error:', error)
    const safeError = process.env.NODE_ENV === 'production'
      ? 'Google sign-in failed. Please try again.'
      : (error?.message || 'Google sign-in failed. Please try again.')
    const response = buildOAuthErrorRedirect(
      request,
      safeError,
      errorPath
    )
    response.cookies.set(GOOGLE_OAUTH_STATE_COOKIE, '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 0,
    })
    response.cookies.set(GOOGLE_OAUTH_REDIRECT_COOKIE, '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 0,
    })
    response.cookies.set(GOOGLE_OAUTH_ERROR_PATH_COOKIE, '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 0,
    })
    return response
  }
}
