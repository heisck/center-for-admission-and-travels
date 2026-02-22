import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hashPassword, verifyPassword } from '@/lib/user-auth'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const token = typeof body?.token === 'string' ? body.token.trim() : ''
    const password = typeof body?.password === 'string' ? body.password.trim() : ''

    if (!token || !password) {
      return NextResponse.json({ success: false, error: 'Token and new password are required' }, { status: 400 })
    }

    if (password.length < 8) {
      return NextResponse.json({ success: false, error: 'Password must be at least 8 characters' }, { status: 400 })
    }

    const user = await prisma.user.findUnique({ where: { resetToken: token } })

    if (!user || !user.resetTokenExpiry || user.resetTokenExpiry < new Date()) {
      return NextResponse.json({ success: false, error: 'Invalid or expired reset link. Please request a new one.' }, { status: 400 })
    }

    const passwordHash = await hashPassword(password)

    // Use raw SQL to ensure the update persists (avoids Prisma/connection pooling issues)
    await prisma.$executeRaw`
      UPDATE users
      SET "passwordHash" = ${passwordHash}, "resetToken" = NULL, "resetTokenExpiry" = NULL, "updatedAt" = NOW()
      WHERE id = ${user.id}
    `

    // Invalidate all existing sessions for security
    await prisma.userSession.deleteMany({ where: { userId: user.id } })

    // Verify the update persisted by re-fetching and checking the new password
    const updated = await prisma.user.findUnique({
      where: { id: user.id },
      select: { passwordHash: true },
    })
    if (!updated) {
      return NextResponse.json({ success: false, error: 'Update failed. Please try again.' }, { status: 500 })
    }
    const verified = await verifyPassword(password, updated.passwordHash)
    if (!verified) {
      console.error('Reset password: verification failed after update - possible DB replication/pooling issue')
      return NextResponse.json({
        success: false,
        error: 'Password update did not persist. Please try again in a few seconds, or use the direct database connection.',
      }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: 'Password reset successfully. Please sign in with your new password.' })
  } catch (error) {
    console.error('Reset password error:', error)
    return NextResponse.json({ success: false, error: 'Something went wrong' }, { status: 500 })
  }
}
