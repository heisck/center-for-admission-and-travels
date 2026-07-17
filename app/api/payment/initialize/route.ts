/**
 * API Route: /api/payment/initialize
 * 
 * POST: Initialize a Paystack payment
 * 
 * Body:
 * {
 *   packageId: string
 *   amount: number (optional - will use package price if not provided)
 *   email: string
 *   name: string
 *   phone?: string
 *   paymentMethod?: 'card' | 'mobile_money'
 * }
 *
 * Currency is taken from the package (never trusted from the client) and sent to
 * Paystack as ISO 4217 (GHS | USD | EUR | GBP). Amount is always in minor units.
 */

import { NextRequest, NextResponse } from 'next/server'
import Paystack from '@paystack/paystack-sdk'
import { prisma } from '@/lib/prisma'
import { getUserFromSessionToken, getUserSessionCookieName } from '@/lib/user-auth'
import { getBaseUrl } from '@/lib/url'
import { checkRateLimit, rateLimitResponse } from '@/lib/rate-limit'
import { getClientIp } from '@/lib/security'
import {
  DEFAULT_CURRENCY,
  normalizeCurrency,
  supportsMobileMoney,
  toMinorUnits,
  type SupportedCurrency,
} from '@/lib/currency'
import crypto from 'crypto'

export async function POST(request: NextRequest) {
  const ip = getClientIp(request)
  try {
    const paystackSecret = process.env.PAYSTACK_SECRET_KEY
    if (!paystackSecret) {
      return NextResponse.json(
        { success: false, error: 'Payment service is not configured' },
        { status: 503 }
      )
    }

    const paystack = new Paystack(paystackSecret)

    // Resolve authenticated user from session cookie
    const sessionToken = request.cookies.get(getUserSessionCookieName())?.value
    const user = sessionToken ? await getUserFromSessionToken(sessionToken) : null

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'You must be signed in to make a payment' },
        { status: 401 }
      )
    }

    const { allowed, retryAfterMs } = await checkRateLimit(`pay-init:${user.id}:${ip}`, {
      maxRequests: 10,
      windowMs: 60_000,
    })
    if (!allowed) return rateLimitResponse(retryAfterMs)

    const body = await request.json()
    const { packageId, amount, email, name, phone, paymentMethod, metadata, idempotencyKey } = body

    // Validate required fields
    if (!email || !name) {
      return NextResponse.json(
        { success: false, error: 'Email and name are required' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, error: 'Invalid email address' },
        { status: 400 }
      )
    }

    const normalizedEmail = String(email).trim().toLowerCase()
    const userEmail = String(user.email || '').trim().toLowerCase()
    if (userEmail && normalizedEmail !== userEmail) {
      return NextResponse.json(
        { success: false, error: 'Email does not match your signed-in account' },
        { status: 400 }
      )
    }

    const normalizedPhone = phone ? String(phone).trim().slice(0, 40) : null
    if (normalizedPhone && !/^[+0-9()\-\s]{6,40}$/.test(normalizedPhone)) {
      return NextResponse.json(
        { success: false, error: 'Invalid phone number format' },
        { status: 400 }
      )
    }

    const customerEmail = userEmail || normalizedEmail
    const customerName = String(name).trim().slice(0, 120) || user.displayName || user.username || 'Customer'

    const requestedPaymentMethod = paymentMethod === 'mobile_money' || paymentMethod === 'card'
      ? paymentMethod
      : 'card'

    const normalizedPackageId = String(packageId || '').trim().slice(0, 128)
    if (!normalizedPackageId) {
      return NextResponse.json(
        { success: false, error: 'Package is required for payment' },
        { status: 400 }
      )
    }
    if (!/^[A-Za-z0-9_\-]+$/.test(normalizedPackageId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid package reference' },
        { status: 400 }
      )
    }

    const normalizedIdempotencyKey = String(idempotencyKey || '').trim()
    if (
      normalizedIdempotencyKey &&
      !/^[A-Za-z0-9_\-.]{16,100}$/.test(normalizedIdempotencyKey)
    ) {
      return NextResponse.json(
        { success: false, error: 'Invalid payment attempt key' },
        { status: 400 }
      )
    }

    let packageData: { id: string; name: string; price: number; currency: SupportedCurrency } | null = null

    // Try Package table first
    const pkg = await prisma.package.findUnique({
      where: { id: normalizedPackageId },
      select: { id: true, name: true, price: true, currency: true },
    })

    if (pkg) {
      packageData = {
        id: pkg.id,
        name: pkg.name,
        price: pkg.price,
        currency: normalizeCurrency(pkg.currency),
      }
    }

    // If not found, try TravelToursFeaturedPackage
    if (!packageData) {
      const featuredPkg = await prisma.travelToursFeaturedPackage.findUnique({
        where: { id: normalizedPackageId },
        select: { id: true, name: true, price: true, currency: true },
      })

      if (featuredPkg) {
        packageData = {
          id: featuredPkg.id,
          name: featuredPkg.name,
          price: featuredPkg.price,
          currency: normalizeCurrency(featuredPkg.currency),
        }
      }
    }

    if (!packageData) {
      return NextResponse.json(
        { success: false, error: 'Package not found' },
        { status: 404 }
      )
    }

    const currency = packageData.currency || DEFAULT_CURRENCY

    // Mobile money is only supported for GHS on Ghana Paystack businesses.
    const normalizedPaymentMethod: 'card' | 'mobile_money' = requestedPaymentMethod
    if (normalizedPaymentMethod === 'mobile_money' && !supportsMobileMoney(currency)) {
      return NextResponse.json(
        {
          success: false,
          error: `Mobile Money is only available for GHS packages. This package is priced in ${currency} — please pay by card.`,
        },
        { status: 400 }
      )
    }

    // Never trust client amount for package payments.
    const packageAmount = packageData.price
    if (amount !== undefined && amount !== null && Number(amount) > 0) {
      const sentAmountMinor = toMinorUnits(Number(amount), currency)
      const packageAmountMinor = toMinorUnits(packageAmount, currency)
      if (sentAmountMinor !== packageAmountMinor) {
        return NextResponse.json(
          { success: false, error: 'Amount mismatch for selected package' },
          { status: 400 }
        )
      }
    }

    const finalAmount = Number(packageAmount)
    if (!Number.isFinite(finalAmount) || finalAmount <= 0) {
      return NextResponse.json(
        { success: false, error: 'Valid amount is required' },
        { status: 400 }
      )
    }
    if (finalAmount > 1_000_000) {
      return NextResponse.json(
        { success: false, error: 'Amount exceeds allowed maximum' },
        { status: 400 }
      )
    }

    // Paystack uses the subunit of the currency (pesewas / cents).
    const amountInMinor = toMinorUnits(finalAmount, currency)

    const completedPayment = await prisma.payment.findFirst({
      where: {
        userId: user.id,
        packageId: packageData.id,
        status: 'success',
      },
      orderBy: { createdAt: 'desc' },
      select: { reference: true },
    })

    if (completedPayment) {
      return NextResponse.json(
        {
          success: false,
          error: 'You already have a successful payment for this package. Contact support if you need another booking.',
          reference: completedPayment.reference,
        },
        { status: 409 }
      )
    }

    const reusablePendingPayment = await prisma.payment.findFirst({
      where: {
        userId: user.id,
        packageId: packageData.id,
        status: { in: ['pending', 'processing'] },
        createdAt: { gte: new Date(Date.now() - 1000 * 60 * 60 * 24) },
      },
      orderBy: { createdAt: 'desc' },
      select: {
        reference: true,
        amount: true,
        amountMinor: true,
        currency: true,
        paystackData: true,
      },
    })

    const reusablePaystackData = reusablePendingPayment?.paystackData as any
    if (
      reusablePendingPayment &&
      (reusablePendingPayment.amountMinor || toMinorUnits(Number(reusablePendingPayment.amount), currency)) === amountInMinor &&
      normalizeCurrency(reusablePendingPayment.currency) === currency &&
      reusablePaystackData?.authorization_url &&
      reusablePaystackData?.access_code
    ) {
      return NextResponse.json({
        success: true,
        data: {
          authorizationUrl: reusablePaystackData.authorization_url,
          accessCode: reusablePaystackData.access_code,
          reference: reusablePendingPayment.reference,
          currency,
          amount: finalAmount,
          reused: true,
        },
      })
    }

    if (normalizedIdempotencyKey) {
      const existingPayment = await prisma.payment.findFirst({
        where: {
          userId: user.id,
          packageId: packageData.id,
          paymentMethod: normalizedPaymentMethod,
          status: { in: ['pending', 'processing'] },
          metadata: {
            path: ['checkoutId'],
            equals: normalizedIdempotencyKey,
          },
        },
        orderBy: { createdAt: 'desc' },
        select: {
          reference: true,
          amount: true,
          amountMinor: true,
          currency: true,
          paystackData: true,
        },
      })

      const existingPaystackData = existingPayment?.paystackData as any
      if (
        existingPayment &&
        (existingPayment.amountMinor || toMinorUnits(Number(existingPayment.amount), currency)) === amountInMinor &&
        normalizeCurrency(existingPayment.currency) === currency &&
        existingPaystackData?.authorization_url &&
        existingPaystackData?.access_code
      ) {
        return NextResponse.json({
          success: true,
          data: {
            authorizationUrl: existingPaystackData.authorization_url,
            accessCode: existingPaystackData.access_code,
            reference: existingPayment.reference,
            currency,
            amount: finalAmount,
            reused: true,
          },
        })
      }
    }

    // Generate unique reference
    const reference = `CAT_${Date.now()}_${crypto.randomBytes(6).toString('hex')}`

    // Prepare metadata for Paystack
    const paystackMetadata: any = {
      packageId: packageData.id,
      packageName: packageData?.name || null,
      customerName,
      customerPhone: normalizedPhone,
      paymentMethod: normalizedPaymentMethod,
      expectedAmountMinor: amountInMinor,
      expectedCurrency: currency,
      checkoutId: normalizedIdempotencyKey || null,
    }

    // Add billing address if provided (for card payments)
    if (metadata?.address) {
      paystackMetadata.billingAddress = metadata.address
      paystackMetadata.billingCity = metadata.city || null
      paystackMetadata.billingCountry = metadata.country || null
    }

    // Add mobile money details if provided
    if (metadata?.momoPhone) {
      paystackMetadata.momoPhone = metadata.momoPhone
      paystackMetadata.momoNetwork = metadata.momoNetwork || null
    }

    // Initialize payment with Paystack — amount in minor units + package currency
    let response: any
    try {
      response = await paystack.transaction.initialize({
        email: customerEmail,
        amount: amountInMinor,
        currency,
        reference,
        metadata: paystackMetadata,
        callback_url: `${getBaseUrl(request)}/payment/callback?reference=${reference}`,
      })
    } catch (paystackError: any) {
      console.error('Paystack initialize error:', paystackError)
      const message =
        paystackError?.message ||
        paystackError?.response?.data?.message ||
        'Failed to initialize payment with Paystack'
      return NextResponse.json(
        {
          success: false,
          error:
            typeof message === 'string' && message.toLowerCase().includes('currency')
              ? `Paystack rejected currency ${currency}. Enable this currency on your Paystack dashboard (Settings → Preferences / multi-currency), or price this package in a supported currency (GHS/USD).`
              : message,
        },
        { status: 502 }
      )
    }

    if (!response.status || !response.data) {
      const message = response?.message || 'Failed to initialize payment'
      return NextResponse.json(
        {
          success: false,
          error:
            typeof message === 'string' && String(message).toLowerCase().includes('currency')
              ? `Paystack rejected currency ${currency}. Enable this currency on your Paystack dashboard, or use GHS/USD.`
              : message,
        },
        { status: 500 }
      )
    }

    // Create payment record in database linked to the authenticated user
    await prisma.payment.create({
      data: {
        reference,
        amount: finalAmount,
        amountMinor: amountInMinor,
        currency,
        status: 'pending',
        paymentMethod: normalizedPaymentMethod,
        customerEmail,
        customerName,
        customerPhone: normalizedPhone,
        packageId: packageData.id,
        userId: user.id,
        metadata: {
          packageName: packageData?.name || null,
          billingAddress: metadata?.address || null,
          billingCity: metadata?.city || null,
          billingCountry: metadata?.country || null,
          momoPhone: metadata?.momoPhone || null,
          momoNetwork: metadata?.momoNetwork || null,
          expectedAmountMinor: amountInMinor,
          expectedCurrency: currency,
          checkoutId: normalizedIdempotencyKey || null,
        },
        paystackData: response.data as any,
      },
    })

    return NextResponse.json({
      success: true,
      data: {
        authorizationUrl: response.data.authorization_url,
        accessCode: response.data.access_code,
        reference,
        currency,
        amount: finalAmount,
      },
    })
  } catch (error) {
    console.error('Error initializing payment:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to initialize payment' },
      { status: 500 }
    )
  }
}
