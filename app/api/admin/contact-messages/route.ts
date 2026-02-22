/**
 * Admin Contact Messages API
 * GET - List all contact form messages
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyAdminSession } from '@/lib/auth-helpers'

export async function GET(request: NextRequest) {
  try {
    const session = await verifyAdminSession(request)
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const messages = await prisma.contactMessage.findMany({
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ success: true, data: messages })
  } catch (error: any) {
    console.error('Error fetching contact messages:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
