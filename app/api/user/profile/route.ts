import { NextRequest, NextResponse } from 'next/server'
import { getUserFromSessionToken, getUserSessionCookieName } from '@/lib/user-auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get(getUserSessionCookieName())?.value
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await getUserFromSessionToken(token)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    return NextResponse.json({
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        displayName: user.displayName,
        phone: user.phone,
        createdAt: user.createdAt,
      },
    })
  } catch (error) {
    console.error('Profile GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const token = request.cookies.get(getUserSessionCookieName())?.value
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await getUserFromSessionToken(token)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { displayName, phone } = body

    if (displayName !== undefined && typeof displayName !== 'string') {
      return NextResponse.json({ error: 'displayName must be a string' }, { status: 400 })
    }

    if (phone !== undefined && typeof phone !== 'string') {
      return NextResponse.json({ error: 'phone must be a string' }, { status: 400 })
    }

    const updateData: { displayName?: string; phone?: string } = {}
    if (displayName !== undefined) updateData.displayName = displayName
    if (phone !== undefined) updateData.phone = phone

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: updateData,
    })

    return NextResponse.json({
      user: {
        id: updatedUser.id,
        username: updatedUser.username,
        email: updatedUser.email,
        displayName: updatedUser.displayName,
        phone: updatedUser.phone,
        createdAt: updatedUser.createdAt,
      },
    })
  } catch (error) {
    console.error('Profile PATCH error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
