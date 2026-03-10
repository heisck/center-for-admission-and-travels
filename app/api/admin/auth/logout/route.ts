import { NextRequest, NextResponse } from 'next/server'
import { verifyAdminSession } from '@/lib/auth-helpers'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const session = await verifyAdminSession(request)

    if (session) {
      await prisma.adminSession.deleteMany({ where: { token: session.token } }).catch(() => {})
    }

    const response = NextResponse.json({
      success: true,
      message: 'Logged out successfully',
    })

    response.cookies.set('admin_session', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 0,
    })

    return response
  } catch (error: any) {
    console.error('Logout error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
