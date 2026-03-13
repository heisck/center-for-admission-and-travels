import Link from "next/link"
import Image from "next/image"

import type { HomeHeroContent } from "@/lib/public-content"

const fallbackImages = [
  "/images/thisshouldbeintegrated5.jpg",
  "/images/integrate2.jpg",
  "/images/integrate.jpg",
  "/images/integrate1.jpg",
]

interface HeroSectionProps {
  hero: HomeHeroContent
}

function buildHeroImages(images: string[]) {
  return Array.from(new Set((images || []).filter(Boolean))).slice(0, 4)
}

export default function HeroSection({ hero }: HeroSectionProps) {
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

  const imagePool = buildHeroImages(hero.images)
  const showcaseImages = imagePool.length > 0 ? imagePool : fallbackImages
  const [primaryImage, secondaryImage, tertiaryImage] = [
    showcaseImages[0],
    showcaseImages[1] || showcaseImages[0],
    showcaseImages[2] || showcaseImages[1] || showcaseImages[0],
  ]

  const titleParts = heroTitle.split(" ")
  const accentTitle = titleParts.length > 2 ? titleParts.slice(0, -2).join(" ") : heroTitle
  const trailingTitle = titleParts.length > 2 ? titleParts.slice(-2).join(" ") : ""

  return (
    <section className="relative overflow-hidden py-16 md:py-22">
      <div className="absolute inset-0 -z-20 bg-[radial-gradient(circle_at_top_left,rgba(249,115,22,0.16),transparent_32%),radial-gradient(circle_at_bottom_right,rgba(220,38,38,0.12),transparent_36%),linear-gradient(180deg,#fffaf5_0%,#ffffff_52%,#fff5f0_100%)]" />
      <div className="absolute inset-x-0 top-0 -z-10 h-px bg-gradient-to-r from-transparent via-orange-300/50 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid gap-12 md:grid-cols-[1.05fr_0.95fr] items-center">
          <div className="space-y-8">
            <div className="space-y-5">
              <p className="text-xs font-semibold tracking-[0.36em] uppercase text-orange-600/80">
                Global Admission and Travel Concierge
              </p>
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold leading-tight">
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
              <p className="max-w-2xl text-lg leading-relaxed text-muted-foreground">
                {heroDescription}
              </p>
            </div>

            <div className="flex gap-4 flex-wrap">
              <a
                href="#services"
                className="px-8 py-3 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-xl font-semibold hover:shadow-xl transition"
              >
                {hero.cta1Text || "View Our Services"}
              </a>
              <Link
                href="/contact"
                className="px-8 py-3 border-2 border-primary text-primary rounded-xl font-semibold hover:bg-primary hover:text-white transition"
              >
                {hero.cta2Text || "Contact Us"}
              </Link>
            </div>

            <div className="grid grid-cols-3 gap-4 pt-4">
              {stats.map((stat, idx) => (
                <div
                  key={`${stat.label}-${idx}`}
                  className="rounded-2xl border border-orange-100/80 bg-white/80 px-4 py-5 shadow-[0_12px_30px_rgba(234,88,12,0.08)] backdrop-blur"
                >
                  <div className="text-3xl font-bold text-primary">{stat.value}</div>
                  <p className="mt-1 text-sm text-muted-foreground">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="grid gap-4 md:grid-cols-[1.2fr_0.8fr]">
              <div className="relative min-h-[420px] overflow-hidden rounded-[2rem] border border-white/70 bg-white shadow-[0_28px_70px_rgba(15,23,42,0.16)]">
                <Image
                  src={primaryImage}
                  alt={heroTitle}
                  fill
                  priority
                  sizes="(max-width: 768px) 100vw, 40vw"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/25 via-transparent to-transparent" />
              </div>

              <div className="grid gap-4 grid-rows-[1fr_0.82fr]">
                <div className="relative min-h-[200px] overflow-hidden rounded-[1.75rem] border border-white/70 bg-white shadow-[0_18px_44px_rgba(15,23,42,0.12)]">
                  <Image
                    src={secondaryImage}
                    alt={`${heroTitle} showcase`}
                    fill
                    sizes="(max-width: 768px) 100vw, 24vw"
                    className="object-cover"
                  />
                </div>

                <div className="rounded-[1.75rem] border border-orange-100 bg-white/85 p-6 shadow-[0_18px_44px_rgba(234,88,12,0.10)] backdrop-blur">
                  <div className="relative mb-5 h-28 overflow-hidden rounded-[1.25rem]">
                    <Image
                      src={tertiaryImage}
                      alt={`${heroTitle} planning`}
                      fill
                      sizes="(max-width: 768px) 100vw, 24vw"
                      className="object-cover"
                    />
                  </div>
                  <p className="text-xs font-semibold tracking-[0.32em] uppercase text-orange-600/75">
                    End-to-End Support
                  </p>
                  <h2 className="mt-3 text-2xl font-bold text-slate-900">
                    Clear planning that feels premium, not chaotic
                  </h2>
                  <p className="mt-3 text-sm leading-6 text-slate-600">
                    Admissions, travel, work pathways, and documentation support arranged with one polished experience.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
