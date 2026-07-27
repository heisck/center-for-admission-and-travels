import crypto from 'crypto'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { NextRequest } from 'next/server'

const paymentFindUniqueMock = vi.fn()
const paymentUpdateManyMock = vi.fn()
const sendEmailMock = vi.fn()

vi.mock('@/lib/prisma', () => ({
  prisma: {
    payment: {
      findUnique: paymentFindUniqueMock,
      updateMany: paymentUpdateManyMock,
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

function signedRequest(payload: unknown) {
  const rawBody = JSON.stringify(payload)
  const signature = crypto
    .createHmac('sha512', process.env.PAYSTACK_SECRET_KEY || '')
    .update(rawBody)
    .digest('hex')

  return new NextRequest('http://localhost:3000/api/payment/webhook', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-paystack-signature': signature,
    },
    body: rawBody,
  })
}

describe('POST /api/payment/webhook', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    process.env.PAYSTACK_SECRET_KEY = 'sk_test_dummy'
    delete process.env.PAYSTACK_WEBHOOK_IP_ALLOWLIST
    sendEmailMock.mockResolvedValue(undefined)
  })

  it('rejects a successful event when amount or currency does not match', async () => {
    paymentFindUniqueMock
      .mockResolvedValueOnce({
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
      .mockResolvedValueOnce({
        reference: 'CAT_reference',
        amount: 125,
        currency: 'GHS',
        customerEmail: 'customer@example.com',
        customerName: 'Customer',
        metadata: { itemName: 'Passport Express' },
      })
    paymentUpdateManyMock.mockResolvedValue({ count: 1 })

    const { POST } = await import('@/app/api/payment/webhook/route')
    const response = await POST(
      signedRequest({
        event: 'charge.success',
        data: { reference: 'CAT_reference', amount: 12500, currency: 'USD' },
      })
    )

    expect(response.status).toBe(200)
    expect(paymentUpdateManyMock).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ status: 'failed' }) })
    )
    expect(sendEmailMock).not.toHaveBeenCalled()
  })

  it('does not send a duplicate confirmation when a success was already processed', async () => {
    paymentFindUniqueMock.mockResolvedValue({
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
    paymentUpdateManyMock.mockResolvedValue({ count: 0 })

    const { POST } = await import('@/app/api/payment/webhook/route')
    const response = await POST(
      signedRequest({
        event: 'charge.success',
        data: { reference: 'CAT_reference', amount: 12500, currency: 'GHS' },
      })
    )

    expect(response.status).toBe(200)
    expect((await response.json()).message).toMatch(/already processed/i)
    expect(sendEmailMock).not.toHaveBeenCalled()
  })
})
