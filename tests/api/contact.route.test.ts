import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { NextRequest } from 'next/server'

const checkRateLimitMock = vi.fn()
const rateLimitResponseMock = vi.fn()
const contactMessageCreateMock = vi.fn()
const sendEmailMock = vi.fn()
const getFreshSupportContactMock = vi.fn()

vi.mock('@/lib/rate-limit', () => ({
  checkRateLimit: checkRateLimitMock,
  rateLimitResponse: rateLimitResponseMock,
}))

vi.mock('@/lib/prisma', () => ({
  prisma: {
    contactMessage: {
      create: contactMessageCreateMock,
    },
  },
}))

vi.mock('@/lib/email', () => ({
  sendEmail: sendEmailMock,
}))

vi.mock('@/lib/support-contact', () => ({
  getFreshSupportContact: getFreshSupportContactMock,
}))

describe('POST /api/contact', () => {
  const originalSmtpFrom = process.env.SMTP_FROM

  beforeEach(() => {
    checkRateLimitMock.mockResolvedValue({ allowed: true, retryAfterMs: 0 })
    rateLimitResponseMock.mockReturnValue(
      new Response(JSON.stringify({ success: false, error: 'Too many requests' }), { status: 429 })
    )
    contactMessageCreateMock.mockResolvedValue({ id: 'contact-message-1' })
    sendEmailMock.mockResolvedValue(true)
    getFreshSupportContactMock.mockResolvedValue({
      email: 'contact@centerforadmissionandtravels.com',
      phone: '+233 248 422 663',
      whatsappNumber: '+233248422663',
    })
    process.env.SMTP_FROM = 'auth-mailbox@example.com'
  })

  afterEach(() => {
    if (originalSmtpFrom === undefined) {
      delete process.env.SMTP_FROM
    } else {
      process.env.SMTP_FROM = originalSmtpFrom
    }
  })

  it('sends contact notifications to the admin-managed public contact email', async () => {
    const { POST } = await import('@/app/api/contact/route')

    const request = new NextRequest('http://localhost:3000/api/contact', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        name: 'Ama Visitor',
        email: 'ama@example.com',
        phone: '+233 555 0101',
        subject: 'Study abroad help',
        message: 'I would like to talk about admission options.',
      }),
    })

    const response = await POST(request)
    const payload = await response.json()

    expect(response.status).toBe(200)
    expect(payload.success).toBe(true)
    expect(contactMessageCreateMock).toHaveBeenCalledWith({
      data: {
        name: 'Ama Visitor',
        email: 'ama@example.com',
        phone: '+233 555 0101',
        subject: 'Study abroad help',
        message: 'I would like to talk about admission options.',
      },
    })
    expect(sendEmailMock).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'contact@centerforadmissionandtravels.com',
        replyTo: 'ama@example.com',
        subject: 'New Contact: Study abroad help',
      })
    )
    expect(sendEmailMock).not.toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'auth-mailbox@example.com',
      })
    )
  })
})
