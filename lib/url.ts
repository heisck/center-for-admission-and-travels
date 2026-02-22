import { NextRequest } from 'next/server'

/**
 * Get the application base URL. When a request is available and comes from
 * production (non-localhost), uses the request origin so reset links etc.
 * point to the correct deployment. Otherwise uses NEXT_PUBLIC_BASE_URL or
 * falls back to localhost.
 */
export function getBaseUrl(request?: NextRequest): string {
  const envUrl = process.env.NEXT_PUBLIC_BASE_URL?.replace(/\/$/, '')

  if (request) {
    const proto = request.headers.get('x-forwarded-proto') || 'http'
    const host = request.headers.get('host') || 'localhost:3000'
    const requestOrigin = `${proto}://${host}`

    // When request is from production (not localhost), always use request origin
    // so reset links point to the actual deployment (fixes Vercel when env has localhost)
    if (!host.includes('localhost')) {
      return requestOrigin
    }
  }

  if (envUrl) {
    return envUrl
  }

  return 'http://localhost:3000'
}
