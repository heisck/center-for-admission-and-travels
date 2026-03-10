/**
 * API Route: /api/payment/verify
 * 
 * GET: Verify a payment status using Paystack reference
 * 
 * Query params:
 *   reference: string (Paystack payment reference)
 */

import { NextRequest, NextResponse } from 'next/server'
import Paystack from '@paystack/paystack-sdk'
import { prisma } from '@/lib/prisma'
import { sendEmail } from '@/lib/email'
import { paymentConfirmationEmail } from '@/lib/email-templates'
import { getSupportContact } from '@/lib/support-contact'
import { getUserFromSessionToken, getUserSessionCookieName } from '@/lib/user-auth'
import { checkRateLimit, rateLimitResponse } from '@/lib/rate-limit'
import { getClientIp } from '@/lib/security'

export async function GET(request: NextRequest) {
  const ip = getClientIp(request)
  try {
    const paystackSecret = process.env.PAYSTACK_SECRET_KEY
    if (!paystackSecret) {
      return NextResponse.json(
        { success: false, error: 'Payment service is not configured' },
        { status: 503 }
      )
    }

    const sessionToken = request.cookies.get(getUserSessionCookieName())?.value
    const user = sessionToken ? await getUserFromSessionToken(sessionToken) : null
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'You must be signed in to verify payments' },
        { status: 401 }
      )
    }

    const { allowed, retryAfterMs } = await checkRateLimit(`pay-verify:${user.id}:${ip}`, {
      maxRequests: 20,
      windowMs: 60_000,
    })
    if (!allowed) return rateLimitResponse(retryAfterMs)

    const paystack = new Paystack(paystackSecret)

    const { searchParams } = new URL(request.url)
    const reference = (searchParams.get('reference') || '').trim().slice(0, 128)

    if (!reference) {
      return NextResponse.json(
        { success: false, error: 'Payment reference is required' },
        { status: 400 }
      )
    }
    if (!/^[A-Za-z0-9_\-]+$/.test(reference)) {
      return NextResponse.json(
        { success: false, error: 'Invalid payment reference format' },
        { status: 400 }
      )
    }

    const payment = await prisma.payment.findFirst({
      where: {
        reference,
        userId: user.id,
      },
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

    if (!payment) {
      return NextResponse.json(
        { success: false, error: 'Payment not found for this account' },
        { status: 404 }
      )
    }

    // Verify payment with Paystack
    const response = await paystack.transaction.verify({ reference })

    if (!response.status || !response.data) {
      return NextResponse.json(
        { success: false, error: 'Failed to verify payment' },
        { status: 500 }
      )
    }

    const paymentData = response.data

    // Determine payment status
    let status: 'pending' | 'processing' | 'success' | 'failed' | 'cancelled' = 'pending'
    if (paymentData.status === 'success') {
      status = 'success'
    } else if (paymentData.status === 'failed') {
      status = 'failed'
    } else if (paymentData.status === 'abandoned') {
      status = 'cancelled'
    } else {
      status = 'processing'
    }

    const paidAmountKobo = Number(paymentData.amount || 0)
    const expectedAmountKobo = Math.round(payment.amount * 100)
    const verifiedCurrency = String(paymentData.currency || '').toUpperCase()
    const expectedCurrency = payment.currency.toUpperCase()
    const amountAndCurrencyMatch = paidAmountKobo === expectedAmountKobo && verifiedCurrency === expectedCurrency

    if (!amountAndCurrencyMatch) {
      status = 'failed'
    }

    const previousStatus = payment.status
    if (previousStatus === 'success' && status !== 'success') {
      status = 'success'
    }

    const updatedPayment = await prisma.payment.update({
      where: { id: payment.id },
      data: {
        status,
        paystackData: paymentData as any,
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

    // Send payment confirmation email on success (non-blocking)
    if (status === 'success' && previousStatus !== 'success' && updatedPayment.customerEmail) {
      const supportContact = await getSupportContact()
      const template = paymentConfirmationEmail({
        name: updatedPayment.customerName || 'Customer',
        reference: updatedPayment.reference,
        amount: updatedPayment.amount,
        currency: updatedPayment.currency,
        packageName: (updatedPayment.metadata as any)?.packageName || 'Booking',
      }, supportContact)
      sendEmail({ to: updatedPayment.customerEmail, ...template }).catch(() => {})
    }

    const responseMessage = !amountAndCurrencyMatch && status === 'failed'
      ? 'Payment verification failed: amount or currency mismatch'
      : undefined

    return NextResponse.json({
      success: true,
      data: {
        status,
        reference: updatedPayment.reference,
        amount: updatedPayment.amount,
        currency: updatedPayment.currency,
        paidAt: paymentData.paid_at,
        message: responseMessage,
      },
    })
  } catch (error) {
    console.error('Error verifying payment:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to verify payment' },
      { status: 500 }
    )
  }
}

