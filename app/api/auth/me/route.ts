import { NextRequest, NextResponse } from 'next/server'
import { getUserFromSessionToken, getUserSessionCookieName } from '@/lib/user-auth'

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get(getUserSessionCookieName())?.value
    if (!token) return NextResponse.json({ user: null })

    const user = await getUserFromSessionToken(token)
    if (!user) return NextResponse.json({ user: null })

    return NextResponse.json({
      user: { id: user.id, username: user.username, email: user.email, displayName: user.displayName },
    })
  } catch (error) {
    console.error('Me error:', error)
    return NextResponse.json({ user: null }, { status: 500 })
  }
}

