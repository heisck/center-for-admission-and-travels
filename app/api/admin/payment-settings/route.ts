/**
 * API Route: /api/admin/payment-settings
 * 
 * GET: Fetch payment settings (admin only)
 * POST: Update payment settings (admin only)
 */

import { NextRequest, NextResponse } from 'next/server'
import { verifyAdminSession } from '@/lib/auth-helpers'
import { checkRateLimit, rateLimitResponse } from '@/lib/rate-limit'
import { getClientIp } from '@/lib/security'

// Payment settings are stored in environment variables
// This API provides a way to view and update them (in production, use a secure settings store)

export async function GET(request: NextRequest) {
  try {
    // Verify admin session
    const session = await verifyAdminSession(request)
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    // Return payment settings (masked for security)
    const settings = {
      paystackPublicKeyConfigured: Boolean(process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY),
      paystackSecretKeyConfigured: Boolean(process.env.PAYSTACK_SECRET_KEY),
      isConfigured:
        !!process.env.PAYSTACK_SECRET_KEY && !!process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY,
      currency: process.env.PAYMENT_CURRENCY || 'GHS',
      baseUrl: process.env.NEXT_PUBLIC_BASE_URL || '(auto-detected from request)',
    }

    return NextResponse.json({ success: true, data: settings })
  } catch (error: any) {
    console.error('Error fetching payment settings:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  const ip = getClientIp(request)
  const { allowed, retryAfterMs } = await checkRateLimit(`admin-payment-settings:${ip}`, {
    maxRequests: 10,
    windowMs: 60_000,
  })
  if (!allowed) return rateLimitResponse(retryAfterMs)

  try {
    // Verify admin session
    const session = await verifyAdminSession(request)
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()

    // Note: In production, you should store these in a database or secure vault
    // For now, we'll just validate and return a message
    // The actual keys should be set in .env file

    const { paystackPublicKey, paystackSecretKey, currency, baseUrl } = body

    // Validate that keys are provided
    if (!paystackPublicKey || !paystackSecretKey) {
      return NextResponse.json(
        { success: false, error: 'Paystack keys are required' },
        { status: 400 }
      )
    }

    const normalizedPublicKey = String(paystackPublicKey).trim()
    const normalizedSecretKey = String(paystackSecretKey).trim()
    if (!normalizedPublicKey.startsWith('pk_') || !normalizedSecretKey.startsWith('sk_')) {
      return NextResponse.json(
        { success: false, error: 'Paystack key formats are invalid' },
        { status: 400 }
      )
    }

    // Return instructions to update .env file without echoing secrets.
    return NextResponse.json({
      success: true,
      message:
        'Payment settings should be updated in the .env file:\n' +
        'NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=<your-public-key>\n' +
        'PAYSTACK_SECRET_KEY=<your-secret-key>\n' +
        `PAYMENT_CURRENCY=${currency || 'GHS'}\n` +
        `NEXT_PUBLIC_BASE_URL=${baseUrl || 'http://localhost:3000'}\n` +
        '\nAfter updating, restart your server.',
    })
  } catch (error: any) {
    console.error('Error updating payment settings:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

