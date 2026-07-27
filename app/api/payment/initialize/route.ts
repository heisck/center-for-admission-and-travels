/**
 * API Route: /api/payment/initialize
 * 
 * POST: Initialize a Paystack payment
 * 
 * Body:
 * {
 *   packageId?: string
 *   servicePlanId?: string
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

    const body = await request.json().catch(() => null)
    if (!body || typeof body !== 'object') {
      return NextResponse.json({ success: false, error: 'Invalid JSON body' }, { status: 400 })
    }
    const {
      packageId,
      servicePlanId,
      amount,
      email,
      name,
      phone,
      paymentMethod,
      metadata,
      idempotencyKey,
    } = body

    // Validate required fields
    if (!email || !name) {
      return NextResponse.json(
        { success: false, error: 'Email and name are required' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (String(email).length > 254 || !emailRegex.test(String(email))) {
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
    const normalizedServicePlanId = String(servicePlanId || '').trim().slice(0, 128)
    if (normalizedPackageId && normalizedServicePlanId) {
      return NextResponse.json(
        { success: false, error: 'Choose either a package or a service plan, not both' },
        { status: 400 }
      )
    }
    const normalizedItemId = normalizedServicePlanId || normalizedPackageId
    const isServicePlanPayment = Boolean(normalizedServicePlanId)
    if (!normalizedItemId) {
      return NextResponse.json(
        { success: false, error: 'A package or service plan is required for payment' },
        { status: 400 }
      )
    }
    if (!/^[A-Za-z0-9_\-]+$/.test(normalizedItemId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid booking reference' },
        { status: 400 }
      )
    }

    const normalizedIdempotencyKey = String(idempotencyKey || '').trim()
    if (!/^[A-Za-z0-9_\-.]{16,100}$/.test(normalizedIdempotencyKey)) {
      return NextResponse.json(
        { success: false, error: 'A valid payment attempt key is required' },
        { status: 400 }
      )
    }

    let packageData: {
      id: string
      name: string
      price: number
      currency: SupportedCurrency
      itemType: 'package' | 'service_plan'
      serviceId?: string
      serviceName?: string
      servicePlanId?: string
      planName?: string
      duration?: string
    } | null = null

    if (isServicePlanPayment) {
      const servicePlan = await prisma.professionalServicePlan.findFirst({
        where: {
          id: normalizedServicePlanId,
          published: true,
          service: { published: true },
        },
        select: {
          id: true,
          name: true,
          price: true,
          currency: true,
          duration: true,
          service: { select: { id: true, name: true } },
        },
      })

      if (servicePlan) {
        packageData = {
          id: servicePlan.id,
          name: `${servicePlan.service.name} — ${servicePlan.name}`,
          price: Number(servicePlan.price),
          currency: normalizeCurrency(servicePlan.currency),
          itemType: 'service_plan',
          serviceId: servicePlan.service.id,
          serviceName: servicePlan.service.name,
          servicePlanId: servicePlan.id,
          planName: servicePlan.name,
          duration: servicePlan.duration,
        }
      }
    } else {
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
          itemType: 'package',
        }
      }

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
            itemType: 'package',
          }
        }
      }
    }

    if (!packageData) {
      return NextResponse.json(
        { success: false, error: isServicePlanPayment ? 'Service plan not found' : 'Package not found' },
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
          error: `Mobile Money is only available for GHS bookings. This item is priced in ${currency} — please pay by card.`,
        },
        { status: 400 }
      )
    }

    // Never trust client amount for package or service-plan payments.
    const packageAmount = packageData.price
    if (amount !== undefined && amount !== null && Number(amount) > 0) {
      const sentAmountMinor = toMinorUnits(Number(amount), currency)
      const packageAmountMinor = toMinorUnits(packageAmount, currency)
      if (sentAmountMinor !== packageAmountMinor) {
        return NextResponse.json(
          { success: false, error: 'Amount mismatch for selected booking' },
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

    const completedPayment =
      packageData.itemType === 'package'
        ? await prisma.payment.findFirst({
            where: {
              userId: user.id,
              packageId: packageData.id,
              status: 'success',
            },
            orderBy: { createdAt: 'desc' },
            select: { reference: true },
          })
        : null

    if (completedPayment) {
      return NextResponse.json(
        {
          success: false,
          error: 'You already have a successful payment for this booking. Contact support if you need another one.',
          reference: completedPayment.reference,
        },
        { status: 409 }
      )
    }

    // Generate unique reference
    const reference = `CAT_${Date.now()}_${crypto.randomBytes(6).toString('hex')}`
    const billingAddress = String(metadata?.address || '').trim().slice(0, 500) || null
    const billingCity = String(metadata?.city || '').trim().slice(0, 120) || null
    const billingCountry = String(metadata?.country || '').trim().slice(0, 120) || null
    const momoPhone = String(metadata?.momoPhone || '').trim().slice(0, 40) || null
    const momoNetwork = String(metadata?.momoNetwork || '').trim().slice(0, 40) || null

    // Prepare metadata for Paystack
    const paystackMetadata: any = {
      packageId: packageData.id,
      itemType: packageData.itemType,
      itemName: packageData.name,
      packageName: packageData.itemType === 'package' ? packageData.name : null,
      serviceId: packageData.serviceId || null,
      serviceName: packageData.serviceName || null,
      servicePlanId: packageData.servicePlanId || null,
      planName: packageData.planName || null,
      duration: packageData.duration || null,
      customerName,
      customerPhone: normalizedPhone,
      paymentMethod: normalizedPaymentMethod,
      expectedAmountMinor: amountInMinor,
      expectedCurrency: currency,
      checkoutId: normalizedIdempotencyKey,
    }

    // Add billing address if provided (for card payments)
    if (billingAddress) {
      paystackMetadata.billingAddress = billingAddress
      paystackMetadata.billingCity = billingCity
      paystackMetadata.billingCountry = billingCountry
    }

    // Add mobile money details if provided
    if (momoPhone) {
      paystackMetadata.momoPhone = momoPhone
      paystackMetadata.momoNetwork = momoNetwork
    }

    // Initialize payment with Paystack — amount in minor units + package currency
    const paymentMetadata = {
      itemType: packageData.itemType,
      itemName: packageData.name,
      packageName: packageData.itemType === 'package' ? packageData.name : null,
      serviceId: packageData.serviceId || null,
      serviceName: packageData.serviceName || null,
      servicePlanId: packageData.servicePlanId || null,
      planName: packageData.planName || null,
      duration: packageData.duration || null,
      billingAddress,
      billingCity,
      billingCountry,
      momoPhone,
      momoNetwork,
      expectedAmountMinor: amountInMinor,
      expectedCurrency: currency,
      checkoutId: normalizedIdempotencyKey,
    }

    // Reserve the unique checkout before contacting Paystack. The unique
    // checkoutId closes the double-submit race across multiple server instances.
    let reservedPayment: { id: string; reference: string }
    try {
      reservedPayment = await prisma.payment.create({
        data: {
          reference,
          checkoutId: normalizedIdempotencyKey,
          amount: finalAmount,
          amountMinor: amountInMinor,
          currency,
          status: 'processing',
          paymentMethod: normalizedPaymentMethod,
          customerEmail,
          customerName,
          customerPhone: normalizedPhone,
          packageId: packageData.id,
          userId: user.id,
          metadata: paymentMetadata,
        },
        select: { id: true, reference: true },
      })
    } catch (reservationError: any) {
      if (reservationError?.code !== 'P2002') throw reservationError

      const existingPayment = await prisma.payment.findUnique({
        where: { checkoutId: normalizedIdempotencyKey },
        select: {
          userId: true,
          packageId: true,
          paymentMethod: true,
          status: true,
          reference: true,
          amount: true,
          amountMinor: true,
          currency: true,
          paystackData: true,
        },
      })

      if (
        !existingPayment ||
        existingPayment.userId !== user.id ||
        existingPayment.packageId !== packageData.id ||
        existingPayment.paymentMethod !== normalizedPaymentMethod ||
        (existingPayment.amountMinor || toMinorUnits(Number(existingPayment.amount), currency)) !== amountInMinor ||
        normalizeCurrency(existingPayment.currency) !== currency
      ) {
        return NextResponse.json(
          { success: false, error: 'This payment attempt key is already in use' },
          { status: 409 }
        )
      }

      const existingData = existingPayment.paystackData as any
      if (
        ['pending', 'processing'].includes(existingPayment.status) &&
        existingData?.authorization_url &&
        existingData?.access_code
      ) {
        return NextResponse.json({
          success: true,
          data: {
            authorizationUrl: existingData.authorization_url,
            accessCode: existingData.access_code,
            reference: existingPayment.reference,
            currency,
            amount: finalAmount,
            reused: true,
          },
        })
      }

      return NextResponse.json(
        {
          success: false,
          error:
            existingPayment.status === 'processing'
              ? 'This payment is still being initialized. Please retry in a moment.'
              : 'This payment attempt is closed. Start a new checkout attempt.',
        },
        { status: 409 }
      )
    }

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
      await prisma.payment.update({
        where: { id: reservedPayment.id },
        data: {
          status: 'failed',
          paystackData: { initializationError: String(message).slice(0, 500) },
        },
      }).catch(() => undefined)
      return NextResponse.json(
        {
          success: false,
          error:
            typeof message === 'string' && message.toLowerCase().includes('currency')
              ? `Paystack rejected currency ${currency}. Enable this currency on your Paystack dashboard (Settings → Preferences / multi-currency), or price this booking in a supported currency (GHS/USD).`
              : message,
        },
        { status: 502 }
      )
    }

    const authorizationUrl =
      typeof response?.data?.authorization_url === 'string'
        ? response.data.authorization_url.trim()
        : ''
    const accessCode =
      typeof response?.data?.access_code === 'string'
        ? response.data.access_code.trim()
        : ''

    if (
      !response.status ||
      !response.data ||
      !authorizationUrl ||
      !accessCode ||
      !/^https:\/\//i.test(authorizationUrl)
    ) {
      const message = response?.message || 'Failed to initialize payment'
      await prisma.payment.update({
        where: { id: reservedPayment.id },
        data: {
          status: 'failed',
          paystackData: { initializationError: String(message).slice(0, 500) },
        },
      }).catch(() => undefined)
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

    await prisma.payment.update({
      where: { id: reservedPayment.id },
      data: {
        status: 'pending',
        paystackData: response.data as any,
      },
    })

    return NextResponse.json({
      success: true,
      data: {
        authorizationUrl,
        accessCode,
        reference: reservedPayment.reference,
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
