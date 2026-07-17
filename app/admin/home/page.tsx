'use client'

import Link from 'next/link'
import { useAdmin } from '@/context/admin-context'
import {
  EditableTextWrapper,
  EditableTextareaWrapper,
} from '@/components/admin/editable-content'
import Footer from '@/components/footer'
import Masonry from '@/components/Masonry'
import { ImageEditor } from '@/components/admin/image-editor'

export default function AdminHomePage() {
  const { content, updateHomeHero, updateServices, updateHomeHeroImages, updateHomeFeaturedPackages } = useAdmin()
  const { hero, services, featuredPackages = [] } = content.home
  const packages = content.packages || []
  
  // Convert images to Masonry items format
  const heroImages = hero.images || []
  const masonryItems = heroImages.map((img, index) => ({
    id: String(index + 1),
    img: img,
    url: "#",
    height: [400, 350, 400, 600, 300][index % 5] || 400,
  }))

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

              {/* Masonry Animation - mirrors main page exactly */}
              <div className="relative h-full">
                <div className="relative w-full h-72 md:h-96 rounded-2xl overflow-hidden">
                  {masonryItems.length > 0 ? (
                    <Masonry
                      items={masonryItems}
                      ease="power3.out"
                      duration={0.6}
                      stagger={0.05}
                      animateFrom="bottom"
                      scaleOnHover={true}
                      hoverScale={0.95}
                      blurToFocus={true}
                      colorShiftOnHover={true}
                    />
                  ) : (
                    <div className="w-full h-full bg-slate-200 border-2 border-dashed border-slate-400 flex items-center justify-center text-slate-500 text-sm text-center px-4">
                      No images yet. Add images below to see the animation.
                    </div>
                  )}
                </div>
                {/* Image Editor for Masonry */}
                <div className="mt-4 p-4 bg-white rounded-lg border border-border">
                  <ImageEditor
                    images={heroImages}
                    onChange={updateHomeHeroImages}
                    maxImages={10}
                    label="Hero Gallery Images (for Masonry Animation)"
                  />
                </div>
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

            <p className="text-center text-sm text-muted-foreground mb-8 max-w-xl mx-auto">
              Edit titles freely. Public page links stay stable via the route selector — not the title.
            </p>
            <div className="grid md:grid-cols-2 gap-8">
              {services.map((service, idx) => {
                const routeOptions = [
                  { value: '/study-abroad', label: 'Study Abroad' },
                  { value: '/work-abroad', label: 'Work Abroad' },
                  { value: '/travel-tours', label: 'Travel & Tours' },
                  { value: '/global-network', label: 'Global Network' },
                ]
                const linkedRoute =
                  service.route || routeOptions[idx]?.value || routeOptions[0].value
                return (
                  <div
                    key={service.id}
                    className="group p-8 rounded-2xl border border-border bg-white hover:border-primary hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2"
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
                    <div className="mt-4 flex flex-col gap-1 text-sm">
                      <label className="text-muted-foreground font-medium text-xs">
                        Links to (public URL):
                      </label>
                      <select
                        value={linkedRoute}
                        onChange={(e) => {
                          const next = [...services]
                          next[idx] = { ...service, route: e.target.value }
                          updateServices(next)
                        }}
                        className="px-2 py-1.5 border border-border rounded bg-white text-foreground font-mono text-xs"
                      >
                        {routeOptions.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.value} ({opt.label})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        {/* Featured Packages - pick which packages show on homepage */}
        <section className="py-12 md:py-24 bg-slate-50 border-t">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-foreground">Featured Packages on Homepage</h2>
              <p className="text-muted-foreground mt-1">
                Select packages to highlight on the homepage. Visitors see these first without navigating through the site.
              </p>
            </div>
            {packages.length === 0 ? (
              <div className="bg-white rounded-xl border border-border p-8 text-center">
                <p className="text-muted-foreground">No packages yet. Add packages in the Packages editor first.</p>
                <Link href="/admin/packages" className="mt-4 inline-block px-4 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary/90">
                  Go to Packages
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {packages.map((pkg) => {
                  const isFeatured = featuredPackages?.some((fp) => fp.id === pkg.id)
                  return (
                    <label
                      key={pkg.id}
                      className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition ${
                        isFeatured ? 'border-primary bg-primary/5' : 'border-border bg-white hover:border-slate-300'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={!!isFeatured}
                        onChange={() => {
                          const currentIds = featuredPackages?.map((fp) => fp.id) || []
                          const newIds = isFeatured
                            ? currentIds.filter((id) => id !== pkg.id)
                            : [...currentIds, pkg.id]
                          updateHomeFeaturedPackages(newIds)
                        }}
                        className="w-5 h-5 rounded border-border text-primary focus:ring-primary"
                      />
                      <div className="flex-1">
                        <span className="font-semibold text-foreground">{pkg.name}</span>
                        <span className="text-muted-foreground text-sm ml-2">({pkg.category})</span>
                      </div>
                      <span className="text-primary font-medium">
                        {pkg.price > 0 ? `$${pkg.price.toLocaleString()}` : 'Contact'}
                      </span>
                    </label>
                  )
                })}
              </div>
            )}
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
