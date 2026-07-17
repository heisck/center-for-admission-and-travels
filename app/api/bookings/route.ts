import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import crypto from 'crypto'
import { checkRateLimit, rateLimitResponse } from '@/lib/rate-limit'
import { getClientIp } from '@/lib/security'
import { DEFAULT_CURRENCY, normalizeCurrency, toMinorUnits } from '@/lib/currency'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const ALLOWED_METHODS = new Set(['whatsapp', 'email', 'phone', 'call', 'form'])

function normalizeText(value: unknown, maxLength: number) {
  return String(value || '').trim().slice(0, maxLength)
}

export async function POST(request: NextRequest) {
  const ip = getClientIp(request)
  const { allowed, retryAfterMs } = await checkRateLimit(`bookings:${ip}`, {
    maxRequests: 12,
    windowMs: 60_000,
  })
  if (!allowed) return rateLimitResponse(retryAfterMs)

  try {
    const body = await request.json().catch(() => ({}))
    const website = normalizeText(body?.website, 200)
    if (website) {
      // Honeypot for basic bot traffic.
      return NextResponse.json({
        success: true,
        message: 'Booking request received. You will be contacted shortly.',
      })
    }

    const packageId = normalizeText(body?.packageId, 64)
    const serviceType = normalizeText(body?.serviceType, 120)
    const country = normalizeText(body?.country, 120)
    const fullName = normalizeText(body?.fullName, 120)
    const email = normalizeText(body?.email, 254).toLowerCase()
    const phone = normalizeText(body?.phone, 40)
    const notes = normalizeText(body?.notes, 3000)
    const rawMethod = normalizeText(body?.method, 32).toLowerCase()
    const method = ALLOWED_METHODS.has(rawMethod) ? rawMethod : 'whatsapp'

    const isGeneralInquiry = !packageId || packageId === 'general-inquiry'

    if (!fullName || !email || !phone || (!packageId && !serviceType)) {
      return NextResponse.json(
        { success: false, error: 'Full name, email, phone, and service/package are required' },
        { status: 400 }
      )
    }

    if (!EMAIL_REGEX.test(email)) {
      return NextResponse.json(
        { success: false, error: 'Invalid email address' },
        { status: 400 }
      )
    }

    let packageName = serviceType || 'General inquiry'
    let packagePrice = 0
    let packageCurrency = DEFAULT_CURRENCY

    if (!isGeneralInquiry) {
      const pkg = await prisma.package.findUnique({
        where: { id: packageId },
        select: { name: true, price: true, currency: true },
      })

      if (pkg) {
        packageName = pkg.name
        packagePrice = pkg.price
        packageCurrency = normalizeCurrency(pkg.currency)
      } else {
        const featuredPkg = await prisma.travelToursFeaturedPackage.findUnique({
          where: { id: packageId },
          select: { name: true, price: true, currency: true },
        })
        if (featuredPkg) {
          packageName = featuredPkg.name
          packagePrice = featuredPkg.price
          packageCurrency = normalizeCurrency(featuredPkg.currency)
        }
      }

      if (!packagePrice || packagePrice <= 0) {
        return NextResponse.json(
          { success: false, error: 'Package not found' },
          { status: 404 }
        )
      }
    }

    await prisma.payment.create({
      data: {
        reference: `BOOK_${Date.now()}_${crypto.randomBytes(8).toString('hex')}`,
        amount: packagePrice,
        amountMinor: toMinorUnits(packagePrice, packageCurrency),
        currency: packageCurrency,
        status: 'pending',
        paymentMethod: method,
        customerEmail: email,
        customerName: fullName,
        customerPhone: phone,
        packageId: isGeneralInquiry ? null : packageId,
        metadata: {
          type: 'booking_request',
          inquiryType: isGeneralInquiry ? 'general_inquiry' : 'package_booking',
          packageName,
          serviceType: serviceType || null,
          country: country || null,
          notes: notes || null,
          contactMethod: method,
        },
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Booking request received. You will be contacted shortly.',
    })
  } catch (error: any) {
    console.error('Error creating booking:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create booking. Please try again.' },
      { status: 500 }
    )
  }
}

