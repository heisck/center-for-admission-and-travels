/**
 * API: GET /api/contact/whatsapp
 * Returns the current WhatsApp number from the database.
 * Short-lived caching with explicit invalidation on admin updates.
 */

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const revalidate = 60
export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const contact = await prisma.contactInfo.findUnique({
      where: { id: 'contact' },
      select: { whatsappNumber: true },
    })
    const number = contact?.whatsappNumber?.replace(/\D/g, '') || ''
    return NextResponse.json(
      { success: true, whatsappNumber: number },
      {
        headers: {
          'Cache-Control': 'public, max-age=0, s-maxage=60, must-revalidate',
        },
      }
    )
  } catch (error) {
    console.error('[WhatsApp API] Error:', error)
    return NextResponse.json(
      { success: false, whatsappNumber: '' },
      { status: 500 }
    )
  }
}
