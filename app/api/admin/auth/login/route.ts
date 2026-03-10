import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { compare } from 'bcryptjs'
import crypto from 'crypto'
import { checkRateLimit, rateLimitResponse } from '@/lib/rate-limit'
import { getClientIp } from '@/lib/security'
import { pruneAdminSessions } from '@/lib/auth-helpers'

export async function POST(request: NextRequest) {
  const ip = getClientIp(request)
  const { allowed, retryAfterMs } = await checkRateLimit(`admin-login:${ip}`, {
    maxRequests: 8,
    windowMs: 60_000,
  })
  if (!allowed) return rateLimitResponse(retryAfterMs)

  try {
    const body = await request.json()
    const { email, password } = body

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Email and password are required' },
        { status: 400 }
      )
    }

    const id = String(email).trim().toLowerCase()
    const passwordTrimmed = String(password).trim()

    const adminUser = await prisma.adminUser.findFirst({
      where: {
        OR: [{ email: id }, { username: id }],
      },
    })

    if (!adminUser) {
      return NextResponse.json(
        { success: false, error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    const isValid = await compare(passwordTrimmed, adminUser.password)
    if (!isValid) {
      return NextResponse.json(
        { success: false, error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    const token = crypto.randomBytes(32).toString('hex')
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24) // 24 hours

    await prisma.adminSession.create({
      data: {
        userId: adminUser.id,
        token,
        expiresAt,
      },
    })
    await pruneAdminSessions(adminUser.id).catch(() => {})

    const response = NextResponse.json({
      success: true,
      message: 'Login successful',
    })

    response.cookies.set('admin_session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 60 * 60 * 24,
    })

    return response
  } catch (error: any) {
    console.error('Login error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

