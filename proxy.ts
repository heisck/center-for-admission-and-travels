import { NextRequest, NextResponse } from 'next/server'
import { hasAuthSessionCookie, isSameOriginRequest } from '@/lib/security'

const MUTATING_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE'])

function ensureRequestId(request: NextRequest): string {
  return request.headers.get('x-request-id') || crypto.randomUUID()
}

function addSecurityHeaders(response: NextResponse, requestId: string) {
  response.headers.set('X-Frame-Options', 'SAMEORIGIN')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')
  response.headers.set('X-Request-Id', requestId)

  if (process.env.NODE_ENV === 'production') {
    response.headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload')
  }

  return response
}

const PUBLIC_ADMIN_AUTH_PATHS = new Set([
  '/api/admin/auth/login',
  '/api/admin/auth/forgot-password',
  '/api/admin/auth/reset-password',
  '/api/admin/auth/google/start',
  '/api/admin/auth/google/callback',
])

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

  const isProtectedUserPage =
    pathname === '/profile' ||
    pathname.startsWith('/profile/') ||
    pathname === '/my-payments' ||
    pathname.startsWith('/my-payments/')

  if (isProtectedUserPage && !request.cookies.get('user_session')?.value) {
    const signinUrl = request.nextUrl.clone()
    signinUrl.pathname = '/signin'
    signinUrl.search = ''
    signinUrl.searchParams.set('redirect', pathname)
    return addSecurityHeaders(NextResponse.redirect(signinUrl), requestId)
  }

  if (pathname.startsWith('/api/user/') && !request.cookies.get('user_session')?.value) {
    return addSecurityHeaders(
      NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      ),
      requestId
    )
  }

  if (
    pathname.startsWith('/api/admin/') &&
    !PUBLIC_ADMIN_AUTH_PATHS.has(pathname) &&
    !request.cookies.get('admin_session')?.value
  ) {
    return addSecurityHeaders(
      NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      ),
      requestId
    )
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

export const middleware = proxy

export const config = {
  matcher: [
    '/api/:path*',
    '/admin',
    '/admin/:path*',
    '/profile',
    '/profile/:path*',
    '/my-payments',
    '/my-payments/:path*',
  ],
}
