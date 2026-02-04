"use client"

import './page.css'
import { useScrollToTop } from "@/hooks/use-scroll-to-top"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import Image from "next/image"
import { CheckCircle } from "lucide-react"
import FounderSection from "@/components/founder-section"
import TestimonialsCustom from "@/components/smoothui/blocks/testimonials-custom"
import { usePublicContent } from "@/context/public-content-context"

export default function About() {
  useScrollToTop()
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

  const about = content?.about
  if (!about) {
    return <div>Content not available</div>
  }

  return (
    <main className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="relative py-16 md:py-24 bg-gradient-to-br from-orange-50 to-red-50 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Image - Top Left */}
            <div className="relative h-80 rounded-2xl overflow-hidden shadow-xl order-2 md:order-1">
              <Image
                src={about.heroImage || "/images/thisshouldbeintegrated4.jpg"}
                alt="Team at conference"
                fill
                className="object-cover object-top"
              />
            </div>

            {/* Content */}
            <div className="order-1 md:order-2">
              <h1 className="text-5xl md:text-6xl font-bold mb-4">
                <span className="bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                  {about.heroTitle || "About Center for Admission and Travels"}
                </span>
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl">
                {about.heroSubtitle || "Your trusted partner in global opportunities. We believe every journey is unique, and our team is dedicated to guiding you with honesty, professionalism, and care from start to finish."}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12">
            <div>
              <h2 className="text-3xl font-bold mb-6 text-primary">Our Mission</h2>
              <p className="text-lg text-muted-foreground leading-relaxed mb-6">
                {about.mission?.description || "To provide trusted, personalized, and professional services in international education, travel, and job placements."}
              </p>
              <div className="space-y-3">
                {about.mission?.points?.map((point, idx) => (
                  <div key={idx} className="flex items-start space-x-3">
                    <CheckCircle className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                    <span className="text-foreground">{point}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h2 className="text-3xl font-bold mb-6 text-primary">Our Vision</h2>
              <p className="text-lg text-muted-foreground leading-relaxed mb-6">
                {about.vision?.description || "To be Ghana's leading gateway to global education, travel, and work opportunities."}
              </p>
              <div className="space-y-3">
                {about.vision?.points?.map((point, idx) => (
                  <div key={idx} className="flex items-start space-x-3">
                    <CheckCircle className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                    <span className="text-foreground">{point}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center mb-12">
            <span className="bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
              Core Values
            </span>
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {about.coreValues?.map((value, idx) => (
              <div key={value.id || idx} className="bg-white p-8 rounded-xl shadow-sm hover:shadow-lg transition">
                <h3 className="text-xl font-bold text-primary mb-3">{value.title}</h3>
                <p className="text-muted-foreground">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <FounderSection />
      
      {/* Success Stories */}
      {about.successStories && about.successStories.length > 0 && (
        <TestimonialsCustom
          testimonials={about.successStories.map((ss) => ({
            name: ss.name,
            role: ss.program,
            content: ss.quote,
          }))}
          title="Success Stories"
          subtitle="Hear from our satisfied clients about their transformative journeys"
        />
      )}

      {/* Team */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center mb-4">
            <span className="bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
              Meet Our Team
            </span>
          </h2>
          <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
            Dedicated professionals committed to your success
          </p>

          <div className="grid md:grid-cols-4 gap-8 team-grid">
            {about.team?.map((member, idx) => (
              <div key={member.id || idx} className="group">
                <div className="relative h-64 mb-4 rounded-xl overflow-hidden shadow-lg">
                  <Image
                    src={member.image || "/placeholder.svg"}
                    alt={member.name}
                    width={300}
                    height={400}
                    className="min-w-3xs md:min-w-1/3 w-full h-full object-cover object-top group-hover:scale-110 transition duration-300"
                  />
                </div>
                <h3 className="text-lg font-bold text-foreground">{member.name}</h3>
                <p className="text-primary font-semibold">{member.role}</p>
                {member.description && (
                  <div className="text-sm text-muted-foreground leading-relaxed mt-2">
                    <details>
                      <summary className="cursor-pointer">More Info</summary>
                      <div className="mt-2">{member.description}</div>
                    </details>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
