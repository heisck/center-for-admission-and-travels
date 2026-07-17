/**
 * API Route: /api/admin/content/[section]
 * 
 * Admin-only endpoints for updating specific content sections
 * 
 * Sections: home, about, packages, travel-tours, service-pages, contact, footer
 * 
 * Now using Prisma to read/write from database
 */

import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath, revalidateTag } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { verifyAdminSession } from '@/lib/auth-helpers'
import * as contentHelpers from '@/lib/prisma-content-helpers'
import { hasAdminPermission } from '@/lib/admin-permissions'
import { logAdminAudit } from '@/lib/admin-audit'

type UrlRow = { url: string }
type FeaturedPackageRow = { package: unknown }

// GET /api/admin/content/[section] - Get specific section
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ section: string }> | { section: string } }
) {
  try {
    const session = await verifyAdminSession(request)
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }
    if (!hasAdminPermission(session.role, 'dashboard.read')) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })
    }

    // Handle both Promise and direct params (Next.js 15+ vs 14)
    const resolvedParams = await Promise.resolve(params)
    const { section } = resolvedParams

    // Fetch from database using Prisma
    let data: any = null

    switch (section) {
      case 'home': {
        const homePage = await prisma.homePage.findUnique({
          where: { id: 'home' },
          include: {
            heroImages: { orderBy: { order: 'asc' } },
            heroStats: { orderBy: { order: 'asc' } },
            services: { orderBy: { order: 'asc' } },
            featuredPackages: { orderBy: { order: 'asc' }, include: { package: true } },
          },
        })
        data = {
          hero: {
            title: homePage?.heroTitle || '',
            subtitle: homePage?.heroSubtitle || '',
            description: homePage?.heroDescription || '',
            cta1Text: homePage?.heroCta1Text || '',
            cta2Text: homePage?.heroCta2Text || '',
            images: homePage?.heroImages?.map((img: UrlRow) => img.url) || [],
            stats: homePage?.heroStats || [],
          },
          services: homePage?.services || [],
          featuredPackages: homePage?.featuredPackages?.map((fp: FeaturedPackageRow) => fp.package) || [],
        }
        break
      }
      case 'about': {
        const aboutPage = await prisma.aboutPage.findUnique({
          where: { id: 'about' },
          include: {
            mission: { include: { points: { orderBy: { order: 'asc' } } } },
            vision: { include: { points: { orderBy: { order: 'asc' } } } },
            coreValues: { orderBy: { order: 'asc' } },
            founder: true,
            teamMembers: { orderBy: { order: 'asc' } },
          },
        })
        data = {
          heroTitle: aboutPage?.heroTitle || '',
          heroSubtitle: aboutPage?.heroSubtitle || '',
          heroImage: aboutPage?.heroImageUrl || '',
          mission: aboutPage?.mission,
          vision: aboutPage?.vision,
          coreValues: aboutPage?.coreValues || [],
          founder: aboutPage?.founder,
          team: aboutPage?.teamMembers || [],
        }
        break
      }
      case 'packages': {
        data = await prisma.package.findMany({
          orderBy: { order: 'asc' },
          include: {
            highlights: { orderBy: { order: 'asc' } },
            images: { orderBy: { order: 'asc' } },
            included: { orderBy: { order: 'asc' } },
            notIncluded: { orderBy: { order: 'asc' } },
          },
        })
        break
      }
      case 'travel-tours': {
        const travelToursPage = await prisma.travelToursPage.findUnique({
          where: { id: 'travel-tours' },
          include: {
            featuredPackages: {
              orderBy: { order: 'asc' },
              include: { highlights: { orderBy: { order: 'asc' } } },
            },
            benefits: { orderBy: { order: 'asc' } },
            galleryImages: { orderBy: { order: 'asc' } },
          },
        })
        data = {
          hero: travelToursPage,
          featured: travelToursPage?.featuredPackages || [],
          benefits: travelToursPage?.benefits || [],
          galleryImages: travelToursPage?.galleryImages.map((img: UrlRow) => img.url) || [],
        }
        break
      }
      case 'service-pages': {
        data = await prisma.servicePage.findMany({
          include: {
            whyStudySection: { include: { highlights: { orderBy: { order: 'asc' } } } },
            benefits: { orderBy: { order: 'asc' } },
            requirements: { orderBy: { order: 'asc' } },
            countries: { orderBy: { order: 'asc' } },
            successStories: { orderBy: { order: 'asc' } },
            scholarships: { orderBy: { order: 'asc' } },
          },
        })
        break
      }
      case 'contact': {
        data = await prisma.contactInfo.findUnique({ where: { id: 'contact' } })
        break
      }
      case 'footer': {
        data = await prisma.footerInfo.findUnique({
          where: { id: 'footer' },
          include: { socialLinks: { orderBy: { order: 'asc' } } },
        })
        break
      }
      default:
        return NextResponse.json({ success: false, error: 'Invalid section' }, { status: 400 })
    }

    return NextResponse.json({ success: true, data })
  } catch (error: any) {
    const resolvedParams = await Promise.resolve(params)
    console.error(`Error fetching ${resolvedParams.section}:`, error)
    return NextResponse.json({ success: false, error: 'Failed to fetch content section' }, { status: 500 })
  }
}

// PUT /api/admin/content/[section] - Update specific section
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ section: string }> | { section: string } }
) {
  try {
    const session = await verifyAdminSession(request)
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }
    if (!hasAdminPermission(session.role, 'content.write')) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })
    }

    // Handle both Promise and direct params (Next.js 15+ vs 14)
    const resolvedParams = await Promise.resolve(params)
    const { section } = resolvedParams
    const body = await request.json()

    // Update database using Prisma
    switch (section) {
      case 'home':
        if (body.hero) {
          await contentHelpers.updateHomePage({
            heroTitle: body.hero.title,
            heroSubtitle: body.hero.subtitle,
            heroDescription: body.hero.description,
            heroCta1Text: body.hero.cta1Text,
            heroCta2Text: body.hero.cta2Text,
          })
          if (body.hero.images) {
            await contentHelpers.updateHomeHeroImages(body.hero.images)
          }
          if (body.hero.stats) {
            await contentHelpers.updateHomeStats(body.hero.stats)
          }
        }
        if (body.services) {
          await contentHelpers.updateHomeServices(body.services)
        }
        if (body.featuredPackages && Array.isArray(body.featuredPackages)) {
          const packageIds = body.featuredPackages.map((p: { id: string }) => p.id).filter(Boolean)
          await contentHelpers.updateHomeFeaturedPackages(packageIds)
        }
        break
      case 'about':
        if (body.heroTitle || body.heroSubtitle || body.heroImage) {
          await contentHelpers.updateAboutPage({
            heroTitle: body.heroTitle,
            heroSubtitle: body.heroSubtitle,
            heroImageUrl: body.heroImage,
          })
        }
        if (body.mission) {
          await contentHelpers.updateAboutMission({
            title: body.mission.title,
            description: body.mission.description,
            points: body.mission.points,
          })
        }
        if (body.vision) {
          await contentHelpers.updateAboutVision({
            title: body.vision.title,
            description: body.vision.description,
            points: body.vision.points,
          })
        }
        if (body.coreValues) {
          await contentHelpers.updateAboutCoreValues(body.coreValues)
        }
        if (body.founder) {
          await contentHelpers.updateAboutFounder({
            name: body.founder.name,
            title: body.founder.title,
            description: body.founder.description,
            imageUrl: body.founder.image,
            vision: body.founder.vision,
            mission: body.founder.mission,
            values: body.founder.values,
          })
        }
        // Only update team if explicitly provided and not empty
        // This prevents accidentally deleting team members when updating other fields
        if (body.team && Array.isArray(body.team) && body.team.length > 0) {
          await contentHelpers.updateAboutTeamMembers(
            body.team.map((tm: any) => ({
              name: tm.name,
              role: tm.role,
              imageUrl: tm.image,
              description: tm.description,
            }))
          )
        }
        // Update success stories if provided
        if (body.successStories && Array.isArray(body.successStories)) {
          await contentHelpers.updateAboutSuccessStories(
            body.successStories.map((ss: any) => ({
              name: ss.name,
              program: ss.program,
              quote: ss.quote,
            }))
          )
        }
        break
      case 'packages':
        // Handle package updates (create/update/delete)
        // This would need more specific endpoints for individual packages
        break
      case 'travel-tours':
        if (body.hero) {
          await contentHelpers.updateTravelToursPage({
            heroTitle: body.hero.title,
            heroDescription: body.hero.description,
            heroParagraph: body.hero.paragraph,
            heroImageUrl: body.hero.image,
          })
        }
        if (body.featured) {
          // Update featured packages
          await contentHelpers.updateTravelToursFeaturedPackages(body.featured)
        }
        if (body.benefits) {
          // Update benefits
          await contentHelpers.updateTravelToursBenefits(body.benefits)
        }
        if (body.galleryImages && Array.isArray(body.galleryImages)) {
          // Update gallery images
          await contentHelpers.updateTravelToursGalleryImages(body.galleryImages)
        }
        break
      case 'service-pages':
        // Service pages are updated individually by serviceId
        // This would need a nested route like /api/admin/content/service-pages/[serviceId]
        break
      case 'contact':
        const latitude =
          body.location?.latitude !== undefined && body.location?.latitude !== null && body.location?.latitude !== ''
            ? Number(body.location.latitude)
            : null
        const longitude =
          body.location?.longitude !== undefined && body.location?.longitude !== null && body.location?.longitude !== ''
            ? Number(body.location.longitude)
            : null

        await contentHelpers.updateContactInfo({
          phone: body.phone,
          email: body.email,
          whatsappNumber: body.whatsappNumber,
          addressStreet: body.address?.street,
          addressCity: body.address?.city,
          addressRegion: body.address?.region,
          addressCountry: body.address?.country,
          mapLatitude: Number.isFinite(latitude as number) ? latitude : null,
          mapLongitude: Number.isFinite(longitude as number) ? longitude : null,
        })
        break
      case 'footer':
        await contentHelpers.updateFooterInfo({
          companyDescription: body.companyDescription,
          socialLinks: body.socialLinks,
        })
        break
      default:
        return NextResponse.json({ success: false, error: 'Invalid section' }, { status: 400 })
    }

    revalidatePath('/api/content')
    revalidatePath('/api/contact/whatsapp')
    revalidatePath('/', 'layout')
    revalidatePath('/')
    revalidatePath('/packages')
    revalidatePath('/travel-tours')
    revalidatePath('/about')
    revalidatePath('/study-abroad')
    revalidatePath('/work-abroad')
    revalidatePath('/global-network')
    revalidatePath('/contact')
    revalidateTag('public-content', 'max')

    await logAdminAudit({
      request,
      session,
      action: `content.${section}.update`,
      entityType: 'content_section',
      entityId: section,
      metadata: { keys: Object.keys(body || {}) },
    })

    return NextResponse.json({ success: true, message: `${section} updated` })
  } catch (error: any) {
    const resolvedParams = await Promise.resolve(params)
    console.error(`Error updating ${resolvedParams.section}:`, error)
    return NextResponse.json({ success: false, error: 'Failed to update content section' }, { status: 500 })
  }
}
