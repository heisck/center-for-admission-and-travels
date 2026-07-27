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
const paymentFindUniqueMock = vi.fn()
const paymentCreateMock = vi.fn()
const paymentUpdateMock = vi.fn()

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
      findUnique: paymentFindUniqueMock,
      create: paymentCreateMock,
      update: paymentUpdateMock,
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
    paymentFindUniqueMock.mockReset()
    paymentCreateMock.mockReset()
    paymentUpdateMock.mockReset()
    paymentUpdateMock.mockResolvedValue({})
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
        idempotencyKey: 'checkout-test-0001',
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
    paymentCreateMock.mockResolvedValue({ id: 'payment-1', reference: 'CAT_test_reference' })

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
        idempotencyKey: 'checkout-test-0001',
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
        amountMinor: 12500,
        checkoutId: 'checkout-test-0001',
        status: 'processing',
        packageId: 'plan-1',
        metadata: expect.objectContaining({
          itemType: 'service_plan',
          itemName: 'Passport Assistance — Express',
          serviceName: 'Passport Assistance',
          planName: 'Express',
        }),
      }),
      select: { id: true, reference: true },
    })
    expect(paymentUpdateMock).toHaveBeenCalledWith({
      where: { id: 'payment-1' },
      data: {
        status: 'pending',
        paystackData: {
          authorization_url: 'https://paystack.example/checkout',
          access_code: 'access-code',
        },
      },
    })
  })

  it('requires a client payment-attempt idempotency key', async () => {
    process.env.PAYSTACK_SECRET_KEY = 'sk_test_dummy'
    getUserFromSessionTokenMock.mockResolvedValue({
      id: 'user-1',
      email: 'customer@example.com',
      username: 'customer',
      displayName: 'Customer',
    })

    const { POST } = await import('@/app/api/payment/initialize/route')
    const response = await POST(
      new NextRequest('http://localhost:3000/api/payment/initialize', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          cookie: 'user_session=session-token',
        },
        body: JSON.stringify({
          packageId: 'package-1',
          email: 'customer@example.com',
          name: 'Customer',
        }),
      })
    )

    expect(response.status).toBe(400)
    expect((await response.json()).error).toMatch(/payment attempt key/i)
    expect(packageFindUniqueMock).not.toHaveBeenCalled()
    expect(paymentCreateMock).not.toHaveBeenCalled()
  })

  it('reuses the exact existing Paystack checkout after an idempotency race', async () => {
    process.env.PAYSTACK_SECRET_KEY = 'sk_test_dummy'
    getUserFromSessionTokenMock.mockResolvedValue({
      id: 'user-1',
      email: 'customer@example.com',
      username: 'customer',
      displayName: 'Customer',
    })
    packageFindUniqueMock.mockResolvedValue({
      id: 'package-1',
      name: 'Study Tour',
      price: 250,
      currency: 'GHS',
    })
    paymentFindFirstMock.mockResolvedValue(null)
    paymentCreateMock.mockRejectedValue({ code: 'P2002' })
    paymentFindUniqueMock.mockResolvedValue({
      userId: 'user-1',
      packageId: 'package-1',
      paymentMethod: 'card',
      status: 'pending',
      reference: 'CAT_existing',
      amount: 250,
      amountMinor: 25000,
      currency: 'GHS',
      paystackData: {
        authorization_url: 'https://paystack.example/existing',
        access_code: 'existing-access',
      },
    })

    const { POST } = await import('@/app/api/payment/initialize/route')
    const response = await POST(
      new NextRequest('http://localhost:3000/api/payment/initialize', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          cookie: 'user_session=session-token',
        },
        body: JSON.stringify({
          packageId: 'package-1',
          email: 'customer@example.com',
          name: 'Customer',
          paymentMethod: 'card',
          idempotencyKey: 'checkout-test-0002',
        }),
      })
    )
    const payload = await response.json()

    expect(response.status).toBe(200)
    expect(payload.data).toEqual(
      expect.objectContaining({
        authorizationUrl: 'https://paystack.example/existing',
        accessCode: 'existing-access',
        reference: 'CAT_existing',
        reused: true,
      })
    )
    expect(paystackInitializeMock).not.toHaveBeenCalled()
    expect(paymentUpdateMock).not.toHaveBeenCalled()
  })

  it('rejects reuse of an idempotency key for a different checkout', async () => {
    process.env.PAYSTACK_SECRET_KEY = 'sk_test_dummy'
    getUserFromSessionTokenMock.mockResolvedValue({
      id: 'user-1',
      email: 'customer@example.com',
      username: 'customer',
      displayName: 'Customer',
    })
    packageFindUniqueMock.mockResolvedValue({
      id: 'package-1',
      name: 'Study Tour',
      price: 250,
      currency: 'GHS',
    })
    paymentFindFirstMock.mockResolvedValue(null)
    paymentCreateMock.mockRejectedValue({ code: 'P2002' })
    paymentFindUniqueMock.mockResolvedValue({
      userId: 'another-user',
      packageId: 'package-1',
      paymentMethod: 'card',
      status: 'pending',
      reference: 'CAT_existing',
      amount: 250,
      amountMinor: 25000,
      currency: 'GHS',
      paystackData: {},
    })

    const { POST } = await import('@/app/api/payment/initialize/route')
    const response = await POST(
      new NextRequest('http://localhost:3000/api/payment/initialize', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          cookie: 'user_session=session-token',
        },
        body: JSON.stringify({
          packageId: 'package-1',
          email: 'customer@example.com',
          name: 'Customer',
          paymentMethod: 'card',
          idempotencyKey: 'checkout-test-0003',
        }),
      })
    )

    expect(response.status).toBe(409)
    expect((await response.json()).error).toMatch(/already in use/i)
    expect(paystackInitializeMock).not.toHaveBeenCalled()
  })

  it('marks the reserved payment failed when Paystack initialization fails', async () => {
    process.env.PAYSTACK_SECRET_KEY = 'sk_test_dummy'
    getUserFromSessionTokenMock.mockResolvedValue({
      id: 'user-1',
      email: 'customer@example.com',
      username: 'customer',
      displayName: 'Customer',
    })
    packageFindUniqueMock.mockResolvedValue({
      id: 'package-1',
      name: 'Study Tour',
      price: 250,
      currency: 'GHS',
    })
    paymentFindFirstMock.mockResolvedValue(null)
    paymentCreateMock.mockResolvedValue({ id: 'payment-2', reference: 'CAT_failed' })
    paystackInitializeMock.mockRejectedValue(new Error('Paystack unavailable'))

    const { POST } = await import('@/app/api/payment/initialize/route')
    const response = await POST(
      new NextRequest('http://localhost:3000/api/payment/initialize', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          cookie: 'user_session=session-token',
        },
        body: JSON.stringify({
          packageId: 'package-1',
          email: 'customer@example.com',
          name: 'Customer',
          paymentMethod: 'card',
          idempotencyKey: 'checkout-test-0004',
        }),
      })
    )

    expect(response.status).toBe(502)
    expect(paymentUpdateMock).toHaveBeenCalledWith({
      where: { id: 'payment-2' },
      data: {
        status: 'failed',
        paystackData: { initializationError: 'Paystack unavailable' },
      },
    })
  })
})
