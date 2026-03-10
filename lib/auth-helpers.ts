import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'

export interface AdminSession {
  userId: string
  username: string
  token: string
  expiresAt: Date
}

export async function verifyAdminSession(request: NextRequest): Promise<AdminSession | null> {
  const sessionCookie = request.cookies.get('admin_session')

  if (!sessionCookie) {
    return null
  }

  try {
    const session = await prisma.adminSession.findUnique({
      where: { token: sessionCookie.value },
      include: { user: true },
    })

    if (!session || session.expiresAt < new Date()) {
      if (session) {
        await prisma.adminSession.delete({ where: { id: session.id } }).catch(() => {})
      }
      return null
    }

    return {
      userId: session.user.id,
      username: session.user.username,
      token: session.token,
      expiresAt: session.expiresAt,
    }
  } catch {
    return null
  }
}

export async function pruneAdminSessions(userId: string, keepLatest = 3): Promise<void> {
  await prisma.adminSession.deleteMany({
    where: {
      userId,
      expiresAt: { lte: new Date() },
    },
  })

  const staleSessions = await prisma.adminSession.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    skip: keepLatest,
    select: { id: true },
  })

  if (staleSessions.length === 0) return

  await prisma.adminSession.deleteMany({
    where: { id: { in: staleSessions.map((session) => session.id) } },
  })
}
