import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyAdminSession } from '@/lib/auth-helpers'
import { hashPassword, verifyPassword } from '@/lib/user-auth'
import { checkRateLimit, rateLimitResponse } from '@/lib/rate-limit'
import { getClientIp } from '@/lib/security'

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export async function GET(request: NextRequest) {
  try {
    const session = await verifyAdminSession(request)
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const adminUser = await prisma.adminUser.findUnique({
      where: { id: session.userId },
      select: {
        id: true,
        username: true,
        email: true,
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

    const { allowed, retryAfterMs } = await checkRateLimit(`admin-profile:${session.userId}:${ip}`, {
      maxRequests: 10,
      windowMs: 60_000,
    })
    if (!allowed) return rateLimitResponse(retryAfterMs)

    const body = await request.json()
    const emailInput = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : ''
    const currentPassword = typeof body?.currentPassword === 'string' ? body.currentPassword.trim() : ''
    const newPassword = typeof body?.newPassword === 'string' ? body.newPassword.trim() : ''

    if (!currentPassword) {
      return NextResponse.json({ success: false, error: 'Current password is required' }, { status: 400 })
    }

    if (!emailInput && !newPassword) {
      return NextResponse.json({ success: false, error: 'No changes provided' }, { status: 400 })
    }

    if (emailInput && !isValidEmail(emailInput)) {
      return NextResponse.json({ success: false, error: 'Please enter a valid email address' }, { status: 400 })
    }

    if (newPassword && newPassword.length < 8) {
      return NextResponse.json({ success: false, error: 'New password must be at least 8 characters' }, { status: 400 })
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
    if (newPassword) {
      updateData.password = await hashPassword(newPassword)
    }

    await prisma.adminUser.update({
      where: { id: adminUser.id },
      data: updateData,
    })

    if (newPassword) {
      await prisma.adminSession.deleteMany({
        where: {
          userId: adminUser.id,
          token: { not: session.token },
        },
      })
    }

    return NextResponse.json({
      success: true,
      message: newPassword
        ? 'Profile updated. Password changed successfully.'
        : 'Profile updated successfully.',
    })
  } catch (error) {
    console.error('Admin profile PUT error:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}

