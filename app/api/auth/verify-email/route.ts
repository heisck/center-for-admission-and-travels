import { NextRequest, NextResponse } from 'next/server'

import { prisma } from '@/lib/prisma'
import { hashResetToken } from '@/lib/reset-token'
import { createSessionToken, pruneUserSessions } from '@/lib/user-auth'
import { getUserSessionCookieName, getUserSessionHintCookieName } from '@/lib/user-session-cookies'
import { getBaseUrl } from '@/lib/url'

export const dynamic = 'force-dynamic'

function redirectWithMessage(request: NextRequest, type: 'error' | 'notice', message: string) {
  const url = new URL('/signin', getBaseUrl(request))
  url.searchParams.set(type, message)
  return NextResponse.redirect(url)
}

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('token')?.trim() || ''

  if (!/^[a-f0-9]{64}$/i.test(token)) {
    return redirectWithMessage(request, 'error', 'Invalid or expired email verification link.')
  }

  try {
    const tokenHash = hashResetToken(token)
    const user = await prisma.user.findUnique({
      where: { emailVerificationToken: tokenHash },
      select: {
        id: true,
        emailVerificationTokenExpiry: true,
      },
    })

    if (!user || !user.emailVerificationTokenExpiry || user.emailVerificationTokenExpiry < new Date()) {
      return redirectWithMessage(request, 'error', 'Invalid or expired email verification link.')
    }

    const sessionToken = createSessionToken()
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30)
    const consumed = await prisma.$transaction(async (tx) => {
      const result = await tx.user.updateMany({
        where: {
          id: user.id,
          emailVerificationToken: tokenHash,
          emailVerificationTokenExpiry: { gt: new Date() },
        },
        data: {
          emailVerifiedAt: new Date(),
          emailVerificationToken: null,
          emailVerificationTokenExpiry: null,
        },
      })
      if (result.count !== 1) return false

      await tx.userSession.create({
        data: {
          userId: user.id,
          token: sessionToken,
          expiresAt,
        },
      })
      return true
    })
    if (!consumed) {
      return redirectWithMessage(request, 'error', 'Invalid or expired email verification link.')
    }
    await pruneUserSessions(user.id).catch((error) => {
      console.error('[Verify Email] Failed to prune user sessions:', error)
    })

    const response = NextResponse.redirect(new URL('/', getBaseUrl(request)))
    response.cookies.set(getUserSessionCookieName(), sessionToken, {
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
  } catch (error) {
    console.error('[Verify Email] Error:', error)
    return redirectWithMessage(request, 'error', 'Email verification failed. Please try again.')
  }
}
