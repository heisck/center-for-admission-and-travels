import { prisma } from '@/lib/prisma'

export type HealthStatus = 'ok' | 'error' | 'skipped'

export interface HealthCheckResult {
  status: HealthStatus
  latencyMs: number
  message?: string
}

async function timed<T>(fn: () => Promise<T>): Promise<{ value: T; latencyMs: number }> {
  const start = Date.now()
  const value = await fn()
  return { value, latencyMs: Date.now() - start }
}

export async function checkDatabaseHealth(): Promise<HealthCheckResult> {
  try {
    const { latencyMs } = await timed(async () => prisma.$queryRaw`SELECT 1`)
    return { status: 'ok', latencyMs }
  } catch {
    return { status: 'error', latencyMs: 0, message: 'Database is unreachable' }
  }
}

export async function checkRedisHealth(): Promise<HealthCheckResult> {
  const redisUrl = process.env.UPSTASH_REDIS_REST_URL?.trim().replace(/\/+$/, '') || ''
  const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN?.trim() || ''

  if (!redisUrl || !redisToken) {
    return { status: 'skipped', latencyMs: 0, message: 'Redis is not configured' }
  }

  try {
    const { value, latencyMs } = await timed(async () => {
      const response = await fetch(`${redisUrl}/ping`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${redisToken}`,
        },
        cache: 'no-store',
      })

      if (!response.ok) {
        throw new Error(`Redis ping failed with status ${response.status}`)
      }

      const body = await response.json().catch(() => ({}))
      const result = typeof body?.result === 'string' ? body.result.toUpperCase() : ''
      if (result !== 'PONG') {
        throw new Error('Redis ping did not return PONG')
      }

      return true
    })

    if (value) {
      return { status: 'ok', latencyMs }
    }
    return { status: 'error', latencyMs: 0, message: 'Redis ping returned no result' }
  } catch {
    return { status: 'error', latencyMs: 0, message: 'Redis is unreachable' }
  }
}

export function getRuntimeHealthMetadata(requestId: string | null) {
  return {
    timestamp: new Date().toISOString(),
    uptimeSec: Math.round(process.uptime()),
    memory: {
      rssMb: Math.round(process.memoryUsage().rss / 1024 / 1024),
      heapUsedMb: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
    },
    nodeVersion: process.version,
    region: process.env.VERCEL_REGION || process.env.RENDER_REGION || null,
    commitSha: process.env.VERCEL_GIT_COMMIT_SHA || process.env.RENDER_GIT_COMMIT || null,
    requestId,
  }
}
