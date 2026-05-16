import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'

import { prisma } from '@/lib/prisma'
import { getBaseUrl } from '@/lib/url'
import { pruneAdminSessions } from '@/lib/auth-helpers'
import type { GoogleProfile } from '@/lib/google-oauth'

export const ADMIN_GOOGLE_OAUTH_CALLBACK_PATH = '/api/admin/auth/google/callback'
export const ADMIN_GOOGLE_OAUTH_STATE_COOKIE = 'admin_google_oauth_state'

export function buildAdminOAuthErrorRedirect(request: NextRequest, message: string) {
  const redirect = new URL('/admin-login', getBaseUrl(request))
  redirect.searchParams.set('error', message)
  return NextResponse.redirect(redirect)
}

export async function findAdminByGoogleProfile(profile: GoogleProfile) {
  const email = profile.email?.trim().toLowerCase()
  if (!email) throw new Error('Google did not return an email address.')

  const matchingAdmins = await prisma.adminUser.findMany({
    where: {
      email: {
        equals: email,
        mode: 'insensitive',
      },
    },
    select: {
      id: true,
      username: true,
      email: true,
      role: true,
    },
  })

  if (matchingAdmins.length === 0) {
    throw new Error('No admin account is registered with this Google email.')
  }

  if (matchingAdmins.length > 1) {
    throw new Error('More than one admin account uses this email. Please sign in with password.')
  }

  return matchingAdmins[0]
}

export async function createSignedInAdminResponse(
  request: NextRequest,
  adminUser: { id: string },
  redirectPath = '/admin'
) {
  const token = crypto.randomBytes(32).toString('hex')
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24)

  await prisma.adminSession.create({
    data: {
      userId: adminUser.id,
      token,
      expiresAt,
    },
  })
  await pruneAdminSessions(adminUser.id).catch(() => {})

  const response = NextResponse.redirect(new URL(redirectPath, getBaseUrl(request)))
  response.cookies.set('admin_session', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: 60 * 60 * 24,
  })

  return response
}
