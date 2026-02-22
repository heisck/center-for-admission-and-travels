import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserFromSessionToken, getUserSessionCookieName } from '@/lib/user-auth'

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get(getUserSessionCookieName())?.value
    if (!token) {
      return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 })
    }

    const user = await getUserFromSessionToken(token)
    if (!user) {
      return NextResponse.json({ success: false, error: 'Invalid session' }, { status: 401 })
    }

    const payments = await prisma.payment.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        reference: true,
        amount: true,
        currency: true,
        status: true,
        paymentMethod: true,
        customerName: true,
        customerEmail: true,
        customerPhone: true,
        packageId: true,
        metadata: true,
        adminNote: true,
        adminViewedAt: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    return NextResponse.json({ success: true, data: payments })
  } catch (error: any) {
    console.error('Error fetching user payments:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch payments' },
      { status: 500 }
    )
  }
}
