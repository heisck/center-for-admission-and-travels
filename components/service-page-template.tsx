"use client"

import { useScrollToTop } from "@/hooks/use-scroll-to-top"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import Image from "next/image"
import SharedBookingForm from "@/components/shared-booking-form"
import { CheckCircle } from "lucide-react"

interface ServicePageTemplateProps {
  service: {
    id: string
    title: string
    heroImage: string
    bannerTitle: string
    bannerSubtitle: string
    benefits: string[]
    requirements: string[]
    countries: Array<{ name: string; description: string; image?: string }>
    visaGuidance: string
    successStories: Array<{ name: string; program: string; quote: string }>
    scholarships: Array<{ name: string; amount: string; description: string }>
  }
}

export default function ServicePageTemplate({ service }: ServicePageTemplateProps) {
  useScrollToTop()

  return (
    <main className="min-h-screen bg-background">
      <Navbar />

      <section className="relative py-12 md:py-24 bg-gradient-to-br from-orange-50 to-red-50 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="relative h-80 md:h-96 rounded-2xl overflow-hidden shadow-xl order-2 md:order-1">
              <Image
                src={service.heroImage}
                alt={service.bannerTitle}
                fill
                className="object-cover object-center"
              />
            </div>

            <div className="order-1 md:order-2">
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-4">
                <span className="bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                  {service.bannerTitle}
                </span>
              </h1>
              <p className="text-xl text-muted-foreground mb-6">{service.bannerSubtitle}</p>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Discover comprehensive support and guidance tailored to help you achieve your international aspirations with confidence and clarity.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 sm:py-16 md:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-4">
            <span className="bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
              Key Benefits
            </span>
          </h2>
          <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
            Experience comprehensive support at every step of your journey
          </p>

          <div className="grid md:grid-cols-2 gap-8">
            {service.benefits.map((benefit, idx) => (
              <div key={idx} className="flex gap-4">
                <CheckCircle className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                <p className="text-foreground leading-relaxed">{benefit}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-12 sm:py-16 md:py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-4">
            <span className="bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
              Requirements & Eligibility
            </span>
          </h2>
          <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
            Understand what you need to succeed in your journey
          </p>

          <div className="grid md:grid-cols-2 gap-8">
            {service.requirements.map((req, idx) => (
              <div key={idx} className="bg-white p-6 rounded-xl shadow-sm hover:shadow-lg transition">
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-100 to-red-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-bold text-primary">{idx + 1}</span>
                  </div>
                  <p className="text-foreground leading-relaxed">{req}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-12 sm:py-16 md:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-4">
            <span className="bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
              Featured Destinations
            </span>
          </h2>
          <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
            Explore opportunities across the globe with our trusted partners
          </p>

          <div className="grid md:grid-cols-3 gap-8">
            {service.countries.map((country, idx) => (
              <div
                key={idx}
                className="group bg-white border border-border rounded-xl overflow-hidden hover:shadow-xl hover:border-primary transition-all duration-300 transform hover:-translate-y-2"
              >
                {country.image && (
                  <div className="relative h-48 overflow-hidden">
                    <Image
                      src={country.image}
                      alt={country.name}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                    <div className="absolute bottom-4 left-4 right-4">
                      <h3 className="text-2xl font-bold text-white">{country.name}</h3>
                    </div>
                  </div>
                )}
                {!country.image && (
                  <div className="p-6 pb-3">
                    <h3 className="text-2xl font-bold text-foreground mb-3 group-hover:text-primary transition">
                      {country.name}
                    </h3>
                  </div>
                )}
                <div className="p-6 pt-4">
                  <p className="text-muted-foreground leading-relaxed">{country.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-12 sm:py-16 md:py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-4">
            <span className="bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
              Visa & Immigration Guidance
            </span>
          </h2>

          <div className="max-w-3xl mx-auto bg-white rounded-xl p-8 shadow-lg">
            <p className="text-lg text-foreground leading-relaxed">{service.visaGuidance}</p>
            <div className="mt-8 p-6 bg-orange-50 rounded-lg border border-orange-200">
              <p className="text-primary font-semibold mb-2">Expert Support Available</p>
              <p className="text-muted-foreground">
                Our visa specialists are ready to guide you through every step. Schedule a consultation to discuss your specific requirements and timeline.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 sm:py-16 md:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-4">
            <span className="bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
              Success Stories
            </span>
          </h2>
          <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
            Hear from our satisfied clients about their transformative journeys
          </p>

          <div className="grid md:grid-cols-3 gap-8">
            {service.successStories.map((story, idx) => (
              <div key={idx} className="bg-gradient-to-br from-orange-50 to-red-50 rounded-xl p-8 border border-orange-100 hover:shadow-lg transition">
                <p className="text-lg text-foreground italic mb-4">"{story.quote}"</p>
                <div className="border-t pt-4">
                  <p className="font-bold text-primary">{story.name}</p>
                  <p className="text-sm text-muted-foreground">{story.program}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-12 sm:py-16 md:py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-4">
            <span className="bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
              Financial Support & Scholarships
            </span>
          </h2>
          <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
            Make your dreams affordable with our scholarship and financial aid programs
          </p>

          <div className="grid md:grid-cols-3 gap-8">
            {service.scholarships.map((scholarship, idx) => (
              <div key={idx} className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition">
                <h3 className="text-xl font-bold text-primary mb-2">{scholarship.name}</h3>
                <p className="text-2xl font-bold text-foreground mb-3">{scholarship.amount}</p>
                <p className="text-muted-foreground">{scholarship.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-12 sm:py-16 md:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-4">
            <span className="bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
              Ready to Begin Your Journey?
            </span>
          </h2>
          <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
            Fill out the form below to start your application process. Our team will contact you within 24 hours.
          </p>

          <SharedBookingForm serviceType={service.title} />
        </div>
      </section>

      <Footer />
    </main>
  )
}
