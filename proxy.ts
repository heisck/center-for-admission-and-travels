import { NextRequest, NextResponse } from 'next/server'
import { hasAuthSessionCookie, isSameOriginRequest } from '@/lib/security'

const MUTATING_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE'])

function addSecurityHeaders(response: NextResponse) {
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')

  if (process.env.NODE_ENV === 'production') {
    response.headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload')
  }

  return response
}

export function proxy(request: NextRequest) {
  const isMutation = MUTATING_METHODS.has(request.method.toUpperCase())
  const hasSession = hasAuthSessionCookie(request)

  if (isMutation && hasSession && !isSameOriginRequest(request)) {
    return addSecurityHeaders(
      NextResponse.json(
        { success: false, error: 'Cross-site request blocked' },
        { status: 403 }
      )
    )
  }

  const response = NextResponse.next()
  if (hasSession) {
    response.headers.set('Cache-Control', 'no-store')
    response.headers.set('Vary', 'Cookie, Origin')
  }
  return addSecurityHeaders(response)
}

export const config = {
  matcher: ['/api/:path*'],
}
