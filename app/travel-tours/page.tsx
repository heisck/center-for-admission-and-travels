"use client"

import { useScrollToTop } from "@/hooks/use-scroll-to-top"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import Link from "next/link"
import Image from "next/image"
import { useState } from "react"
import { usePublicContent } from "@/context/public-content-context"
import { MapPin, Clock, DollarSign, CheckCircle } from "lucide-react"
import DomeGallery from './DomeGallery';

export default function TravelTours() {
  useScrollToTop()
  const { content, loading } = usePublicContent()
  const [expandedPackage, setExpandedPackage] = useState<string | null>(null)

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

  const travelTours = content?.travelTours
  const featuredPackages = travelTours?.featured || []
  const benefits = travelTours?.benefits || []
  const galleryImages = travelTours?.galleryImages || []

  return (
    <main className="min-h-screen bg-background">
      <Navbar />

      <section className="py-16 md:py-24 bg-gradient-to-br from-orange-50 to-red-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center mb-12">
            <div className="relative h-80 rounded-2xl overflow-hidden ">
              <div style={{ width: '100%', height: '100%' }}>
                <DomeGallery images={galleryImages.length > 0 ? galleryImages.map(img => ({ src: img, alt: '' })) : undefined} />
              </div>
              {/* <Image
                src="/images/travel.jpg"
                alt="Travel packages showcase"
                fill
                className="object-cover object-center"
              /> */}
            </div>

            <div>
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-4">
                <span className="bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                  {travelTours?.hero?.title || "Travel & Tours"}
                </span>
              </h1>
              <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
                {travelTours?.hero?.description || "Explore our carefully curated collection of travel experiences designed to create unforgettable memories."}
              </p>
              <p className="text-lg text-muted-foreground leading-relaxed">
                {travelTours?.hero?.paragraph || "Center for Admission and Travels delivers end-to-end travel solutions with transparency, expertise, and dedication."}
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
            {featuredPackages.map((pkg) => (
              <div
                key={pkg.id}
                className="group bg-white border border-border rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2"
              >
                <div className="h-64 relative overflow-hidden bg-gray-200">
                  <Image
                    src={pkg.image || "/placeholder.svg"}
                    alt={pkg.name}
                    fill
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
                    {pkg.highlights?.slice(0, 3).map((h, i) => (
                      <div key={i} className="flex items-start space-x-2 text-sm">
                        <CheckCircle className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                        <span className="text-foreground">{h}</span>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={() => setExpandedPackage(expandedPackage === pkg.id ? null : pkg.id)}
                    className="w-full mb-3 px-4 py-2 border border-primary text-primary rounded-lg text-sm font-semibold hover:bg-primary hover:text-white transition"
                  >
                    {expandedPackage === pkg.id ? "Hide Details" : "View Details"}
                  </button>

                  {expandedPackage === pkg.id && (
                    <div className="mt-6 pt-6 border-t border-border animate-fade-in mb-6">
                      <h4 className="font-bold text-foreground mb-3">All Highlights</h4>
                      <div className="space-y-2">
                        {pkg.highlights?.map((h, i) => (
                          <div key={i} className="flex items-start space-x-2 text-sm">
                            <CheckCircle className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                            <span className="text-foreground">{h}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

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
            {benefits.map((benefit) => (
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

      <Footer />
    </main>
  )
}
