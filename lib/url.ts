import { NextRequest } from 'next/server'

function parseBaseUrl(value: string | undefined, allowHttp: boolean): string | null {
  const raw = value?.trim()
  if (!raw) return null
  const withProtocol = /^[a-z][a-z0-9+.-]*:\/\//i.test(raw) ? raw : `https://${raw}`

  try {
    const url = new URL(withProtocol)
    if (url.protocol !== 'https:' && !(allowHttp && url.protocol === 'http:')) return null
    if (url.username || url.password || !url.hostname) return null
    return url.origin
  } catch {
    return null
  }
}

/**
 * Resolve the canonical application origin for email links and OAuth.
 * Production never trusts the request Host header because that would allow
 * password-reset and verification link poisoning behind a permissive proxy.
 */
export function getBaseUrl(request?: NextRequest): string {
  const isProduction = process.env.NODE_ENV === 'production'
  const configured =
    parseBaseUrl(process.env.NEXT_PUBLIC_BASE_URL, !isProduction) ||
    parseBaseUrl(process.env.VERCEL_PROJECT_PRODUCTION_URL, false) ||
    parseBaseUrl(process.env.VERCEL_URL, false)

  if (configured) return configured

  if (!isProduction && request) {
    return parseBaseUrl(request.nextUrl.origin, true) || 'http://localhost:3000'
  }

  return isProduction ? 'https://catravels.com' : 'http://localhost:3000'
}
