import { NextRequest, NextResponse } from 'next/server'
import Paystack from '@paystack/paystack-sdk'

import { verifyAdminSession } from '@/lib/auth-helpers'
import { hasAdminPermission } from '@/lib/admin-permissions'
import { logAdminAudit } from '@/lib/admin-audit'
import { prisma } from '@/lib/prisma'
import { checkRateLimit, rateLimitResponse } from '@/lib/rate-limit'
import { getClientIp } from '@/lib/security'
import { sendEmail } from '@/lib/email'
import { paymentConfirmationEmail } from '@/lib/email-templates'
import { getSupportContact } from '@/lib/support-contact'

type PaystackStatus = 'pending' | 'processing' | 'success' | 'failed' | 'cancelled'

function mapPaystackStatus(status: unknown): PaystackStatus {
  if (status === 'success') return 'success'
  if (status === 'failed') return 'failed'
  if (status === 'abandoned') return 'cancelled'
  return 'processing'
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const ip = getClientIp(request)

  try {
    const session = await verifyAdminSession(request)
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }
    if (!hasAdminPermission(session.role, 'payments.manage')) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })
    }

    const { allowed, retryAfterMs } = await checkRateLimit(`admin-payment-recheck:${session.userId}:${ip}`, {
      maxRequests: 20,
      windowMs: 60_000,
    })
    if (!allowed) return rateLimitResponse(retryAfterMs)

    const paystackSecret = process.env.PAYSTACK_SECRET_KEY
    if (!paystackSecret) {
      return NextResponse.json(
        { success: false, error: 'Payment service is not configured' },
        { status: 503 }
      )
    }

    const { id } = await params
    const payment = await prisma.payment.findUnique({
      where: { id },
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

    if (!payment) {
      return NextResponse.json({ success: false, error: 'Payment not found' }, { status: 404 })
    }

    const paystack = new Paystack(paystackSecret)
    const verifyResponse = await paystack.transaction.verify({ reference: payment.reference })

    if (!verifyResponse.status || !verifyResponse.data) {
      return NextResponse.json(
        { success: false, error: 'Paystack could not verify this payment yet' },
        { status: 502 }
      )
    }

    const paymentData = verifyResponse.data
    let nextStatus = mapPaystackStatus(paymentData.status)

    const paidAmountMinor = Number(paymentData.amount || 0)
    const expectedAmountMinor = payment.amountMinor || Math.round(Number(payment.amount) * 100)
    const paidCurrency = String(paymentData.currency || '').toUpperCase()
    const expectedCurrency = payment.currency.toUpperCase()
    const amountAndCurrencyMatch = paidAmountMinor === expectedAmountMinor && paidCurrency === expectedCurrency

    if (!amountAndCurrencyMatch) {
      nextStatus = 'failed'
    }

    if (payment.status === 'success' && nextStatus !== 'success') {
      nextStatus = 'success'
    }

    const updateResult = await prisma.payment.updateMany({
      where: {
        id: payment.id,
        status: { not: 'success' },
      },
      data: {
        status: nextStatus,
        paystackData: paymentData as any,
        updatedAt: new Date(),
      },
    })

    const updatedPayment = await prisma.payment.findUnique({
      where: { id: payment.id },
      include: {
        user: { select: { id: true, username: true, email: true, displayName: true } },
      },
    })

    if (!updatedPayment) {
      return NextResponse.json({ success: false, error: 'Payment not found after recheck' }, { status: 404 })
    }

    if (nextStatus === 'success' && updateResult.count === 1 && updatedPayment.customerEmail) {
      const supportContact = await getSupportContact()
      const template = paymentConfirmationEmail(
        {
          name: updatedPayment.customerName || 'Customer',
          reference: updatedPayment.reference,
          amount: Number(updatedPayment.amount),
          currency: updatedPayment.currency,
          packageName: (updatedPayment.metadata as any)?.packageName || 'Booking',
        },
        supportContact
      )
      sendEmail({ to: updatedPayment.customerEmail, ...template }).catch((error) => {
        console.error('[Admin Payment Recheck] Failed to send payment confirmation email:', error)
      })
    }

    await logAdminAudit({
      request,
      session,
      action: 'payment.recheck',
      entityType: 'payment',
      entityId: payment.id,
      metadata: {
        reference: payment.reference,
        statusBefore: payment.status,
        statusAfter: nextStatus,
        amountAndCurrencyMatch,
        paystackStatus: paymentData.status,
      },
    })

    return NextResponse.json({
      success: true,
      data: { ...updatedPayment, amount: Number(updatedPayment.amount) },
      message: amountAndCurrencyMatch
        ? 'Payment status refreshed from Paystack.'
        : 'Paystack amount or currency did not match the expected payment.',
    })
  } catch (error) {
    console.error('[Admin Payment Recheck] Error:', error)
    return NextResponse.json({ success: false, error: 'Failed to re-check payment' }, { status: 500 })
  }
}
