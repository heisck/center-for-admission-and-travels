import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendEmail } from '@/lib/email'
import { contactNotificationEmail } from '@/lib/email-templates'
import { getFreshSupportContact } from '@/lib/support-contact'
import { checkRateLimit, rateLimitResponse } from '@/lib/rate-limit'
import { getClientIp } from '@/lib/security'

function normalizeString(value: unknown, maxLength: number) {
  return String(value || '').trim().slice(0, maxLength)
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export async function POST(request: NextRequest) {
  const ip = getClientIp(request)
  const { allowed, retryAfterMs } = await checkRateLimit(`contact:${ip}`, {
    maxRequests: 6,
    windowMs: 60_000,
  })
  if (!allowed) return rateLimitResponse(retryAfterMs)

  try {
    const body = await request.json()
    const website = normalizeString(body?.website, 200)
    if (website) {
      // Honeypot field hit by bots: pretend success to reduce retries.
      return NextResponse.json({ success: true })
    }

    const name = normalizeString(body?.name, 120)
    const email = normalizeString(body?.email, 254).toLowerCase()
    const phone = normalizeString(body?.phone, 40)
    const subject = normalizeString(body?.subject, 160)
    const message = normalizeString(body?.message, 5000)

    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { error: 'Name, email, subject, and message are required' },
        { status: 400 }
      )
    }

    if (!isValidEmail(email)) {
      return NextResponse.json(
        { error: 'Please provide a valid email address' },
        { status: 400 }
      )
    }

    const supportContact = await getFreshSupportContact()
    const recipientEmail = supportContact.email
    if (!isValidEmail(recipientEmail)) {
      console.error('[Contact] Contact recipient email is not configured')
      return NextResponse.json(
        { error: 'Contact email is not configured. Please try again later.' },
        { status: 503 }
      )
    }

    const contactMessage = await prisma.contactMessage.create({
      data: { name, email, phone: phone || null, subject, message },
    })

    const notification = contactNotificationEmail({ name, email, phone, subject, message }, supportContact)
    sendEmail({ to: recipientEmail, replyTo: email, ...notification }).catch((err) =>
      console.error('[Contact] Failed to send notification email:', err)
    )

    return NextResponse.json({ success: true, id: contactMessage.id })
  } catch (error) {
    console.error('[Contact] Error:', error)
    return NextResponse.json(
      { error: 'Failed to send message. Please try again.' },
      { status: 500 }
    )
  }
}

