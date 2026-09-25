import { NextRequest } from 'next/server'

const EDGE_IP_HEADERS = ['cf-connecting-ip', 'x-real-ip', 'x-vercel-ip'] as const
const SESSION_COOKIE_NAMES = ['admin_session', 'user_session'] as const

export function getClientIp(request: NextRequest): string {
  for (const headerName of EDGE_IP_HEADERS) {
    const raw = request.headers.get(headerName)
    if (raw) {
      const trimmed = raw.trim()
      if (trimmed) return trimmed
    }
  }

  const forwardedFor = request.headers.get('x-forwarded-for')
  if (forwardedFor) {
    const parts = forwardedFor.split(',').map((ip) => ip.trim()).filter(Boolean)
    if (parts.length > 0) {
      return parts[parts.length - 1]
    }
  }

  return 'unknown'
}

export function hasAuthSessionCookie(request: NextRequest): boolean {
  return SESSION_COOKIE_NAMES.some((cookieName) => Boolean(request.cookies.get(cookieName)?.value))
}

export function getRequestOrigin(request: NextRequest): string {
  return request.nextUrl.origin
}

export function isSameOriginRequest(request: NextRequest): boolean {
  const originHeader = request.headers.get('origin')
  const refererHeader = request.headers.get('referer')
  const candidate = originHeader || refererHeader
  if (!candidate) return false

  let origin: string
  try {
    origin = new URL(candidate).origin
  } catch {
    return false
  }

  const expectedOrigins = new Set<string>([request.nextUrl.origin])
  if (process.env.NEXT_PUBLIC_BASE_URL) {
    try {
      expectedOrigins.add(new URL(process.env.NEXT_PUBLIC_BASE_URL).origin)
    } catch {}
  }

  return expectedOrigins.has(origin)
}
