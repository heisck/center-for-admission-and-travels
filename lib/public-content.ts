import { unstable_cache } from 'next/cache'

import { prisma } from '@/lib/prisma'

export type PackageCategory = 'travel' | 'study' | 'work'

export interface HomeHeroStat {
  value: string
  label: string
}

export interface HomeHeroContent {
  title: string
  subtitle: string
  description: string
  cta1Text: string
  cta2Text: string
  stats: HomeHeroStat[]
  images: string[]
}

export interface HomeServiceContent {
  id: string
  icon: string
  title: string
  description: string
  href: string
}

export interface BlogPostSummary {
  id: string
  slug: string
  title: string
  excerpt: string
  imageUrl: string | null
  packageId: string | null
  publishedAt: string | null
}

export interface PackageCardContent {
  id: string
  name: string
  description: string
  category: PackageCategory
  duration: string
  price: number
  highlights: string[]
  itinerary: string
  images: string[]
  included: string[]
  notIncluded: string[]
}

export interface AboutFounderContent {
  name: string
  title: string
  description: string
  image: string
  vision: string
  mission: string
  values: string
}

export interface AboutContent {
  heroTitle: string
  heroSubtitle: string
  heroImage: string
  mission: {
    title: string
    description: string
    points: string[]
  }
  vision: {
    title: string
    description: string
    points: string[]
  }
  coreValues: Array<{
    id: string
    title: string
    description: string
  }>
  founder: AboutFounderContent
  team: Array<{
    id: string
    name: string
    role: string
    image: string
    description: string
  }>
  successStories: Array<{
    id: string
    name: string
    program: string
    quote: string
  }>
}

export interface TravelToursContent {
  hero: {
    title: string
    description: string
    paragraph: string
    image: string
  }
  featured: Array<{
    id: string
    name: string
    description: string
    duration: string
    price: number
    image: string
    highlights: string[]
  }>
  benefits: Array<{
    id: string
    title: string
    description: string
  }>
  galleryImages: string[]
}

export interface ContactContent {
  phone: string
  email: string
  address: {
    street: string
    city: string
    region: string
    country: string
  }
  whatsappNumber: string
  location: {
    latitude: number | null
    longitude: number | null
  }
}

export interface FooterContent {
  companyDescription: string
  socialLinks: Array<{
    id: string
    platform: string
    url: string
  }>
}

export interface ServicePageContent {
  id: string
  title: string
  description: string
  icon: string
  route: string
  heroImage: string
  bannerTitle: string
  bannerSubtitle: string
  overview?: string
  whyStudyOutsideThisCountry?: {
    title: string
    highlights?: string[]
  }
  benefits: string[]
  requirements: string[]
  countries: Array<{
    name: string
    description: string
    image: string
  }>
  visaGuidance: string
  successStories: Array<{
    name: string
    program: string
    quote: string
  }>
  scholarships: Array<{
    name: string
    amount: string
    description: string
  }>
}

export interface SiteChromeContent {
  contact: ContactContent
  footer: FooterContent
}

export interface HomePageContent {
  hero: HomeHeroContent
  services: HomeServiceContent[]
  featuredPackages: PackageCardContent[]
  latestBlogPosts: BlogPostSummary[]
}

export interface PublicContentPayload {
  home: {
    hero: HomeHeroContent
    services: Array<{
      id: string
      icon: string
      title: string
      description: string
    }>
    featuredPackages: PackageCardContent[]
  }
  blogPosts: BlogPostSummary[]
  about: AboutContent
  packages: PackageCardContent[]
  travelTours: TravelToursContent
  contact: ContactContent
  footer: FooterContent
  servicePages: ServicePageContent[]
}

const DEFAULT_PUBLIC_CONTENT_CACHE_SECONDS = 300
const PUBLIC_CONTENT_TAG = 'public-content'

const PUBLIC_CONTENT_CACHE_SECONDS = (() => {
  const parsed = Number.parseInt(process.env.PUBLIC_CONTENT_CACHE_REVALIDATE_SECONDS || '', 10)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : DEFAULT_PUBLIC_CONTENT_CACHE_SECONDS
})()

const DEFAULT_CONTACT: ContactContent = {
  phone: '',
  email: '',
  address: {
    street: '',
    city: '',
    region: '',
    country: '',
  },
  whatsappNumber: '',
  location: {
    latitude: null,
    longitude: null,
  },
}

const DEFAULT_FOOTER: FooterContent = {
  companyDescription: '',
  socialLinks: [],
}

const DEFAULT_HOME_CONTENT: HomePageContent = {
  hero: {
    title: '',
    subtitle: '',
    description: '',
    cta1Text: '',
    cta2Text: '',
    stats: [],
    images: [],
  },
  services: [],
  featuredPackages: [],
  latestBlogPosts: [],
}

const DEFAULT_ABOUT_CONTENT: AboutContent = {
  heroTitle: '',
  heroSubtitle: '',
  heroImage: '',
  mission: {
    title: '',
    description: '',
    points: [],
  },
  vision: {
    title: '',
    description: '',
    points: [],
  },
  coreValues: [],
  founder: {
    name: '',
    title: '',
    description: '',
    image: '',
    vision: '',
    mission: '',
    values: '',
  },
  team: [],
  successStories: [],
}

const DEFAULT_TRAVEL_TOURS_CONTENT: TravelToursContent = {
  hero: {
    title: '',
    description: '',
    paragraph: '',
    image: '',
  },
  featured: [],
  benefits: [],
  galleryImages: [],
}

function logPublicContentError(scope: string, error: unknown) {
  console.error(`[public-content] Failed to load ${scope}:`, error)
}

function mapPackage(pkg: any): PackageCardContent {
  return {
    id: pkg.id,
    name: pkg.name,
    description: pkg.description,
    category: pkg.category,
    duration: pkg.duration,
    price: pkg.price,
    highlights: pkg.highlights?.map((item: any) => item.text) || [],
    itinerary: pkg.itinerary || '',
    images: pkg.images?.map((img: any) => img.url) || [],
    included: pkg.included?.map((item: any) => item.text) || [],
    notIncluded: pkg.notIncluded?.map((item: any) => item.text) || [],
  }
}

function mapBlogPost(post: any): BlogPostSummary {
  return {
    id: post.id,
    slug: post.slug,
    title: post.title,
    excerpt: post.excerpt || '',
    imageUrl: post.imageUrl || null,
    packageId: post.packageId || null,
    publishedAt: post.publishedAt?.toISOString?.() || null,
  }
}

function mapContact(contactInfo: any): ContactContent {
  if (!contactInfo) return DEFAULT_CONTACT

  return {
    phone: contactInfo.phone || '',
    email: contactInfo.email || '',
    address: {
      street: contactInfo.addressStreet || '',
      city: contactInfo.addressCity || '',
      region: contactInfo.addressRegion || '',
      country: contactInfo.addressCountry || '',
    },
    whatsappNumber: contactInfo.whatsappNumber || '',
    location: {
      latitude: contactInfo.mapLatitude ?? null,
      longitude: contactInfo.mapLongitude ?? null,
    },
  }
}

function mapFooter(footerInfo: any): FooterContent {
  if (!footerInfo) return DEFAULT_FOOTER

  return {
    companyDescription: footerInfo.companyDescription || '',
    socialLinks:
      footerInfo.socialLinks?.map((link: any) => ({
        id: link.id,
        platform: link.platform,
        url: link.url,
      })) || [],
  }
}

function mapAbout(aboutPage: any): AboutContent {
  return {
    heroTitle: aboutPage?.heroTitle || '',
    heroSubtitle: aboutPage?.heroSubtitle || '',
    heroImage: aboutPage?.heroImageUrl || '',
    mission: {
      title: aboutPage?.mission?.title || '',
      description: aboutPage?.mission?.description || '',
      points: aboutPage?.mission?.points?.map((item: any) => item.text) || [],
    },
    vision: {
      title: aboutPage?.vision?.title || '',
      description: aboutPage?.vision?.description || '',
      points: aboutPage?.vision?.points?.map((item: any) => item.text) || [],
    },
    coreValues:
      aboutPage?.coreValues?.map((item: any) => ({
        id: item.id,
        title: item.title,
        description: item.description,
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
      aboutPage?.teamMembers?.map((member: any) => ({
        id: member.id,
        name: member.name,
        role: member.role,
        image: member.imageUrl,
        description: member.description,
      })) || [],
    successStories:
      aboutPage?.successStories?.map((story: any) => ({
        id: story.id,
        name: story.name,
        program: story.program,
        quote: story.quote,
      })) || [],
  }
}

function mapServicePage(page: any): ServicePageContent {
  return {
    id: page?.serviceId || '',
    title: page?.title || '',
    description: page?.description || '',
    icon: page?.icon || '',
    route: page?.route || '',
    heroImage: page?.heroImageUrl || '',
    bannerTitle: page?.bannerTitle || '',
    bannerSubtitle: page?.bannerSubtitle || '',
    overview: page?.overview || undefined,
    whyStudyOutsideThisCountry: page?.whyStudySection
      ? {
          title: page.whyStudySection.title,
          highlights: page.whyStudySection.highlights?.map((item: any) => item.text) || [],
        }
      : undefined,
    benefits: page?.benefits?.map((item: any) => item.text) || [],
    requirements: page?.requirements?.map((item: any) => item.text) || [],
    countries:
      page?.countries?.map((country: any) => ({
        name: country.name,
        description: country.description,
        image: country.imageUrl,
      })) || [],
    visaGuidance: page?.visaGuidance || '',
    successStories:
      page?.successStories?.map((story: any) => ({
        name: story.name,
        program: story.program,
        quote: story.quote,
      })) || [],
    scholarships:
      page?.scholarships?.map((scholarship: any) => ({
        name: scholarship.name,
        amount: scholarship.amount,
        description: scholarship.description,
      })) || [],
  }
}

const TITLE_TO_ROUTE_MAP: Record<string, string> = {
  'Study Abroad': '/study-abroad',
  'Work Abroad': '/work-abroad',
  'Travel & Tours': '/travel-tours',
  'Travel Tours': '/travel-tours',
  'Global Network': '/global-network',
}

// Canonical service routes used when matching older home-page cards to service pages.
// Used when a card has no explicit route (renamed before `route` column existed).
const POSITION_FALLBACK_ROUTES = [
  '/study-abroad',
  '/work-abroad',
  '/travel-tours',
  '/global-network',
]

function buildServiceHref(
  service: { title?: string | null; route?: string | null; position?: number },
  servicePages: Array<{ title: string; route: string; serviceId: string }>
) {
  const validRoutes = new Set(servicePages.map((p) => p.route))

  // 1. Stable route stored directly on the home service (set via admin or
  //    backfilled on migration). Renames of `title` no longer break the link.
  if (service.route && validRoutes.has(service.route)) return service.route

  // 2. Match the current title against an existing service page.
  const matchingPage = servicePages.find(
    (page) =>
      page.title?.toLowerCase() === service.title?.toLowerCase() ||
      page.serviceId?.toLowerCase() === service.title?.toLowerCase().replace(/\s+/g, '-')
  )
  if (matchingPage?.route) return matchingPage.route

  // 3. Hardcoded legacy map (only when service pages aren't loaded).
  if (service.title && TITLE_TO_ROUTE_MAP[service.title]) return TITLE_TO_ROUTE_MAP[service.title]

  // 4. Slugify only if the resulting route actually exists.
  if (service.title) {
    const slug = `/${service.title.toLowerCase().replace(/\s+/g, '-').replace(/&/g, '')}`
    if (validRoutes.has(slug)) return slug
  }

  // 5. Position fallback: a renamed card at one of the first four positions
  //    is presumed to map to the canonical service route at that position.
  if (service.position !== undefined && service.position < POSITION_FALLBACK_ROUTES.length) {
    const fallback = POSITION_FALLBACK_ROUTES[service.position]
    if (validRoutes.has(fallback)) return fallback
  }

  // 6. Never return a 404. Fall back to home.
  return '/'
}

export const getSiteChromeContent = unstable_cache(
  async (): Promise<SiteChromeContent> => {
    try {
      const [contactInfo, footerInfo] = await Promise.all([
        prisma.contactInfo.findUnique({ where: { id: 'contact' } }),
        prisma.footerInfo.findUnique({
          where: { id: 'footer' },
          include: {
            socialLinks: {
              orderBy: { order: 'asc' },
            },
          },
        }),
      ])

      return {
        contact: mapContact(contactInfo),
        footer: mapFooter(footerInfo),
      }
    } catch (error) {
      logPublicContentError('site chrome', error)
      return {
        contact: DEFAULT_CONTACT,
        footer: DEFAULT_FOOTER,
      }
    }
  },
  ['site-chrome'],
  {
    revalidate: PUBLIC_CONTENT_CACHE_SECONDS,
    tags: [PUBLIC_CONTENT_TAG],
  }
)

const getSiteChromeEnvelopeJson = unstable_cache(
  async (): Promise<string> => {
    const chrome = await getSiteChromeContent()
    return JSON.stringify({ success: true, data: chrome })
  },
  ['site-chrome-envelope-json'],
  {
    revalidate: PUBLIC_CONTENT_CACHE_SECONDS,
    tags: [PUBLIC_CONTENT_TAG],
  }
)

export const getBlogPosts = unstable_cache(
  async (): Promise<BlogPostSummary[]> => {
    try {
      if (!(prisma as any).blogPost) return []

      const posts = await (prisma as any).blogPost.findMany({
        where: { published: true },
        orderBy: [{ publishedAt: 'desc' }, { order: 'asc' }],
        take: 24,
      })

      return posts.map(mapBlogPost)
    } catch (error) {
      logPublicContentError('blog posts', error)
      return []
    }
  },
  ['blog-posts'],
  {
    revalidate: PUBLIC_CONTENT_CACHE_SECONDS,
    tags: [PUBLIC_CONTENT_TAG],
  }
)

export const getHomePageContent = unstable_cache(
  async (): Promise<HomePageContent> => {
    try {
      const [homePage, servicePages, blogPosts] = await Promise.all([
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
                    included: { orderBy: { order: 'asc' } },
                    notIncluded: { orderBy: { order: 'asc' } },
                  },
                },
              },
            },
          },
        }),
        prisma.servicePage.findMany({
          select: {
            serviceId: true,
            title: true,
            route: true,
          },
        }),
        getBlogPosts(),
      ])

      return {
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
          homePage?.services?.map((service, index) => ({
            id: service.id,
            icon: service.icon,
            title: service.title,
            description: service.description,
            href: buildServiceHref({ title: service.title, route: (service as any).route, position: index }, servicePages),
          })) || [],
        featuredPackages:
          (homePage?.featuredPackages ?? [])
            .map((item: any) => item.package)
            .filter(Boolean)
            .map(mapPackage) || [],
        latestBlogPosts: blogPosts.slice(0, 3),
      }
    } catch (error) {
      logPublicContentError('home page', error)
      return DEFAULT_HOME_CONTENT
    }
  },
  ['home-page'],
  {
    revalidate: PUBLIC_CONTENT_CACHE_SECONDS,
    tags: [PUBLIC_CONTENT_TAG],
  }
)

export const getPackagesPageContent = unstable_cache(
  async (): Promise<PackageCardContent[]> => {
    try {
      const packages = await prisma.package.findMany({
        orderBy: { order: 'asc' },
        include: {
          highlights: { orderBy: { order: 'asc' } },
          images: { orderBy: { order: 'asc' } },
          included: { orderBy: { order: 'asc' } },
          notIncluded: { orderBy: { order: 'asc' } },
        },
      })

      return packages.map(mapPackage)
    } catch (error) {
      logPublicContentError('packages page', error)
      return []
    }
  },
  ['packages-page'],
  {
    revalidate: PUBLIC_CONTENT_CACHE_SECONDS,
    tags: [PUBLIC_CONTENT_TAG],
  }
)

export const getAboutPageContent = unstable_cache(
  async (): Promise<AboutContent> => {
    try {
      const aboutPage = await prisma.aboutPage.findUnique({
        where: { id: 'about' },
        include: {
          mission: { include: { points: { orderBy: { order: 'asc' } } } },
          vision: { include: { points: { orderBy: { order: 'asc' } } } },
          coreValues: { orderBy: { order: 'asc' } },
          founder: true,
          teamMembers: { orderBy: { order: 'asc' } },
          successStories: { orderBy: { order: 'asc' } },
        },
      })

      return mapAbout(aboutPage)
    } catch (error) {
      logPublicContentError('about page', error)
      return DEFAULT_ABOUT_CONTENT
    }
  },
  ['about-page'],
  {
    revalidate: PUBLIC_CONTENT_CACHE_SECONDS,
    tags: [PUBLIC_CONTENT_TAG],
  }
)

export const getTravelToursPageContent = unstable_cache(
  async (): Promise<TravelToursContent> => {
    try {
      const page = await prisma.travelToursPage.findUnique({
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

      return {
        hero: {
          title: page?.heroTitle || '',
          description: page?.heroDescription || '',
          paragraph: page?.heroParagraph || '',
          image: page?.heroImageUrl || '',
        },
        featured:
          page?.featuredPackages?.map((item) => ({
            id: item.id,
            name: item.name,
            description: item.description,
            duration: item.duration,
            price: item.price,
            image: item.imageUrl,
            highlights: item.highlights?.map((highlight) => highlight.text) || [],
          })) || [],
        benefits:
          page?.benefits?.map((benefit) => ({
            id: benefit.id,
            title: benefit.title,
            description: benefit.description,
          })) || [],
        galleryImages: page?.galleryImages?.map((img) => img.url) || [],
      }
    } catch (error) {
      logPublicContentError('travel tours page', error)
      return DEFAULT_TRAVEL_TOURS_CONTENT
    }
  },
  ['travel-tours-page'],
  {
    revalidate: PUBLIC_CONTENT_CACHE_SECONDS,
    tags: [PUBLIC_CONTENT_TAG],
  }
)

export const getAllServicePages = unstable_cache(
  async (): Promise<ServicePageContent[]> => {
    try {
      const servicePages = await prisma.servicePage.findMany({
        include: {
          whyStudySection: { include: { highlights: { orderBy: { order: 'asc' } } } },
          benefits: { orderBy: { order: 'asc' } },
          requirements: { orderBy: { order: 'asc' } },
          countries: { orderBy: { order: 'asc' } },
          successStories: { orderBy: { order: 'asc' } },
          scholarships: { orderBy: { order: 'asc' } },
        },
      })

      return servicePages.map(mapServicePage)
    } catch (error) {
      logPublicContentError('service pages', error)
      return []
    }
  },
  ['service-pages'],
  {
    revalidate: PUBLIC_CONTENT_CACHE_SECONDS,
    tags: [PUBLIC_CONTENT_TAG],
  }
)

export const getServicePageByRoute = unstable_cache(
  async (route: string): Promise<ServicePageContent | null> => {
    try {
      const normalizedRoute = route.startsWith('/') ? route : `/${route}`
      const serviceId = normalizedRoute.slice(1)

      const servicePage = await prisma.servicePage.findFirst({
        where: {
          OR: [{ route: normalizedRoute }, { serviceId }],
        },
        include: {
          whyStudySection: { include: { highlights: { orderBy: { order: 'asc' } } } },
          benefits: { orderBy: { order: 'asc' } },
          requirements: { orderBy: { order: 'asc' } },
          countries: { orderBy: { order: 'asc' } },
          successStories: { orderBy: { order: 'asc' } },
          scholarships: { orderBy: { order: 'asc' } },
        },
      })

      return servicePage ? mapServicePage(servicePage) : null
    } catch (error) {
      logPublicContentError(`service page route ${route}`, error)
      return null
    }
  },
  ['service-page-by-route'],
  {
    revalidate: PUBLIC_CONTENT_CACHE_SECONDS,
    tags: [PUBLIC_CONTENT_TAG],
  }
)

const getCachedPublicContentPayload = unstable_cache(
  async (): Promise<PublicContentPayload> => {
    const [home, about, packages, travelTours, chrome, blogPosts, servicePages] = await Promise.all([
      getHomePageContent(),
      getAboutPageContent(),
      getPackagesPageContent(),
      getTravelToursPageContent(),
      getSiteChromeContent(),
      getBlogPosts(),
      getAllServicePages(),
    ])

    return {
      home: {
        hero: home.hero,
        services: home.services.map((service) => ({
          id: service.id,
          icon: service.icon,
          title: service.title,
          description: service.description,
        })),
        featuredPackages: home.featuredPackages,
      },
      blogPosts,
      about,
      packages,
      travelTours,
      contact: chrome.contact,
      footer: chrome.footer,
      servicePages,
    }
  },
  ['public-content-payload'],
  {
    revalidate: PUBLIC_CONTENT_CACHE_SECONDS,
    tags: [PUBLIC_CONTENT_TAG],
  }
)

export async function getPublicContent(): Promise<PublicContentPayload> {
  return getCachedPublicContentPayload()
}

const getPublicContentEnvelopeJson = unstable_cache(
  async (): Promise<string> => {
    const content = await getCachedPublicContentPayload()
    return JSON.stringify({ success: true, data: content })
  },
  ['public-content-envelope-json'],
  {
    revalidate: PUBLIC_CONTENT_CACHE_SECONDS,
    tags: [PUBLIC_CONTENT_TAG],
  }
)

export async function getCachedSiteChromeEnvelopeJson(): Promise<string> {
  return getSiteChromeEnvelopeJson()
}

export async function getCachedPublicContentEnvelopeJson(): Promise<string> {
  return getPublicContentEnvelopeJson()
}
