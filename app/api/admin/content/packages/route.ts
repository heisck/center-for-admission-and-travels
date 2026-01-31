/**
 * API Route: /api/admin/content/packages
 * 
 * Admin-only endpoints for managing packages
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyAdminSession } from '@/lib/auth-helpers'
import * as contentHelpers from '@/lib/prisma-content-helpers'

// GET /api/admin/content/packages - Get all packages
export async function GET(request: NextRequest) {
  try {
    const session = await verifyAdminSession(request)
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const packages = await prisma.package.findMany({
      orderBy: { order: 'asc' },
      include: {
        highlights: { orderBy: { order: 'asc' } },
        images: { orderBy: { order: 'asc' } },
        included: { orderBy: { order: 'asc' } },
        notIncluded: { orderBy: { order: 'asc' } },
      },
    })

    const formatted = packages.map((pkg) => ({
      id: pkg.id,
      name: pkg.name,
      description: pkg.description,
      category: pkg.category,
      duration: pkg.duration,
      price: pkg.price,
      highlights: pkg.highlights.map((h) => h.text),
      itinerary: pkg.itinerary || '',
      images: pkg.images.map((img) => img.url),
    }))

    return NextResponse.json({ success: true, data: formatted })
  } catch (error: any) {
    console.error('Error fetching packages:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

// POST /api/admin/content/packages - Create new package
export async function POST(request: NextRequest) {
  try {
    const session = await verifyAdminSession(request)
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { name, description, category, duration, price, highlights, itinerary, images } = body

    // Get max order to append new package
    const maxOrder = await prisma.package.aggregate({
      _max: { order: true },
    })
    const newOrder = (maxOrder._max.order || 0) + 1

    // Create package
    const newPackage = await prisma.package.create({
      data: {
        name,
        description,
        category,
        duration,
        price,
        itinerary: itinerary || '',
        order: newOrder,
        highlights: {
          create: highlights?.map((text: string, index: number) => ({
            text,
            order: index,
          })) || [],
        },
        images: {
          create: images?.map((url: string, index: number) => ({
            url,
            order: index,
          })) || [],
        },
      },
      include: {
        highlights: { orderBy: { order: 'asc' } },
        images: { orderBy: { order: 'asc' } },
      },
    })

    return NextResponse.json({
      success: true,
      data: {
        id: newPackage.id,
        name: newPackage.name,
        description: newPackage.description,
        category: newPackage.category,
        duration: newPackage.duration,
        price: newPackage.price,
        highlights: newPackage.highlights.map((h) => h.text),
        itinerary: newPackage.itinerary || '',
        images: newPackage.images.map((img) => img.url),
      },
    })
  } catch (error: any) {
    console.error('Error creating package:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

// PUT /api/admin/content/packages - Update package
export async function PUT(request: NextRequest) {
  try {
    const session = await verifyAdminSession(request)
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { id, name, description, category, duration, price, highlights, itinerary, images } = body

    if (!id) {
      return NextResponse.json({ success: false, error: 'Package ID required' }, { status: 400 })
    }

    // Update package
    await prisma.package.update({
      where: { id },
      data: {
        name,
        description,
        category,
        duration,
        price,
        itinerary: itinerary || '',
      },
    })

    // Update highlights
    if (highlights) {
      await prisma.packageHighlight.deleteMany({ where: { packageId: id } })
      await prisma.packageHighlight.createMany({
        data: highlights.map((text: string, index: number) => ({
          packageId: id,
          text,
          order: index,
        })),
      })
    }

    // Update images
    if (images) {
      await prisma.packageImage.deleteMany({ where: { packageId: id } })
      await prisma.packageImage.createMany({
        data: images.map((url: string, index: number) => ({
          packageId: id,
          url,
          order: index,
        })),
      })
    }

    return NextResponse.json({ success: true, message: 'Package updated' })
  } catch (error: any) {
    console.error('Error updating package:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

// DELETE /api/admin/content/packages - Delete package
export async function DELETE(request: NextRequest) {
  try {
    const session = await verifyAdminSession(request)
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ success: false, error: 'Package ID required' }, { status: 400 })
    }

    await prisma.package.delete({ where: { id } })

    return NextResponse.json({ success: true, message: 'Package deleted' })
  } catch (error: any) {
    console.error('Error deleting package:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
