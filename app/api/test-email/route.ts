/**
 * Test email endpoint - sends a test email to verify SMTP config.
 * POST /api/test-email with body: { "to": "your@email.com" }
 * Only works when NODE_ENV !== 'production' for safety.
 */

import { NextRequest, NextResponse } from 'next/server'
import { sendEmail } from '@/lib/email'
import { checkRateLimit, rateLimitResponse } from '@/lib/rate-limit'
import { getClientIp } from '@/lib/security'
import { verifyAdminSession } from '@/lib/auth-helpers'
import { hasAdminPermission } from '@/lib/admin-permissions'

export async function POST(request: NextRequest) {
  if (process.env.ENABLE_TEST_EMAIL_ENDPOINT !== 'true') {
    return NextResponse.json({ success: false, error: 'Test email endpoint is disabled' }, { status: 403 })
  }

  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ success: false, error: 'Test email disabled in production' }, { status: 403 })
  }

  const session = await verifyAdminSession(request)
  if (!session) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }
  if (!hasAdminPermission(session.role, 'security.manage')) {
    return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })
  }

  const ip = getClientIp(request)
  const { allowed, retryAfterMs } = await checkRateLimit(`test-email:${session.userId}:${ip}`, {
    maxRequests: 3,
    windowMs: 60_000,
  })
  if (!allowed) return rateLimitResponse(retryAfterMs)

  try {
    const body = await request.json().catch(() => ({}))
    const to = body?.to

    if (!to || typeof to !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Provide { "to": "your@email.com" } in the request body' },
        { status: 400 }
      )
    }

    const email = String(to).trim().toLowerCase()
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ success: false, error: 'Invalid email address' }, { status: 400 })
    }

    const sent = await sendEmail({
      to: email,
      subject: 'CFAAT Email Test – It works!',
      html: `
        <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px;">
          <h1 style="color:#ea580c;">✓ Email test successful</h1>
          <p>If you received this, your Gmail SMTP setup is working correctly.</p>
          <p style="color:#64748b;font-size:14px;">Center for Admission & Travels</p>
        </div>
      `,
    })

    if (sent) {
      return NextResponse.json({ success: true, message: `Test email sent to ${email}. Check your inbox (and spam).` })
    }

    return NextResponse.json(
      { success: false, error: 'SMTP not configured or send failed. Check SMTP_USER, SMTP_PASS in .env and server logs.' },
      { status: 500 }
    )
  } catch (error) {
    console.error('Test email error:', error)
    return NextResponse.json({ success: false, error: 'Failed to send test email' }, { status: 500 })
  }
}

