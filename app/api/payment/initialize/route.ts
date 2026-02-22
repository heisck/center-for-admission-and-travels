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

const paystack = new Paystack(process.env.PAYSTACK_SECRET_KEY || '')

export async function POST(request: NextRequest) {
  try {
    // Resolve authenticated user from session cookie
    const sessionToken = request.cookies.get(getUserSessionCookieName())?.value
    const user = sessionToken ? await getUserFromSessionToken(sessionToken) : null

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'You must be signed in to make a payment' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { packageId, amount, email, name, phone, paymentMethod, metadata } = body

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

    let finalAmount = amount
    let packageData = null

    // If packageId is provided, fetch package and use its price
    if (packageId) {
      // Try Package table first
      packageData = await prisma.package.findUnique({
        where: { id: packageId },
        select: { id: true, name: true, price: true },
      })

      // If not found, try TravelToursFeaturedPackage
      if (!packageData) {
        const featuredPkg = await prisma.travelToursFeaturedPackage.findUnique({
          where: { id: packageId },
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

      // Use package price if amount not provided
      if (!finalAmount) {
        finalAmount = packageData.price
      }
    }

    if (!finalAmount || finalAmount <= 0) {
      return NextResponse.json(
        { success: false, error: 'Valid amount is required' },
        { status: 400 }
      )
    }

    // Convert amount to kobo (Paystack uses smallest currency unit)
    // For GHS, 1 GHS = 100 pesewas, so multiply by 100
    const amountInKobo = Math.round(finalAmount * 100)

    // Generate unique reference
    const reference = `CAT_${Date.now()}_${Math.random().toString(36).substring(7)}`

    // Prepare metadata for Paystack
    const paystackMetadata: any = {
      packageId: packageId || null,
      packageName: packageData?.name || null,
      customerName: name,
      customerPhone: phone || null,
      paymentMethod: paymentMethod || 'card',
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
      email,
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
        currency: 'GHS',
        status: 'pending',
        paymentMethod: paymentMethod || 'card',
        customerEmail: email,
        customerName: name,
        customerPhone: phone || null,
        packageId: packageId || null,
        userId: user.id,
        metadata: {
          packageName: packageData?.name || null,
          billingAddress: metadata?.address || null,
          billingCity: metadata?.city || null,
          billingCountry: metadata?.country || null,
          momoPhone: metadata?.momoPhone || null,
          momoNetwork: metadata?.momoNetwork || null,
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
  } catch (error: any) {
    console.error('Error initializing payment:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to initialize payment' },
      { status: 500 }
    )
  }
}
