/**
 * API Route: /api/admin/content/[section]
 * 
 * Admin-only endpoints for updating specific content sections
 * 
 * Sections: home, about, packages, travel-tours, service-pages, contact, footer
 * 
 * TODO: Replace mockDataStore with Prisma client when database is connected
 */

import { NextRequest, NextResponse } from 'next/server'
import { mockDataStore } from '@/lib/mock-data-store'
import { verifyAdminSession } from '@/lib/auth-helpers'

// GET /api/admin/content/[section] - Get specific section
export async function GET(
  request: NextRequest,
  { params }: { params: { section: string } }
) {
  try {
    const session = await verifyAdminSession(request)
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const { section } = params

    // TODO: Replace with Prisma queries
    let data = null

    switch (section) {
      case 'home':
        data = {
          hero: {
            title: mockDataStore.getHomePage()?.heroTitle || '',
            subtitle: mockDataStore.getHomePage()?.heroSubtitle || '',
            description: mockDataStore.getHomePage()?.heroDescription || '',
            cta1Text: mockDataStore.getHomePage()?.heroCta1Text || '',
            cta2Text: mockDataStore.getHomePage()?.heroCta2Text || '',
            images: mockDataStore.getHomeHeroImages().map((img) => img.url),
            stats: mockDataStore.getHomeStats(),
          },
          services: mockDataStore.getHomeServices(),
        }
        break
      case 'about':
        data = {
          heroTitle: mockDataStore.getAboutPage()?.heroTitle || '',
          heroSubtitle: mockDataStore.getAboutPage()?.heroSubtitle || '',
          heroImage: mockDataStore.getAboutPage()?.heroImageUrl || '',
          mission: mockDataStore.getAboutMission(),
          vision: mockDataStore.getAboutVision(),
          coreValues: mockDataStore.getAboutCoreValues(),
          founder: mockDataStore.getAboutFounder(),
          team: mockDataStore.getAboutTeamMembers(),
        }
        break
      case 'packages':
        data = mockDataStore.getPackages()
        break
      case 'travel-tours':
        data = {
          hero: mockDataStore.getTravelToursPage(),
          featured: mockDataStore.getTravelToursFeatured(),
        }
        break
      case 'service-pages':
        data = mockDataStore.getServicePages()
        break
      case 'contact':
        data = mockDataStore.getContactInfo()
        break
      case 'footer':
        data = mockDataStore.getFooterInfo()
        break
      default:
        return NextResponse.json({ success: false, error: 'Invalid section' }, { status: 400 })
    }

    return NextResponse.json({ success: true, data })
  } catch (error: any) {
    console.error(`Error fetching ${params.section}:`, error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

// PUT /api/admin/content/[section] - Update specific section
export async function PUT(
  request: NextRequest,
  { params }: { params: { section: string } }
) {
  try {
    const session = await verifyAdminSession(request)
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const { section } = params
    const body = await request.json()

    // TODO: Replace with Prisma updates
    // This is simplified - in production, you'd have proper validation and error handling

    switch (section) {
      case 'home':
        if (body.hero) {
          mockDataStore.updateHomePage(body.hero)
        }
        if (body.services) {
          mockDataStore.updateHomeServices(body.services)
        }
        break
      case 'about':
        if (body.heroTitle) {
          mockDataStore.updateAboutPage({ heroTitle: body.heroTitle })
        }
        // Add more cases as needed
        break
      // Add more sections...
      default:
        return NextResponse.json({ success: false, error: 'Invalid section' }, { status: 400 })
    }

    return NextResponse.json({ success: true, message: `${section} updated` })
  } catch (error: any) {
    console.error(`Error updating ${params.section}:`, error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
