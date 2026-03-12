import { unstable_cache } from 'next/cache'

import { prisma } from '@/lib/prisma'

const DEFAULT_PUBLIC_CONTENT_CACHE_SECONDS = 300

const PUBLIC_CONTENT_CACHE_SECONDS = (() => {
  const parsed = Number.parseInt(process.env.PUBLIC_CONTENT_CACHE_REVALIDATE_SECONDS || '', 10)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : DEFAULT_PUBLIC_CONTENT_CACHE_SECONDS
})()

async function buildPublicContentPayload() {
  const results = await Promise.allSettled([
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
    prisma.package.findMany({
      orderBy: { order: 'asc' },
      include: {
        highlights: { orderBy: { order: 'asc' } },
        images: { orderBy: { order: 'asc' } },
        included: { orderBy: { order: 'asc' } },
        notIncluded: { orderBy: { order: 'asc' } },
      },
    }),
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
    prisma.contactInfo.findUnique({ where: { id: 'contact' } }),
    prisma.footerInfo.findUnique({
      where: { id: 'footer' },
      include: { socialLinks: { orderBy: { order: 'asc' } } },
    }),
    (prisma as any).blogPost
      ? (prisma as any).blogPost.findMany({
          where: { published: true },
          orderBy: [{ publishedAt: 'desc' }, { order: 'asc' }],
          take: 10,
        })
      : Promise.resolve([]),
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

  const homePage = results[0].status === 'fulfilled' ? results[0].value : null
  const aboutPage = results[1].status === 'fulfilled' ? results[1].value : null
  const packages = results[2].status === 'fulfilled' ? results[2].value : []
  const travelToursPage = results[3].status === 'fulfilled' ? results[3].value : null
  const contactInfo = results[4].status === 'fulfilled' ? results[4].value : null
  const footerInfo = results[5].status === 'fulfilled' ? results[5].value : null
  const blogPosts = results[6].status === 'fulfilled' ? results[6].value : []
  const servicePages = results[7].status === 'fulfilled' ? results[7].value : []

  results.forEach((result, index) => {
    if (result.status === 'rejected') {
      console.error(`Failed to fetch content at index ${index}:`, result.reason)
    }
  })

  return {
    home: {
      hero: {
        title: homePage?.heroTitle || '',
        subtitle: homePage?.heroSubtitle || '',
        description: homePage?.heroDescription || '',
        cta1Text: homePage?.heroCta1Text || '',
        cta2Text: homePage?.heroCta2Text || '',
        images: homePage?.heroImages?.map((img) => img.url) || [],
        stats:
          homePage?.heroStats?.map((stat) => ({
            value: stat.value,
            label: stat.label,
          })) || [],
      },
      services:
        homePage?.services?.map((svc) => ({
          id: svc.id,
          icon: svc.icon,
          title: svc.title,
          description: svc.description,
        })) || [],
      featuredPackages:
        (homePage?.featuredPackages ?? [])
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
      coreValues:
        aboutPage?.coreValues?.map((cv) => ({
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
      team:
        aboutPage?.teamMembers?.map((tm) => ({
          id: tm.id,
          name: tm.name,
          role: tm.role,
          image: tm.imageUrl,
          description: tm.description,
        })) || [],
      successStories:
        aboutPage?.successStories?.map((ss) => ({
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
      featured:
        travelToursPage?.featuredPackages?.map((fp) => ({
          id: fp.id,
          name: fp.name,
          description: fp.description,
          duration: fp.duration,
          price: fp.price,
          image: fp.imageUrl,
          highlights: fp.highlights?.map((h) => h.text) || [],
        })) || [],
      benefits:
        travelToursPage?.benefits?.map((benefit) => ({
          id: benefit.id,
          title: benefit.title,
          description: benefit.description,
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
      socialLinks:
        footerInfo?.socialLinks?.map((sl) => ({
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
      benefits: sp.benefits?.map((benefit) => benefit.text) || [],
      requirements: sp.requirements?.map((requirement) => requirement.text) || [],
      countries:
        sp.countries?.map((country) => ({
          name: country.name,
          description: country.description,
          image: country.imageUrl,
        })) || [],
      visaGuidance: sp.visaGuidance || '',
      successStories:
        sp.successStories?.map((story) => ({
          name: story.name,
          program: story.program,
          quote: story.quote,
        })) || [],
      scholarships:
        sp.scholarships?.map((scholarship) => ({
          name: scholarship.name,
          amount: scholarship.amount,
          description: scholarship.description,
        })) || [],
    })),
  }
}

export const getPublicContent = unstable_cache(buildPublicContentPayload, ['public-content:v1'], {
  revalidate: PUBLIC_CONTENT_CACHE_SECONDS,
  tags: ['public-content'],
})
