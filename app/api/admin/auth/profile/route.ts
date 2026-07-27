import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyAdminSession } from '@/lib/auth-helpers'
import { hashPassword, verifyPassword } from '@/lib/user-auth'
import { checkRateLimit, rateLimitResponse } from '@/lib/rate-limit'
import { getClientIp } from '@/lib/security'
import { hasAdminPermission } from '@/lib/admin-permissions'
import { logAdminAudit } from '@/lib/admin-audit'
import { validatePassword } from '@/lib/password-policy'

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export async function GET(request: NextRequest) {
  try {
    const session = await verifyAdminSession(request)
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }
    if (!hasAdminPermission(session.role, 'dashboard.read')) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })
    }

    const adminUser = await prisma.adminUser.findUnique({
      where: { id: session.userId },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        createdAt: true,
      },
    })

    if (!adminUser) {
      return NextResponse.json({ success: false, error: 'Admin user not found' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      data: adminUser,
    })
  } catch (error) {
    console.error('Admin profile GET error:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  const ip = getClientIp(request)
  try {
    const session = await verifyAdminSession(request)
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }
    if (!hasAdminPermission(session.role, 'dashboard.read')) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })
    }

    const { allowed, retryAfterMs } = await checkRateLimit(`admin-profile:${session.userId}:${ip}`, {
      maxRequests: 10,
      windowMs: 60_000,
    })
    if (!allowed) return rateLimitResponse(retryAfterMs)

    const body = await request.json().catch(() => null)
    if (!body || typeof body !== 'object') {
      return NextResponse.json({ success: false, error: 'Invalid JSON body' }, { status: 400 })
    }
    const emailInput = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : ''
    const currentPassword = typeof body?.currentPassword === 'string' ? body.currentPassword : ''
    const newPasswordResult = body?.newPassword ? validatePassword(body.newPassword) : null

    if (!currentPassword) {
      return NextResponse.json({ success: false, error: 'Current password is required' }, { status: 400 })
    }

    if (!emailInput && !body?.newPassword) {
      return NextResponse.json({ success: false, error: 'No changes provided' }, { status: 400 })
    }

    if (emailInput && (emailInput.length > 254 || !isValidEmail(emailInput))) {
      return NextResponse.json({ success: false, error: 'Please enter a valid email address' }, { status: 400 })
    }

    if (newPasswordResult && !newPasswordResult.password) {
      return NextResponse.json({ success: false, error: newPasswordResult.error }, { status: 400 })
    }

    const adminUser = await prisma.adminUser.findUnique({
      where: { id: session.userId },
    })

    if (!adminUser) {
      return NextResponse.json({ success: false, error: 'Admin user not found' }, { status: 404 })
    }

    const isPasswordValid = await verifyPassword(currentPassword, adminUser.password)
    if (!isPasswordValid) {
      return NextResponse.json({ success: false, error: 'Current password is incorrect' }, { status: 401 })
    }

    if (emailInput && emailInput !== (adminUser.email || '').toLowerCase()) {
      const existingEmail = await prisma.adminUser.findFirst({
        where: {
          email: emailInput,
          NOT: { id: adminUser.id },
        },
        select: { id: true },
      })

      if (existingEmail) {
        return NextResponse.json({ success: false, error: 'That email is already in use' }, { status: 409 })
      }
    }

    const updateData: { email?: string; password?: string } = {}
    if (emailInput) {
      updateData.email = emailInput
    }
    if (newPasswordResult?.password) {
      updateData.password = await hashPassword(newPasswordResult.password)
    }

    await prisma.adminUser.update({
      where: { id: adminUser.id },
      data: updateData,
    })

    await logAdminAudit({
      request,
      session,
      action: 'admin.profile.update',
      entityType: 'admin_user',
      entityId: adminUser.id,
      metadata: {
        emailUpdated: Boolean(emailInput),
        passwordUpdated: Boolean(newPasswordResult?.password),
      },
    })

    if (newPasswordResult?.password) {
      await prisma.adminSession.deleteMany({
        where: {
          userId: adminUser.id,
          token: { not: session.token },
        },
      })
    }

    return NextResponse.json({
      success: true,
      message: newPasswordResult?.password
        ? 'Profile updated. Password changed successfully.'
        : 'Profile updated successfully.',
    })
  } catch (error) {
    console.error('Admin profile PUT error:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}

