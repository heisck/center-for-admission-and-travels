'use client'

import { useAdmin } from '@/context/admin-context'
import {
  EditableTextWrapper,
  EditableTextareaWrapper,
} from '@/components/admin/editable-content'
import ServicesGrid from '@/components/services-grid'
import CTASection from '@/components/cta-section'
import Footer from '@/components/footer'
import Masonry from '@/components/Masonry'
import { useState, useEffect } from 'react'

const items = [
  { id: '1', img: '/images/thisshouldbeintegrated5.jpg', url: '#', height: 400 },
  { id: '2', img: '/images/integrate2.jpg', url: '#', height: 350 },
  { id: '3', img: '/images/integrate.jpg', url: '#', height: 400 },
  { id: '4', img: '/images/integrate1.jpg', url: '#', height: 600 },
  { id: '5', img: '/images/integrate3.jpg', url: '#', height: 300 },
]

export default function AdminHomePage() {
  const { content, updateHomeHero } = useAdmin()
  const { hero } = content.home
  const [masonryLoaded, setMasonryLoaded] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setMasonryLoaded(true), 500)
    return () => clearTimeout(timer)
  }, [])

  return (
    <main className="min-h-screen bg-background">
      {/* Hero Section - mirrors main home hero */}
      <section className="relative overflow-hidden md:py-22">
        <div className="hidden md:block absolute inset-0 bg-gradient-to-br from-orange-50 via-white to-red-50 -z-30"></div>

        {/* Mobile: Full-width hero with Masonry background */}
        <div className="md:hidden relative w-full" style={{ minHeight: '420px', zIndex: 10 }}>
          <div style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', zIndex: 5 }}>
            <div style={{ width: '100%', height: '100%' }}>
              <Masonry
                items={items}
                ease="power3.out"
                duration={0.6}
                stagger={0.05}
                animateFrom="bottom"
                scaleOnHover={true}
                hoverScale={0.95}
                blurToFocus={true}
                colorShiftOnHover={true}
              />
            </div>
          </div>
          <div className="hero-content-wrapper" style={{ zIndex: 20, position: 'relative', backgroundColor: masonryLoaded ? 'rgba(0, 0, 0, 0.25)' : 'transparent', paddingBottom: '24px', backdropFilter: masonryLoaded ? 'blur(4px)' : 'none', transition: 'all 0.5s ease-in' }}>
            <div className="px-4">
              <EditableTextWrapper
                value={hero.title}
                onChange={(value) => updateHomeHero({ title: value })}
                variant="title"
                className="text-4xl sm:text-5xl font-bold leading-tight mb-4"
              />
              <EditableTextareaWrapper
                value={hero.description}
                onChange={(value) => updateHomeHero({ description: value })}
                rows={3}
                className={`text-lg mt-6 leading-relaxed transition-colors duration-500 ${masonryLoaded ? 'text-white' : 'text-muted-foreground'}`}
              />
            </div>

            <div className="flex gap-4 flex-wrap px-4">
              <a
                href="#services"
                className="px-8 py-3 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-lg font-semibold hover:shadow-xl transition transform hover:scale-105"
              >
                {hero.cta1Text || 'View Our Services'}
              </a>
              <a
                href="/admin/contact"
                className="px-8 py-3 border-2 border-primary text-primary rounded-lg font-semibold hover:bg-primary hover:text-white transition"
              >
                {hero.cta2Text || 'Contact Us'}
              </a>
            </div>

            <div className="grid grid-cols-3 gap-6 pt-8 px-4">
              {hero.stats.map((stat, idx) => (
                <div key={idx}>
                  <EditableTextWrapper
                    value={stat.value}
                    onChange={(value) => {
                      const newStats = [...hero.stats]
                      newStats[idx] = { ...stat, value }
                      updateHomeHero({ stats: newStats })
                    }}
                    variant="title"
                    className="text-3xl font-bold text-primary"
                  />
                  <EditableTextWrapper
                    value={stat.label}
                    onChange={(value) => {
                      const newStats = [...hero.stats]
                      newStats[idx] = { ...stat, label: value }
                      updateHomeHero({ stats: newStats })
                    }}
                    variant="body"
                    className={`text-sm transition-colors duration-500 ${masonryLoaded ? 'text-white' : 'text-muted-foreground'}`}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Desktop: Grid layout */}
          <div className="hidden md:grid md:grid-cols-2 gap-12 items-center">
            <div className="relative md:space-y-8 space-y-4 animate-fade-in">
              <div className="relative z-20">
                <EditableTextWrapper
                  value={hero.title}
                  onChange={(value) => updateHomeHero({ title: value })}
                  variant="title"
                  className="text-4xl sm:text-5xl md:text-6xl font-bold leading-tight mb-4"
                />
                <EditableTextareaWrapper
                  value={hero.description}
                  onChange={(value) => updateHomeHero({ description: value })}
                  rows={4}
                  className="text-lg text-muted-foreground mt-6 leading-relaxed"
                />
              </div>

              <div className="relative z-20 flex gap-4 flex-wrap">
                <a
                  href="#services"
                  className="px-8 py-3 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-lg font-semibold hover:shadow-xl transition transform hover:scale-105"
                >
                  {hero.cta1Text || 'View Our Services'}
                </a>
                <a
                  href="/admin/contact"
                  className="px-8 py-3 border-2 border-primary text-primary rounded-lg font-semibold hover:bg-primary hover:text-white transition"
                >
                  {hero.cta2Text || 'Contact Us'}
                </a>
              </div>

              <div className="relative z-20 grid grid-cols-3 md:gap-6 pt-8">
                {hero.stats.map((stat, idx) => (
                  <div key={idx}>
                    <EditableTextWrapper
                      value={stat.value}
                      onChange={(value) => {
                        const newStats = [...hero.stats]
                        newStats[idx] = { ...stat, value }
                        updateHomeHero({ stats: newStats })
                      }}
                      variant="title"
                      className="text-3xl font-bold text-primary"
                    />
                    <EditableTextWrapper
                      value={stat.label}
                      onChange={(value) => {
                        const newStats = [...hero.stats]
                        newStats[idx] = { ...stat, label: value }
                        updateHomeHero({ stats: newStats })
                      }}
                      variant="body"
                      className="text-sm text-muted-foreground"
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="relative h-full">
              <div className="relative w-full h-96 rounded-2xl">
                <Masonry
                  items={items}
                  ease="power3.out"
                  duration={0.6}
                  stagger={0.05}
                  animateFrom="bottom"
                  scaleOnHover={true}
                  hoverScale={0.95}
                  blurToFocus={true}
                  colorShiftOnHover={true}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <ServicesGrid />
      <CTASection />
      <Footer />
    </main>
  )
}
