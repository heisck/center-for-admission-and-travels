import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyAdminSession } from '@/lib/auth-helpers'
import { hasAdminPermission } from '@/lib/admin-permissions'
import { checkRateLimit, rateLimitResponse } from '@/lib/rate-limit'
import { getClientIp } from '@/lib/security'
import { logAdminAudit } from '@/lib/admin-audit'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const ip = getClientIp(request)
  try {
    const session = await verifyAdminSession(request)
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }
    if (!hasAdminPermission(session.role, 'payments.manage')) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })
    }

    const { allowed, retryAfterMs } = await checkRateLimit(`admin-payment-update:${session.userId}:${ip}`, {
      maxRequests: 30,
      windowMs: 60_000,
    })
    if (!allowed) return rateLimitResponse(retryAfterMs)

    const { id } = await params
    const body = await request.json()
    const data: { adminNote?: string; adminViewedAt?: Date } = {}
    const auditMetadata: Record<string, unknown> = {}

    if (typeof body.adminNote === 'string') {
      const note = body.adminNote.trim()
      if (note.length > 2000) {
        return NextResponse.json({ success: false, error: 'Admin note is too long' }, { status: 400 })
      }
      data.adminNote = note
      auditMetadata.adminNoteUpdated = true
    }

    if (body.adminViewedAt !== undefined) {
      const parsedDate = body.adminViewedAt ? new Date(body.adminViewedAt) : new Date()
      if (Number.isNaN(parsedDate.getTime())) {
        return NextResponse.json({ success: false, error: 'Invalid adminViewedAt value' }, { status: 400 })
      }
      data.adminViewedAt = parsedDate
      auditMetadata.adminViewedAtUpdated = true
    }

    if (Object.keys(data).length === 0) {
      return NextResponse.json({ success: false, error: 'No valid fields to update' }, { status: 400 })
    }

    const payment = await prisma.payment.update({
      where: { id },
      data,
      include: {
        user: { select: { id: true, username: true, email: true, displayName: true } },
      },
    })

    await logAdminAudit({
      request,
      session,
      action: 'payment.update',
      entityType: 'payment',
      entityId: id,
      metadata: auditMetadata,
    })

    return NextResponse.json({ success: true, data: { ...payment, amount: Number(payment.amount) } })
  } catch (error: unknown) {
    console.error('Error updating payment:', error)
    if (typeof error === 'object' && error && 'code' in error && (error as { code?: string }).code === 'P2025') {
      return NextResponse.json({ success: false, error: 'Payment not found' }, { status: 404 })
    }
    return NextResponse.json({ success: false, error: 'Failed to update payment' }, { status: 500 })
  }
}
