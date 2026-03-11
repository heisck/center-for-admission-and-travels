/**
 * Liveness probe endpoint.
 * Returns 200 while the process is alive.
 */

import { NextRequest, NextResponse } from 'next/server'
import { getRuntimeHealthMetadata } from '@/lib/health-check'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET(request: NextRequest) {
  const requestId = request.headers.get('x-request-id') || crypto.randomUUID()
  return NextResponse.json(
    {
      status: 'ok',
      ...getRuntimeHealthMetadata(requestId),
    },
    {
      status: 200,
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      },
    }
  )
}
