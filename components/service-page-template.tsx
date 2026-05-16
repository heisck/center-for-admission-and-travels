import Footer from "@/components/footer-server"
import PublicNavbar from "@/components/public-navbar"
import Image from "next/image"
import { CheckCircle, ArrowRight } from "lucide-react"
import TestimonialsCustom from "@/components/smoothui/blocks/testimonials-custom"
import Link from "next/link"

import type { ServicePageContent, SiteChromeContent } from "@/lib/public-content"
import "./service-hero.css"

interface ServicePageTemplateProps {
  service: ServicePageContent
  chrome: SiteChromeContent
}

export default function ServicePageTemplate({ service, chrome }: ServicePageTemplateProps) {
  return (
    <main className="min-h-screen bg-background">
      <PublicNavbar currentPath={service.route} />

      {/* Full-bleed hero below 1280px. Section follows the sticky nav in flow,
          so the image's top edge sits flush against the navbar's bottom. */}
      <section className="relative xl:hidden min-h-[clamp(420px,75vh,640px)] md:min-h-[clamp(480px,80vh,720px)] flex items-end overflow-hidden">
        <Image
          src={service.heroImage}
          alt={service.bannerTitle}
          fill
          priority
          className="object-cover object-top service-hero-img"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/5 via-black/30 to-black/65" />

        <div className="relative z-10 w-full pb-12 md:pb-16 pt-32">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl">
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-4 text-white service-hero-fade service-hero-fade-1">
                {service.bannerTitle}
              </h1>
              <p className="text-lg md:text-xl text-white/85 mb-6 leading-relaxed service-hero-fade service-hero-fade-2">
                {service.bannerSubtitle}
              </p>
              <Link
                href={`/apply?service=${encodeURIComponent(service.title)}`}
                className="inline-flex items-center justify-center whitespace-nowrap gap-2 px-8 py-3 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-lg font-semibold hover:shadow-xl transition transform hover:scale-105 service-hero-fade service-hero-fade-3"
              >
                Click to Apply <ArrowRight className="w-5 h-5 flex-shrink-0" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Split hero (≥1600px). Contained image card + text panel so the image
          stays a fixed visual size on huge screens instead of stretching. */}
      <section className="hidden xl:block bg-gradient-to-br from-orange-50 to-red-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-16 items-center">
            <div className="relative aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl">
              <Image
                src={service.heroImage}
                alt={service.bannerTitle}
                fill
                priority
                sizes="(min-width: 1280px) 50vw, 100vw"
                className="object-cover object-top service-hero-img"
              />
              <div className="absolute inset-0 bg-gradient-to-tr from-black/30 via-transparent to-transparent" />
            </div>

            <div>
              <h1 className="text-5xl xl:text-6xl font-bold mb-6 service-hero-fade service-hero-fade-1">
                <span className="bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                  {service.bannerTitle}
                </span>
              </h1>
              <p className="text-xl text-muted-foreground mb-8 leading-relaxed service-hero-fade service-hero-fade-2">
                {service.bannerSubtitle}
              </p>
              <Link
                href={`/apply?service=${encodeURIComponent(service.title)}`}
                className="inline-flex items-center justify-center whitespace-nowrap gap-2 px-8 py-3 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-lg font-semibold hover:shadow-xl transition transform hover:scale-105 service-hero-fade service-hero-fade-3"
              >
                Click to Apply <ArrowRight className="w-5 h-5 flex-shrink-0" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {service.overview && (
        <section className="py-12 sm:py-16 md:py-20 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-2xl p-8 md:p-12 border border-orange-200">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-6 text-foreground">
                About This Service
              </h2>
              <p className="text-lg text-foreground leading-relaxed">
                {service.overview}
              </p>
            </div>
          </div>
        </section>
      )}

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

      {service.whyStudyOutsideThisCountry && (
        <section className="py-12 sm:py-16 md:py-20 bg-slate-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-4">
              <span className="bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                {service.whyStudyOutsideThisCountry.title}
              </span>
            </h2>
            <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
              Discover transformative opportunities that await you in the world's top destinations
            </p>

            <div className="grid md:grid-cols-2 gap-6">
              {(service.whyStudyOutsideThisCountry.highlights ?? []).map((highlight, idx) => (
                <div key={idx} className="bg-white p-6 rounded-xl shadow-sm hover:shadow-lg transition">
                  <div className="flex gap-4">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center flex-shrink-0 mt-1">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <p className="text-foreground leading-relaxed">{highlight}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

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

      <TestimonialsCustom
        testimonials={service.successStories.map((story) => ({ name: story.name, role: story.program, content: story.quote }))}
        title="Success Stories"
        subtitle="Hear from our satisfied clients about their transformative journeys"
      />

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
          <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-2xl p-12 text-center border border-orange-200">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Ready to Begin Your Journey?
            </h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Click the button below to start your application. Select your service, fill out your details, and our team will contact you within 24 hours.
            </p>
            <Link
              href={`/apply?service=${encodeURIComponent(service.title)}`}
              className="inline-flex items-center justify-center whitespace-nowrap gap-2 px-8 sm:px-10 py-4 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-lg font-bold text-base sm:text-lg hover:shadow-xl transition transform hover:scale-105"
            >
              Click to Apply Now <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0" />
            </Link>
          </div>
        </div>
      </section>

      <Footer contact={chrome.contact} footer={chrome.footer} />
    </main>
  )
}
