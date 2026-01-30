'use client'

import { useAdmin } from '@/context/admin-context'
import Footer from '@/components/footer'
import Image from 'next/image'
import { CheckCircle, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { services } from '@/data/services'
import {
  EditableTextWrapper,
  EditableTextareaWrapper,
} from '@/components/admin/editable-content'

export default function AdminWorkAbroadPage() {
  const service = services.find((s) => s.id === 'work-abroad')

  if (!service) {
    return <div>Service not found</div>
  }

  return (
    <main className="min-h-screen bg-background">
      {/* Hero Section */}
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
              <EditableTextWrapper
                value={service.bannerTitle}
                onChange={() => {}}
                variant="title"
                className="text-4xl sm:text-5xl md:text-6xl font-bold mb-4"
              />
              <EditableTextareaWrapper
                value={service.bannerSubtitle}
                onChange={() => {}}
                rows={2}
                className="text-xl text-muted-foreground mb-6"
              />
              <EditableTextareaWrapper
                value="Discover comprehensive support and guidance tailored to help you achieve your international aspirations with confidence and clarity."
                onChange={() => {}}
                rows={3}
                className="text-lg text-muted-foreground leading-relaxed mb-8"
              />
              <Link
                href={`/admin/apply?service=${encodeURIComponent(service.title)}`}
                className="inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-lg font-semibold hover:shadow-xl transition transform hover:scale-105"
              >
                Click to Apply <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Key Benefits */}
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
                <EditableTextareaWrapper
                  value={benefit}
                  onChange={() => {}}
                  rows={2}
                  className="text-foreground leading-relaxed flex-1"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Requirements */}
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
                  <EditableTextareaWrapper
                    value={req}
                    onChange={() => {}}
                    rows={2}
                    className="text-foreground leading-relaxed flex-1"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Destinations */}
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
                      <EditableTextWrapper
                        value={country.name}
                        onChange={() => {}}
                        variant="heading"
                        className="text-2xl font-bold text-white"
                      />
                    </div>
                  </div>
                )}
                {!country.image && (
                  <div className="p-6 pb-3">
                    <EditableTextWrapper
                      value={country.name}
                      onChange={() => {}}
                      variant="heading"
                      className="text-2xl font-bold text-foreground mb-3 group-hover:text-primary transition"
                    />
                  </div>
                )}
                <div className="p-6 pt-4">
                  <EditableTextareaWrapper
                    value={country.description}
                    onChange={() => {}}
                    rows={3}
                    className="text-muted-foreground leading-relaxed"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Visa Guidance */}
      <section className="py-12 sm:py-16 md:py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-4">
            <span className="bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
              Visa & Immigration Guidance
            </span>
          </h2>

          <div className="max-w-3xl mx-auto bg-white rounded-xl p-8 shadow-lg">
            <EditableTextareaWrapper
              value={service.visaGuidance}
              onChange={() => {}}
              rows={6}
              className="text-lg text-foreground leading-relaxed"
            />
            <div className="mt-8 p-6 bg-orange-50 rounded-lg border border-orange-200">
              <p className="text-primary font-semibold mb-2">Expert Support Available</p>
              <p className="text-muted-foreground">
                Our visa specialists are ready to guide you through every step. Schedule a consultation to discuss your specific requirements and timeline.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
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
              href={`/admin/apply?service=${encodeURIComponent(service.title)}`}
              className="inline-flex items-center gap-2 px-10 py-4 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-lg font-bold text-lg hover:shadow-xl transition transform hover:scale-105"
            >
              Click to Apply Now <ArrowRight className="w-6 h-6" />
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}

