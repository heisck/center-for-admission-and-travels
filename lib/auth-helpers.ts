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
