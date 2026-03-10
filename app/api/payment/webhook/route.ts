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

export async function POST(request: NextRequest) {
  try {
    const paystackSecret = process.env.PAYSTACK_SECRET_KEY
    if (!paystackSecret) {
      return NextResponse.json(
        { success: false, error: 'Webhook secret is not configured' },
        { status: 503 }
      )
    }

    const rawBody = await request.text()
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

    if (!reference) {
      return NextResponse.json(
        { success: false, error: 'Missing payment reference' },
        { status: 400 }
      )
    }

    const payment = await prisma.payment.findUnique({
      where: { reference },
      select: {
        id: true,
        reference: true,
        amount: true,
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
        const expectedAmountKobo = Math.round(payment.amount * 100)
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

    const previousStatus = payment.status
    const updatedPayment = await prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: nextStatus,
        paystackData: data as any,
        updatedAt: new Date(),
      },
      select: {
        reference: true,
        amount: true,
        currency: true,
        customerEmail: true,
        customerName: true,
        metadata: true,
      },
    })

    if (
      nextStatus === 'success' &&
      previousStatus !== 'success' &&
      updatedPayment.customerEmail
    ) {
      const supportContact = await getSupportContact()
      const template = paymentConfirmationEmail(
        {
          name: updatedPayment.customerName || 'Customer',
          reference: updatedPayment.reference,
          amount: updatedPayment.amount,
          currency: updatedPayment.currency,
          packageName: (updatedPayment.metadata as any)?.packageName || 'Booking',
        },
        supportContact
      )
      sendEmail({ to: updatedPayment.customerEmail, ...template }).catch((error) => {
        console.error('[Webhook] Failed to send payment confirmation email:', error)
      })
    }

    return NextResponse.json({ success: true, message: 'Webhook processed' })
  } catch (error: any) {
    console.error('Error processing webhook:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Webhook processing failed' },
      { status: 500 }
    )
  }
}
