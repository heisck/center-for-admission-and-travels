"use client"

import Navbar from "@/components/navbar"
import HeroSection from "@/components/hero-section"
import ServicesGrid from "@/components/services-grid"
import CTASection from "@/components/cta-section"
import Footer from "@/components/footer"
import { usePublicContent } from "@/context/public-content-context"
import { Skeleton } from "@/components/ui/skeleton"

export default function Home() {
  const { content, loading } = usePublicContent()

  if (loading) {
    return (
      <main className="min-h-screen bg-background">
        <Navbar />
        {/* Hero skeleton */}
        <section className="py-20 md:py-32 bg-gradient-to-br from-orange-50 to-red-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
            <Skeleton className="h-12 w-[320px] mx-auto" />
            <Skeleton className="h-5 w-[480px] max-w-full mx-auto" />
            <Skeleton className="h-5 w-[400px] max-w-full mx-auto" />
            <Skeleton className="h-12 w-[160px] mx-auto rounded-lg" />
          </div>
        </section>
        {/* Services skeleton */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12 space-y-3">
              <Skeleton className="h-8 w-[240px] mx-auto" />
              <Skeleton className="h-4 w-[360px] mx-auto" />
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="bg-white border border-border rounded-2xl p-8 space-y-4">
                  <Skeleton className="h-14 w-14 rounded-xl" />
                  <Skeleton className="h-6 w-[160px]" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
              ))}
            </div>
          </div>
        </section>
        {/* CTA skeleton */}
        <section className="py-20 bg-gradient-to-br from-orange-50 to-red-50">
          <div className="max-w-3xl mx-auto px-4 text-center space-y-4">
            <Skeleton className="h-10 w-[300px] mx-auto" />
            <Skeleton className="h-4 w-[400px] max-w-full mx-auto" />
            <Skeleton className="h-12 w-[180px] mx-auto rounded-lg" />
          </div>
        </section>
        <Footer />
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
