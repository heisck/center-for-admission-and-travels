/**
 * Prisma Content Helpers
 * 
 * Helper functions for updating content in the database via Prisma.
 * Used by admin API routes.
 */

import { prisma } from './prisma'

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

export async function updateHomeServices(services: Array<{ id?: string; icon: string; title: string; description: string }>) {
  const homePage = await prisma.homePage.findUnique({ where: { id: 'home' } })
  if (!homePage) {
    await prisma.homePage.create({ data: { id: 'home', heroTitle: '', heroCta1Text: '', heroCta2Text: '' } })
  }

  // Delete existing services
  await prisma.homeService.deleteMany({ where: { homePageId: 'home' } })

  // Create new services
  await prisma.homeService.createMany({
    data: services.map((svc, index) => ({
      homePageId: 'home',
      icon: svc.icon,
      title: svc.title,
      description: svc.description,
      order: index,
    })),
  })
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

// ============================================================================
// PACKAGES
// ============================================================================

export async function updatePackage(id: string, data: {
  name?: string
  category?: 'travel' | 'study' | 'work'
  description?: string
  duration?: string
  price?: number
  itinerary?: string
  highlights?: string[]
  images?: string[]
  included?: string[]
  notIncluded?: string[]
}) {
  const pkg = await prisma.package.update({
    where: { id },
    data: {
      name: data.name,
      category: data.category,
      description: data.description,
      duration: data.duration,
      price: data.price,
      itinerary: data.itinerary,
    },
  })

  if (data.highlights) {
    await prisma.packageHighlight.deleteMany({ where: { packageId: id } })
    await prisma.packageHighlight.createMany({
      data: data.highlights.map((text, index) => ({
        packageId: id,
        text,
        order: index,
      })),
    })
  }

  if (data.images) {
    await prisma.packageImage.deleteMany({ where: { packageId: id } })
    await prisma.packageImage.createMany({
      data: data.images.map((url, index) => ({
        packageId: id,
        url,
        order: index,
      })),
    })
  }

  if (data.included) {
    await prisma.packageIncluded.deleteMany({ where: { packageId: id } })
    await prisma.packageIncluded.createMany({
      data: data.included.map((text, index) => ({
        packageId: id,
        text,
        order: index,
      })),
    })
  }

  if (data.notIncluded) {
    await prisma.packageNotIncluded.deleteMany({ where: { packageId: id } })
    await prisma.packageNotIncluded.createMany({
      data: data.notIncluded.map((text, index) => ({
        packageId: id,
        text,
        order: index,
      })),
    })
  }

  return pkg
}

export async function createPackage(data: {
  name: string
  category: 'travel' | 'study' | 'work'
  description: string
  duration: string
  price: number
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
  await prisma.travelToursFeaturedPackage.deleteMany({ where: { travelToursPageId: 'travel-tours' } })

  // Create new featured packages with highlights
  for (const [index, fp] of featured.entries()) {
    const featuredPkg = await prisma.travelToursFeaturedPackage.create({
      data: {
        travelToursPageId: 'travel-tours',
        name: fp.name,
        description: fp.description,
        duration: fp.duration,
        price: fp.price,
        imageUrl: fp.image,
        order: index,
      },
    })

    // Create highlights
    if (fp.highlights && fp.highlights.length > 0) {
      await prisma.travelToursFeaturedPackageHighlight.createMany({
        data: fp.highlights.map((text, hIndex) => ({
          featuredPackageId: featuredPkg.id,
          text,
          order: hIndex,
        })),
      })
    }
  }
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
  bannerTitle?: string
  bannerSubtitle?: string
  overview?: string
  visaGuidance?: string
  benefits?: string[]
  requirements?: string[]
  countries?: Array<{ name: string; description: string; image: string }>
}) {
  const service = await prisma.servicePage.upsert({
    where: { serviceId },
    update: {
      title: data.title,
      description: data.description,
      icon: data.icon,
      route: data.route,
      heroImageUrl: data.heroImageUrl,
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
      bannerTitle: data.bannerTitle || '',
      bannerSubtitle: data.bannerSubtitle || '',
      overview: data.overview,
      visaGuidance: data.visaGuidance || '',
    },
  })

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
    },
  })
}

export async function updateFooterInfo(data: {
  companyDescription?: string
  socialLinks?: Array<{ platform: string; url: string }>
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
    await prisma.footerSocialLink.deleteMany({ where: { footerInfoId: footer.id } })
    await prisma.footerSocialLink.createMany({
      data: data.socialLinks.map((link, index) => ({
        footerInfoId: footer.id,
        platform: link.platform,
        url: link.url,
        order: index,
      })),
    })
  }

  return footer
}
