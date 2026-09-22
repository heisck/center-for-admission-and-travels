import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { hash } from 'bcryptjs'

const prisma = new PrismaClient()

function assertSeedAllowed() {
  if (process.env.ALLOW_DATABASE_SEED !== 'true') throw new Error('Set ALLOW_DATABASE_SEED=true to seed.')
  if (process.env.NODE_ENV === 'production' && process.env.ALLOW_PRODUCTION_SEED !== 'true') {
    throw new Error('Refusing to seed production.')
  }
}

async function seedService(input: {
  serviceId: string; title: string; route: string; image: string
  bannerTitle: string; bannerSubtitle: string; overview: string
  benefits: string[]; requirements: string[]
  countries: Array<{ name: string; description: string; imageUrl: string }>
}) {
  if (await prisma.servicePage.findUnique({ where: { serviceId: input.serviceId } })) return
  await prisma.servicePage.create({ data: {
    serviceId: input.serviceId, title: input.title, description: input.overview,
    icon: 'Globe', route: input.route, heroImageUrl: input.image,
    bannerTitle: input.bannerTitle, bannerSubtitle: input.bannerSubtitle,
    overview: input.overview,
    visaGuidance: 'Our consultants explain the applicable documentation, timelines, and next steps for your circumstances.',
    benefits: { create: input.benefits.map((text, order) => ({ text, order })) },
    requirements: { create: input.requirements.map((text, order) => ({ text, order })) },
    countries: { create: input.countries.map((item, order) => ({ ...item, order })) },
  } })
}

async function main() {
  assertSeedAllowed()
  const email = process.env.DEV_ADMIN_EMAIL || 'admin@localhost.test'
  const plainPassword = process.env.DEV_ADMIN_PASSWORD || 'ChangeMe123!'

  const existingAdmin = await prisma.adminUser.findUnique({ where: { username: 'admin' } })
  if (!existingAdmin) {
    await prisma.adminUser.create({ data: {
      username: 'admin', email, password: await hash(plainPassword, 12), role: 'SUPER_ADMIN',
    } })
  }

  await prisma.contactInfo.upsert({ where: { id: 'contact' }, update: {}, create: {
    id: 'contact', phone: '+233 50 435 3887', email: 'info@catravels.com',
    whatsappNumber: '233504353887', addressStreet: '', addressCity: 'Accra',
    addressRegion: 'Greater Accra', addressCountry: 'Ghana',
  } })
  await prisma.footerInfo.upsert({ where: { id: 'footer' }, update: {}, create: {
    id: 'footer', companyDescription: 'Trusted support for study, work, travel, and documentation services from Ghana.',
  } })

  if (!(await prisma.homePage.findUnique({ where: { id: 'home' } }))) {
    const serviceItems = [
      ['GraduationCap', 'Study Abroad', 'Admissions and application support.', '/study-abroad'],
      ['Briefcase', 'Work Abroad', 'International career guidance.', '/work-abroad'],
      ['Plane', 'Travel & Tours', 'Curated international travel experiences.', '/travel-tours'],
      ['FileCheck', 'Travel Documentation Services', 'Professional document support.', '/global-network'],
    ]
    await prisma.homePage.create({ data: {
      id: 'home', heroTitle: 'Your journey starts here', heroSubtitle: 'Study, work and travel abroad',
      heroDescription: 'Practical guidance and trusted support for your next international opportunity.',
      heroCta1Text: 'Explore Services', heroCta2Text: 'View Packages',
      heroImages: { create: ['/images/hero/ca-travels-hero-portrait.png', '/canada-niagara-falls-toronto-city.jpg', '/united-kingdom-big-ben-london-university.jpg'].map((url, order) => ({ url, order })) },
      heroStats: { create: [{ value: '10+', label: 'Destinations' }, { value: '4', label: 'Core services' }, { value: '24/7', label: 'Online access' }].map((item, order) => ({ ...item, order })) },
      services: { create: serviceItems.map(([icon, title, description, route], order) => ({ icon, title, description, route, order })) },
    } })
  }

  await seedService({
    serviceId: 'study-abroad', title: 'Study Abroad', route: '/study-abroad', image: '/images/services/study-abroad.jpg',
    bannerTitle: 'Study Abroad With Confidence', bannerSubtitle: 'Support from course selection through admission and visa preparation.',
    overview: 'Build an education pathway that fits your goals, profile, and budget.',
    benefits: ['Personalized institution guidance', 'Application and document review', 'Pre-departure preparation'],
    requirements: ['Academic records', 'Valid passport', 'Financial and supporting documents'],
    countries: [
      { name: 'United Kingdom', description: 'Globally respected universities.', imageUrl: '/united-kingdom-big-ben-london-university.jpg' },
      { name: 'Canada', description: 'Quality education in welcoming communities.', imageUrl: '/canada-niagara-falls-toronto-city.jpg' },
      { name: 'Germany', description: 'Strong academic and technical pathways.', imageUrl: '/germany.jpg' },
    ],
  })
  await seedService({
    serviceId: 'work-abroad', title: 'Work Abroad', route: '/work-abroad', image: '/images/services/work-abroad.jpg',
    bannerTitle: 'Take Your Career Further', bannerSubtitle: 'Practical application and preparation support for international opportunities.',
    overview: 'Understand the routes, expectations, and documentation for working abroad.',
    benefits: ['Profile assessment', 'Application document guidance', 'Relocation preparation'],
    requirements: ['Valid passport', 'Updated CV', 'Relevant qualifications or experience'],
    countries: [
      { name: 'Canada', description: 'Opportunities across many industries.', imageUrl: '/canada-niagara-falls-toronto-city.jpg' },
      { name: 'United Kingdom', description: 'Established international career pathways.', imageUrl: '/united-kingdom-big-ben-london-university.jpg' },
      { name: 'United Arab Emirates', description: 'A dynamic regional business hub.', imageUrl: '/dubai-burj-khalifa-city-skyline.jpg' },
    ],
  })

  if ((await prisma.package.count()) === 0) await prisma.package.create({ data: {
    name: 'Dubai Discovery', category: 'travel', description: 'A flexible package for first-time visitors.',
    duration: '5 days', price: 9500, currency: 'GHS', itinerary: 'Arrival, city experiences, free time, and departure.',
    highlights: { create: [{ text: 'City tour', order: 0 }, { text: 'Curated accommodation', order: 1 }] },
    images: { create: [{ url: '/dubai-burj-khalifa-city-skyline.jpg', order: 0 }] },
    included: { create: [{ text: 'Accommodation', order: 0 }, { text: 'Airport transfers', order: 1 }] },
    notIncluded: { create: [{ text: 'Personal expenses', order: 0 }] },
  } })

  if (!(await prisma.travelToursPage.findUnique({ where: { id: 'travel-tours' } }))) {
    await prisma.travelToursPage.create({ data: {
      id: 'travel-tours', heroTitle: 'Travel & Tours', heroDescription: 'Explore memorable destinations with trusted support.',
      heroParagraph: 'Choose a package or request a custom itinerary.', heroImageUrl: '/images/services/travel-tours.jpg',
      galleryImages: { create: ['/dubai-burj-khalifa-city-skyline.jpg', '/europe-paris-eiffel-tower-landmarks.jpg', '/asia-tropical-beaches-thailand-temples.jpg'].map((url, order) => ({ url, order })) },
      benefits: { create: [
        { title: 'Clear planning', description: 'Know what is included before you travel.' },
        { title: 'Trusted support', description: 'Guidance before and during your journey.' },
        { title: 'Flexible options', description: 'Choose a package or request a custom trip.' },
      ].map((item, order) => ({ ...item, order })) },
    } })
  }

  if ((await prisma.professionalService.count()) === 0) await prisma.professionalService.create({ data: {
    slug: 'travel-document-review', name: 'Travel Document Review',
    summary: 'A structured review of your travel documentation before submission.',
    descriptionHtml: '<p>We review your documents, identify obvious gaps, and explain the next steps.</p>',
    imageUrl: '/images/services/documentation.jpg', published: true,
    plans: { create: [
      { name: 'Standard Review', description: 'Checklist and review feedback.', duration: '3–5 business days', price: 450, currency: 'GHS', order: 0 },
      { name: 'Priority Review', description: 'Expedited review and feedback.', duration: '1–2 business days', price: 750, currency: 'GHS', order: 1 },
    ] },
  } })

  for (const page of [
    ['privacy', 'Privacy Policy'], ['terms', 'Terms and Conditions'], ['refund-policy', 'Refund Policy'],
  ]) await prisma.legalPage.upsert({ where: { slug: page[0] }, update: {}, create: {
    slug: page[0], title: page[1], content: '<p>Development content: review before production launch.</p>',
  } })

  console.log(`Development data ready. Admin: ${email}`)
}

main().catch((error) => { console.error(error); process.exitCode = 1 }).finally(() => prisma.$disconnect())
