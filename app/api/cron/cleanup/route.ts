import { NextRequest, NextResponse } from 'next/server'

import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'
export const revalidate = 0

function isAuthorized(request: NextRequest) {
  const secret = process.env.CRON_SECRET
  if (!secret) return process.env.NODE_ENV !== 'production'
  return request.headers.get('authorization') === `Bearer ${secret}`
}

export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }

  const now = new Date()
  const staleVerificationCutoff = new Date(Date.now() - 1000 * 60 * 60 * 24 * 7)

  const [userSessions, adminSessions, staleVerificationTokens] = await Promise.all([
    prisma.userSession.deleteMany({ where: { expiresAt: { lte: now } } }),
    prisma.adminSession.deleteMany({ where: { expiresAt: { lte: now } } }),
    prisma.user.updateMany({
      where: {
        emailVerifiedAt: null,
        emailVerificationTokenExpiry: { lte: staleVerificationCutoff },
      },
      data: {
        emailVerificationToken: null,
        emailVerificationTokenExpiry: null,
      },
    }),
  ])

  return NextResponse.json({
    success: true,
    cleaned: {
      userSessions: userSessions.count,
      adminSessions: adminSessions.count,
      staleVerificationTokens: staleVerificationTokens.count,
    },
  })
}
