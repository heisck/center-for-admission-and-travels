/**
 * Admin Contact Message API
 * PATCH - Mark message as read
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyAdminSession } from '@/lib/auth-helpers'
import { hasAdminPermission } from '@/lib/admin-permissions'
import { logAdminAudit } from '@/lib/admin-audit'
import { checkRateLimit, rateLimitResponse } from '@/lib/rate-limit'
import { getClientIp } from '@/lib/security'

const ID_PATTERN = /^[A-Za-z0-9_-]{1,128}$/

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const session = await verifyAdminSession(request)
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }
    if (!hasAdminPermission(session.role, 'support.manage')) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })
    }

    const { id } = await Promise.resolve(params)
    if (!ID_PATTERN.test(id)) {
      return NextResponse.json({ success: false, error: 'Invalid message ID' }, { status: 400 })
    }
    const { allowed, retryAfterMs } = await checkRateLimit(
      `admin-contact-message-update:${session.userId}:${getClientIp(request)}`,
      { maxRequests: 30, windowMs: 60_000 }
    )
    if (!allowed) return rateLimitResponse(retryAfterMs)

    const body = await request.json().catch(() => null)
    if (!body || typeof body !== 'object') {
      return NextResponse.json({ success: false, error: 'Invalid JSON body' }, { status: 400 })
    }
    const { read } = body
    if (typeof read !== 'boolean') {
      return NextResponse.json({ success: false, error: 'read must be a boolean' }, { status: 400 })
    }

    const message = await prisma.contactMessage.update({
      where: { id },
      data: { read },
    })

    await logAdminAudit({
      request,
      session,
      action: 'contact_message.update',
      entityType: 'contact_message',
      entityId: id,
      metadata: { read },
    })

    return NextResponse.json({ success: true, data: message })
  } catch (error: any) {
    console.error('Error updating contact message:', error)
    if (error?.code === 'P2025') {
      return NextResponse.json({ success: false, error: 'Message not found' }, { status: 404 })
    }
    return NextResponse.json({ success: false, error: 'Failed to update contact message' }, { status: 500 })
  }
}
