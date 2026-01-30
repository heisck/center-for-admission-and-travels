"use client"

import Navbar from "@/components/navbar"
import HeroSection from "@/components/hero-section"
import ServicesGrid from "@/components/services-grid"
import CTASection from "@/components/cta-section"
import Footer from "@/components/footer"
import { usePublicContent } from "@/context/public-content-context"

export default function Home() {
  const { content, loading } = usePublicContent()

  if (loading) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <HeroSection />
      <ServicesGrid />
      <CTASection />
      <Footer />
    </main>
  )
}
