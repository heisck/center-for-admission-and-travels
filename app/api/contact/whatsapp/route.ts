/**
 * API: GET /api/contact/whatsapp
 * Returns the current WhatsApp number from the database.
 * Short-lived caching with explicit invalidation on admin updates.
 */

import { NextResponse } from 'next/server'
import { getSiteChromeContent } from '@/lib/public-content'

export const revalidate = 60
const BROWSER_CACHE_SECONDS = 15

export async function GET() {
  try {
    const chrome = await getSiteChromeContent()
    const number = chrome.contact.whatsappNumber?.replace(/\D/g, '') || ''
    return NextResponse.json(
      { success: true, whatsappNumber: number },
      {
        headers: {
          'Cache-Control': `public, max-age=${BROWSER_CACHE_SECONDS}, s-maxage=60, stale-while-revalidate=60`,
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
