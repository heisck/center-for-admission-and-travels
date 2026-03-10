/**
 * API Route: /api/packages/[id]
 * 
 * GET: Fetch a single package by ID
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const revalidate = 60

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const packageId = id

    if (!packageId) {
      return NextResponse.json(
        { success: false, error: 'Package ID is required' },
        { status: 400 }
      )
    }

    // Try to fetch from Package table first
    const pkg = await prisma.package.findUnique({
      where: { id: packageId },
      include: {
        highlights: { orderBy: { order: 'asc' } },
        images: { orderBy: { order: 'asc' } },
        included: { orderBy: { order: 'asc' } },
        notIncluded: { orderBy: { order: 'asc' } },
      },
    })

    // If not found in Package table, try TravelToursFeaturedPackage
    if (!pkg) {
      const featuredPkg = await prisma.travelToursFeaturedPackage.findUnique({
        where: { id: packageId },
        include: {
          highlights: { orderBy: { order: 'asc' } },
        },
      })

      if (featuredPkg) {
        // Transform TravelToursFeaturedPackage to match Package format
        const packageData = {
          id: featuredPkg.id,
          name: featuredPkg.name,
          description: featuredPkg.description,
          category: 'travel', // Travel tours packages are always travel category
          duration: featuredPkg.duration,
          price: featuredPkg.price,
          highlights: featuredPkg.highlights?.map((h) => h.text) || [],
          itinerary: '', // Travel tours packages don't have itinerary in the schema
          images: featuredPkg.imageUrl ? [featuredPkg.imageUrl] : [],
          included: [],
          notIncluded: [],
        }

        return NextResponse.json(
          { success: true, data: packageData },
          {
            headers: {
              'Cache-Control': 'public, max-age=0, s-maxage=60, must-revalidate',
            },
          }
        )
      }
    }

    if (!pkg) {
      return NextResponse.json(
        { success: false, error: 'Package not found' },
        { status: 404 }
      )
    }

    // Transform Package to match frontend format
    const packageData = {
      id: pkg.id,
      name: pkg.name,
      description: pkg.description,
      category: pkg.category,
      duration: pkg.duration,
      price: pkg.price,
      highlights: pkg.highlights?.map((h) => h.text) || [],
      itinerary: pkg.itinerary || '',
      images: pkg.images?.map((img) => img.url) || [],
      included: pkg.included?.map((i) => i.text) || [],
      notIncluded: pkg.notIncluded?.map((i) => i.text) || [],
    }

    return NextResponse.json(
      { success: true, data: packageData },
      {
        headers: {
          'Cache-Control': 'public, max-age=0, s-maxage=60, must-revalidate',
        },
      }
    )
  } catch (error) {
    console.error('Error fetching package:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch package' },
      { status: 500 }
    )
  }
}
