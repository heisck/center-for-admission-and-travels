import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { NextRequest } from 'next/server'

const getUserFromSessionTokenMock = vi.fn()
const getUserSessionCookieNameMock = vi.fn()
const checkRateLimitMock = vi.fn()
const rateLimitResponseMock = vi.fn()
const paystackInitializeMock = vi.fn()
const packageFindUniqueMock = vi.fn()
const featuredPackageFindUniqueMock = vi.fn()
const servicePlanFindFirstMock = vi.fn()
const paymentFindFirstMock = vi.fn()
const paymentCreateMock = vi.fn()

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
    package: { findUnique: packageFindUniqueMock },
    travelToursFeaturedPackage: { findUnique: featuredPackageFindUniqueMock },
    professionalServicePlan: { findFirst: servicePlanFindFirstMock },
    payment: {
      findFirst: paymentFindFirstMock,
      create: paymentCreateMock,
    },
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
    packageFindUniqueMock.mockReset()
    featuredPackageFindUniqueMock.mockReset()
    servicePlanFindFirstMock.mockReset()
    paymentFindFirstMock.mockReset()
    paymentCreateMock.mockReset()
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

  it('resolves a professional service plan on the server and stores service metadata', async () => {
    process.env.PAYSTACK_SECRET_KEY = 'sk_test_dummy'
    getUserFromSessionTokenMock.mockResolvedValue({
      id: 'user-1',
      email: 'customer@example.com',
      username: 'customer',
      displayName: 'Customer',
    })
    servicePlanFindFirstMock.mockResolvedValue({
      id: 'plan-1',
      name: 'Express',
      price: 125,
      currency: 'GHS',
      duration: '3 working days',
      service: {
        id: 'service-1',
        name: 'Passport Assistance',
      },
    })
    paymentFindFirstMock.mockResolvedValue(null)
    paystackInitializeMock.mockResolvedValue({
      status: true,
      data: {
        authorization_url: 'https://paystack.example/checkout',
        access_code: 'access-code',
      },
    })
    paymentCreateMock.mockResolvedValue({ id: 'payment-1' })

    const { POST } = await import('@/app/api/payment/initialize/route')
    const request = new NextRequest('http://localhost:3000/api/payment/initialize', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        cookie: 'user_session=session-token',
      },
      body: JSON.stringify({
        servicePlanId: 'plan-1',
        email: 'customer@example.com',
        name: 'Customer',
        phone: '0241234567',
        paymentMethod: 'card',
      }),
    })

    const response = await POST(request)
    const payload = await response.json()

    expect(response.status).toBe(200)
    expect(payload.success).toBe(true)
    expect(packageFindUniqueMock).not.toHaveBeenCalled()
    expect(paystackInitializeMock).toHaveBeenCalledWith(
      expect.objectContaining({
        amount: 12500,
        currency: 'GHS',
        metadata: expect.objectContaining({
          itemType: 'service_plan',
          itemName: 'Passport Assistance — Express',
          serviceId: 'service-1',
          servicePlanId: 'plan-1',
          planName: 'Express',
        }),
      })
    )
    expect(paymentCreateMock).toHaveBeenCalledWith({
      data: expect.objectContaining({
        amount: 125,
        packageId: 'plan-1',
        metadata: expect.objectContaining({
          itemType: 'service_plan',
          itemName: 'Passport Assistance — Express',
          serviceName: 'Passport Assistance',
          planName: 'Express',
        }),
      }),
    })
  })
})
