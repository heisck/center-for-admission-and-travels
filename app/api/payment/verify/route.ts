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

const paystack = new Paystack(process.env.PAYSTACK_SECRET_KEY || '')

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const reference = searchParams.get('reference')

    if (!reference) {
      return NextResponse.json(
        { success: false, error: 'Payment reference is required' },
        { status: 400 }
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

    // Update payment record in database
    const payment = await prisma.payment.update({
      where: { reference },
      data: {
        status,
        paystackData: paymentData as any,
        updatedAt: new Date(),
      },
    })

    // Send payment confirmation email on success (non-blocking)
    if (status === 'success' && payment.customerEmail) {
      const supportContact = await getSupportContact()
      const template = paymentConfirmationEmail({
        name: payment.customerName || 'Customer',
        reference: payment.reference,
        amount: payment.amount,
        currency: payment.currency,
        packageName: (payment.metadata as any)?.packageName || 'Booking',
      }, supportContact)
      sendEmail({ to: payment.customerEmail, ...template }).catch(() => {})
    }

    return NextResponse.json({
      success: true,
      data: {
        status,
        reference: paymentData.reference,
        amount: paymentData.amount / 100, // Convert from kobo to GHS
        currency: paymentData.currency,
        customer: paymentData.customer,
        metadata: paymentData.metadata,
        paidAt: paymentData.paid_at,
      },
    })
  } catch (error: any) {
    console.error('Error verifying payment:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to verify payment' },
      { status: 500 }
    )
  }
}
