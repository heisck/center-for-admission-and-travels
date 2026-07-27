/**
 * API Route: /api/admin/content/packages
 * 
 * Admin-only endpoints for managing packages
 */

import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath, revalidateTag } from 'next/cache'
import { PackageCategory } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { verifyAdminSession } from '@/lib/auth-helpers'
import { hasAdminPermission } from '@/lib/admin-permissions'
import { logAdminAudit } from '@/lib/admin-audit'
import { DEFAULT_CURRENCY, isSupportedCurrency, normalizeCurrency } from '@/lib/currency'
import { deleteUnreferencedCloudinaryUrls } from '@/lib/cloudinary-orphans'
import { checkRateLimit, rateLimitResponse } from '@/lib/rate-limit'
import { getClientIp } from '@/lib/security'

const PACKAGE_ID_PATTERN = /^[A-Za-z0-9_-]{1,128}$/
const VALID_CATEGORIES = new Set<PackageCategory>([
  PackageCategory.travel,
  PackageCategory.study,
  PackageCategory.work,
])

type ParseResult<T> =
  | { value: T; error?: never }
  | { error: string; value?: never }

function boundedText(value: unknown, maxLength: number) {
  return String(value ?? '').trim().slice(0, maxLength)
}

function parseTextArray(
  value: unknown,
  field: string,
  options: { maxItems?: number; maxLength?: number } = {}
): ParseResult<string[]> {
  if (!Array.isArray(value)) {
    return { error: `${field} must be an array` } as const
  }

  const maxItems = options.maxItems ?? 100
  const maxLength = options.maxLength ?? 500
  if (value.length > maxItems) {
    return { error: `${field} cannot contain more than ${maxItems} items` } as const
  }

  return {
    value: value
      .map((item) => boundedText(item, maxLength))
      .filter(Boolean),
  } as const
}

function parseImageArray(value: unknown): ParseResult<string[]> {
  const parsed = parseTextArray(value, 'Images', { maxItems: 20, maxLength: 2000 })
  if ('error' in parsed) return parsed

  const invalid = parsed.value.find(
    (url) => !url.startsWith('/') && !/^https:\/\/[^\s]+$/i.test(url)
  )
  if (invalid) {
    return { error: 'Images must use an HTTPS URL or a local /public path' } as const
  }
  return parsed
}

function parsePrice(value: unknown) {
  const price = Number(value)
  if (!Number.isFinite(price) || price <= 0 || price > 1_000_000) {
    return { error: 'Price must be greater than 0 and no more than 1,000,000' } as const
  }
  return { value: price } as const
}

function parseCategory(value: unknown) {
  const category = String(value || '').trim().toLowerCase() as PackageCategory
  if (!VALID_CATEGORIES.has(category)) {
    return { error: 'Category must be travel, study, or work' } as const
  }
  return { value: category } as const
}

function parseCurrency(value: unknown) {
  const currency = String(value || '').trim().toUpperCase()
  if (!isSupportedCurrency(currency)) {
    return { error: 'Currency must be GHS, USD, EUR, or GBP' } as const
  }
  return { value: normalizeCurrency(currency) } as const
}

async function enforceAdminWriteLimit(request: NextRequest, userId: string) {
  const { allowed, retryAfterMs } = await checkRateLimit(
    `admin-packages-write:${userId}:${getClientIp(request)}`,
    { maxRequests: 60, windowMs: 60_000 }
  )
  return allowed ? null : rateLimitResponse(retryAfterMs)
}

function revalidatePackageSurfaces(packageId?: string) {
  revalidatePath('/api/content')
  revalidatePath('/', 'layout')
  revalidatePath('/packages')
  revalidatePath('/travel-tours')
  revalidatePath('/')
  if (packageId) {
    revalidatePath(`/api/packages/${packageId}`)
    revalidatePath(`/checkout`)
  }
  revalidateTag('public-content', 'max')
}

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
    const limited = await enforceAdminWriteLimit(request, session.userId)
    if (limited) return limited

    const body = await request.json().catch(() => null)
    if (!body || typeof body !== 'object') {
      return NextResponse.json({ success: false, error: 'Invalid JSON body' }, { status: 400 })
    }
    const { name, description, category, duration, price, currency, highlights, itinerary, images, included, notIncluded } = body

    const safeName = boundedText(name, 160)
    const safeDuration = boundedText(duration, 120)
    const safeDescription = boundedText(description, 5000)
    const safeItinerary = boundedText(itinerary, 50_000)

    if (!safeName) {
      return NextResponse.json({ success: false, error: 'Package name is required' }, { status: 400 })
    }
    if (!safeDuration) {
      return NextResponse.json({ success: false, error: 'Package duration is required' }, { status: 400 })
    }
    const parsedCategory = parseCategory(category)
    if ('error' in parsedCategory) {
      return NextResponse.json({ success: false, error: parsedCategory.error }, { status: 400 })
    }
    const parsedPrice = parsePrice(price)
    if ('error' in parsedPrice) {
      return NextResponse.json({ success: false, error: parsedPrice.error }, { status: 400 })
    }
    const parsedCurrency = currency === undefined
      ? { value: DEFAULT_CURRENCY } as const
      : parseCurrency(currency)
    if ('error' in parsedCurrency) {
      return NextResponse.json({ success: false, error: parsedCurrency.error }, { status: 400 })
    }
    const parsedHighlights = parseTextArray(highlights ?? [], 'Highlights')
    const parsedImages = parseImageArray(images ?? [])
    const parsedIncluded = parseTextArray(included ?? [], 'Included items')
    const parsedNotIncluded = parseTextArray(notIncluded ?? [], 'Not included items')
    for (const parsed of [parsedHighlights, parsedImages, parsedIncluded, parsedNotIncluded]) {
      if ('error' in parsed) {
        return NextResponse.json({ success: false, error: parsed.error }, { status: 400 })
      }
    }

    // Get max order to append new package
    const maxOrder = await prisma.package.aggregate({
      _max: { order: true },
    })
    const newOrder = (maxOrder._max.order || 0) + 1

    // Create package
    const newPackage = await prisma.package.create({
      data: {
        name: safeName,
        description: safeDescription,
        category: parsedCategory.value,
        duration: safeDuration,
        price: parsedPrice.value,
        currency: parsedCurrency.value,
        itinerary: safeItinerary,
        order: newOrder,
        highlights: {
          create: parsedHighlights.value.map((text: string, index: number) => ({
            text,
            order: index,
          })),
        },
        images: {
          create: parsedImages.value.map((url: string, index: number) => ({
            url,
            order: index,
          })),
        },
        included: {
          create: parsedIncluded.value.map((text: string, index: number) => ({
            text,
            order: index,
          })),
        },
        notIncluded: {
          create: parsedNotIncluded.value.map((text: string, index: number) => ({
            text,
            order: index,
          })),
        },
      },
      include: {
        highlights: { orderBy: { order: 'asc' } },
        images: { orderBy: { order: 'asc' } },
        included: { orderBy: { order: 'asc' } },
        notIncluded: { orderBy: { order: 'asc' } },
      },
    })

    revalidatePackageSurfaces(newPackage.id)

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
    const limited = await enforceAdminWriteLimit(request, session.userId)
    if (limited) return limited

    const body = await request.json().catch(() => null)
    if (!body || typeof body !== 'object') {
      return NextResponse.json({ success: false, error: 'Invalid JSON body' }, { status: 400 })
    }
    const { id, name, description, category, duration, price, currency, highlights, itinerary, images, included, notIncluded } = body

    const safeId = boundedText(id, 128)
    if (!PACKAGE_ID_PATTERN.test(safeId)) {
      return NextResponse.json({ success: false, error: 'Package ID required' }, { status: 400 })
    }

    // Partial update: only write fields that were explicitly provided
    const packageData: Record<string, unknown> = {}
    if (name !== undefined) {
      const value = boundedText(name, 160)
      if (!value) {
        return NextResponse.json({ success: false, error: 'Package name is required' }, { status: 400 })
      }
      packageData.name = value
    }
    if (description !== undefined) packageData.description = boundedText(description, 5000)
    if (category !== undefined) {
      const parsed = parseCategory(category)
      if ('error' in parsed) {
        return NextResponse.json({ success: false, error: parsed.error }, { status: 400 })
      }
      packageData.category = parsed.value
    }
    if (duration !== undefined) {
      const value = boundedText(duration, 120)
      if (!value) {
        return NextResponse.json({ success: false, error: 'Package duration is required' }, { status: 400 })
      }
      packageData.duration = value
    }
    if (price !== undefined) {
      const parsed = parsePrice(price)
      if ('error' in parsed) {
        return NextResponse.json({ success: false, error: parsed.error }, { status: 400 })
      }
      packageData.price = parsed.value
    }
    if (currency !== undefined) {
      const parsed = parseCurrency(currency)
      if ('error' in parsed) {
        return NextResponse.json({ success: false, error: parsed.error }, { status: 400 })
      }
      packageData.currency = parsed.value
    }
    if (itinerary !== undefined) packageData.itinerary = boundedText(itinerary, 50_000)

    const parsedHighlights = highlights === undefined ? null : parseTextArray(highlights, 'Highlights')
    const parsedImages = images === undefined ? null : parseImageArray(images)
    const parsedIncluded = included === undefined ? null : parseTextArray(included, 'Included items')
    const parsedNotIncluded = notIncluded === undefined ? null : parseTextArray(notIncluded, 'Not included items')
    for (const parsed of [parsedHighlights, parsedImages, parsedIncluded, parsedNotIncluded]) {
      if (parsed && 'error' in parsed) {
        return NextResponse.json({ success: false, error: parsed.error }, { status: 400 })
      }
    }
    if (
      Object.keys(packageData).length === 0 &&
      !parsedHighlights &&
      !parsedImages &&
      !parsedIncluded &&
      !parsedNotIncluded
    ) {
      return NextResponse.json({ success: false, error: 'No package fields supplied' }, { status: 400 })
    }

    const existingPackage = await prisma.package.findUnique({
      where: { id: safeId },
      select: { id: true },
    })
    if (!existingPackage) {
      return NextResponse.json({ success: false, error: 'Package not found' }, { status: 404 })
    }

    let removedImageUrls: string[] = []

    await prisma.$transaction(async (tx) => {
      if (Object.keys(packageData).length > 0) {
        await tx.package.update({
          where: { id: safeId },
          data: packageData,
        })
      }

      if (parsedHighlights) {
        await tx.packageHighlight.deleteMany({ where: { packageId: safeId } })
        const data = parsedHighlights.value.map((text: string, index: number) => ({
          packageId: safeId,
          text,
          order: index,
        }))
        if (data.length > 0) await tx.packageHighlight.createMany({ data })
      }

      if (parsedImages) {
        const previousImages = await tx.packageImage.findMany({
          where: { packageId: safeId },
          select: { url: true },
        })
        const nextUrls = parsedImages.value
        const nextSet = new Set(nextUrls)
        removedImageUrls = previousImages
          .map((img) => img.url)
          .filter((url) => !nextSet.has(url))

        await tx.packageImage.deleteMany({ where: { packageId: safeId } })
        const data = nextUrls.map((url: string, index: number) => ({
          packageId: safeId,
          url,
          order: index,
        }))
        if (data.length > 0) await tx.packageImage.createMany({ data })
      }

      if (parsedIncluded) {
        await tx.packageIncluded.deleteMany({ where: { packageId: safeId } })
        const data = parsedIncluded.value.map((text: string, index: number) => ({
          packageId: safeId,
          text,
          order: index,
        }))
        if (data.length > 0) await tx.packageIncluded.createMany({ data })
      }

      if (parsedNotIncluded) {
        await tx.packageNotIncluded.deleteMany({ where: { packageId: safeId } })
        const data = parsedNotIncluded.value.map((text: string, index: number) => ({
          packageId: safeId,
          text,
          order: index,
        }))
        if (data.length > 0) await tx.packageNotIncluded.createMany({ data })
      }
    })

    // After DB commit: drop only assets no longer referenced anywhere (shared URLs stay)
    if (removedImageUrls.length > 0) {
      void deleteUnreferencedCloudinaryUrls(removedImageUrls)
    }

    revalidatePackageSurfaces(safeId)

    await logAdminAudit({
      request,
      session,
      action: 'package.update',
      entityType: 'package',
      entityId: safeId,
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
    const limited = await enforceAdminWriteLimit(request, session.userId)
    if (limited) return limited

    const body = await request.json().catch(() => null)
    if (!body || typeof body !== 'object') {
      return NextResponse.json({ success: false, error: 'Invalid JSON body' }, { status: 400 })
    }
    const parsedCurrency = parseCurrency(body?.currency)
    if ('error' in parsedCurrency) {
      return NextResponse.json({ success: false, error: parsedCurrency.error }, { status: 400 })
    }
    const packageCurrency = parsedCurrency.value
    const packageIds = Array.isArray(body?.packageIds)
      ? body.packageIds
          .map((id: unknown) => boundedText(id, 128))
          .filter((id: string) => PACKAGE_ID_PATTERN.test(id))
      : null
    if (Array.isArray(body?.packageIds) && body.packageIds.length > 500) {
      return NextResponse.json(
        { success: false, error: 'No more than 500 packages can be updated at once' },
        { status: 400 }
      )
    }
    if (Array.isArray(body?.packageIds) && packageIds?.length !== body.packageIds.length) {
      return NextResponse.json({ success: false, error: 'One or more package IDs are invalid' }, { status: 400 })
    }

    const where =
      packageIds && packageIds.length > 0
        ? { id: { in: packageIds } }
        : {}

    const result = await prisma.package.updateMany({
      where,
      data: { currency: packageCurrency },
    })

    revalidatePackageSurfaces()

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
    const limited = await enforceAdminWriteLimit(request, session.userId)
    if (limited) return limited

    const { searchParams } = new URL(request.url)
    const id = boundedText(searchParams.get('id'), 128)

    if (!PACKAGE_ID_PATTERN.test(id)) {
      return NextResponse.json({ success: false, error: 'Package ID required' }, { status: 400 })
    }

    // Capture Cloudinary URLs before cascade-delete removes image rows
    const existing = await prisma.package.findUnique({
      where: { id },
      include: { images: { select: { url: true } } },
    })

    if (!existing) {
      return NextResponse.json({ success: false, error: 'Package not found' }, { status: 404 })
    }

    const imageUrls = existing.images.map((img) => img.url)

    await prisma.package.delete({ where: { id } })

    // Best-effort: remove only unreferenced package images (shared URLs stay)
    void deleteUnreferencedCloudinaryUrls(imageUrls)

    revalidatePackageSurfaces(id)

    await logAdminAudit({
      request,
      session,
      action: 'package.delete',
      entityType: 'package',
      entityId: id,
      metadata: { name: existing.name, imageCount: imageUrls.length },
    })

    return NextResponse.json({ success: true, message: 'Package deleted' })
  } catch (error: any) {
    console.error('Error deleting package:', error)
    return NextResponse.json({ success: false, error: 'Failed to delete package' }, { status: 500 })
  }
}
