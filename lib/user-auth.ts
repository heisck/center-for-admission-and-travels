import { hash, compare } from 'bcryptjs'
import { prisma } from '@/lib/prisma'

const USER_SESSION_COOKIE = 'user_session'

export function getUserSessionCookieName() {
  return USER_SESSION_COOKIE
}

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

