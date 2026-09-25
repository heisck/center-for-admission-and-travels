import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { compare } from 'bcryptjs'
import crypto from 'crypto'
import { checkRateLimit, rateLimitResponse } from '@/lib/rate-limit'
import { getClientIp } from '@/lib/security'
import { pruneAdminSessions } from '@/lib/auth-helpers'
import { validatePassword } from '@/lib/password-policy'
import { logAdminAudit } from '@/lib/admin-audit'

export async function POST(request: NextRequest) {
  const ip = getClientIp(request)
  const { allowed, retryAfterMs } = await checkRateLimit(`admin-login:${ip}`, {
    maxRequests: 8,
    windowMs: 60_000,
  })
  if (!allowed) return rateLimitResponse(retryAfterMs)

  const contentLength = Number(request.headers.get('content-length') || 0)
  if (contentLength > 16384) {
    return NextResponse.json({ success: false, error: 'Payload too large' }, { status: 413 })
  }

  try {
    const body = await request.json().catch(() => null)
    if (!body || typeof body !== 'object') {
      return NextResponse.json({ success: false, error: 'Invalid JSON body' }, { status: 400 })
    }
    const { email, password } = body

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Email and password are required' },
        { status: 400 }
      )
    }

    const id = String(email).trim().toLowerCase().slice(0, 254)
    const passwordResult = validatePassword(password)
    if (!passwordResult.password) {
      return NextResponse.json(
        { success: false, error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    const adminUser = await prisma.adminUser.findFirst({
      where: {
        OR: [{ email: id }, { username: id }],
      },
    })

    const DUMMY_HASH = '$2a$12$e8kZ1f0q.O0k6b9b2Z.z..rK6mZq0l8g7s1W9y2Z0z1W9y2Z0z1W9'
    const passwordHashToCompare = adminUser ? adminUser.password : DUMMY_HASH
    const isValid = await compare(passwordResult.password, passwordHashToCompare)

    if (!adminUser || !isValid) {
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
    await pruneAdminSessions(adminUser.id).catch((error) => {
      console.error('[Admin Auth] Failed to prune admin sessions:', error)
    })

    await logAdminAudit({
      request,
      session: {
        userId: adminUser.id,
        username: adminUser.username,
        email: adminUser.email,
        role: adminUser.role,
        token: '',
        expiresAt,
      },
      action: 'auth.login.success',
      entityType: 'admin_user',
      entityId: adminUser.id,
    }).catch(() => {})

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

