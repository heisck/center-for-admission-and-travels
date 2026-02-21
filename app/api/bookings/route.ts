import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { packageId, fullName, email, phone, notes, method } = body

    if (!fullName || !email || !phone || !packageId) {
      return NextResponse.json(
        { success: false, error: 'Full name, email, phone, and package are required' },
        { status: 400 }
      )
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, error: 'Invalid email address' },
        { status: 400 }
      )
    }

    let packageName = 'Unknown Package'
    let packagePrice = 0

    const pkg = await prisma.package.findUnique({
      where: { id: packageId },
      select: { name: true, price: true },
    })

    if (pkg) {
      packageName = pkg.name
      packagePrice = pkg.price
    } else {
      const featuredPkg = await prisma.travelToursFeaturedPackage.findUnique({
        where: { id: packageId },
        select: { name: true, price: true },
      })
      if (featuredPkg) {
        packageName = featuredPkg.name
        packagePrice = featuredPkg.price
      }
    }

    await prisma.payment.create({
      data: {
        reference: `BOOK_${Date.now()}_${Math.random().toString(36).substring(7)}`,
        amount: packagePrice,
        currency: 'GHS',
        status: 'pending',
        paymentMethod: method || 'whatsapp',
        customerEmail: email,
        customerName: fullName,
        customerPhone: phone,
        packageId,
        metadata: {
          type: 'booking_request',
          packageName,
          notes: notes || null,
          contactMethod: method || 'whatsapp',
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
