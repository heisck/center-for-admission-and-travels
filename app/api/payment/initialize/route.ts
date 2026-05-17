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
 */

import { NextRequest, NextResponse } from 'next/server'
import Paystack from '@paystack/paystack-sdk'
import { prisma } from '@/lib/prisma'
import { getUserFromSessionToken, getUserSessionCookieName } from '@/lib/user-auth'
import { getBaseUrl } from '@/lib/url'
import { checkRateLimit, rateLimitResponse } from '@/lib/rate-limit'
import { getClientIp } from '@/lib/security'
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

    const normalizedPaymentMethod = paymentMethod === 'mobile_money' || paymentMethod === 'card'
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

    let finalAmount = amount
    let packageData = null

    // Try Package table first
    packageData = await prisma.package.findUnique({
      where: { id: normalizedPackageId },
      select: { id: true, name: true, price: true },
    })

    // If not found, try TravelToursFeaturedPackage
    if (!packageData) {
      const featuredPkg = await prisma.travelToursFeaturedPackage.findUnique({
        where: { id: normalizedPackageId },
        select: { id: true, name: true, price: true },
      })

      if (featuredPkg) {
        packageData = {
          id: featuredPkg.id,
          name: featuredPkg.name,
          price: featuredPkg.price,
        }
      }
    }

    if (!packageData) {
      return NextResponse.json(
        { success: false, error: 'Package not found' },
        { status: 404 }
      )
    }

    // Never trust client amount for package payments.
    const packageAmount = packageData.price
    if (amount !== undefined && amount !== null && Number(amount) > 0) {
      const sentAmountMinor = Math.round(Number(amount) * 100)
      const packageAmountMinor = Math.round(packageAmount * 100)
      if (sentAmountMinor !== packageAmountMinor) {
        return NextResponse.json(
          { success: false, error: 'Amount mismatch for selected package' },
          { status: 400 }
        )
      }
    }

    finalAmount = packageAmount

    const parsedAmount = Number(finalAmount)
    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      return NextResponse.json(
        { success: false, error: 'Valid amount is required' },
        { status: 400 }
      )
    }
    if (parsedAmount > 1_000_000) {
      return NextResponse.json(
        { success: false, error: 'Amount exceeds allowed maximum' },
        { status: 400 }
      )
    }

    finalAmount = parsedAmount

    // Convert amount to kobo (Paystack uses smallest currency unit)
    // For GHS, 1 GHS = 100 pesewas, so multiply by 100
    const amountInKobo = Math.round(finalAmount * 100)

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
      (reusablePendingPayment.amountMinor || Math.round(Number(reusablePendingPayment.amount) * 100)) === amountInKobo &&
      reusablePendingPayment.currency === 'GHS' &&
      reusablePaystackData?.authorization_url &&
      reusablePaystackData?.access_code
    ) {
      return NextResponse.json({
        success: true,
        data: {
          authorizationUrl: reusablePaystackData.authorization_url,
          accessCode: reusablePaystackData.access_code,
          reference: reusablePendingPayment.reference,
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
        (existingPayment.amountMinor || Math.round(Number(existingPayment.amount) * 100)) === amountInKobo &&
        existingPayment.currency === 'GHS' &&
        existingPaystackData?.authorization_url &&
        existingPaystackData?.access_code
      ) {
        return NextResponse.json({
          success: true,
          data: {
            authorizationUrl: existingPaystackData.authorization_url,
            accessCode: existingPaystackData.access_code,
            reference: existingPayment.reference,
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
      expectedAmountKobo: amountInKobo,
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

    // Initialize payment with Paystack
    const response = await paystack.transaction.initialize({
      email: customerEmail,
      amount: amountInKobo,
      currency: 'GHS',
      reference,
      metadata: paystackMetadata,
      callback_url: `${getBaseUrl(request)}/payment/callback?reference=${reference}`,
    })

    if (!response.status || !response.data) {
      return NextResponse.json(
        { success: false, error: 'Failed to initialize payment' },
        { status: 500 }
      )
    }

    // Create payment record in database linked to the authenticated user
    await prisma.payment.create({
      data: {
        reference,
        amount: finalAmount,
        amountMinor: amountInKobo,
        currency: 'GHS',
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
          expectedAmountKobo: amountInKobo,
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

