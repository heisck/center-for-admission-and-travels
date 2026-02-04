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

  // Team Members - Delete existing and create fresh
  await prisma.aboutTeamMember.deleteMany({ where: { aboutPageId: aboutPage.id } })
  await prisma.aboutTeamMember.createMany({
    data: [
      {
        aboutPageId: aboutPage.id,
        name: 'George Owusu Ntim',
        role: 'Founder, Managing Director & Chief Travel Consultant',
        imageUrl: '/images/USETHIS IMAGE FOR THE TEAM MEMBER TO REPLACE THE ONE OF THE FOUNDER.jpg',
        description: '',
        order: 0,
      },
      {
        aboutPageId: aboutPage.id,
        name: 'Sadat Abdul Wahab',
        role: 'Travel Consultant',
        imageUrl: '/images/team2.jpg',
        description: "Sadat Abdul Wahab is a dedicated Travel Consultant with in-depth knowledge of visa procedures, ticketing, and travel planning. He works closely with clients to create tailored travel solutions that fit their goals and budgets. Sadat's expertise and customer-focused approach help ensure stress-free journeys from Ghana to destinations around the world.",
        order: 1,
      },
      {
        aboutPageId: aboutPage.id,
        name: 'Drake Nana Adjei Afram',
        role: 'Accountant',
        imageUrl: '/images/team1.jpg',
        description: "Drake Nana Adjei Afram oversees all financial operations at Center for Admission and Travels. As the company's Accountant, he is responsible for budgeting, invoicing, reconciliation, and maintaining accurate financial records. With strong analytical skills and a commitment to transparency, Drake supports the financial stability and growth of the organisation.",
        order: 2,
      },
      {
        aboutPageId: aboutPage.id,
        name: 'Esther Adjei Konamah',
        role: 'Administrative & Front Desk Officer',
        imageUrl: '/images/team3.jpg',
        description: "Esther Adjei Konamah ensures the smooth daily operation of our office. As the Administrative and Front Desk Officer, she warmly welcomes clients, manages enquiries, organizes appointments, and maintains efficient office systems. Esther's professionalism, communication skills, and friendly service make her an essential part of our client experience.",
        order: 3,
      },
    ],
  })

  // Success Stories
  await prisma.aboutSuccessStory.deleteMany({ where: { aboutPageId: aboutPage.id } })
  await prisma.aboutSuccessStory.createMany({
    data: [
      {
        aboutPageId: aboutPage.id,
        name: 'Ama Boateng',
        program: 'Computer Science at Oxford University',
        quote: 'CFAAT made my dream of studying at Oxford a reality. Their guidance was invaluable throughout the entire process.',
        order: 0,
      },
      {
        aboutPageId: aboutPage.id,
        name: 'Kwame Mensah',
        program: 'Medicine at Cambridge University',
        quote: 'From application to visa approval, CFAAT was with me every step. I highly recommend their services to anyone serious about studying abroad.',
        order: 1,
      },
      {
        aboutPageId: aboutPage.id,
        name: 'Abena Osei',
        program: 'Business Administration at Harvard University',
        quote: 'The team at CFAAT understood my goals and matched me with the perfect university. Life-changing experience!',
        order: 2,
      },
    ],
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

  const studyAbroadPage = await prisma.servicePage.upsert({
    where: { serviceId: 'study-abroad' },
    update: {
      overview: 'Education is the foundation of success. Our expert team guides you through every step of the study abroad journey—from selecting the perfect university that matches your goals and budget, to securing admission and handling all visa requirements. With our personalized approach, hundreds of students have transformed their futures through quality international education. We don\'t just process applications; we become your trusted partner in achieving your academic dreams at the world\'s most prestigious institutions.',
      visaGuidance: 'Our visa specialists guide you through every step of the application process. We provide documentation checklists, interview preparation, and support throughout the approval process. Our success rate speaks for itself with hundreds of students obtaining their study visas annually.',
    },
    create: {
      serviceId: 'study-abroad',
      title: 'Study Abroad',
      description: 'Admission guidance, university selection, and visa processing',
      icon: 'GraduationCap',
      route: '/study-abroad',
      heroImageUrl: '/images/study-abroad.jpg',
      bannerTitle: 'Study Abroad',
      bannerSubtitle: 'Transform your future with world-class education',
      overview: 'Education is the foundation of success. Our expert team guides you through every step of the study abroad journey—from selecting the perfect university that matches your goals and budget, to securing admission and handling all visa requirements. With our personalized approach, hundreds of students have transformed their futures through quality international education. We don\'t just process applications; we become your trusted partner in achieving your academic dreams at the world\'s most prestigious institutions.',
      visaGuidance: 'Our visa specialists guide you through every step of the application process. We provide documentation checklists, interview preparation, and support throughout the approval process. Our success rate speaks for itself with hundreds of students obtaining their study visas annually.',
    },
  })

  // Why Study Section
  await prisma.serviceWhyStudySection.upsert({
    where: { servicePageId: studyAbroadPage.id },
    update: {},
    create: {
      servicePageId: studyAbroadPage.id,
      title: 'Why Study Outside Your Country?',
    },
  })

  const whyStudySection = await prisma.serviceWhyStudySection.findUnique({
    where: { servicePageId: studyAbroadPage.id },
  })

  if (whyStudySection) {
    await prisma.serviceWhyStudyHighlight.deleteMany({ where: { sectionId: whyStudySection.id } })
    await prisma.serviceWhyStudyHighlight.createMany({
      data: [
        { sectionId: whyStudySection.id, text: 'Access to world-class universities with cutting-edge research facilities and innovative teaching methodologies that expand your knowledge and skills', order: 0 },
        { sectionId: whyStudySection.id, text: 'Global recognition and competitive advantage—international degrees are highly valued by employers worldwide and can significantly boost your career prospects', order: 1 },
        { sectionId: whyStudySection.id, text: 'Diverse academic programs and curricula that offer flexibility to explore multiple disciplines before specializing, providing a broader educational foundation', order: 2 },
        { sectionId: whyStudySection.id, text: 'Abundant scholarship and financial aid opportunities specifically designed for international students, making quality education more accessible', order: 3 },
        { sectionId: whyStudySection.id, text: 'Build an international professional network with peers from around the world, creating lifelong connections and global career opportunities', order: 4 },
        { sectionId: whyStudySection.id, text: 'Work authorization programs in many countries that allow you to gain practical experience and offset education costs during your studies', order: 5 },
        { sectionId: whyStudySection.id, text: 'Personal growth through cultural immersion, language development, and exposure to different perspectives that shape well-rounded global citizens', order: 6 },
      ],
    })
  }

  // Benefits
  await prisma.serviceBenefit.deleteMany({ where: { servicePageId: studyAbroadPage.id } })
  await prisma.serviceBenefit.createMany({
    data: [
      { servicePageId: studyAbroadPage.id, text: 'Expert admission counseling from experienced professionals with track records of successful placements', order: 0 },
      { servicePageId: studyAbroadPage.id, text: 'Comprehensive university selection based on your academic profile, career goals, and financial circumstances', order: 1 },
      { servicePageId: studyAbroadPage.id, text: 'Complete visa application support including documentation, interviews, and post-visa guidance', order: 2 },
      { servicePageId: studyAbroadPage.id, text: 'IELTS and standardized test preparation to maximize your admission chances', order: 3 },
      { servicePageId: studyAbroadPage.id, text: 'Scholarship identification and application assistance to reduce financial burden', order: 4 },
      { servicePageId: studyAbroadPage.id, text: 'Pre-departure orientation covering cultural adjustment, accommodation, and financial management', order: 5 },
      { servicePageId: studyAbroadPage.id, text: 'Post-arrival support with university coordination and settling-in guidance', order: 6 },
    ],
  })

  // Requirements
  await prisma.serviceRequirement.deleteMany({ where: { servicePageId: studyAbroadPage.id } })
  await prisma.serviceRequirement.createMany({
    data: [
      { servicePageId: studyAbroadPage.id, text: 'Minimum secondary school completion or equivalent qualification', order: 0 },
      { servicePageId: studyAbroadPage.id, text: 'Satisfactory academic records and references from educational institutions', order: 1 },
      { servicePageId: studyAbroadPage.id, text: 'English language proficiency (verified through IELTS, TOEFL, or equivalent)', order: 2 },
      { servicePageId: studyAbroadPage.id, text: 'Valid passport with at least 6 months validity beyond intended return date', order: 3 },
      { servicePageId: studyAbroadPage.id, text: 'Financial proof or scholarship confirmation for program duration', order: 4 },
      { servicePageId: studyAbroadPage.id, text: 'Completed university applications for target institutions', order: 5 },
      { servicePageId: studyAbroadPage.id, text: 'Statement of purpose outlining academic and career goals', order: 6 },
    ],
  })

  // Countries
  await prisma.serviceCountry.deleteMany({ where: { servicePageId: studyAbroadPage.id } })
  await prisma.serviceCountry.createMany({
    data: [
      { servicePageId: studyAbroadPage.id, name: 'United Kingdom', description: 'World-renowned universities with centuries of academic excellence', imageUrl: '/united-kingdom-big-ben-london-university.jpg', order: 0 },
      { servicePageId: studyAbroadPage.id, name: 'United States', description: 'Leading institutions offering diverse programs and financial aid opportunities', imageUrl: '/statue-of-liberty-nyc.png', order: 1 },
      { servicePageId: studyAbroadPage.id, name: 'Canada', description: 'Quality education with welcoming policies for international students', imageUrl: '/canada-niagara-falls-toronto-city.jpg', order: 2 },
      { servicePageId: studyAbroadPage.id, name: 'Australia', description: 'Strong academic reputation with excellent post-study work opportunities', imageUrl: '/austrailia.png', order: 3 },
      { servicePageId: studyAbroadPage.id, name: 'Netherlands', description: 'Affordable quality education with English-taught programs', imageUrl: '/netherlands.jpg', order: 4 },
      { servicePageId: studyAbroadPage.id, name: 'Germany', description: 'Excellence in engineering and sciences with low tuition costs', imageUrl: '/germany.jpg', order: 5 },
    ],
  })

  // Success Stories
  await prisma.serviceSuccessStory.deleteMany({ where: { servicePageId: studyAbroadPage.id } })
  await prisma.serviceSuccessStory.createMany({
    data: [
      { servicePageId: studyAbroadPage.id, name: 'Ama Boateng', program: 'Computer Science at Oxford University', quote: 'CFAAT made my dream of studying at Oxford a reality. Their guidance was invaluable throughout the entire process.', order: 0 },
      { servicePageId: studyAbroadPage.id, name: 'Kwame Mensah', program: 'Medicine at Cambridge University', quote: 'From application to visa approval, CFAAT was with me every step. I highly recommend their services to anyone serious about studying abroad.', order: 1 },
      { servicePageId: studyAbroadPage.id, name: 'Abena Osei', program: 'Business Administration at Harvard University', quote: 'The team at CFAAT understood my goals and matched me with the perfect university. Life-changing experience!', order: 2 },
    ],
  })

  // Scholarships
  await prisma.serviceScholarship.deleteMany({ where: { servicePageId: studyAbroadPage.id } })
  await prisma.serviceScholarship.createMany({
    data: [
      { servicePageId: studyAbroadPage.id, name: 'CFAAT Excellence Scholarship', amount: 'Up to $5,000', description: 'For outstanding students with strong academic records', order: 0 },
      { servicePageId: studyAbroadPage.id, name: 'Partner University Scholarships', amount: 'Varies', description: 'Direct scholarships from our partner institutions', order: 1 },
      { servicePageId: studyAbroadPage.id, name: 'Merit-Based Awards', amount: 'Up to 50% tuition', description: 'For students with exceptional academic achievements', order: 2 },
    ],
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
