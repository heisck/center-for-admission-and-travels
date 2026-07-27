import { NextRequest, NextResponse } from 'next/server'
import { verifyAdminSession } from '@/lib/auth-helpers'
import { prisma } from '@/lib/prisma'
import { hasAdminPermission } from '@/lib/admin-permissions'
import { logAdminAudit } from '@/lib/admin-audit'
import { checkRateLimit, rateLimitResponse } from '@/lib/rate-limit'
import { getClientIp } from '@/lib/security'
import type { PaymentStatus } from '@prisma/client'

const BOOKING_STATUSES = new Set<string>([
  'pending',
  'processing',
  'success',
  'failed',
  'cancelled',
])
const ID_PATTERN = /^[A-Za-z0-9_-]{1,128}$/

function isPaymentStatus(value: string): value is PaymentStatus {
  return BOOKING_STATUSES.has(value)
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
    const { allowed, retryAfterMs } = await checkRateLimit(
      `admin-bookings-read:${session.userId}:${getClientIp(request)}`,
      { maxRequests: 60, windowMs: 60_000 }
    )
    if (!allowed) return rateLimitResponse(retryAfterMs)

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const page = Math.max(1, Number.parseInt(searchParams.get('page') || '1', 10) || 1)
    const limit = Math.min(100, Math.max(1, Number.parseInt(searchParams.get('limit') || '20', 10) || 20))
    const skip = (page - 1) * limit

    const where: any = {
      metadata: {
        path: ['type'],
        equals: 'booking_request',
      },
    }
    if (status && status !== 'all') {
      if (!isPaymentStatus(status)) {
        return NextResponse.json({ success: false, error: 'Invalid booking status' }, { status: 400 })
      }
      where.status = status
    }

    const [bookings, total] = await Promise.all([
      prisma.payment.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.payment.count({ where }),
    ])

    return NextResponse.json({
      success: true,
      data: {
        bookings: bookings.map((booking) => ({ ...booking, amount: Number(booking.amount) })),
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    })
  } catch (error: any) {
    console.error('Error fetching bookings:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch bookings' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await verifyAdminSession(request)
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }
    if (!hasAdminPermission(session.role, 'support.manage')) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })
    }
    const { allowed, retryAfterMs } = await checkRateLimit(
      `admin-bookings-write:${session.userId}:${getClientIp(request)}`,
      { maxRequests: 30, windowMs: 60_000 }
    )
    if (!allowed) return rateLimitResponse(retryAfterMs)

    const body = await request.json().catch(() => null)
    const id = String(body?.id || '').trim()
    const status = String(body?.status || '').trim()

    if (!ID_PATTERN.test(id) || !isPaymentStatus(status)) {
      return NextResponse.json(
        { success: false, error: 'A valid booking ID and status are required' },
        { status: 400 }
      )
    }

    const existing = await prisma.payment.findUnique({
      where: { id },
      select: { id: true, metadata: true },
    })
    if (!existing) {
      return NextResponse.json({ success: false, error: 'Booking not found' }, { status: 404 })
    }
    if ((existing.metadata as any)?.type !== 'booking_request') {
      return NextResponse.json(
        { success: false, error: 'Online payment status must be refreshed from Paystack' },
        { status: 400 }
      )
    }

    const updated = await prisma.payment.update({
      where: { id: existing.id },
      data: { status, updatedAt: new Date() },
    })

    await logAdminAudit({
      request,
      session,
      action: 'booking.status.update',
      entityType: 'payment',
      entityId: id,
      metadata: { status },
    })

    return NextResponse.json({ success: true, data: { ...updated, amount: Number(updated.amount) } })
  } catch (error: any) {
    console.error('Error updating booking:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update booking' },
      { status: 500 }
    )
  }
}
