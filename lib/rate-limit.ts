import crypto from 'crypto'

interface RequestBucket {
  timestamps: number[]
  lastSeen: number
}

interface RateLimitOptions {
  maxRequests: number
  windowMs: number
}

interface RateLimitResult {
  allowed: boolean
  remaining: number
  retryAfterMs: number
}

const requests = new Map<string, RequestBucket>()

const CLEANUP_INTERVAL = 60_000
const MAX_RATE_LIMIT_KEYS = 50_000
let lastCleanup = Date.now()

const REDIS_URL = process.env.UPSTASH_REDIS_REST_URL?.trim().replace(/\/+$/, '') || ''
const REDIS_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN?.trim() || ''
const RATE_LIMIT_PREFIX = process.env.RATE_LIMIT_PREFIX?.trim() || 'rl'
const FAIL_CLOSED = process.env.RATE_LIMIT_FAIL_CLOSED === 'true'
let warnedRedisNotConfigured = false

function isRedisConfigured() {
  return Boolean(REDIS_URL && REDIS_TOKEN)
}

function cleanup(windowMs: number) {
  const now = Date.now()
  if (now - lastCleanup < CLEANUP_INTERVAL) return
  lastCleanup = now

  const cutoff = now - windowMs
  for (const [key, bucket] of requests) {
    const filtered = bucket.timestamps.filter((t) => t > cutoff)
    if (filtered.length === 0) {
      requests.delete(key)
      continue
    }
    bucket.timestamps = filtered
    bucket.lastSeen = filtered[filtered.length - 1]
    requests.set(key, bucket)
  }
}

function enforceKeyLimit() {
  if (requests.size <= MAX_RATE_LIMIT_KEYS) return

  const overBy = requests.size - MAX_RATE_LIMIT_KEYS
  const removeCount = Math.max(overBy, Math.ceil(MAX_RATE_LIMIT_KEYS * 0.05))
  const oldestFirst = [...requests.entries()]
    .sort((a, b) => a[1].lastSeen - b[1].lastSeen)
    .slice(0, removeCount)

  for (const [key] of oldestFirst) {
    requests.delete(key)
  }
}

function normalizeKey(rawKey: string) {
  return String(rawKey || 'unknown').slice(0, 500)
}

function buildRedisKey(key: string, options: RateLimitOptions) {
  const hash = crypto.createHash('sha256').update(key).digest('hex')
  return `${RATE_LIMIT_PREFIX}:${options.maxRequests}:${options.windowMs}:${hash}`
}

async function runRedisPipeline(commands: Array<Array<string | number>>): Promise<any[]> {
  const response = await fetch(`${REDIS_URL}/pipeline`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${REDIS_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(commands),
    cache: 'no-store',
  })

  if (!response.ok) {
    throw new Error(`Redis pipeline failed with status ${response.status}`)
  }

  const body = await response.json()
  if (!Array.isArray(body)) {
    throw new Error('Redis pipeline response was not an array')
  }

  for (const item of body) {
    if (item && typeof item === 'object' && 'error' in item && item.error) {
      throw new Error(`Redis error: ${String(item.error)}`)
    }
  }

  return body
}

function parseRedisResultNumber(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) return value
  if (typeof value === 'string') {
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : null
  }
  return null
}

async function checkRedisRateLimit(key: string, options: RateLimitOptions): Promise<RateLimitResult> {
  const redisKey = buildRedisKey(key, options)

  const pipelineResult = await runRedisPipeline([
    ['INCR', redisKey],
    ['PTTL', redisKey],
  ])

  const count = parseRedisResultNumber(pipelineResult[0]?.result)
  let ttlMs = parseRedisResultNumber(pipelineResult[1]?.result)

  if (!count || count <= 0) {
    throw new Error('Redis returned invalid increment count')
  }

  if (!ttlMs || ttlMs < 0) {
    await runRedisPipeline([['PEXPIRE', redisKey, options.windowMs]])
    ttlMs = options.windowMs
  }

  if (count > options.maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      retryAfterMs: Math.max(1, ttlMs),
    }
  }

  return {
    allowed: true,
    remaining: Math.max(0, options.maxRequests - count),
    retryAfterMs: 0,
  }
}

function checkMemoryRateLimit(key: string, { maxRequests, windowMs }: RateLimitOptions): RateLimitResult {
  cleanup(windowMs)
  enforceKeyLimit()

  const now = Date.now()
  const cutoff = now - windowMs
  const existingBucket = requests.get(key)
  const timestamps = (existingBucket?.timestamps || []).filter((t) => t > cutoff)

  if (timestamps.length >= maxRequests) {
    const oldestInWindow = timestamps[0]
    requests.set(key, { timestamps, lastSeen: timestamps[timestamps.length - 1] || now })
    return {
      allowed: false,
      remaining: 0,
      retryAfterMs: oldestInWindow + windowMs - now,
    }
  }

  timestamps.push(now)
  requests.set(key, { timestamps, lastSeen: now })

  return {
    allowed: true,
    remaining: maxRequests - timestamps.length,
    retryAfterMs: 0,
  }
}

export async function checkRateLimit(rawKey: string, options: RateLimitOptions): Promise<RateLimitResult> {
  const key = normalizeKey(rawKey)

  if (!isRedisConfigured() && process.env.NODE_ENV === 'production' && !warnedRedisNotConfigured) {
    warnedRedisNotConfigured = true
    console.warn('[RateLimit] UPSTASH_REDIS_REST_URL/TOKEN not configured; using in-memory fallback')
  }

  if (isRedisConfigured()) {
    try {
      return await checkRedisRateLimit(key, options)
    } catch (error) {
      console.error('[RateLimit] Redis backend unavailable, using fallback:', error)
      if (FAIL_CLOSED) {
        return {
          allowed: false,
          remaining: 0,
          retryAfterMs: options.windowMs,
        }
      }
    }
  }

  return checkMemoryRateLimit(key, options)
}

export function rateLimitResponse(retryAfterMs: number) {
  return new Response(
    JSON.stringify({
      success: false,
      error: 'Too many requests. Please try again later.',
    }),
    {
      status: 429,
      headers: {
        'Content-Type': 'application/json',
        'Retry-After': String(Math.ceil(Math.max(1, retryAfterMs) / 1000)),
      },
    }
  )
}
