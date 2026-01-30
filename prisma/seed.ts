/**
 * PRISMA SEED SCRIPT
 * 
 * Populates database with initial/default content.
 * 
 * Run with: npx prisma db seed
 * 
 * Or: npx tsx prisma/seed.ts
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // ============================================================================
  // HOME PAGE
  // ============================================================================
  
  const homePage = await prisma.homePage.upsert({
    where: { id: 'home' },
    update: {},
    create: {
      id: 'home',
      heroTitle: 'Looking To Travel',
      heroSubtitle: '& Enrich Your Future',
      heroDescription: 'Welcome to Center for Admission and Travels, where your dreams of studying, working, and traveling abroad become reality. We guide you with honesty, professionalism, and care every step of the way.',
      heroCta1Text: 'View Our Services',
      heroCta2Text: 'Contact Us',
    },
  })

  // Home Stats
  await prisma.homeStat.createMany({
    data: [
      { homePageId: homePage.id, value: '50+', label: 'Success Stories', order: 0 },
      { homePageId: homePage.id, value: '15+', label: 'Destinations', order: 1 },
      { homePageId: homePage.id, value: '100%', label: 'Satisfaction', order: 2 },
    ],
    skipDuplicates: true,
  })

  // Home Services
  await prisma.homeService.createMany({
    data: [
      {
        homePageId: homePage.id,
        icon: 'GraduationCap',
        title: 'Study Abroad',
        description: 'Admission guidance, university selection, and visa processing for top institutions worldwide',
        order: 0,
      },
      {
        homePageId: homePage.id,
        icon: 'Briefcase',
        title: 'Work Abroad',
        description: 'Job placement assistance and relocation support in verified international companies',
        order: 1,
      },
      {
        homePageId: homePage.id,
        icon: 'Plane',
        title: 'Travel & Tours',
        description: 'Curated travel packages to Dubai, Europe, Asia, and more with full support',
        order: 2,
      },
      {
        homePageId: homePage.id,
        icon: 'Globe',
        title: 'Global Network',
        description: 'Partnerships with accredited universities and verified employers worldwide',
        order: 3,
      },
    ],
    skipDuplicates: true,
  })

  // ============================================================================
  // ABOUT PAGE
  // ============================================================================

  const aboutPage = await prisma.aboutPage.upsert({
    where: { id: 'about' },
    update: {},
    create: {
      id: 'about',
      heroTitle: 'About Center for Admission and Travels',
      heroSubtitle: 'Your trusted partner in global opportunities. We believe every journey is unique, and our team is dedicated to guiding you with honesty, professionalism, and care from start to finish.',
      heroImageUrl: '/images/thisshouldbeintegrated4.jpg',
    },
  })

  // Mission
  const mission = await prisma.aboutMission.upsert({
    where: { aboutPageId: aboutPage.id },
    update: {},
    create: {
      aboutPageId: aboutPage.id,
      title: 'Our Mission',
      description: 'To provide trusted, personalized, and professional services in international education, travel, and job placements. We are dedicated to guiding students to study abroad, facilitating smooth and affordable travel, and providing pathways for work opportunities.',
    },
  })

  await prisma.aboutMissionPoint.createMany({
    data: [
      { missionId: mission.id, text: 'Honest and transparent guidance', order: 0 },
      { missionId: mission.id, text: 'Professional expertise and care', order: 1 },
      { missionId: mission.id, text: 'Personalized attention for every client', order: 2 },
    ],
    skipDuplicates: true,
  })

  // Vision
  const vision = await prisma.aboutVision.upsert({
    where: { aboutPageId: aboutPage.id },
    update: {},
    create: {
      aboutPageId: aboutPage.id,
      title: 'Our Vision',
      description: "To be Ghana's leading gateway to global education, travel, and work opportunities; empowering individuals to explore the world, gain international experience, and unlock their full potential.",
    },
  })

  await prisma.aboutVisionPoint.createMany({
    data: [
      { visionId: vision.id, text: 'Global network of partners', order: 0 },
      { visionId: vision.id, text: 'Technology-driven solutions', order: 1 },
      { visionId: vision.id, text: 'Inspiring international success', order: 2 },
    ],
    skipDuplicates: true,
  })

  // Core Values
  await prisma.aboutCoreValue.createMany({
    data: [
      {
        aboutPageId: aboutPage.id,
        title: 'Integrity',
        description: 'Honesty and ethical practices in all dealings',
        order: 0,
      },
      {
        aboutPageId: aboutPage.id,
        title: 'Professionalism',
        description: 'Expert service with dedication and expertise',
        order: 1,
      },
      {
        aboutPageId: aboutPage.id,
        title: 'Customer First',
        description: 'Your needs drive everything we do',
        order: 2,
      },
      {
        aboutPageId: aboutPage.id,
        title: 'Transparency',
        description: 'Clear communication without hidden costs',
        order: 3,
      },
      {
        aboutPageId: aboutPage.id,
        title: 'Respect',
        description: 'Value every individual and their journey',
        order: 4,
      },
      {
        aboutPageId: aboutPage.id,
        title: 'Confidentiality',
        description: 'Your information is safe with us',
        order: 5,
      },
    ],
    skipDuplicates: true,
  })

  // Founder
  await prisma.aboutFounder.upsert({
    where: { aboutPageId: aboutPage.id },
    update: {},
    create: {
      aboutPageId: aboutPage.id,
      name: 'George Owusu Ntim',
      title: 'Meet Our Founder',
      description: 'George Owusu Ntim is the visionary Director of Center for Admission and Travels. With a strong background in international education, travel coordination, and client advisory services, he leads the company with excellence and integrity.',
      imageUrl: '/images/founder.jpg',
      vision: "Ghana's leading gateway to global opportunities",
      mission: 'Trusted, personalized, professional services',
      values: 'Integrity, professionalism, transparency, and care',
    },
  })

  // ============================================================================
  // CONTACT & FOOTER
  // ============================================================================

  await prisma.contactInfo.upsert({
    where: { id: 'contact' },
    update: {},
    create: {
      id: 'contact',
      phone: '+233 248 422 663',
      email: 'info@centerforadmissionandtravels.com',
      whatsappNumber: '+233248422663',
      addressStreet: 'BA14 Chinkara Street, Gumani',
      addressCity: 'Tamale',
      addressRegion: 'Northern Region',
      addressCountry: 'Ghana',
    },
  })

  const footerInfo = await prisma.footerInfo.upsert({
    where: { id: 'footer' },
    update: {},
    create: {
      id: 'footer',
      companyDescription: 'Unlocking global opportunities for education, work, and travel.',
    },
  })

  await prisma.footerSocialLink.createMany({
    data: [
      { footerInfoId: footerInfo.id, platform: 'Facebook', url: 'https://facebook.com', order: 0 },
      { footerInfoId: footerInfo.id, platform: 'LinkedIn', url: 'https://linkedin.com', order: 1 },
      { footerInfoId: footerInfo.id, platform: 'Twitter', url: 'https://twitter.com', order: 2 },
    ],
    skipDuplicates: true,
  })

  // ============================================================================
  // SERVICE PAGES (Basic structure - can be expanded)
  // ============================================================================

  await prisma.servicePage.upsert({
    where: { serviceId: 'study-abroad' },
    update: {},
    create: {
      serviceId: 'study-abroad',
      title: 'Study Abroad',
      description: 'Admission guidance, university selection, and visa processing',
      icon: 'GraduationCap',
      route: '/study-abroad',
      heroImageUrl: '/images/study-abroad.jpg',
      bannerTitle: 'Study Abroad',
      bannerSubtitle: 'Transform your future with world-class education',
    },
  })

  await prisma.servicePage.upsert({
    where: { serviceId: 'work-abroad' },
    update: {},
    create: {
      serviceId: 'work-abroad',
      title: 'Work Abroad',
      description: 'Job placement assistance and relocation support',
      icon: 'Briefcase',
      route: '/work-abroad',
      heroImageUrl: '/images/work-abroad.jpg',
      bannerTitle: 'Work Abroad',
      bannerSubtitle: 'Career opportunities on the global stage',
    },
  })

  await prisma.servicePage.upsert({
    where: { serviceId: 'global-network' },
    update: {},
    create: {
      serviceId: 'global-network',
      title: 'Global Network',
      description: 'Partnerships with accredited universities and verified employers',
      icon: 'Globe',
      route: '/global-network',
      heroImageUrl: '/images/global-network.jpg',
      bannerTitle: 'Global Network',
      bannerSubtitle: 'Your gateway to worldwide opportunities',
    },
  })

  // ============================================================================
  // ADMIN USER (Default credentials)
  // ============================================================================

  // NOTE: In production, password should be hashed with bcrypt
  // For now, this is a placeholder
  await prisma.adminUser.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      password: 'password123', // TODO: Hash this with bcrypt in production
      email: 'admin@example.com',
    },
  })

  console.log('✅ Database seeded successfully!')
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
