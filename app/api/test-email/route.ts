/**
 * Test email endpoint - sends a test email to verify SMTP config.
 * POST /api/test-email with body: { "to": "your@email.com" }
 * Only works when NODE_ENV !== 'production' for safety.
 */

import { NextRequest, NextResponse } from 'next/server'
import { sendEmail } from '@/lib/email'

export async function POST(request: NextRequest) {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ success: false, error: 'Test email disabled in production' }, { status: 403 })
  }

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
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
  }
}
