'use client'

import Link from 'next/link'
import { useAdmin } from '@/context/admin-context'
import { AdminToolbar } from '@/components/admin/admin-toolbar'
import {
  EditableTextWrapper,
  EditableTextareaWrapper,
} from '@/components/admin/editable-content'
import Footer from '@/components/footer'

export default function AdminHomePage() {
  const { content, updateHomeHero, updateServices } = useAdmin()
  const { hero, services } = content.home

  return (
    <>

      <main className="min-h-screen bg-background overflow-x-hidden">
        {/* Hero - mirrors main home layout but fully editable */}
        <section className="relative py-16 md:py-24 bg-gradient-to-br from-orange-50 via-white to-red-50 overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              {/* Content */}
              <div className="space-y-6">
                <div>
                  <EditableTextWrapper
                    value={hero.title}
                    onChange={(value) => updateHomeHero({ title: value })}
                    variant="title"
                    className="leading-tight"
                  />
                  {hero.subtitle && (
                    <div className="mt-2">
                      <EditableTextWrapper
                        value={hero.subtitle}
                        onChange={(value) => updateHomeHero({ subtitle: value })}
                        variant="subtitle"
                      />
                    </div>
                  )}
                </div>

                <EditableTextareaWrapper
                  value={hero.description}
                  onChange={(value) => updateHomeHero({ description: value })}
                  rows={3}
                  className="mt-2"
                />

                {/* CTAs */}
                <div className="flex gap-4 flex-wrap">
                  <button className="px-8 py-3 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-lg font-semibold hover:shadow-xl transition transform hover:scale-105">
                    {hero.cta1Text}
                  </button>
                  <button className="px-8 py-3 border-2 border-primary text-primary rounded-lg font-semibold hover:bg-primary hover:text-white transition">
                    {hero.cta2Text}
                  </button>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-6 pt-4">
                  {hero.stats.map((stat, idx) => (
                    <div key={idx}>
                      <input
                        type="text"
                        value={stat.value}
                        onChange={(e) => {
                          const newStats = [...hero.stats]
                          newStats[idx] = { ...stat, value: e.target.value }
                          updateHomeHero({ stats: newStats })
                        }}
                        className="w-full text-2xl md:text-3xl font-bold text-primary bg-transparent border-b border-transparent focus:border-primary focus:outline-none"
                      />
                      <input
                        type="text"
                        value={stat.label}
                        onChange={(e) => {
                          const newStats = [...hero.stats]
                          newStats[idx] = { ...stat, label: e.target.value }
                          updateHomeHero({ stats: newStats })
                        }}
                        className="mt-1 w-full text-sm text-muted-foreground bg-transparent border-b border-dotted border-slate-300 focus:border-primary focus:outline-none"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Visual placeholder to mirror hero imagery area */}
              <div className="relative h-72 md:h-96 rounded-2xl bg-slate-200 border border-dashed border-slate-400 flex items-center justify-center text-slate-500 text-sm text-center px-4">
                Hero imagery & Masonry-style visuals appear here on the live site.
                <br />
                (Design-only area – content is managed separately.)
              </div>
            </div>
          </div>
        </section>

        {/* Services - mirrors main services grid with editable cards */}
        <section id="services" className="py-12 md:py-24 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold mb-4">
                <span className="text-foreground">Our </span>
                <span className="bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                  Services
                </span>
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Comprehensive solutions for your international journey
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {services.map((service, idx) => (
                <div
                  key={service.id}
                  className="group p-8 rounded-2xl border border-border bg-white hover:border-primary hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer"
                >
                  <h3 className="text-2xl font-bold mb-3 text-foreground">
                    <EditableTextWrapper
                      value={service.title}
                      onChange={(value) => {
                        const next = [...services]
                        next[idx] = { ...service, title: value }
                        updateServices(next)
                      }}
                      variant="heading"
                    />
                  </h3>
                  <EditableTextareaWrapper
                    value={service.description}
                    onChange={(value) => {
                      const next = [...services]
                      next[idx] = { ...service, description: value }
                      updateServices(next)
                    }}
                    rows={3}
                  />
                  <div className="mt-4 text-sm text-primary font-semibold">
                    Linked to: <span className="underline">{service.id}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA + Footer from main site (read-only, for visual parity) */}
        <section className="py-20 bg-white border-t border-slate-100">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Ready to{' '}
              <span className="bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                Start Your Journey?
              </span>
            </h2>
            <p className="text-xl text-muted-foreground mb-10 leading-relaxed">
              Let Center for Admission and Travels guide you to your global opportunity. Contact us today for a free
              consultation.
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <Link
                href="/signin"
                className="px-8 py-3 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-lg font-semibold hover:shadow-xl transition transform hover:scale-105"
              >
                Get Started Today
              </Link>
              <a
                href="#services"
                className="px-8 py-3 border-2 border-primary text-primary rounded-lg font-semibold hover:bg-primary hover:text-white transition"
              >
                Explore Services
              </a>
            </div>
          </div>
        </section>

        <Footer />
      </main>
    </>
  )
}
