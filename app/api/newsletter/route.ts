/**
 * Newsletter signup API
 * POST /api/newsletter - Subscribe email to newsletter
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { checkRateLimit, rateLimitResponse } from '@/lib/rate-limit'
import { getClientIp } from '@/lib/security'

export async function POST(request: NextRequest) {
  const ip = getClientIp(request)
  const { allowed, retryAfterMs } = await checkRateLimit(`newsletter:${ip}`, {
    maxRequests: 8,
    windowMs: 60_000,
  })
  if (!allowed) return rateLimitResponse(retryAfterMs)

  try {
    const body = await request.json().catch(() => ({}))
    const website = String(body?.website || '').trim().slice(0, 200)
    if (website) {
      // Honeypot for bots.
      return NextResponse.json({ success: true, message: 'Thank you for subscribing!' })
    }

    const email = typeof body?.email === 'string' ? body.email : ''

    if (!email || typeof email !== 'string') {
      return NextResponse.json({ success: false, error: 'Email is required' }, { status: 400 })
    }

    const normalizedEmail = email.trim().toLowerCase().slice(0, 254)
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      return NextResponse.json({ success: false, error: 'Please enter a valid email address' }, { status: 400 })
    }

    await prisma.newsletterSubscriber.upsert({
      where: { email: normalizedEmail },
      create: { email: normalizedEmail },
      update: {},
    })

    return NextResponse.json({ success: true, message: 'Thank you for subscribing!' })
  } catch (error) {
    console.error('Newsletter signup error:', error)
    return NextResponse.json({ success: false, error: 'Something went wrong. Please try again.' }, { status: 500 })
  }
}

