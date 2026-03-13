import { hash, compare } from 'bcryptjs'
import { prisma } from '@/lib/prisma'

export { getUserSessionCookieName } from '@/lib/user-session-cookies'

export function createSessionToken(): string {
  const buf = crypto.getRandomValues(new Uint8Array(32))
  return Buffer.from(buf).toString('base64url')
}

export async function hashPassword(password: string): Promise<string> {
  return hash(password, 10)
}

export async function verifyPassword(password: string, passwordHash: string): Promise<boolean> {
  return compare(password, passwordHash)
}

export async function getUserFromSessionToken(token: string) {
  const session = await prisma.userSession.findUnique({
    where: { token },
    include: { user: true },
  })

  if (!session) return null
  if (session.expiresAt.getTime() <= Date.now()) return null

  return session.user
}

export async function pruneUserSessions(userId: string, keepLatest = 5): Promise<void> {
  await prisma.userSession.deleteMany({
    where: {
      userId,
      expiresAt: { lte: new Date() },
    },
  })

  const staleSessions = await prisma.userSession.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    skip: keepLatest,
    select: { id: true },
  })

  if (staleSessions.length === 0) return

  await prisma.userSession.deleteMany({
    where: { id: { in: staleSessions.map((session) => session.id) } },
  })
}

