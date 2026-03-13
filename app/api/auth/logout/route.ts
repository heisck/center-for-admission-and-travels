import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserSessionCookieName, getUserSessionHintCookieName } from '@/lib/user-session-cookies'

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get(getUserSessionCookieName())?.value

    if (token) {
      await prisma.userSession.delete({ where: { token } }).catch(() => null)
    }

    const response = NextResponse.json({ success: true })
    response.cookies.set(getUserSessionCookieName(), '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 0,
    })
    response.cookies.set(getUserSessionHintCookieName(), '', {
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 0,
    })
    return response
  } catch (error) {
    console.error('Logout error:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}

