import Navbar from "@/components/navbar"
import Footer from "@/components/footer-server"
import Link from "next/link"
import Image from "next/image"
import { MapPin, Clock, DollarSign, CheckCircle, ChevronDown } from "lucide-react"

import { getSiteChromeContent, getTravelToursPageContent } from "@/lib/public-content"

export const revalidate = 300

function buildHeroImages(heroImage: string, galleryImages: string[]) {
  return Array.from(new Set([heroImage, ...galleryImages].filter(Boolean))).slice(0, 4)
}

function TravelHeroShowcase({ images, title }: { images: string[]; title: string }) {
  if (images.length === 0) {
    return (
      <div className="relative h-80 rounded-[2rem] overflow-hidden border border-orange-100 bg-[radial-gradient(circle_at_top_left,_rgba(251,146,60,0.26),_transparent_45%),linear-gradient(135deg,_#fff7ed_0%,_#ffffff_55%,_#ffe4d6_100%)] p-8 flex flex-col justify-between shadow-[0_20px_50px_rgba(234,88,12,0.12)]">
        <div>
          <p className="text-xs font-semibold tracking-[0.35em] uppercase text-orange-600/80">Travel Desk</p>
          <h2 className="mt-3 text-3xl font-bold text-slate-900">Designed for seamless departures</h2>
        </div>
        <div className="grid grid-cols-3 gap-3 text-sm text-slate-600">
          <div className="rounded-2xl bg-white/80 p-4 shadow-sm">
            <p className="text-2xl font-bold text-orange-600">Visa</p>
            <p>Guidance with clear documentation support.</p>
          </div>
          <div className="rounded-2xl bg-white/80 p-4 shadow-sm">
            <p className="text-2xl font-bold text-orange-600">Tours</p>
            <p>Curated routes for families, teams, and solo travelers.</p>
          </div>
          <div className="rounded-2xl bg-white/80 p-4 shadow-sm">
            <p className="text-2xl font-bold text-orange-600">Care</p>
            <p>Hands-on coordination from booking to return.</p>
          </div>
        </div>
      </div>
    )
  }

  const [primaryImage, ...secondaryImages] = images

  return (
    <div className="grid h-80 grid-cols-[1.35fr_0.95fr] gap-4">
      <div className="relative overflow-hidden rounded-[2rem] border border-white/60 bg-white shadow-[0_22px_50px_rgba(234,88,12,0.18)]">
        <Image
          src={primaryImage}
          alt={title}
          fill
          priority
          sizes="(max-width: 768px) 100vw, 42vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/30 via-transparent to-transparent" />
      </div>

      <div className="grid gap-4 grid-rows-[1.1fr_0.9fr]">
        <div className="grid grid-cols-2 gap-4">
          {secondaryImages.slice(0, 2).map((image, index) => (
            <div
              key={`${image}-${index}`}
              className="relative overflow-hidden rounded-[1.5rem] border border-white/60 bg-white shadow-[0_16px_36px_rgba(15,23,42,0.10)]"
            >
              <Image
                src={image}
                alt={`${title} preview ${index + 2}`}
                fill
                sizes="(max-width: 768px) 50vw, 18vw"
                className="object-cover"
              />
            </div>
          ))}
        </div>

        <div className="rounded-[1.75rem] border border-orange-100 bg-white/85 p-6 shadow-[0_18px_40px_rgba(234,88,12,0.12)] backdrop-blur">
          <p className="text-xs font-semibold tracking-[0.32em] uppercase text-orange-600/80">Tailored Journeys</p>
          <h2 className="mt-3 text-2xl font-bold text-slate-900">Premium planning with fewer moving parts</h2>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            Every itinerary is organized to feel polished, clear, and easy to trust from inquiry to takeoff.
          </p>
        </div>
      </div>
    </div>
  )
}

export default async function TravelTours() {
  const [travelTours, chrome] = await Promise.all([getTravelToursPageContent(), getSiteChromeContent()])
  const heroImages = buildHeroImages(travelTours.hero.image, travelTours.galleryImages)

  return (
    <main className="min-h-screen bg-background">
      <Navbar />

      <section className="py-16 md:py-24 bg-gradient-to-br from-orange-50 to-red-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center mb-12">
            <div className="relative">
              <TravelHeroShowcase
                images={heroImages}
                title={travelTours.hero.title || "Travel and tours by CFAAT"}
              />
            </div>

            <div>
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-4">
                <span className="bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                  {travelTours.hero.title || "Travel & Tours"}
                </span>
              </h1>
              <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
                {travelTours.hero.description || "Explore our carefully curated collection of travel experiences designed to create unforgettable memories."}
              </p>
              <p className="text-lg text-muted-foreground leading-relaxed">
                {travelTours.hero.paragraph || "Center for Admission and Travels delivers end-to-end travel solutions with transparency, expertise, and dedication."}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                Featured Packages
              </span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Choose from our curated destinations and create your perfect travel experience
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {travelTours.featured.map((pkg) => (
              <div
                key={pkg.id}
                className="group bg-white border border-border rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2"
              >
                <div className="h-64 relative overflow-hidden bg-gray-200">
                  <Image
                    src={pkg.image || "/placeholder.svg"}
                    alt={pkg.name}
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover object-center group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black/10 group-hover:bg-black/5 transition"></div>
                </div>

                <div className="p-8">
                  <div className="flex items-center gap-2 mb-3">
                    <MapPin className="w-4 h-4 text-primary" />
                    <span className="text-sm font-semibold text-primary uppercase">{pkg.name.split(' ')[0]}</span>
                  </div>

                  <h3 className="text-2xl font-bold mb-3 text-foreground">{pkg.name}</h3>
                  <p className="text-muted-foreground text-sm mb-6">{pkg.description}</p>

                  <div className="space-y-3 mb-6">
                    <div className="flex items-center gap-2 text-foreground">
                      <Clock className="w-4 h-4 text-primary" />
                      <span className="text-sm">{pkg.duration}</span>
                    </div>
                    <div className="flex items-center gap-2 text-foreground">
                      <DollarSign className="w-4 h-4 text-primary" />
                      <span className="text-sm">From GHS {Number(pkg.price).toLocaleString()} per person</span>
                    </div>
                  </div>

                  <div className="space-y-2 mb-6">
                    {pkg.highlights?.slice(0, 3).map((highlight, index) => (
                      <div key={index} className="flex items-start space-x-2 text-sm">
                        <CheckCircle className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                        <span className="text-foreground">{highlight}</span>
                      </div>
                    ))}
                  </div>

                  <details className="mt-6 mb-6 border-t border-border pt-4 group/details">
                    <summary className="list-none w-full mb-3 px-4 py-2 border border-primary text-primary rounded-lg text-sm font-semibold hover:bg-primary hover:text-white transition inline-flex items-center justify-center gap-2 cursor-pointer">
                      <span>View Details</span>
                      <ChevronDown className="w-4 h-4 transition-transform group-open/details:rotate-180" />
                    </summary>
                    <div className="pt-2 animate-fade-in">
                      <h4 className="font-bold text-foreground mb-3">All Highlights</h4>
                      <div className="space-y-2">
                        {pkg.highlights?.map((highlight, index) => (
                          <div key={index} className="flex items-start space-x-2 text-sm">
                            <CheckCircle className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                            <span className="text-foreground">{highlight}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </details>

                  <Link
                    href={`/checkout?id=${pkg.id}`}
                    className="w-full inline-block px-4 py-3 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-lg text-center font-semibold hover:shadow-lg transition"
                  >
                    Book Package
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center mb-12">
            <span className="bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
              Why Choose CFAAT for Your Travel?
            </span>
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            {travelTours.benefits.map((benefit) => (
              <div key={benefit.id} className="bg-white p-6 rounded-xl shadow-sm hover:shadow-lg transition">
                <h3 className="text-lg font-bold text-primary mb-3">{benefit.title}</h3>
                <p className="text-muted-foreground">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-orange-500 to-red-600 rounded-2xl p-12 text-center text-white">
            <h2 className="text-4xl font-bold mb-4">Ready to Explore the World?</h2>
            <p className="text-lg mb-8 max-w-2xl mx-auto">
              Don't see your dream destination? Contact our travel specialists to create a custom package just for you.
            </p>
            <Link
              href="/contact"
              className="inline-block px-8 py-4 bg-white text-primary rounded-lg font-bold hover:shadow-lg transition"
            >
              Create Custom Package
            </Link>
          </div>
        </div>
      </section>

      <Footer contact={chrome.contact} footer={chrome.footer} />
    </main>
  )
}
