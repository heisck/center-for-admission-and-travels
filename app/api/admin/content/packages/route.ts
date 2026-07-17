/**
 * API Route: /api/admin/content/packages
 * 
 * Admin-only endpoints for managing packages
 */

import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath, revalidateTag } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { verifyAdminSession } from '@/lib/auth-helpers'
import { hasAdminPermission } from '@/lib/admin-permissions'
import { logAdminAudit } from '@/lib/admin-audit'
import { DEFAULT_CURRENCY, normalizeCurrency } from '@/lib/currency'

// GET /api/admin/content/packages - Get all packages
export async function GET(request: NextRequest) {
  try {
    const session = await verifyAdminSession(request)
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }
    if (!hasAdminPermission(session.role, 'dashboard.read')) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })
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

    const formatted = packages.map((pkg: any) => ({
      id: pkg.id,
      name: pkg.name,
      description: pkg.description,
      category: pkg.category,
      duration: pkg.duration,
      price: pkg.price,
      currency: normalizeCurrency(pkg.currency),
      highlights: pkg.highlights.map((h: any) => h.text),
      itinerary: pkg.itinerary || '',
      images: pkg.images.map((img: any) => img.url),
      included: pkg.included.map((item: any) => item.text),
      notIncluded: pkg.notIncluded.map((item: any) => item.text),
    }))

    return NextResponse.json({ success: true, data: formatted })
  } catch (error: any) {
    console.error('Error fetching packages:', error)
    return NextResponse.json({ success: false, error: 'Failed to fetch packages' }, { status: 500 })
  }
}

// POST /api/admin/content/packages - Create new package
export async function POST(request: NextRequest) {
  try {
    const session = await verifyAdminSession(request)
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }
    if (!hasAdminPermission(session.role, 'content.write')) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const { name, description, category, duration, price, currency, highlights, itinerary, images, included, notIncluded } = body
    const packageCurrency = normalizeCurrency(currency, DEFAULT_CURRENCY)

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
        currency: packageCurrency,
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
        included: {
          create: included?.map((text: string, index: number) => ({
            text,
            order: index,
          })) || [],
        },
        notIncluded: {
          create: notIncluded?.map((text: string, index: number) => ({
            text,
            order: index,
          })) || [],
        },
      },
      include: {
        highlights: { orderBy: { order: 'asc' } },
        images: { orderBy: { order: 'asc' } },
        included: { orderBy: { order: 'asc' } },
        notIncluded: { orderBy: { order: 'asc' } },
      },
    })

    revalidatePath('/api/content')
    revalidatePath(`/api/packages/${newPackage.id}`)
    revalidatePath('/', 'layout')
    revalidateTag('public-content', 'max')

    await logAdminAudit({
      request,
      session,
      action: 'package.create',
      entityType: 'package',
      entityId: newPackage.id,
      metadata: { name: newPackage.name, category: newPackage.category },
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
        currency: normalizeCurrency(newPackage.currency),
        highlights: newPackage.highlights.map((h: any) => h.text),
        itinerary: newPackage.itinerary || '',
        images: newPackage.images.map((img: any) => img.url),
        included: newPackage.included.map((item: any) => item.text),
        notIncluded: newPackage.notIncluded.map((item: any) => item.text),
      },
    })
  } catch (error: any) {
    console.error('Error creating package:', error)
    return NextResponse.json({ success: false, error: 'Failed to create package' }, { status: 500 })
  }
}

// PUT /api/admin/content/packages - Update package
export async function PUT(request: NextRequest) {
  try {
    const session = await verifyAdminSession(request)
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }
    if (!hasAdminPermission(session.role, 'content.write')) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const { id, name, description, category, duration, price, currency, highlights, itinerary, images, included, notIncluded } = body

    if (!id) {
      return NextResponse.json({ success: false, error: 'Package ID required' }, { status: 400 })
    }

    // Partial update: only write fields that were explicitly provided
    const packageData: Record<string, unknown> = {}
    if (name !== undefined) packageData.name = name
    if (description !== undefined) packageData.description = description
    if (category !== undefined) packageData.category = category
    if (duration !== undefined) packageData.duration = duration
    if (price !== undefined) packageData.price = price
    if (currency !== undefined) packageData.currency = normalizeCurrency(currency)
    if (itinerary !== undefined) packageData.itinerary = itinerary || ''

    await prisma.$transaction(async (tx) => {
      if (Object.keys(packageData).length > 0) {
        await tx.package.update({
          where: { id },
          data: packageData,
        })
      }

      if (highlights) {
        await tx.packageHighlight.deleteMany({ where: { packageId: id } })
        const data = highlights.map((text: string, index: number) => ({
          packageId: id,
          text,
          order: index,
        }))
        if (data.length > 0) await tx.packageHighlight.createMany({ data })
      }

      if (images) {
        await tx.packageImage.deleteMany({ where: { packageId: id } })
        const data = images.map((url: string, index: number) => ({
          packageId: id,
          url,
          order: index,
        }))
        if (data.length > 0) await tx.packageImage.createMany({ data })
      }

      if (included) {
        await tx.packageIncluded.deleteMany({ where: { packageId: id } })
        const data = included.map((text: string, index: number) => ({
          packageId: id,
          text,
          order: index,
        }))
        if (data.length > 0) await tx.packageIncluded.createMany({ data })
      }

      if (notIncluded) {
        await tx.packageNotIncluded.deleteMany({ where: { packageId: id } })
        const data = notIncluded.map((text: string, index: number) => ({
          packageId: id,
          text,
          order: index,
        }))
        if (data.length > 0) await tx.packageNotIncluded.createMany({ data })
      }
    })

    revalidatePath('/api/content')
    revalidatePath(`/api/packages/${id}`)
    revalidatePath('/', 'layout')
    revalidateTag('public-content', 'max')

    await logAdminAudit({
      request,
      session,
      action: 'package.update',
      entityType: 'package',
      entityId: id,
      metadata: {
        name: packageData.name,
        category: packageData.category,
        currency: packageData.currency,
      },
    })

    return NextResponse.json({ success: true, message: 'Package updated' })
  } catch (error: any) {
    console.error('Error updating package:', error)
    return NextResponse.json({ success: false, error: 'Failed to update package' }, { status: 500 })
  }
}

/**
 * PATCH /api/admin/content/packages
 * Bulk-update currency for all packages, or a selected subset.
 * Body: { currency: 'USD' | 'EUR' | 'GBP' | 'GHS', packageIds?: string[] }
 */
export async function PATCH(request: NextRequest) {
  try {
    const session = await verifyAdminSession(request)
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }
    if (!hasAdminPermission(session.role, 'content.write')) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const packageCurrency = normalizeCurrency(body?.currency)
    const packageIds = Array.isArray(body?.packageIds)
      ? body.packageIds.map((id: unknown) => String(id).trim()).filter(Boolean)
      : null

    const where =
      packageIds && packageIds.length > 0
        ? { id: { in: packageIds } }
        : {}

    const result = await prisma.package.updateMany({
      where,
      data: { currency: packageCurrency },
    })

    revalidatePath('/api/content')
    revalidatePath('/', 'layout')
    revalidateTag('public-content', 'max')

    await logAdminAudit({
      request,
      session,
      action: 'package.bulk_currency',
      entityType: 'package',
      metadata: {
        currency: packageCurrency,
        packageIds: packageIds || 'all',
        updatedCount: result.count,
      },
    })

    return NextResponse.json({
      success: true,
      message: `Updated currency to ${packageCurrency} on ${result.count} package(s)`,
      data: { currency: packageCurrency, updatedCount: result.count },
    })
  } catch (error: any) {
    console.error('Error bulk-updating package currency:', error)
    return NextResponse.json({ success: false, error: 'Failed to update package currencies' }, { status: 500 })
  }
}

// DELETE /api/admin/content/packages - Delete package
export async function DELETE(request: NextRequest) {
  try {
    const session = await verifyAdminSession(request)
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }
    if (!hasAdminPermission(session.role, 'content.write')) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ success: false, error: 'Package ID required' }, { status: 400 })
    }

    await prisma.package.delete({ where: { id } })

    revalidatePath('/api/content')
    revalidatePath(`/api/packages/${id}`)
    revalidatePath('/', 'layout')
    revalidateTag('public-content', 'max')

    await logAdminAudit({
      request,
      session,
      action: 'package.delete',
      entityType: 'package',
      entityId: id,
    })

    return NextResponse.json({ success: true, message: 'Package deleted' })
  } catch (error: any) {
    console.error('Error deleting package:', error)
    return NextResponse.json({ success: false, error: 'Failed to delete package' }, { status: 500 })
  }
}
