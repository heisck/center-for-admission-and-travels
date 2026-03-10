import { NextRequest, NextResponse } from 'next/server'
import { getUserFromSessionToken, getUserSessionCookieName } from '@/lib/user-auth'
import { prisma } from '@/lib/prisma'
import { checkRateLimit, rateLimitResponse } from '@/lib/rate-limit'
import { getClientIp } from '@/lib/security'

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get(getUserSessionCookieName())?.value
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await getUserFromSessionToken(token)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const newsletterSubscriber = await prisma.newsletterSubscriber.findUnique({
      where: { email: user.email },
    })

    return NextResponse.json({
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        displayName: user.displayName,
        phone: user.phone,
        createdAt: user.createdAt,
        newsletterSubscribed: !!newsletterSubscriber,
      },
    })
  } catch (error) {
    console.error('Profile GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const token = request.cookies.get(getUserSessionCookieName())?.value
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await getUserFromSessionToken(token)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const ip = getClientIp(request)
    const { allowed, retryAfterMs } = await checkRateLimit(`profile-update:${user.id}:${ip}`, {
      maxRequests: 15,
      windowMs: 60_000,
    })
    if (!allowed) return rateLimitResponse(retryAfterMs)

    const body = await request.json()
    const { displayName, phone } = body

    if (displayName !== undefined && typeof displayName !== 'string') {
      return NextResponse.json({ error: 'displayName must be a string' }, { status: 400 })
    }

    if (phone !== undefined && typeof phone !== 'string') {
      return NextResponse.json({ error: 'phone must be a string' }, { status: 400 })
    }

    const normalizedDisplayName = displayName !== undefined ? displayName.trim().slice(0, 120) : undefined
    const normalizedPhone = phone !== undefined ? phone.trim().slice(0, 40) : undefined

    const updateData: { displayName?: string | null; phone?: string | null } = {}
    if (normalizedDisplayName !== undefined) updateData.displayName = normalizedDisplayName || null
    if (normalizedPhone !== undefined) updateData.phone = normalizedPhone || null

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: updateData,
    })

    const newsletterSubscriber = await prisma.newsletterSubscriber.findUnique({
      where: { email: updatedUser.email },
    })

    return NextResponse.json({
      user: {
        id: updatedUser.id,
        username: updatedUser.username,
        email: updatedUser.email,
        displayName: updatedUser.displayName,
        phone: updatedUser.phone,
        createdAt: updatedUser.createdAt,
        newsletterSubscribed: !!newsletterSubscriber,
      },
    })
  } catch (error) {
    console.error('Profile PATCH error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

