import PublicNavbar from "@/components/public-navbar"
import HeroSection from "@/components/hero-section"
import ServicesGrid from "@/components/services-grid"
import HomeFeaturedPackages from "@/components/home-featured-packages"
import HomeLatestBlog from "@/components/home-latest-blog"
import CTASection from "@/components/cta-section"
import Footer from "@/components/footer-server"
import { getHomePageContent, getSiteChromeContent } from "@/lib/public-content"

export const revalidate = 300

export default async function Home() {
  const [home, chrome] = await Promise.all([getHomePageContent(), getSiteChromeContent()])

  return (
    <main className="min-h-screen bg-background">
      <PublicNavbar currentPath="/" />
      <HeroSection hero={home.hero} />
      <ServicesGrid services={home.services} />
      <HomeFeaturedPackages featuredPackages={home.featuredPackages} />
      <HomeLatestBlog posts={home.latestBlogPosts} />
      <CTASection />
      <Footer contact={chrome.contact} footer={chrome.footer} />
    </main>
  )
}
