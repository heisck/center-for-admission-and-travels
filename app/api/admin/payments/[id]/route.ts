import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyAdminSession } from '@/lib/auth-helpers'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await verifyAdminSession(request)
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const data: Record<string, any> = {}

    if (typeof body.adminNote === 'string') {
      data.adminNote = body.adminNote
    }

    if (body.adminViewedAt !== undefined) {
      data.adminViewedAt = body.adminViewedAt ? new Date(body.adminViewedAt) : new Date()
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

    return NextResponse.json({ success: true, data: payment })
  } catch (error: any) {
    console.error('Error updating payment:', error)
    if (error.code === 'P2025') {
      return NextResponse.json({ success: false, error: 'Payment not found' }, { status: 404 })
    }
    return NextResponse.json({ success: false, error: 'Failed to update payment' }, { status: 500 })
  }
}
