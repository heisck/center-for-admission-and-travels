/**
 * API Route: /api/content
 * 
 * GET: Fetch all content for frontend
 * POST: Update content (admin only)
 * 
 * TODO: Replace mockDataStore with Prisma client when database is connected
 */

import { NextRequest, NextResponse } from 'next/server'
import { mockDataStore } from '@/lib/mock-data-store'
import { verifyAdminSession } from '@/lib/auth-helpers'

// GET /api/content - Fetch all content for frontend
export async function GET() {
  try {
    // Fetch all content from mock store
    // TODO: Replace with Prisma queries when database is connected
    const content = {
      home: {
        hero: {
          title: mockDataStore.getHomePage()?.heroTitle || '',
          subtitle: mockDataStore.getHomePage()?.heroSubtitle || '',
          description: mockDataStore.getHomePage()?.heroDescription || '',
          cta1Text: mockDataStore.getHomePage()?.heroCta1Text || '',
          cta2Text: mockDataStore.getHomePage()?.heroCta2Text || '',
          images: mockDataStore.getHomeHeroImages().map((img) => img.url),
          stats: mockDataStore.getHomeStats().map((stat) => ({
            value: stat.value,
            label: stat.label,
          })),
        },
        services: mockDataStore.getHomeServices().map((svc) => ({
          id: svc.id,
          icon: svc.icon,
          title: svc.title,
          description: svc.description,
        })),
      },
      about: {
        heroTitle: mockDataStore.getAboutPage()?.heroTitle || '',
        heroSubtitle: mockDataStore.getAboutPage()?.heroSubtitle || '',
        heroImage: mockDataStore.getAboutPage()?.heroImageUrl || '',
        mission: {
          title: mockDataStore.getAboutMission()?.title || '',
          description: mockDataStore.getAboutMission()?.description || '',
          points: mockDataStore.getAboutMission()?.points?.map((p: any) => p.text) || [],
        },
        vision: {
          title: mockDataStore.getAboutVision()?.title || '',
          description: mockDataStore.getAboutVision()?.description || '',
          points: mockDataStore.getAboutVision()?.points?.map((p: any) => p.text) || [],
        },
        coreValues: mockDataStore.getAboutCoreValues().map((cv) => ({
          id: cv.id,
          title: cv.title,
          description: cv.description,
        })),
        founder: {
          name: mockDataStore.getAboutFounder()?.name || '',
          title: mockDataStore.getAboutFounder()?.title || '',
          description: mockDataStore.getAboutFounder()?.description || '',
          image: mockDataStore.getAboutFounder()?.imageUrl || '',
          vision: mockDataStore.getAboutFounder()?.vision || '',
          mission: mockDataStore.getAboutFounder()?.mission || '',
          values: mockDataStore.getAboutFounder()?.values || '',
        },
        team: mockDataStore.getAboutTeamMembers().map((tm) => ({
          id: tm.id,
          name: tm.name,
          role: tm.role,
          image: tm.imageUrl,
          description: tm.description,
        })),
      },
      packages: mockDataStore.getPackages().map((pkg) => ({
        id: pkg.id,
        name: pkg.name,
        description: pkg.description,
        category: pkg.category,
        duration: pkg.duration,
        price: pkg.price,
        highlights: pkg.highlights?.map((h: any) => h.text) || [],
        itinerary: pkg.itinerary || '',
        images: pkg.images?.map((img: any) => img.url) || [],
      })),
      travelTours: {
        hero: {
          title: mockDataStore.getTravelToursPage()?.heroTitle || '',
          description: mockDataStore.getTravelToursPage()?.heroDescription || '',
          paragraph: mockDataStore.getTravelToursPage()?.heroParagraph || '',
          image: mockDataStore.getTravelToursPage()?.heroImageUrl || '',
        },
        featured: mockDataStore.getTravelToursFeatured().map((fp) => ({
          id: fp.id,
          name: fp.name,
          description: fp.description,
          duration: fp.duration,
          price: fp.price,
          image: fp.imageUrl,
          highlights: fp.highlights?.map((h: any) => h.text) || [],
        })),
      },
      contact: {
        phone: mockDataStore.getContactInfo()?.phone || '',
        email: mockDataStore.getContactInfo()?.email || '',
        address: {
          street: mockDataStore.getContactInfo()?.addressStreet || '',
          city: mockDataStore.getContactInfo()?.addressCity || '',
          region: mockDataStore.getContactInfo()?.addressRegion || '',
          country: mockDataStore.getContactInfo()?.addressCountry || '',
        },
        whatsappNumber: mockDataStore.getContactInfo()?.whatsappNumber || '',
      },
      footer: {
        companyDescription: mockDataStore.getFooterInfo()?.companyDescription || '',
        socialLinks: mockDataStore.getFooterInfo()?.socialLinks?.map((sl: any) => ({
          platform: sl.platform,
          url: sl.url,
        })) || [],
      },
      servicePages: mockDataStore.getServicePages().map((sp) => ({
        id: sp.serviceId,
        title: sp.title,
        description: sp.description,
        icon: sp.icon,
        route: sp.route,
        heroImage: sp.heroImageUrl,
        bannerTitle: sp.bannerTitle,
        bannerSubtitle: sp.bannerSubtitle,
        overview: sp.overview,
        benefits: sp.benefits?.map((b: any) => b.text) || [],
        requirements: sp.requirements?.map((r: any) => r.text) || [],
        countries: sp.countries?.map((c: any) => ({
          name: c.name,
          description: c.description,
          image: c.imageUrl,
        })) || [],
        visaGuidance: sp.visaGuidance || '',
      })),
    }

    return NextResponse.json({ success: true, data: content })
  } catch (error: any) {
    console.error('Error fetching content:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

// POST /api/content - Update content (admin only)
export async function POST(request: NextRequest) {
  try {
    // Verify admin session
    const session = await verifyAdminSession(request)
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { section, data } = body

    // TODO: Replace with Prisma updates when database is connected
    // This is a simplified example - in production, you'd have specific endpoints for each section

    return NextResponse.json({ success: true, message: 'Content updated (mock)' })
  } catch (error: any) {
    console.error('Error updating content:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
