import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createSessionToken, getUserSessionCookieName, verifyPassword } from '@/lib/user-auth'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { identifier, password, rememberMe } = body ?? {}

    if (!identifier || !password) {
      return NextResponse.json({ success: false, error: 'Email/username and password are required' }, { status: 400 })
    }

    const id = String(identifier).trim().toLowerCase()

    const user = await prisma.user.findFirst({
      where: {
        OR: [{ email: id }, { username: id }],
      },
    })

    if (!user) {
      console.error(`Signin failed: User not found for identifier: ${id}`)
      return NextResponse.json({ success: false, error: 'Invalid credentials' }, { status: 401 })
    }

    const ok = await verifyPassword(String(password), user.passwordHash)
    if (!ok) {
      console.error(`Signin failed: Password mismatch for user: ${user.email || user.username}`)
      return NextResponse.json({ success: false, error: 'Invalid credentials' }, { status: 401 })
    }

    const token = createSessionToken()
    const days = rememberMe ? 30 : 1
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * days)

    await prisma.userSession.create({
      data: {
        userId: user.id,
        token,
        expiresAt,
      },
    })

    const response = NextResponse.json({
      success: true,
      user: { id: user.id, username: user.username, email: user.email, displayName: user.displayName },
    })

    response.cookies.set(getUserSessionCookieName(), token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      expires: expiresAt,
    })

    return response
  } catch (error) {
    console.error('Signin error:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}

