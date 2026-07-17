/**
 * Prisma Content Helpers
 * 
 * Helper functions for updating content in the database via Prisma.
 * Used by admin API routes.
 */

import { prisma } from './prisma'
import { detectSocialPlatform, normalizeSocialUrl } from './social-links'

// ============================================================================
// HOME PAGE
// ============================================================================

export async function updateHomePage(data: {
  heroTitle?: string
  heroSubtitle?: string
  heroDescription?: string
  heroCta1Text?: string
  heroCta2Text?: string
}) {
  return await prisma.homePage.upsert({
    where: { id: 'home' },
    update: data,
    create: {
      id: 'home',
      heroTitle: data.heroTitle || '',
      heroSubtitle: data.heroSubtitle || '',
      heroDescription: data.heroDescription || '',
      heroCta1Text: data.heroCta1Text || '',
      heroCta2Text: data.heroCta2Text || '',
    },
  })
}

export async function updateHomeHeroImages(images: string[]) {
  const homePage = await prisma.homePage.findUnique({ where: { id: 'home' } })
  if (!homePage) {
    await prisma.homePage.create({ data: { id: 'home', heroTitle: '', heroCta1Text: '', heroCta2Text: '' } })
  }

  // Delete existing images
  await prisma.homeHeroImage.deleteMany({ where: { homePageId: 'home' } })

  // Create new images
  await prisma.homeHeroImage.createMany({
    data: images.map((url, index) => ({
      homePageId: 'home',
      url,
      order: index,
    })),
  })
}

export async function updateHomeStats(stats: Array<{ value: string; label: string }>) {
  const homePage = await prisma.homePage.findUnique({ where: { id: 'home' } })
  if (!homePage) {
    await prisma.homePage.create({ data: { id: 'home', heroTitle: '', heroCta1Text: '', heroCta2Text: '' } })
  }

  await prisma.homeStat.deleteMany({ where: { homePageId: 'home' } })
  await prisma.homeStat.createMany({
    data: stats.map((stat, index) => ({
      homePageId: 'home',
      value: stat.value,
      label: stat.label,
      order: index,
    })),
  })
}

/** Canonical public routes for the first four home service slots.
 *  Persisted when admin omits `route` so title renames never break links. */
const HOME_SERVICE_ROUTE_FALLBACKS = [
  '/study-abroad',
  '/work-abroad',
  '/travel-tours',
  '/global-network',
]

const VALID_HOME_SERVICE_ROUTES = new Set(HOME_SERVICE_ROUTE_FALLBACKS)

export async function updateHomeServices(services: Array<{ id?: string; icon: string; title: string; description: string; route?: string | null }>) {
  const homePage = await prisma.homePage.findUnique({ where: { id: 'home' } })
  if (!homePage) {
    await prisma.homePage.create({ data: { id: 'home', heroTitle: '', heroCta1Text: '', heroCta2Text: '' } })
  }

  // Delete existing services
  await prisma.homeService.deleteMany({ where: { homePageId: 'home' } })

  // Create new services — always store a stable route when possible.
  // Title text is free-form; links must not depend on the title string.
  await prisma.homeService.createMany({
    data: services.map((svc, index) => {
      const rawRoute = (svc.route || '').trim()
      const route =
        rawRoute && VALID_HOME_SERVICE_ROUTES.has(rawRoute)
          ? rawRoute
          : HOME_SERVICE_ROUTE_FALLBACKS[index] ?? null

      return {
        homePageId: 'home',
        icon: svc.icon || 'Globe',
        title: (svc.title || '').trim() || `Service ${index + 1}`,
        description: (svc.description || '').trim(),
        route,
        order: index,
      }
    }),
  })
}

export async function updateHomeFeaturedPackages(packageIds: string[]) {
  const homePage = await prisma.homePage.findUnique({ where: { id: 'home' } })
  if (!homePage) {
    await prisma.homePage.create({ data: { id: 'home', heroTitle: '', heroCta1Text: '', heroCta2Text: '' } })
  }

  await prisma.homeFeaturedPackage.deleteMany({ where: { homePageId: 'home' } })

  if (packageIds.length > 0) {
    await prisma.homeFeaturedPackage.createMany({
      data: packageIds.map((packageId, index) => ({
        homePageId: 'home',
        packageId,
        order: index,
      })),
    })
  }
}

// ============================================================================
// ABOUT PAGE
// ============================================================================

export async function updateAboutPage(data: {
  heroTitle?: string
  heroSubtitle?: string
  heroImageUrl?: string
}) {
  return await prisma.aboutPage.upsert({
    where: { id: 'about' },
    update: data,
    create: {
      id: 'about',
      heroTitle: data.heroTitle || '',
      heroSubtitle: data.heroSubtitle || '',
      heroImageUrl: data.heroImageUrl || '',
    },
  })
}

export async function updateAboutMission(data: { title?: string; description?: string; points?: string[] }) {
  const aboutPage = await prisma.aboutPage.findUnique({ where: { id: 'about' } })
  if (!aboutPage) {
    await prisma.aboutPage.create({ data: { id: 'about', heroTitle: '', heroSubtitle: '', heroImageUrl: '' } })
  }

  const mission = await prisma.aboutMission.upsert({
    where: { aboutPageId: 'about' },
    update: { title: data.title, description: data.description },
    create: {
      aboutPageId: 'about',
      title: data.title || '',
      description: data.description || '',
    },
  })

  if (data.points) {
    await prisma.aboutMissionPoint.deleteMany({ where: { missionId: mission.id } })
    await prisma.aboutMissionPoint.createMany({
      data: data.points.map((text, index) => ({
        missionId: mission.id,
        text,
        order: index,
      })),
    })
  }
}

export async function updateAboutVision(data: { title?: string; description?: string; points?: string[] }) {
  const aboutPage = await prisma.aboutPage.findUnique({ where: { id: 'about' } })
  if (!aboutPage) {
    await prisma.aboutPage.create({ data: { id: 'about', heroTitle: '', heroSubtitle: '', heroImageUrl: '' } })
  }

  const vision = await prisma.aboutVision.upsert({
    where: { aboutPageId: 'about' },
    update: { title: data.title, description: data.description },
    create: {
      aboutPageId: 'about',
      title: data.title || '',
      description: data.description || '',
    },
  })

  if (data.points) {
    await prisma.aboutVisionPoint.deleteMany({ where: { visionId: vision.id } })
    await prisma.aboutVisionPoint.createMany({
      data: data.points.map((text, index) => ({
        visionId: vision.id,
        text,
        order: index,
      })),
    })
  }
}

export async function updateAboutCoreValues(values: Array<{ id?: string; title: string; description: string }>) {
  const aboutPage = await prisma.aboutPage.findUnique({ where: { id: 'about' } })
  if (!aboutPage) {
    await prisma.aboutPage.create({ data: { id: 'about', heroTitle: '', heroSubtitle: '', heroImageUrl: '' } })
  }

  await prisma.aboutCoreValue.deleteMany({ where: { aboutPageId: 'about' } })
  await prisma.aboutCoreValue.createMany({
    data: values.map((val, index) => ({
      aboutPageId: 'about',
      title: val.title,
      description: val.description,
      order: index,
    })),
  })
}

export async function updateAboutFounder(data: {
  name?: string
  title?: string
  description?: string
  imageUrl?: string
  vision?: string
  mission?: string
  values?: string
}) {
  const aboutPage = await prisma.aboutPage.findUnique({ where: { id: 'about' } })
  if (!aboutPage) {
    await prisma.aboutPage.create({ data: { id: 'about', heroTitle: '', heroSubtitle: '', heroImageUrl: '' } })
  }

  return await prisma.aboutFounder.upsert({
    where: { aboutPageId: 'about' },
    update: data,
    create: {
      aboutPageId: 'about',
      name: data.name || '',
      title: data.title || '',
      description: data.description || '',
      imageUrl: data.imageUrl || '',
      vision: data.vision || '',
      mission: data.mission || '',
      values: data.values || '',
    },
  })
}

export async function updateAboutTeamMembers(members: Array<{ id?: string; name: string; role: string; imageUrl: string; description: string }>) {
  const aboutPage = await prisma.aboutPage.findUnique({ where: { id: 'about' } })
  if (!aboutPage) {
    await prisma.aboutPage.create({ data: { id: 'about', heroTitle: '', heroSubtitle: '', heroImageUrl: '' } })
  }

  await prisma.aboutTeamMember.deleteMany({ where: { aboutPageId: 'about' } })
  await prisma.aboutTeamMember.createMany({
    data: members.map((member, index) => ({
      aboutPageId: 'about',
      name: member.name,
      role: member.role,
      imageUrl: member.imageUrl,
      description: member.description,
      order: index,
    })),
  })
}

export async function updateAboutSuccessStories(stories: Array<{ id?: string; name: string; program: string; quote: string }>) {
  const aboutPage = await prisma.aboutPage.findUnique({ where: { id: 'about' } })
  if (!aboutPage) {
    await prisma.aboutPage.create({ data: { id: 'about', heroTitle: '', heroSubtitle: '', heroImageUrl: '' } })
  }

  await prisma.aboutSuccessStory.deleteMany({ where: { aboutPageId: 'about' } })
  await prisma.aboutSuccessStory.createMany({
    data: stories.map((story, index) => ({
      aboutPageId: 'about',
      name: story.name,
      program: story.program,
      quote: story.quote,
      order: index,
    })),
  })
}

// ============================================================================
// PACKAGES
// ============================================================================

export async function updatePackage(id: string, data: {
  name?: string
  category?: 'travel' | 'study' | 'work'
  description?: string
  duration?: string
  price?: number
  currency?: string
  itinerary?: string
  highlights?: string[]
  images?: string[]
  included?: string[]
  notIncluded?: string[]
}) {
  return await prisma.$transaction(async (tx) => {
    const pkg = await tx.package.update({
      where: { id },
      data: {
        name: data.name,
        category: data.category,
        description: data.description,
        duration: data.duration,
        price: data.price,
        currency: data.currency,
        itinerary: data.itinerary,
      },
    })

    if (data.highlights) {
      await tx.packageHighlight.deleteMany({ where: { packageId: id } })
      const highlights = data.highlights.map((text, index) => ({
        packageId: id,
        text,
        order: index,
      }))
      if (highlights.length > 0) await tx.packageHighlight.createMany({ data: highlights })
    }

    if (data.images) {
      await tx.packageImage.deleteMany({ where: { packageId: id } })
      const images = data.images.map((url, index) => ({
        packageId: id,
        url,
        order: index,
      }))
      if (images.length > 0) await tx.packageImage.createMany({ data: images })
    }

    if (data.included) {
      await tx.packageIncluded.deleteMany({ where: { packageId: id } })
      const included = data.included.map((text, index) => ({
        packageId: id,
        text,
        order: index,
      }))
      if (included.length > 0) await tx.packageIncluded.createMany({ data: included })
    }

    if (data.notIncluded) {
      await tx.packageNotIncluded.deleteMany({ where: { packageId: id } })
      const notIncluded = data.notIncluded.map((text, index) => ({
        packageId: id,
        text,
        order: index,
      }))
      if (notIncluded.length > 0) await tx.packageNotIncluded.createMany({ data: notIncluded })
    }

    return pkg
  })
}

export async function createPackage(data: {
  name: string
  category: 'travel' | 'study' | 'work'
  description: string
  duration: string
  price: number
  currency?: string
  itinerary?: string
  highlights?: string[]
  images?: string[]
  included?: string[]
  notIncluded?: string[]
}) {
  const pkg = await prisma.package.create({
    data: {
      name: data.name,
      category: data.category,
      description: data.description,
      duration: data.duration,
      price: data.price,
      currency: data.currency || 'GHS',
      itinerary: data.itinerary || '',
      highlights: {
        create: (data.highlights || []).map((text, index) => ({
          text,
          order: index,
        })),
      },
      images: {
        create: (data.images || []).map((url, index) => ({
          url,
          order: index,
        })),
      },
      included: {
        create: (data.included || []).map((text, index) => ({
          text,
          order: index,
        })),
      },
      notIncluded: {
        create: (data.notIncluded || []).map((text, index) => ({
          text,
          order: index,
        })),
      },
    },
  })

  return pkg
}

export async function deletePackage(id: string) {
  return await prisma.package.delete({ where: { id } })
}

// ============================================================================
// TRAVEL TOURS
// ============================================================================

export async function updateTravelToursPage(data: {
  heroTitle?: string
  heroDescription?: string
  heroParagraph?: string
  heroImageUrl?: string
}) {
  return await prisma.travelToursPage.upsert({
    where: { id: 'travel-tours' },
    update: data,
    create: {
      id: 'travel-tours',
      heroTitle: data.heroTitle || '',
      heroDescription: data.heroDescription || '',
      heroParagraph: data.heroParagraph || '',
      heroImageUrl: data.heroImageUrl || '',
    },
  })
}

export async function updateTravelToursFeaturedPackages(featured: Array<{
  id?: string
  name: string
  description: string
  duration: string
  price: number
  currency?: string
  image: string
  highlights: string[]
}>) {
  const travelToursPage = await prisma.travelToursPage.findUnique({ where: { id: 'travel-tours' } })
  if (!travelToursPage) {
    await prisma.travelToursPage.create({
      data: { id: 'travel-tours', heroTitle: '', heroDescription: '', heroParagraph: '', heroImageUrl: '' },
    })
  }

  // Delete existing featured packages (cascade will delete highlights)
  await prisma.travelToursFeaturedPackage.deleteMany({ where: { pageId: 'travel-tours' } })

  // Create new featured packages with highlights
  for (const [index, fp] of featured.entries()) {
    const featuredPkg = await prisma.travelToursFeaturedPackage.create({
      data: {
        pageId: 'travel-tours',
        name: fp.name,
        description: fp.description,
        duration: fp.duration,
        price: fp.price,
        currency: fp.currency || 'GHS',
        imageUrl: fp.image,
        order: index,
      },
    })

    // Create highlights
    if (fp.highlights && fp.highlights.length > 0) {
      await prisma.travelToursHighlight.createMany({
        data: fp.highlights.map((text, hIndex) => ({
          packageId: featuredPkg.id,
          text,
          order: hIndex,
        })),
      })
    }
  }
}

export async function updateTravelToursGalleryImages(images: string[]) {
  const page = await prisma.travelToursPage.findUnique({
    where: { id: 'travel-tours' },
  })
  if (!page) {
    await prisma.travelToursPage.create({
      data: {
        id: 'travel-tours',
        heroTitle: '',
        heroDescription: '',
        heroParagraph: '',
        heroImageUrl: '',
      },
    })
  }

  // Delete existing gallery images
  await prisma.travelToursGalleryImage.deleteMany({ where: { pageId: 'travel-tours' } })

  // Create new gallery images
  await prisma.travelToursGalleryImage.createMany({
    data: images.map((url, index) => ({
      pageId: 'travel-tours',
      url,
      order: index,
    })),
  })
}

export async function updateTravelToursBenefits(benefits: Array<{
  id?: string
  title: string
  description: string
}>) {
  const page = await prisma.travelToursPage.findUnique({
    where: { id: 'travel-tours' },
  })

  if (!page) {
    await prisma.travelToursPage.create({
      data: { id: 'travel-tours', heroTitle: '', heroDescription: '', heroParagraph: '', heroImageUrl: '' },
    })
  }

  // Delete existing benefits
  await prisma.travelToursBenefit.deleteMany({
    where: { pageId: 'travel-tours' },
  })

  // Create new benefits
  await prisma.travelToursBenefit.createMany({
    data: benefits.map((b, index) => ({
      pageId: 'travel-tours',
      title: b.title,
      description: b.description,
      order: index,
    })),
  })
}

// ============================================================================
// SERVICE PAGES
// ============================================================================

export async function updateServicePage(serviceId: string, data: {
  title?: string
  description?: string
  icon?: string
  route?: string
  heroImageUrl?: string
  heroImagePositionX?: number
  heroImagePositionY?: number
  bannerTitle?: string
  bannerSubtitle?: string
  overview?: string
  visaGuidance?: string
  benefits?: string[]
  requirements?: string[]
  countries?: Array<{ name: string; description: string; image: string }>
  successStories?: Array<{ name: string; program: string; quote: string }>
  scholarships?: Array<{ name: string; amount: string; description: string }>
  whyStudyOutsideThisCountry?: { title: string; highlights: string[] }
}) {
  const service = await prisma.servicePage.upsert({
    where: { serviceId },
    update: {
      title: data.title,
      description: data.description,
      icon: data.icon,
      route: data.route,
      heroImageUrl: data.heroImageUrl,
      heroImagePositionX: data.heroImagePositionX,
      heroImagePositionY: data.heroImagePositionY,
      bannerTitle: data.bannerTitle,
      bannerSubtitle: data.bannerSubtitle,
      overview: data.overview,
      visaGuidance: data.visaGuidance,
    },
    create: {
      serviceId,
      title: data.title || '',
      description: data.description || '',
      icon: data.icon || '',
      route: data.route || '',
      heroImageUrl: data.heroImageUrl || '',
      heroImagePositionX: data.heroImagePositionX ?? 50,
      heroImagePositionY: data.heroImagePositionY ?? 50,
      bannerTitle: data.bannerTitle || '',
      bannerSubtitle: data.bannerSubtitle || '',
      overview: data.overview,
      visaGuidance: data.visaGuidance || '',
    },
  })

  // Why Study Section
  if (data.whyStudyOutsideThisCountry) {
    const whyStudySection = await prisma.serviceWhyStudySection.upsert({
      where: { servicePageId: service.id },
      update: {
        title: data.whyStudyOutsideThisCountry.title,
      },
      create: {
        servicePageId: service.id,
        title: data.whyStudyOutsideThisCountry.title,
      },
    })

    if (data.whyStudyOutsideThisCountry.highlights) {
      await prisma.serviceWhyStudyHighlight.deleteMany({ where: { sectionId: whyStudySection.id } })
      await prisma.serviceWhyStudyHighlight.createMany({
        data: data.whyStudyOutsideThisCountry.highlights.map((text, index) => ({
          sectionId: whyStudySection.id,
          text,
          order: index,
        })),
      })
    }
  }

  if (data.benefits) {
    await prisma.serviceBenefit.deleteMany({ where: { servicePageId: service.id } })
    await prisma.serviceBenefit.createMany({
      data: data.benefits.map((text, index) => ({
        servicePageId: service.id,
        text,
        order: index,
      })),
    })
  }

  if (data.requirements) {
    await prisma.serviceRequirement.deleteMany({ where: { servicePageId: service.id } })
    await prisma.serviceRequirement.createMany({
      data: data.requirements.map((text, index) => ({
        servicePageId: service.id,
        text,
        order: index,
      })),
    })
  }

  if (data.countries) {
    await prisma.serviceCountry.deleteMany({ where: { servicePageId: service.id } })
    await prisma.serviceCountry.createMany({
      data: data.countries.map((country, index) => ({
        servicePageId: service.id,
        name: country.name,
        description: country.description,
        imageUrl: country.image,
        order: index,
      })),
    })
  }

  if (data.successStories) {
    await prisma.serviceSuccessStory.deleteMany({ where: { servicePageId: service.id } })
    await prisma.serviceSuccessStory.createMany({
      data: data.successStories.map((story, index) => ({
        servicePageId: service.id,
        name: story.name,
        program: story.program,
        quote: story.quote,
        order: index,
      })),
    })
  }

  if (data.scholarships) {
    await prisma.serviceScholarship.deleteMany({ where: { servicePageId: service.id } })
    await prisma.serviceScholarship.createMany({
      data: data.scholarships.map((scholarship, index) => ({
        servicePageId: service.id,
        name: scholarship.name,
        amount: scholarship.amount,
        description: scholarship.description,
        order: index,
      })),
    })
  }

  return service
}

// ============================================================================
// CONTACT & FOOTER
// ============================================================================

export async function updateContactInfo(data: {
  phone?: string
  email?: string
  whatsappNumber?: string
  addressStreet?: string
  addressCity?: string
  addressRegion?: string
  addressCountry?: string
  mapLatitude?: number | null
  mapLongitude?: number | null
}) {
  return await prisma.contactInfo.upsert({
    where: { id: 'contact' },
    update: data,
    create: {
      id: 'contact',
      phone: data.phone || '',
      email: data.email || '',
      whatsappNumber: data.whatsappNumber || '',
      addressStreet: data.addressStreet || '',
      addressCity: data.addressCity || '',
      addressRegion: data.addressRegion || '',
      addressCountry: data.addressCountry || '',
      mapLatitude: data.mapLatitude ?? null,
      mapLongitude: data.mapLongitude ?? null,
    },
  })
}

export async function updateFooterInfo(data: {
  companyDescription?: string
  socialLinks?: Array<{ platform?: string; url: string; id?: string }>
}) {
  const footer = await prisma.footerInfo.upsert({
    where: { id: 'footer' },
    update: { companyDescription: data.companyDescription },
    create: {
      id: 'footer',
      companyDescription: data.companyDescription || '',
    },
  })

  if (data.socialLinks) {
    const normalizedLinks = data.socialLinks
      .map((link) => {
        const url = normalizeSocialUrl(link.url)
        if (!url) return null
        return {
          platform: detectSocialPlatform(url),
          url,
        }
      })
      .filter(Boolean) as Array<{ platform: string; url: string }>

    await prisma.footerSocialLink.deleteMany({ where: { footerInfoId: footer.id } })
    await prisma.footerSocialLink.createMany({
      data: normalizedLinks.map((link, index) => ({
        footerInfoId: footer.id,
        platform: link.platform,
        url: link.url,
        order: index,
      })),
    })
  }

  return footer
}
