"use client"

import Navbar from "@/components/navbar"
import HeroSection from "@/components/hero-section"
import ServicesGrid from "@/components/services-grid"
import FounderSection from "@/components/founder-section"
import PackagesPreview from "@/components/packages-preview"
import CTASection from "@/components/cta-section"
import Footer from "@/components/footer"

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <HeroSection />
      <ServicesGrid />
      <FounderSection />
      <PackagesPreview />
      <CTASection />
      <Footer />
    </main>
  )
}
