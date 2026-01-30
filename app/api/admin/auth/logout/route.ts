/**
 * API Route: /api/admin/auth/logout
 * 
 * Admin logout endpoint
 */

import { NextRequest, NextResponse } from 'next/server'
import { verifyAdminSession, destroyAdminSession } from '@/lib/auth-helpers'

// POST /api/admin/auth/logout
export async function POST(request: NextRequest) {
  try {
    const session = await verifyAdminSession(request)
    
    if (session) {
      await destroyAdminSession(session.token)
    }

    const response = NextResponse.json({
      success: true,
      message: 'Logged out successfully',
    })

    // Clear session cookie
    response.cookies.delete('admin_session')

    return response
  } catch (error: any) {
    console.error('Logout error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
