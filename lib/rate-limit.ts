const requests = new Map<string, number[]>()

const CLEANUP_INTERVAL = 60_000
let lastCleanup = Date.now()

function cleanup(windowMs: number) {
  const now = Date.now()
  if (now - lastCleanup < CLEANUP_INTERVAL) return
  lastCleanup = now
  const cutoff = now - windowMs
  for (const [key, timestamps] of requests) {
    const filtered = timestamps.filter((t) => t > cutoff)
    if (filtered.length === 0) {
      requests.delete(key)
    } else {
      requests.set(key, filtered)
    }
  }
}

interface RateLimitOptions {
  maxRequests: number
  windowMs: number
}

export function checkRateLimit(
  ip: string,
  { maxRequests, windowMs }: RateLimitOptions
): { allowed: boolean; remaining: number; retryAfterMs: number } {
  cleanup(windowMs)

  const now = Date.now()
  const cutoff = now - windowMs
  const timestamps = (requests.get(ip) || []).filter((t) => t > cutoff)

  if (timestamps.length >= maxRequests) {
    const oldestInWindow = timestamps[0]
    return {
      allowed: false,
      remaining: 0,
      retryAfterMs: oldestInWindow + windowMs - now,
    }
  }

  timestamps.push(now)
  requests.set(ip, timestamps)

  return {
    allowed: true,
    remaining: maxRequests - timestamps.length,
    retryAfterMs: 0,
  }
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
        'Retry-After': String(Math.ceil(retryAfterMs / 1000)),
      },
    }
  )
}
