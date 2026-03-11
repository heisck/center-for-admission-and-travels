import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { NextRequest } from 'next/server'

const getUserFromSessionTokenMock = vi.fn()
const getUserSessionCookieNameMock = vi.fn()
const checkRateLimitMock = vi.fn()
const rateLimitResponseMock = vi.fn()
const paystackInitializeMock = vi.fn()

vi.mock('@paystack/paystack-sdk', () => ({
  default: class MockPaystack {
    transaction = {
      initialize: paystackInitializeMock,
    }
  },
}))

vi.mock('@/lib/user-auth', () => ({
  getUserFromSessionToken: getUserFromSessionTokenMock,
  getUserSessionCookieName: getUserSessionCookieNameMock,
}))

vi.mock('@/lib/rate-limit', () => ({
  checkRateLimit: checkRateLimitMock,
  rateLimitResponse: rateLimitResponseMock,
}))

vi.mock('@/lib/url', () => ({
  getBaseUrl: vi.fn(() => 'http://localhost:3000'),
}))

vi.mock('@/lib/prisma', () => ({
  prisma: {
    package: { findUnique: vi.fn() },
    travelToursFeaturedPackage: { findUnique: vi.fn() },
    payment: { create: vi.fn() },
  },
}))

describe('POST /api/payment/initialize', () => {
  const originalPaystackSecret = process.env.PAYSTACK_SECRET_KEY

  beforeEach(() => {
    checkRateLimitMock.mockResolvedValue({ allowed: true, retryAfterMs: 0 })
    rateLimitResponseMock.mockReturnValue(
      new Response(JSON.stringify({ success: false, error: 'Too many requests' }), { status: 429 })
    )
    getUserSessionCookieNameMock.mockReturnValue('user_session')
    getUserFromSessionTokenMock.mockReset()
    paystackInitializeMock.mockReset()
  })

  afterEach(() => {
    if (originalPaystackSecret === undefined) {
      delete process.env.PAYSTACK_SECRET_KEY
    } else {
      process.env.PAYSTACK_SECRET_KEY = originalPaystackSecret
    }
  })

  it('returns 503 when payment service is not configured', async () => {
    delete process.env.PAYSTACK_SECRET_KEY
    const { POST } = await import('@/app/api/payment/initialize/route')

    const request = new NextRequest('http://localhost:3000/api/payment/initialize', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({}),
    })

    const response = await POST(request)
    const payload = await response.json()

    expect(response.status).toBe(503)
    expect(payload.success).toBe(false)
    expect(payload.error).toMatch(/not configured/i)
  })

  it('returns 401 when user is not authenticated', async () => {
    process.env.PAYSTACK_SECRET_KEY = 'sk_test_dummy'
    getUserFromSessionTokenMock.mockResolvedValue(null)
    const { POST } = await import('@/app/api/payment/initialize/route')

    const request = new NextRequest('http://localhost:3000/api/payment/initialize', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        email: 'customer@example.com',
        name: 'Customer',
        amount: 100,
      }),
    })

    const response = await POST(request)
    const payload = await response.json()

    expect(response.status).toBe(401)
    expect(payload.success).toBe(false)
    expect(payload.error).toMatch(/must be signed in/i)
  })
})
