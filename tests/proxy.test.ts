import { describe, expect, it } from 'vitest'
import { NextRequest } from 'next/server'
import { proxy, config } from '@/proxy'

describe('proxy middleware security audit', () => {
  it('matcher includes admin routes, user routes, and api routes', () => {
    expect(config.matcher).toContain('/api/:path*')
    expect(config.matcher).toContain('/admin')
    expect(config.matcher).toContain('/admin/:path*')
    expect(config.matcher).toContain('/profile')
    expect(config.matcher).toContain('/profile/:path*')
    expect(config.matcher).toContain('/my-payments')
    expect(config.matcher).toContain('/my-payments/:path*')
  })

  it('redirects unauthenticated user accessing /admin to /admin-login', () => {
    const request = new NextRequest('http://localhost:3000/admin')
    const response = proxy(request)

    expect(response.status).toBe(307)
    expect(response.headers.get('location')).toBe('http://localhost:3000/admin-login')
    expect(response.headers.get('x-frame-options')).toBe('SAMEORIGIN')
    expect(response.headers.get('x-content-type-options')).toBe('nosniff')
  })

  it('redirects unauthenticated user accessing /profile to /signin with redirect param', () => {
    const request = new NextRequest('http://localhost:3000/profile')
    const response = proxy(request)

    expect(response.status).toBe(307)
    expect(response.headers.get('location')).toBe('http://localhost:3000/signin?redirect=%2Fprofile')
  })

  it('redirects unauthenticated user accessing /my-payments to /signin with redirect param', () => {
    const request = new NextRequest('http://localhost:3000/my-payments')
    const response = proxy(request)

    expect(response.status).toBe(307)
    expect(response.headers.get('location')).toBe('http://localhost:3000/signin?redirect=%2Fmy-payments')
  })

  it('blocks unauthenticated requests to /api/user/* with 401', async () => {
    const request = new NextRequest('http://localhost:3000/api/user/profile')
    const response = proxy(request)

    expect(response.status).toBe(401)
    const data = await response.json()
    expect(data.error).toBe('Unauthorized')
  })

  it('blocks unauthenticated requests to protected /api/admin/* with 401', async () => {
    const request = new NextRequest('http://localhost:3000/api/admin/bookings')
    const response = proxy(request)

    expect(response.status).toBe(401)
    const data = await response.json()
    expect(data.error).toBe('Unauthorized')
  })

  it('allows unauthenticated requests to public admin auth routes', () => {
    const loginRequest = new NextRequest('http://localhost:3000/api/admin/auth/login')
    const response = proxy(loginRequest)

    expect(response.status).toBe(200)
  })

  it('allows authenticated admin to access /admin', () => {
    const request = new NextRequest('http://localhost:3000/admin', {
      headers: { cookie: 'admin_session=test-admin-token' },
    })
    const response = proxy(request)

    expect(response.status).toBe(200)
    expect(response.headers.get('cache-control')).toBe('no-store')
  })

  it('blocks cross-site mutating requests when session cookie is present', async () => {
    const request = new NextRequest('http://localhost:3000/api/bookings', {
      method: 'POST',
      headers: {
        cookie: 'user_session=test-user-token',
        origin: 'https://attacker.evil.com',
      },
    })
    const response = proxy(request)

    expect(response.status).toBe(403)
    const data = await response.json()
    expect(data.error).toBe('Cross-site request blocked')
  })

  it('allows same-origin mutating requests when session cookie is present', () => {
    const request = new NextRequest('http://localhost:3000/api/bookings', {
      method: 'POST',
      headers: {
        cookie: 'user_session=test-user-token',
        origin: 'http://localhost:3000',
      },
    })
    const response = proxy(request)

    expect(response.status).toBe(200)
  })
})
