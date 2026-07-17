import PublicNavbar from "@/components/public-navbar"
import HomeMinimalistHero from "@/components/home-minimalist-hero"
import ServicesGrid from "@/components/services-grid"
import HomeFeaturedPackages from "@/components/home-featured-packages"
import HomeLatestBlog from "@/components/home-latest-blog"
import CTASection from "@/components/cta-section"
import Footer from "@/components/footer-server"
import { FaqStructuredData, ServiceStructuredData } from "@/components/structured-data"
import { createMetadata } from "@/lib/metadata"
import { getHomePageContent, getSiteChromeContent } from "@/lib/public-content"

export const revalidate = 300

export const metadata = createMetadata({
  title: 'CA Travels Ghana — Study Abroad, Work Abroad & Travel Packages | CFAAT',
  description:
    'CA Travels (Center for Admission and Travels / CFAAT) is Ghana\'s partner for study abroad, work abroad, and international travel. Admission support, visa guidance, and curated tours worldwide.',
  path: '/',
})

const HOME_FAQS = [
  {
    question: 'Who is CA Travels or CFAAT?',
    answer:
      'CA Travels is the trading name people use for Center for Admission and Travels (CFAAT), a Ghana-based consultancy for international education, work mobility, and travel packages.',
  },
  {
    question: 'What services does Center for Admission and Travels offer?',
    answer:
      'We support study abroad admissions, work abroad pathways, travel and tour packages, and related visa and documentation guidance for clients in Ghana and the region.',
  },
]

export default async function Home() {
  const [home, chrome] = await Promise.all([getHomePageContent(), getSiteChromeContent()])

  return (
    <main className="min-h-screen bg-background">
      <FaqStructuredData faqs={HOME_FAQS} />
      <ServiceStructuredData
        name="Study Abroad from Ghana"
        serviceType="Educational counseling"
        description="University admission guidance and study-abroad support from Center for Admission and Travels (CA Travels / CFAAT)."
        path="/study-abroad"
      />
      <ServiceStructuredData
        name="Work Abroad Support"
        serviceType="Career mobility consulting"
        description="Work abroad pathways and relocation guidance with CFAAT."
        path="/work-abroad"
      />
      <ServiceStructuredData
        name="Travel and Tour Packages"
        serviceType="Travel agency"
        description="International travel packages and tours from Ghana with CA Travels."
        path="/travel-tours"
      />
      <PublicNavbar currentPath="/" />
      <HomeMinimalistHero hero={home.hero} />
      <ServicesGrid services={home.services} />
      <HomeFeaturedPackages featuredPackages={home.featuredPackages} />
      <HomeLatestBlog posts={home.latestBlogPosts} />
      <CTASection />
      <Footer contact={chrome.contact} footer={chrome.footer} />
    </main>
  )
}
