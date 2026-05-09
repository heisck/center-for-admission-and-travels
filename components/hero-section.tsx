'use client'

import Link from "next/link"
import { useState, useEffect } from 'react'

import HeroMasonryPanel from '@/components/hero-masonry-panel'
import './hero-section.css'
import type { HomeHeroContent } from "@/lib/public-content"

const fallbackItems = [
  {
    id: "1",
    img: "/images/thisshouldbeintegrated5.jpg",
    url: "https://example.com/one",
    height: 400,
  },
  {
    id: "2",
    img: "/images/integrate2.jpg",
    url: "https://example.com/two",
    height: 350,
  },
  {
    id: "3",
    img: "/images/integrate.jpg",
    url: "https://example.com/three",
    height: 400,
  },
  {
    id: "4",
    img: "/images/integrate1.jpg",
    url: "https://example.com/four",
    height: 600,
  },
  {
    id: "5",
    img: "/images/integrate3.jpg",
    url: "https://example.com/five",
    height: 300,
  },
]

interface HeroSectionProps {
  hero: HomeHeroContent
}

export default function HeroSection({ hero }: HeroSectionProps) {
  const [masonryLoaded, setMasonryLoaded] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setMasonryLoaded(true), 500)
    return () => clearTimeout(timer)
  }, [])

  const heroTitle = hero.title || "Looking To Travel"
  const heroDescription =
    hero.description ||
    "Welcome to Center for Admission and Travels, where your dreams of studying, working, and traveling abroad become reality. We guide you with honesty, professionalism, and care every step of the way."
  const stats = hero.stats?.length
    ? hero.stats
    : [
        { value: "50+", label: "Success Stories" },
        { value: "15+", label: "Destinations" },
        { value: "100%", label: "Satisfaction" },
      ]

  const heroImages = hero.images || []
  const items = heroImages.length > 0
    ? heroImages.map((img, index) => ({
        id: `db-${index}`,
        img,
        url: "#",
        height: [400, 350, 400, 600, 300][index % 5] || 400,
      }))
    : fallbackItems

  const titleParts = heroTitle.split(' ')
  const accentTitle = titleParts.length > 2 ? titleParts.slice(0, -2).join(' ') : heroTitle
  const trailingTitle = titleParts.length > 2 ? titleParts.slice(-2).join(' ') : ''

  return (
    <section className="relative overflow-hidden md:py-22">
      <div className="hidden md:block absolute inset-0 bg-gradient-to-br from-orange-50 via-white to-red-50 -z-30"></div>

      <div className="md:hidden relative w-full" style={{ minHeight: '420px', zIndex: 10 }}>
          <div style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', zIndex: 5 }}>
            <div style={{ width: '100%', height: '100%' }}>
              <HeroMasonryPanel items={items} />
            </div>
          </div>
        <div className="hero-content-wrapper" style={{ zIndex: 20, position: 'relative', backgroundColor: masonryLoaded ? 'rgba(0, 0, 0, 0.25)' : 'transparent', paddingBottom: '24px', backdropFilter: masonryLoaded ? 'blur(4px)' : 'none', transition: 'all 0.5s ease-in' }}>
          <div className="px-4">
            <h1 className="text-4xl sm:text-5xl font-bold leading-tight mb-4">
              <span className="bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                {accentTitle}
              </span>
              {trailingTitle ? (
                <>
                  <br />
                  <span className="text-foreground">{trailingTitle}</span>
                </>
              ) : null}
            </h1>
            <p className={`text-lg mt-6 leading-relaxed transition-colors duration-500 ${masonryLoaded ? 'text-white' : 'text-muted-foreground'}`}>
              {heroDescription}
            </p>
          </div>

          <div className="flex gap-4 flex-wrap px-4">
            <a
              href="#services"
              className="px-8 py-3 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-lg font-semibold hover:shadow-xl transition transform hover:scale-105"
            >
              {hero.cta1Text || "View Our Services"}
            </a>
            <Link
              href="/contact"
              className="px-8 py-3 border-2 border-primary text-primary rounded-lg font-semibold hover:bg-primary hover:text-white transition"
            >
              {hero.cta2Text || "Contact Us"}
            </Link>
          </div>

          <div className="grid grid-cols-3 gap-6 pt-8 px-4">
            {stats.map((stat, idx) => (
              <div key={idx}>
                <div className="text-3xl font-bold text-primary">{stat.value}</div>
                <p className={`text-sm transition-colors duration-500 ${masonryLoaded ? 'text-white' : 'text-muted-foreground'}`}>{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="hidden md:grid md:grid-cols-2 gap-12 items-center">
          <div className="relative md:space-y-8 space-y-4 animate-fade-in">
            <div className="relative z-20">
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold leading-tight mb-4">
                <span className="bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                  {accentTitle}
                </span>
                {trailingTitle ? (
                  <>
                    <br />
                    <span className="text-foreground">{trailingTitle}</span>
                  </>
                ) : null}
              </h1>
              <p className="text-lg text-muted-foreground mt-6 leading-relaxed">
                {heroDescription}
              </p>
            </div>

            <div className="relative z-20 flex gap-4 flex-wrap">
              <a
                href="#services"
                className="px-8 py-3 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-lg font-semibold hover:shadow-xl transition transform hover:scale-105"
              >
                {hero.cta1Text || "View Our Services"}
              </a>
              <Link
                href="/contact"
                className="px-8 py-3 border-2 border-primary text-primary rounded-lg font-semibold hover:bg-primary hover:text-white transition"
              >
                {hero.cta2Text || "Contact Us"}
              </Link>
            </div>

            <div className="relative z-20 grid grid-cols-3 md:gap-6 pt-8">
              {stats.map((stat, idx) => (
                <div key={idx}>
                  <div className="text-3xl font-bold text-primary">{stat.value}</div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative h-full">
            <div className="relative w-full h-96 rounded-2xl">
              <HeroMasonryPanel items={items} />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
