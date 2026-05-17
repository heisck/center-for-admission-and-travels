import { NextRequest, NextResponse } from 'next/server'

import { sendEmail } from '@/lib/email'
import { welcomeEmail } from '@/lib/email-templates'
import { getSupportContact } from '@/lib/support-contact'
import { prisma } from '@/lib/prisma'
import { getBaseUrl } from '@/lib/url'
import { createSessionToken, hashPassword, pruneUserSessions } from '@/lib/user-auth'
import { getUserSessionCookieName, getUserSessionHintCookieName } from '@/lib/user-session-cookies'

export const GOOGLE_OAUTH_PROVIDER = 'google'
export const GOOGLE_OAUTH_STATE_COOKIE = 'google_oauth_state'
export const GOOGLE_OAUTH_REDIRECT_COOKIE = 'google_oauth_redirect'
export const GOOGLE_OAUTH_ERROR_PATH_COOKIE = 'google_oauth_error_path'

type GoogleTokenResponse = {
  access_token?: string
  token_type?: string
  expires_in?: number
  id_token?: string
  scope?: string
  error?: string
  error_description?: string
}

export type GoogleProfile = {
  sub?: string
  email?: string
  email_verified?: boolean
  name?: string
}

type PublicUser = {
  id: string
  username: string
  email: string
  displayName: string | null
}

export function getGoogleRedirectUri(request?: NextRequest, callbackPath = '/api/auth/google/callback') {
  return `${getBaseUrl(request)}${callbackPath}`
}

export function getGoogleOAuthConfig() {
  const clientId = process.env.GOOGLE_CLIENT_ID?.trim()
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET?.trim()

  if (!clientId || !clientSecret) {
    throw new Error('Google sign-in is not configured yet.')
  }

  return { clientId, clientSecret }
}

export function sanitizeAuthRedirect(value: string | null | undefined) {
  const redirect = value?.trim() || '/'
  if (!redirect.startsWith('/') || redirect.startsWith('//')) return '/'
  if (redirect.startsWith('/api/auth')) return '/'
  return redirect
}

export function sanitizeOAuthErrorPath(value: string | null | undefined) {
  return value === '/signup' ? '/signup' : '/signin'
}

export function buildGoogleAuthorizationUrl(
  request: NextRequest,
  state: string,
  callbackPath = '/api/auth/google/callback'
) {
  const { clientId } = getGoogleOAuthConfig()
  const url = new URL('https://accounts.google.com/o/oauth2/v2/auth')

  url.searchParams.set('client_id', clientId)
  url.searchParams.set('redirect_uri', getGoogleRedirectUri(request, callbackPath))
  url.searchParams.set('response_type', 'code')
  url.searchParams.set('scope', 'openid email profile')
  url.searchParams.set('state', state)
  url.searchParams.set('prompt', 'select_account')

  return url
}

export function buildOAuthErrorRedirect(request: NextRequest, message: string, errorPath = '/signin') {
  const redirect = new URL(sanitizeOAuthErrorPath(errorPath), getBaseUrl(request))
  redirect.searchParams.set('error', message)
  return NextResponse.redirect(redirect)
}

export async function exchangeGoogleCodeForTokens(
  request: NextRequest,
  code: string,
  callbackPath = '/api/auth/google/callback'
) {
  const { clientId, clientSecret } = getGoogleOAuthConfig()

  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      code,
      grant_type: 'authorization_code',
      redirect_uri: getGoogleRedirectUri(request, callbackPath),
    }),
  })

  const data = (await response.json().catch(() => ({}))) as GoogleTokenResponse
  if (!response.ok || !data.access_token) {
    throw new Error(data.error_description || 'Google could not complete sign-in.')
  }

  return data
}

export async function fetchGoogleProfile(accessToken: string) {
  const response = await fetch('https://openidconnect.googleapis.com/v1/userinfo', {
    headers: { Authorization: `Bearer ${accessToken}` },
  })

  const profile = (await response.json().catch(() => ({}))) as GoogleProfile
  if (!response.ok || !profile.sub || !profile.email) {
    throw new Error('Google did not return a usable profile.')
  }

  if (profile.email_verified !== true) {
    throw new Error('Please verify your Google email address before signing in.')
  }

  return profile
}

function normalizeUsernameSeed(profile: GoogleProfile) {
  const source = profile.name || profile.email?.split('@')[0] || 'user'
  const cleaned = source.toLowerCase().replace(/[^a-z0-9_]/g, '').slice(0, 24)
  if (cleaned.length >= 3) return cleaned
  return `user${cleaned}`.slice(0, 24)
}

async function createUniqueUsername(profile: GoogleProfile) {
  const seed = normalizeUsernameSeed(profile)

  for (let attempt = 0; attempt < 8; attempt += 1) {
    const suffix = attempt === 0 ? '' : Math.random().toString(36).slice(2, 6)
    const username = `${seed}${suffix}`.slice(0, 30)
    const existing = await prisma.user.findUnique({
      where: { username },
      select: { id: true },
    })

    if (!existing) return username
  }

  return `user${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`.slice(0, 30)
}

async function attachGoogleAccount(userId: string, profile: GoogleProfile) {
  try {
    await prisma.userOAuthAccount.create({
      data: {
        userId,
        provider: GOOGLE_OAUTH_PROVIDER,
        providerAccountId: profile.sub!,
        email: profile.email!.toLowerCase(),
      },
    })
  } catch (error: any) {
    if (error?.code !== 'P2002') throw error
  }
}

export async function findOrCreateGoogleUser(profile: GoogleProfile) {
  const providerAccountId = profile.sub!
  const email = profile.email!.toLowerCase()

  const linkedAccount = await prisma.userOAuthAccount.findUnique({
    where: {
      provider_providerAccountId: {
        provider: GOOGLE_OAUTH_PROVIDER,
        providerAccountId,
      },
    },
    select: {
      user: {
        select: { id: true, username: true, email: true, displayName: true },
      },
    },
  })

  if (linkedAccount?.user) {
    return { user: linkedAccount.user, isNewUser: false }
  }

  const existingUser = await prisma.user.findUnique({
    where: { email },
    select: { id: true, username: true, email: true, displayName: true, emailVerifiedAt: true },
  })

  if (existingUser) {
    if (!existingUser.emailVerifiedAt) {
      await prisma.user.update({
        where: { id: existingUser.id },
        data: {
          emailVerifiedAt: new Date(),
          emailVerificationToken: null,
          emailVerificationTokenExpiry: null,
        },
      })
    }
    await attachGoogleAccount(existingUser.id, profile)
    return {
      user: {
        id: existingUser.id,
        username: existingUser.username,
        email: existingUser.email,
        displayName: existingUser.displayName,
      },
      isNewUser: false,
    }
  }

  const username = await createUniqueUsername(profile)
  const passwordHash = await hashPassword(createSessionToken())
  const displayName = profile.name?.trim().slice(0, 120) || null

  const user = await prisma.user.create({
    data: {
      username,
      email,
      passwordHash,
      displayName,
      emailVerifiedAt: new Date(),
      oauthAccounts: {
        create: {
          provider: GOOGLE_OAUTH_PROVIDER,
          providerAccountId,
          email,
        },
      },
    },
    select: { id: true, username: true, email: true, displayName: true },
  })

  const supportContact = await getSupportContact()
  const template = welcomeEmail(user.displayName || user.username, supportContact)
  sendEmail({ to: user.email, ...template }).catch((error) => {
    console.error('[Google OAuth] Failed to send welcome email:', error)
  })

  return { user, isNewUser: true }
}

export async function createSignedInUserResponse(request: NextRequest, user: PublicUser, redirectPath: string) {
  const token = createSessionToken()
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30)

  await prisma.userSession.create({
    data: {
      userId: user.id,
      token,
      expiresAt,
    },
  })
  await pruneUserSessions(user.id).catch((error) => {
    console.error('[Google OAuth] Failed to prune user sessions:', error)
  })

  const response = NextResponse.redirect(new URL(redirectPath, getBaseUrl(request)))
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
}
