/**
 * API Route: /api/admin/auth/login
 * 
 * Admin login endpoint
 * 
 * TODO: Replace with real authentication when database is connected
 */

import { NextRequest, NextResponse } from 'next/server'
import { authenticateAdmin } from '@/lib/auth-helpers'

// POST /api/admin/auth/login
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = body

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Email and password are required' },
        { status: 400 }
      )
    }

    const result = await authenticateAdmin(email, password)

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 401 }
      )
    }

    // Set session cookie
    const response = NextResponse.json({
      success: true,
      message: 'Login successful',
      token: result.token,
    })

    // TODO: In production, use httpOnly, secure, sameSite cookies
    response.cookies.set('admin_session', result.token!, {
      maxAge: 60 * 60 * 24, // 24 hours
      path: '/',
      // httpOnly: true, // Enable in production
      // secure: process.env.NODE_ENV === 'production', // Enable in production
      // sameSite: 'strict',
    })

    return response
  } catch (error: any) {
    console.error('Login error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
