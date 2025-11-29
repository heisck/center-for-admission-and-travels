"use client"

import Navbar from "@/components/navbar"
import HeroSection from "@/components/hero-section"
import ServicesGrid from "@/components/services-grid"
import CTASection from "@/components/cta-section"
import Footer from "@/components/footer"

export default function Home() {
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
