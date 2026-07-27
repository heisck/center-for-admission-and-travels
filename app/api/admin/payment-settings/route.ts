/**
 * API Route: /api/admin/payment-settings
 * 
 * GET: Fetch payment settings (admin only)
 * POST is intentionally disabled. Runtime secrets must be managed by the
 * deployment platform, never submitted through the application UI.
 */

import { NextRequest, NextResponse } from 'next/server'
import { verifyAdminSession } from '@/lib/auth-helpers'
import { checkRateLimit, rateLimitResponse } from '@/lib/rate-limit'
import { getClientIp } from '@/lib/security'
import { hasAdminPermission } from '@/lib/admin-permissions'
import { logAdminAudit } from '@/lib/admin-audit'

export async function GET(request: NextRequest) {
  const ip = getClientIp(request)
  try {
    // Verify admin session
    const session = await verifyAdminSession(request)
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }
    if (!hasAdminPermission(session.role, 'settings.manage')) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })
    }

    const { allowed, retryAfterMs } = await checkRateLimit(`admin-payment-settings-read:${session.userId}:${ip}`, {
      maxRequests: 30,
      windowMs: 60_000,
    })
    if (!allowed) return rateLimitResponse(retryAfterMs)

    // Return payment settings (masked for security)
    const settings = {
      paystackPublicKeyConfigured: Boolean(process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY),
      paystackSecretKeyConfigured: Boolean(process.env.PAYSTACK_SECRET_KEY),
      isConfigured:
        !!process.env.PAYSTACK_SECRET_KEY && !!process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY,
      currency: process.env.PAYMENT_CURRENCY || 'GHS',
      baseUrlConfigured: Boolean(process.env.NEXT_PUBLIC_BASE_URL),
      webhookAllowlistConfigured: Boolean(process.env.PAYSTACK_WEBHOOK_IP_ALLOWLIST),
    }

    return NextResponse.json({ success: true, data: settings })
  } catch (error) {
    console.error('Error fetching payment settings:', error)
    return NextResponse.json({ success: false, error: 'Failed to fetch payment settings' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await verifyAdminSession(request)
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }
    if (!hasAdminPermission(session.role, 'security.manage')) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })
    }

    await logAdminAudit({
      request,
      session,
      action: 'payment_settings.update_blocked',
      entityType: 'payment_settings',
      metadata: { reason: 'runtime-secrets-are-read-only' },
    })

    return NextResponse.json({
      success: false,
      error: 'Payment secrets are read-only here. Update them in the deployment platform environment settings.',
    }, { status: 405, headers: { Allow: 'GET' } })
  } catch (error) {
    console.error('Error updating payment settings:', error)
    return NextResponse.json({ success: false, error: 'Failed to update payment settings' }, { status: 500 })
  }
}

