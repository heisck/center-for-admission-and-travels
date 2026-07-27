/**
 * API Route: /api/payment/webhook
 *
 * POST: Handle Paystack webhook events
 *
 * This endpoint receives webhook notifications from Paystack
 * when payment status changes.
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendEmail } from '@/lib/email'
import { paymentConfirmationEmail } from '@/lib/email-templates'
import { getSupportContact } from '@/lib/support-contact'
import { getClientIp } from '@/lib/security'
import crypto from 'crypto'

function isValidSignature(rawBody: string, signature: string, secret: string) {
  const normalizedSignature = signature.trim().toLowerCase()
  if (!/^[a-f0-9]{128}$/.test(normalizedSignature)) return false

  const expectedSignature = crypto
    .createHmac('sha512', secret)
    .update(rawBody)
    .digest('hex')

  if (normalizedSignature.length !== expectedSignature.length) return false

  return crypto.timingSafeEqual(
    Buffer.from(normalizedSignature, 'hex'),
    Buffer.from(expectedSignature, 'hex')
  )
}

function getWebhookIpAllowlist() {
  return String(process.env.PAYSTACK_WEBHOOK_IP_ALLOWLIST || '')
    .split(/[,\s]+/)
    .map((ip) => ip.trim())
    .filter(Boolean)
}

function isWebhookIpAllowed(request: NextRequest) {
  const allowlist = getWebhookIpAllowlist()
  if (allowlist.length === 0) return true

  const forwardedFor = request.headers.get('x-forwarded-for') || ''
  const forwardedIps = forwardedFor
    .split(',')
    .map((ip) => ip.trim())
    .filter(Boolean)
  const clientIp = forwardedIps[0] || getClientIp(request)

  return allowlist.includes(clientIp)
}

export async function POST(request: NextRequest) {
  try {
    const paystackSecret = process.env.PAYSTACK_SECRET_KEY
    if (!paystackSecret) {
      return NextResponse.json(
        { success: false, error: 'Webhook secret is not configured' },
        { status: 503 }
      )
    }

    if (!isWebhookIpAllowed(request)) {
      return NextResponse.json(
        { success: false, error: 'Webhook IP is not allowed' },
        { status: 403 }
      )
    }

    const rawBody = await request.text()
    if (Buffer.byteLength(rawBody, 'utf8') > 1_000_000) {
      return NextResponse.json(
        { success: false, error: 'Webhook payload is too large' },
        { status: 413 }
      )
    }
    const signature = request.headers.get('x-paystack-signature') || ''

    if (!signature || !isValidSignature(rawBody, signature, paystackSecret)) {
      return NextResponse.json(
        { success: false, error: 'Invalid signature' },
        { status: 401 }
      )
    }

    let body: any
    try {
      body = JSON.parse(rawBody)
    } catch {
      return NextResponse.json(
        { success: false, error: 'Invalid webhook payload' },
        { status: 400 }
      )
    }
    const { event, data } = body
    const reference = String(data?.reference || '').trim()

    if (!reference || !/^[A-Za-z0-9_-]{1,128}$/.test(reference)) {
      return NextResponse.json(
        { success: false, error: 'Missing or invalid payment reference' },
        { status: 400 }
      )
    }

    const payment = await prisma.payment.findUnique({
      where: { reference },
      select: {
        id: true,
        reference: true,
        amount: true,
        amountMinor: true,
        currency: true,
        status: true,
        customerEmail: true,
        customerName: true,
        metadata: true,
      },
    })

    // Unknown references should not cause retries.
    if (!payment) {
      return NextResponse.json({ success: true, message: 'Reference not found; ignored' })
    }

    let nextStatus: 'pending' | 'processing' | 'success' | 'failed' | 'cancelled' | null = null

    switch (event) {
      case 'charge.success': {
        const paidAmountKobo = Number(data?.amount || 0)
        const expectedAmountKobo = payment.amountMinor || Math.round(Number(payment.amount) * 100)
        const paidCurrency = String(data?.currency || '').toUpperCase()
        const expectedCurrency = payment.currency.toUpperCase()
        const amountAndCurrencyMatch =
          paidAmountKobo === expectedAmountKobo && paidCurrency === expectedCurrency

        nextStatus = amountAndCurrencyMatch ? 'success' : 'failed'
        break
      }
      case 'charge.failed':
        nextStatus = 'failed'
        break
      case 'charge.abandoned':
        nextStatus = 'cancelled'
        break
      case 'transfer.success':
      case 'transfer.failed':
      case 'transfer.reversed':
        // Transfer events are not used for package checkout state.
        nextStatus = null
        break
      default:
        nextStatus = null
    }

    if (!nextStatus) {
      return NextResponse.json({ success: true, message: `Unhandled event: ${event}` })
    }

    // Never downgrade a successful payment due to later noisy events.
    if (payment.status === 'success' && nextStatus !== 'success') {
      return NextResponse.json({ success: true, message: 'Payment already marked successful' })
    }

    const updateResult = await prisma.payment.updateMany({
      where: {
        id: payment.id,
        status: { not: 'success' },
      },
      data: {
        status: nextStatus,
        paystackData: data as any,
        updatedAt: new Date(),
      },
    })

    if (updateResult.count === 0) {
      return NextResponse.json({ success: true, message: 'Payment already processed' })
    }

    const updatedPayment = await prisma.payment.findUnique({
      where: { id: payment.id },
      select: {
        reference: true,
        amount: true,
        currency: true,
        customerEmail: true,
        customerName: true,
        metadata: true,
      },
    })

    if (!updatedPayment) {
      return NextResponse.json({ success: true, message: 'Payment disappeared after update; ignored' })
    }

    if (
      nextStatus === 'success' &&
      updatedPayment.customerEmail
    ) {
      const supportContact = await getSupportContact()
      const template = paymentConfirmationEmail(
        {
          name: updatedPayment.customerName || 'Customer',
          reference: updatedPayment.reference,
          amount: Number(updatedPayment.amount),
          currency: updatedPayment.currency,
          itemName:
            (updatedPayment.metadata as any)?.itemName ||
            (updatedPayment.metadata as any)?.packageName ||
            'Booking',
        },
        supportContact
      )
      sendEmail({ to: updatedPayment.customerEmail, ...template }).catch((error) => {
        console.error('[Webhook] Failed to send payment confirmation email:', error)
      })
    }

    return NextResponse.json({ success: true, message: 'Webhook processed' })
  } catch (error) {
    console.error('Error processing webhook:', error)
    return NextResponse.json(
      { success: false, error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}
