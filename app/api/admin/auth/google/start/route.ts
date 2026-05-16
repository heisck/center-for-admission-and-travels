import { NextRequest, NextResponse } from 'next/server'

import {
  ADMIN_GOOGLE_OAUTH_CALLBACK_PATH,
  ADMIN_GOOGLE_OAUTH_STATE_COOKIE,
  buildAdminOAuthErrorRedirect,
} from '@/lib/admin-google-oauth'
import { buildGoogleAuthorizationUrl } from '@/lib/google-oauth'
import { createSessionToken } from '@/lib/user-auth'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const state = createSessionToken()
    const googleUrl = buildGoogleAuthorizationUrl(request, state, ADMIN_GOOGLE_OAUTH_CALLBACK_PATH)
    const response = NextResponse.redirect(googleUrl)

    response.cookies.set(ADMIN_GOOGLE_OAUTH_STATE_COOKIE, state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 10,
    })

    return response
  } catch (error: any) {
    console.error('Admin Google OAuth start error:', error)
    return buildAdminOAuthErrorRedirect(request, error?.message || 'Google admin sign-in is unavailable right now.')
  }
}
