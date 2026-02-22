import { NextRequest } from 'next/server'

/**
 * Get the application base URL. Uses NEXT_PUBLIC_BASE_URL env var if set,
 * otherwise derives it from the incoming request headers (works automatically
 * on Vercel, Render, or any reverse-proxy setup).
 */
export function getBaseUrl(request?: NextRequest): string {
  if (process.env.NEXT_PUBLIC_BASE_URL) {
    return process.env.NEXT_PUBLIC_BASE_URL.replace(/\/$/, '')
  }

  if (request) {
    const proto = request.headers.get('x-forwarded-proto') || 'http'
    const host = request.headers.get('host') || 'localhost:3000'
    return `${proto}://${host}`
  }

  return 'http://localhost:3000'
}
