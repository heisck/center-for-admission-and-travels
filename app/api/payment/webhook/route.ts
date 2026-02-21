/**
 * API Route: /api/payment/webhook
 * 
 * POST: Handle Paystack webhook events
 * 
 * This endpoint receives webhook notifications from Paystack
 * when payment status changes.
 */

import { NextRequest, NextResponse } from 'next/server'
import Paystack from '@paystack/paystack-sdk'
import { prisma } from '@/lib/prisma'
import crypto from 'crypto'

const paystack = new Paystack(process.env.PAYSTACK_SECRET_KEY || '')

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const hash = request.headers.get('x-paystack-signature')

    // Verify webhook signature
    if (process.env.PAYSTACK_SECRET_KEY) {
      const secret = process.env.PAYSTACK_SECRET_KEY
      const hash = crypto
        .createHmac('sha512', secret)
        .update(JSON.stringify(body))
        .digest('hex')

      const signature = request.headers.get('x-paystack-signature')
      if (hash !== signature) {
        return NextResponse.json(
          { success: false, error: 'Invalid signature' },
          { status: 401 }
        )
      }
    }

    const { event, data } = body

    // Handle different webhook events
    switch (event) {
      case 'charge.success':
        // Payment was successful
        await prisma.payment.update({
          where: { reference: data.reference },
          data: {
            status: 'success',
            paystackData: data as any,
            updatedAt: new Date(),
          },
        })
        break

      case 'charge.failed':
        // Payment failed
        await prisma.payment.update({
          where: { reference: data.reference },
          data: {
            status: 'failed',
            paystackData: data as any,
            updatedAt: new Date(),
          },
        })
        break

      case 'transfer.success':
      case 'transfer.failed':
      case 'transfer.reversed':
        // Handle transfer events if needed
        break

      default:
        console.log('Unhandled webhook event:', event)
    }

    return NextResponse.json({ success: true, message: 'Webhook processed' })
  } catch (error: any) {
    console.error('Error processing webhook:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}
