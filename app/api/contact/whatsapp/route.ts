/**
 * API: GET /api/contact/whatsapp
 * Returns the current WhatsApp number from the database.
 * No caching - always fetches fresh for the floating button.
 */

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET() {
  try {
    const contact = await prisma.contactInfo.findUnique({
      where: { id: 'contact' },
      select: { whatsappNumber: true },
    })
    const number = contact?.whatsappNumber?.replace(/\D/g, '') || '233248422663'
    return NextResponse.json({ success: true, whatsappNumber: number })
  } catch (error) {
    console.error('[WhatsApp API] Error:', error)
    return NextResponse.json(
      { success: false, whatsappNumber: '233248422663' },
      { status: 500 }
    )
  }
}
