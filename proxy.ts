import { NextRequest, NextResponse } from 'next/server'
import { hasAuthSessionCookie, isSameOriginRequest } from '@/lib/security'

const MUTATING_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE'])

function ensureRequestId(request: NextRequest): string {
  return request.headers.get('x-request-id') || crypto.randomUUID()
}

function addSecurityHeaders(response: NextResponse, requestId: string) {
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')
  response.headers.set('X-Request-Id', requestId)

  if (process.env.NODE_ENV === 'production') {
    response.headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload')
  }

  return response
}

export function proxy(request: NextRequest) {
  const requestId = ensureRequestId(request)
  const isMutation = MUTATING_METHODS.has(request.method.toUpperCase())
  const hasSession = hasAuthSessionCookie(request)
  const pathname = request.nextUrl.pathname

  if ((pathname === '/admin' || pathname.startsWith('/admin/')) && !request.cookies.get('admin_session')?.value) {
    const loginUrl = request.nextUrl.clone()
    loginUrl.pathname = '/admin-login'
    loginUrl.search = ''
    return addSecurityHeaders(NextResponse.redirect(loginUrl), requestId)
  }

  if (isMutation && hasSession && !isSameOriginRequest(request)) {
    return addSecurityHeaders(
      NextResponse.json(
        { success: false, error: 'Cross-site request blocked' },
        { status: 403 }
      ),
      requestId
    )
  }

  const response = NextResponse.next()
  response.headers.set('X-Request-Id', requestId)
  if (hasSession) {
    response.headers.set('Cache-Control', 'no-store')
    response.headers.set('Vary', 'Cookie, Origin')
  }
  return addSecurityHeaders(response, requestId)
}

export const config = {
  matcher: ['/api/:path*', '/admin/:path*', '/admin'],
}
