/**
 * Admin Contact Message API
 * PATCH - Mark message as read
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyAdminSession } from '@/lib/auth-helpers'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const session = await verifyAdminSession(request)
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await Promise.resolve(params)
    const body = await request.json()
    const { read } = body

    const message = await prisma.contactMessage.update({
      where: { id },
      data: { read: read !== false },
    })

    return NextResponse.json({ success: true, data: message })
  } catch (error: any) {
    console.error('Error updating contact message:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
