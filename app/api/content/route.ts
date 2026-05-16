/**
 * API Route: /api/content
 *
 * GET: Fetch all public content for the frontend
 * POST: Disabled. Admin writes use section-specific database endpoints.
 */

import { NextResponse } from 'next/server'

import { getCachedPublicContentEnvelopeJson } from '@/lib/public-content'

const PUBLIC_CONTENT_EDGE_CACHE_SECONDS = 30
const PUBLIC_CONTENT_EDGE_STALE_SECONDS = 60
const PUBLIC_CONTENT_BROWSER_CACHE_SECONDS = 10

// GET /api/content - Fetch all content for frontend
export async function GET() {
  try {
    const body = await getCachedPublicContentEnvelopeJson()

    return new NextResponse(body, {
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Cache-Control': `public, max-age=${PUBLIC_CONTENT_BROWSER_CACHE_SECONDS}, s-maxage=${PUBLIC_CONTENT_EDGE_CACHE_SECONDS}, stale-while-revalidate=${PUBLIC_CONTENT_EDGE_STALE_SECONDS}`,
      },
    })
  } catch (error) {
    console.error('Error fetching content:', error)
    return NextResponse.json({ success: false, error: 'Failed to fetch content' }, { status: 500 })
  }
}

// POST /api/content - disabled so content cannot be "saved" without a database write.
export async function POST() {
  return NextResponse.json(
    {
      success: false,
      error: 'Use /api/admin/content/[section] so content is saved to the database.',
    },
    { status: 410 }
  )
}
