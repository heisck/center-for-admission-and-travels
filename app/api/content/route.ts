/**
 * API Route: /api/content
 * 
 * GET: Fetch all content for frontend
 * POST: Update content (admin only)
 * 
 * Now using Prisma to fetch from database
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyAdminSession } from '@/lib/auth-helpers'

// Cache public content for fast reads, then invalidate cache when admins save.
export const revalidate = 60

// GET /api/content - Fetch all content for frontend
export async function GET() {
  try {
    // Fetch all content from database using Prisma
    // Use Promise.allSettled to handle individual failures gracefully
    const results = await Promise.allSettled([
      // Home Page
      prisma.homePage.findUnique({
        where: { id: 'home' },
        include: {
          heroImages: { orderBy: { order: 'asc' } },
          heroStats: { orderBy: { order: 'asc' } },
          services: { orderBy: { order: 'asc' } },
          featuredPackages: {
            orderBy: { order: 'asc' },
            include: {
              package: {
                include: {
                  highlights: { orderBy: { order: 'asc' } },
                  images: { orderBy: { order: 'asc' } },
                },
              },
            },
          },
        },
      }),
      // About Page
      prisma.aboutPage.findUnique({
        where: { id: 'about' },
        include: {
          mission: { include: { points: { orderBy: { order: 'asc' } } } },
          vision: { include: { points: { orderBy: { order: 'asc' } } } },
          coreValues: { orderBy: { order: 'asc' } },
          founder: true,
          teamMembers: { orderBy: { order: 'asc' } },
          successStories: { orderBy: { order: 'asc' } },
        },
      }),
      // Packages
      prisma.package.findMany({
        orderBy: { order: 'asc' },
        include: {
          highlights: { orderBy: { order: 'asc' } },
          images: { orderBy: { order: 'asc' } },
          included: { orderBy: { order: 'asc' } },
          notIncluded: { orderBy: { order: 'asc' } },
        },
      }),
      // Travel Tours
      prisma.travelToursPage.findUnique({
        where: { id: 'travel-tours' },
        include: {
          featuredPackages: {
            orderBy: { order: 'asc' },
            include: { highlights: { orderBy: { order: 'asc' } } },
          },
          benefits: { orderBy: { order: 'asc' } },
          galleryImages: { orderBy: { order: 'asc' } },
        },
      }),
      // Contact Info
      prisma.contactInfo.findUnique({ where: { id: 'contact' } }),
      // Footer Info
      prisma.footerInfo.findUnique({
        where: { id: 'footer' },
        include: { socialLinks: { orderBy: { order: 'asc' } } },
      }),
      // Blog Posts (published only) - safe if migration not yet run
      (prisma as any).blogPost
        ? (prisma as any).blogPost.findMany({
            where: { published: true },
            orderBy: [{ publishedAt: 'desc' }, { order: 'asc' }],
            take: 10,
          })
        : Promise.resolve([]),
      // Service Pages
      prisma.servicePage.findMany({
        include: {
          whyStudySection: { include: { highlights: { orderBy: { order: 'asc' } } } },
          benefits: { orderBy: { order: 'asc' } },
          requirements: { orderBy: { order: 'asc' } },
          countries: { orderBy: { order: 'asc' } },
          successStories: { orderBy: { order: 'asc' } },
          scholarships: { orderBy: { order: 'asc' } },
        },
      }),
    ])

    // Extract results, handling failures gracefully
    const homePage = results[0].status === 'fulfilled' ? results[0].value : null
    const aboutPage = results[1].status === 'fulfilled' ? results[1].value : null
    const packages = results[2].status === 'fulfilled' ? results[2].value : []
    const travelToursPage = results[3].status === 'fulfilled' ? results[3].value : null
    const contactInfo = results[4].status === 'fulfilled' ? results[4].value : null
    const footerInfo = results[5].status === 'fulfilled' ? results[5].value : null
    const blogPosts = results[6].status === 'fulfilled' ? results[6].value : []
    const servicePages = results[7].status === 'fulfilled' ? results[7].value : []

    // Log any failures for debugging
    results.forEach((result, index) => {
      if (result.status === 'rejected') {
        console.error(`Failed to fetch content at index ${index}:`, result.reason)
      }
    })

    // Transform database data to match frontend format
    const content = {
      home: {
        hero: {
          title: homePage?.heroTitle || '',
          subtitle: homePage?.heroSubtitle || '',
          description: homePage?.heroDescription || '',
          cta1Text: homePage?.heroCta1Text || '',
          cta2Text: homePage?.heroCta2Text || '',
          images: homePage?.heroImages?.map((img) => img.url) || [],
          stats: homePage?.heroStats?.map((stat) => ({
            value: stat.value,
            label: stat.label,
          })) || [],
        },
        services: homePage?.services?.map((svc) => ({
          id: svc.id,
          icon: svc.icon,
          title: svc.title,
          description: svc.description,
        })) || [],
        featuredPackages: (homePage?.featuredPackages ?? [])
          .map((fp: any) => fp.package)
          .filter(Boolean)
          .map((pkg: any) => ({
            id: pkg.id,
            name: pkg.name,
            description: pkg.description,
            category: pkg.category,
            duration: pkg.duration,
            price: pkg.price,
            highlights: pkg.highlights?.map((h: any) => h.text) || [],
            images: pkg.images?.map((img: any) => img.url) || [],
          })) || [],
      },
      about: {
        heroTitle: aboutPage?.heroTitle || '',
        heroSubtitle: aboutPage?.heroSubtitle || '',
        heroImage: aboutPage?.heroImageUrl || '',
        mission: {
          title: aboutPage?.mission?.title || '',
          description: aboutPage?.mission?.description || '',
          points: aboutPage?.mission?.points?.map((p) => p.text) || [],
        },
        vision: {
          title: aboutPage?.vision?.title || '',
          description: aboutPage?.vision?.description || '',
          points: aboutPage?.vision?.points?.map((p) => p.text) || [],
        },
        coreValues: aboutPage?.coreValues?.map((cv) => ({
          id: cv.id,
          title: cv.title,
          description: cv.description,
        })) || [],
        founder: {
          name: aboutPage?.founder?.name || '',
          title: aboutPage?.founder?.title || '',
          description: aboutPage?.founder?.description || '',
          image: aboutPage?.founder?.imageUrl || '',
          vision: aboutPage?.founder?.vision || '',
          mission: aboutPage?.founder?.mission || '',
          values: aboutPage?.founder?.values || '',
        },
        team: aboutPage?.teamMembers?.map((tm) => ({
          id: tm.id,
          name: tm.name,
          role: tm.role,
          image: tm.imageUrl,
          description: tm.description,
        })) || [],
        successStories: aboutPage?.successStories?.map((ss) => ({
          id: ss.id,
          name: ss.name,
          program: ss.program,
          quote: ss.quote,
        })) || [],
      },
      packages: packages.map((pkg) => ({
        id: pkg.id,
        name: pkg.name,
        description: pkg.description,
        category: pkg.category,
        duration: pkg.duration,
        price: pkg.price,
        highlights: pkg.highlights?.map((h) => h.text) || [],
        itinerary: pkg.itinerary || '',
        images: pkg.images?.map((img) => img.url) || [],
        included: pkg.included?.map((item) => item.text) || [],
        notIncluded: pkg.notIncluded?.map((item) => item.text) || [],
      })),
      travelTours: {
        hero: {
          title: travelToursPage?.heroTitle || '',
          description: travelToursPage?.heroDescription || '',
          paragraph: travelToursPage?.heroParagraph || '',
          image: travelToursPage?.heroImageUrl || '',
        },
        featured: travelToursPage?.featuredPackages?.map((fp) => ({
          id: fp.id,
          name: fp.name,
          description: fp.description,
          duration: fp.duration,
          price: fp.price,
          image: fp.imageUrl,
          highlights: fp.highlights?.map((h) => h.text) || [],
        })) || [],
        benefits: travelToursPage?.benefits?.map((b) => ({
          id: b.id,
          title: b.title,
          description: b.description,
        })) || [],
        galleryImages: travelToursPage?.galleryImages?.map((img) => img.url) || [],
      },
      contact: {
        phone: contactInfo?.phone || '',
        email: contactInfo?.email || '',
        address: {
          street: contactInfo?.addressStreet || '',
          city: contactInfo?.addressCity || '',
          region: contactInfo?.addressRegion || '',
          country: contactInfo?.addressCountry || '',
        },
        whatsappNumber: contactInfo?.whatsappNumber || '',
        location: {
          latitude: contactInfo?.mapLatitude ?? null,
          longitude: contactInfo?.mapLongitude ?? null,
        },
      },
      footer: {
        companyDescription: footerInfo?.companyDescription || '',
        socialLinks: footerInfo?.socialLinks?.map((sl) => ({
          id: sl.id,
          platform: sl.platform,
          url: sl.url,
        })) || [],
      },
      blogPosts: blogPosts.map((bp: any) => ({
        id: bp.id,
        slug: bp.slug,
        title: bp.title,
        excerpt: bp.excerpt || '',
        imageUrl: bp.imageUrl || null,
        packageId: bp.packageId || null,
        publishedAt: bp.publishedAt?.toISOString?.() || null,
      })),
      servicePages: servicePages.map((sp) => ({
        id: sp.serviceId,
        title: sp.title,
        description: sp.description,
        icon: sp.icon,
        route: sp.route,
        heroImage: sp.heroImageUrl,
        bannerTitle: sp.bannerTitle,
        bannerSubtitle: sp.bannerSubtitle,
        overview: sp.overview || undefined,
        whyStudyOutsideThisCountry: sp.whyStudySection
          ? {
              title: sp.whyStudySection.title,
              highlights: sp.whyStudySection.highlights?.map((h) => h.text) || [],
            }
          : undefined,
        benefits: sp.benefits?.map((b) => b.text) || [],
        requirements: sp.requirements?.map((r) => r.text) || [],
        countries: sp.countries?.map((c) => ({
          name: c.name,
          description: c.description,
          image: c.imageUrl,
        })) || [],
        visaGuidance: sp.visaGuidance || '',
        successStories: sp.successStories?.map((ss) => ({
          name: ss.name,
          program: ss.program,
          quote: ss.quote,
        })) || [],
        scholarships: sp.scholarships?.map((sch) => ({
          name: sch.name,
          amount: sch.amount,
          description: sch.description,
        })) || [],
      })),
    }

    return NextResponse.json(
      { success: true, data: content },
      {
        headers: {
          'Cache-Control': 'public, max-age=0, s-maxage=60, must-revalidate',
        },
      }
    )
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
