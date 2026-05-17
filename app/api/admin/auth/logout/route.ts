import { NextRequest, NextResponse } from 'next/server'
import { verifyAdminSession } from '@/lib/auth-helpers'
import { prisma } from '@/lib/prisma'
import { logAdminAudit } from '@/lib/admin-audit'

export async function POST(request: NextRequest) {
  try {
    const session = await verifyAdminSession(request)

    if (session) {
      await prisma.adminSession.deleteMany({ where: { token: session.token } }).catch((error) => {
        console.error('[Admin Auth] Failed to delete admin session during logout:', error)
      })
      await logAdminAudit({
        request,
        session,
        action: 'admin.auth.logout',
        entityType: 'admin_session',
        entityId: session.token,
      })
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
  } catch (error) {
    console.error('Logout error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
