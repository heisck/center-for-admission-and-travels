/**
 * Newsletter signup API
 * POST /api/newsletter - Subscribe email to newsletter
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email || typeof email !== 'string') {
      return NextResponse.json({ success: false, error: 'Email is required' }, { status: 400 })
    }

    const normalizedEmail = email.trim().toLowerCase()
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
