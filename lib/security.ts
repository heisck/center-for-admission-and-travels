import { NextRequest } from 'next/server'

const IP_HEADER_NAMES = ['x-forwarded-for', 'cf-connecting-ip', 'x-real-ip'] as const
const SESSION_COOKIE_NAMES = ['admin_session', 'user_session'] as const

export function getClientIp(request: NextRequest): string {
  for (const headerName of IP_HEADER_NAMES) {
    const raw = request.headers.get(headerName)
    if (!raw) continue
    const first = raw.split(',')[0]?.trim()
    if (first) return first
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
  if (!originHeader) return false

  let origin: string
  try {
    origin = new URL(originHeader).origin
  } catch {
    return false
  }

  return origin === getRequestOrigin(request)
}
