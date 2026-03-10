/**
 * API: GET /api/contact/whatsapp
 * Returns the current WhatsApp number from the database.
 * No caching - always fetches fresh for the floating button.
 */

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const revalidate = 120

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
          'Cache-Control': 'public, s-maxage=120, stale-while-revalidate=300',
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
