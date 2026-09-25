import { NextRequest } from 'next/server'
import crypto from 'crypto'

import {
  ADMIN_GOOGLE_OAUTH_CALLBACK_PATH,
  ADMIN_GOOGLE_OAUTH_STATE_COOKIE,
  buildAdminOAuthErrorRedirect,
  createSignedInAdminResponse,
  findAdminByGoogleProfile,
} from '@/lib/admin-google-oauth'
import { exchangeGoogleCodeForTokens, fetchGoogleProfile } from '@/lib/google-oauth'

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
  const expectedState = request.cookies.get(ADMIN_GOOGLE_OAUTH_STATE_COOKIE)?.value

  try {
    if (!code || !state || !expectedState || !timingSafeEqualStr(state, expectedState)) {
      throw new Error('Google admin sign-in expired. Please try again.')
    }

    const tokens = await exchangeGoogleCodeForTokens(request, code, ADMIN_GOOGLE_OAUTH_CALLBACK_PATH)
    const profile = await fetchGoogleProfile(tokens.access_token!)
    const adminUser = await findAdminByGoogleProfile(profile)
    const response = await createSignedInAdminResponse(request, adminUser)

    response.cookies.set(ADMIN_GOOGLE_OAUTH_STATE_COOKIE, '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 0,
    })

    return response
  } catch (error: any) {
    console.error('Admin Google OAuth callback error:', error)
    const safeError = process.env.NODE_ENV === 'production'
      ? 'Google admin sign-in failed. Please try again.'
      : (error?.message || 'Google admin sign-in failed. Please try again.')
    const response = buildAdminOAuthErrorRedirect(request, safeError)
    response.cookies.set(ADMIN_GOOGLE_OAUTH_STATE_COOKIE, '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 0,
    })
    return response
  }
}
