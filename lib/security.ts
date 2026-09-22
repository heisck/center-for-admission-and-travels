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
  const forwardedProto = request.headers.get('x-forwarded-proto')?.split(',')[0]?.trim()
  const forwardedHost = request.headers.get('x-forwarded-host')?.split(',')[0]?.trim()
  const host = forwardedHost || request.headers.get('host') || request.nextUrl.host
  const protocol = forwardedProto || request.nextUrl.protocol.replace(':', '')
  return `${protocol}://${host}`
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

  return origin === getRequestOrigin(request)
}
