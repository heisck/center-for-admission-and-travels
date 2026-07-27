import { beforeEach, describe, expect, it, vi } from 'vitest'
import { NextRequest } from 'next/server'

const paystackVerifyMock = vi.fn()
const getUserFromSessionTokenMock = vi.fn()
const paymentFindFirstMock = vi.fn()
const paymentUpdateManyMock = vi.fn()
const paymentFindUniqueMock = vi.fn()
const sendEmailMock = vi.fn()

vi.mock('@paystack/paystack-sdk', () => ({
  default: class MockPaystack {
    transaction = { verify: paystackVerifyMock }
  },
}))
vi.mock('@/lib/user-auth', () => ({
  getUserFromSessionToken: getUserFromSessionTokenMock,
  getUserSessionCookieName: vi.fn(() => 'user_session'),
}))
vi.mock('@/lib/rate-limit', () => ({
  checkRateLimit: vi.fn(async () => ({ allowed: true, retryAfterMs: 0 })),
  rateLimitResponse: vi.fn(() => new Response(null, { status: 429 })),
}))
vi.mock('@/lib/prisma', () => ({
  prisma: {
    payment: {
      findFirst: paymentFindFirstMock,
      updateMany: paymentUpdateManyMock,
      findUnique: paymentFindUniqueMock,
    },
  },
}))
vi.mock('@/lib/email', () => ({ sendEmail: sendEmailMock }))
vi.mock('@/lib/email-templates', () => ({
  paymentConfirmationEmail: vi.fn(() => ({ subject: 'Paid', html: '<p>Paid</p>' })),
}))
vi.mock('@/lib/support-contact', () => ({
  getSupportContact: vi.fn(async () => ({ email: 'support@example.com' })),
}))

describe('GET /api/payment/verify', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    process.env.PAYSTACK_SECRET_KEY = 'sk_test_dummy'
    getUserFromSessionTokenMock.mockResolvedValue({
      id: 'user-1',
      email: 'customer@example.com',
    })
    paymentFindFirstMock.mockResolvedValue({
      id: 'payment-1',
      reference: 'CAT_reference',
      amount: 125,
      amountMinor: 12500,
      currency: 'GHS',
      status: 'pending',
      customerEmail: 'customer@example.com',
      customerName: 'Customer',
      metadata: { itemName: 'Passport Express' },
    })
    paymentFindUniqueMock.mockResolvedValue({
      reference: 'CAT_reference',
      amount: 125,
      currency: 'GHS',
      customerEmail: 'customer@example.com',
      customerName: 'Customer',
      metadata: { itemName: 'Passport Express' },
    })
    sendEmailMock.mockResolvedValue(undefined)
  })

  it('fails verification when Paystack amount or currency differs', async () => {
    paystackVerifyMock.mockResolvedValue({
      status: true,
      data: {
        status: 'success',
        amount: 10000,
        currency: 'GHS',
        paid_at: '2026-07-27T00:00:00.000Z',
      },
    })
    paymentUpdateManyMock.mockResolvedValue({ count: 1 })

    const { GET } = await import('@/app/api/payment/verify/route')
    const response = await GET(
      new NextRequest('http://localhost:3000/api/payment/verify?reference=CAT_reference', {
        headers: { cookie: 'user_session=session-token' },
      })
    )
    const payload = await response.json()

    expect(response.status).toBe(200)
    expect(payload.data.status).toBe('failed')
    expect(payload.data.message).toMatch(/amount or currency mismatch/i)
    expect(paymentUpdateManyMock).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ status: 'failed' }) })
    )
    expect(sendEmailMock).not.toHaveBeenCalled()
  })

  it('sends one confirmation only when this request changes the payment to success', async () => {
    paystackVerifyMock.mockResolvedValue({
      status: true,
      data: {
        status: 'success',
        amount: 12500,
        currency: 'GHS',
        paid_at: '2026-07-27T00:00:00.000Z',
      },
    })
    paymentUpdateManyMock.mockResolvedValue({ count: 1 })

    const { GET } = await import('@/app/api/payment/verify/route')
    const response = await GET(
      new NextRequest('http://localhost:3000/api/payment/verify?reference=CAT_reference', {
        headers: { cookie: 'user_session=session-token' },
      })
    )

    expect(response.status).toBe(200)
    expect(sendEmailMock).toHaveBeenCalledTimes(1)

    vi.clearAllMocks()
    getUserFromSessionTokenMock.mockResolvedValue({ id: 'user-1', email: 'customer@example.com' })
    paymentFindFirstMock.mockResolvedValue({
      id: 'payment-1',
      reference: 'CAT_reference',
      amount: 125,
      amountMinor: 12500,
      currency: 'GHS',
      status: 'success',
      customerEmail: 'customer@example.com',
      customerName: 'Customer',
      metadata: { itemName: 'Passport Express' },
    })
    paystackVerifyMock.mockResolvedValue({
      status: true,
      data: { status: 'success', amount: 12500, currency: 'GHS' },
    })
    paymentUpdateManyMock.mockResolvedValue({ count: 0 })
    paymentFindUniqueMock.mockResolvedValue({
      reference: 'CAT_reference',
      amount: 125,
      currency: 'GHS',
      customerEmail: 'customer@example.com',
      customerName: 'Customer',
      metadata: { itemName: 'Passport Express' },
    })

    const repeatedResponse = await GET(
      new NextRequest('http://localhost:3000/api/payment/verify?reference=CAT_reference', {
        headers: { cookie: 'user_session=session-token' },
      })
    )

    expect(repeatedResponse.status).toBe(200)
    expect(sendEmailMock).not.toHaveBeenCalled()
  })
})
