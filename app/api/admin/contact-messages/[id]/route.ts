/**
 * Admin Contact Message API
 * PATCH - Mark message as read
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyAdminSession } from '@/lib/auth-helpers'
import { hasAdminPermission } from '@/lib/admin-permissions'
import { logAdminAudit } from '@/lib/admin-audit'

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
    const body = await request.json()
    const { read } = body

    const message = await prisma.contactMessage.update({
      where: { id },
      data: { read: read !== false },
    })

    await logAdminAudit({
      request,
      session,
      action: 'contact_message.update',
      entityType: 'contact_message',
      entityId: id,
      metadata: { read: read !== false },
    })

    return NextResponse.json({ success: true, data: message })
  } catch (error: any) {
    console.error('Error updating contact message:', error)
    return NextResponse.json({ success: false, error: 'Failed to update contact message' }, { status: 500 })
  }
}
