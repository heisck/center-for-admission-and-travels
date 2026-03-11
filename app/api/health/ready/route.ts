/**
 * Readiness probe endpoint.
 * Returns 503 when required dependencies are unavailable.
 */

import { NextRequest, NextResponse } from 'next/server'
import {
  checkDatabaseHealth,
  checkRedisHealth,
  getRuntimeHealthMetadata,
} from '@/lib/health-check'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET(request: NextRequest) {
  const requestId = request.headers.get('x-request-id') || crypto.randomUUID()
  const [database, redis] = await Promise.all([
    checkDatabaseHealth(),
    checkRedisHealth(),
  ])

  const requireRedis = process.env.HEALTH_REQUIRE_REDIS === 'true'
  const dbReady = database.status === 'ok'
  const redisReady = redis.status === 'ok' || redis.status === 'skipped' || !requireRedis
  const ready = dbReady && redisReady

  return NextResponse.json(
    {
      status: ready ? 'ready' : 'not_ready',
      checks: { database, redis },
      requireRedis,
      ...getRuntimeHealthMetadata(requestId),
    },
    {
      status: ready ? 200 : 503,
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      },
    }
  )
}
