"use client"

import { useScrollToTop } from "@/hooks/use-scroll-to-top"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import Link from "next/link"
import Image from "next/image"
import { useState } from "react"
import { travelPackages } from "@/data/packages"
import { MapPin, Clock, DollarSign, CheckCircle } from "lucide-react"

export default function TravelTours() {
  useScrollToTop()
  const [expandedPackage, setExpandedPackage] = useState<number | null>(null)

  return (
    <main className="min-h-screen bg-background">
      <Navbar />

      <section className="py-16 md:py-24 bg-gradient-to-br from-orange-50 to-red-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center mb-12">
            <div className="relative h-80 rounded-2xl overflow-hidden shadow-xl">
              <Image
                src="/images/thisshouldbeintegrated2.jpg"
                alt="Travel packages showcase"
                fill
                className="object-cover object-center"
              />
            </div>

            <div>
              <h1 className="text-5xl md:text-6xl font-bold mb-4">
                <span className="bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                  Travel & Tours
                </span>
              </h1>
              <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
                Explore our carefully curated collection of travel experiences designed to create unforgettable memories. From exotic beaches to historic landmarks, cultural immersion to adventure activities, we offer comprehensive travel packages with full support.
              </p>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Center for Admission and Travels delivers end-to-end travel solutions with transparency, expertise, and dedication to ensure your journey is smooth, enjoyable, and hassle-free.
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
            {travelPackages.map((pkg) => (
              <div
                key={pkg.id}
                className="group bg-white border border-border rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2"
              >
                <div className="h-64 relative overflow-hidden bg-gray-200">
                  <Image
                    src={pkg.images[0] || "/placeholder.svg"}
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
                      <span className="text-sm">From ${pkg.price} per person</span>
                    </div>
                  </div>

                  <div className="space-y-2 mb-6">
                    {pkg.highlights.slice(0, 3).map((h, i) => (
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

                  <Link
                    href={`/checkout?id=${pkg.id}`}
                    className="w-full inline-block px-4 py-3 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-lg text-center font-semibold hover:shadow-lg transition"
                  >
                    Book Package
                  </Link>

                  {expandedPackage === pkg.id && (
                    <div className="mt-6 pt-6 border-t border-border animate-fade-in">
                      <h4 className="font-bold text-foreground mb-3">Itinerary</h4>
                      <p className="text-sm text-muted-foreground whitespace-pre-line mb-4">{pkg.itinerary}</p>

                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <h5 className="font-semibold text-foreground text-sm mb-2">Included</h5>
                          <ul className="space-y-1 text-xs text-muted-foreground">
                            {pkg.included.map((item, i) => (
                              <li key={i} className="flex items-start gap-2">
                                <span className="text-primary">✓</span>
                                {item}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <h5 className="font-semibold text-foreground text-sm mb-2">Not Included</h5>
                          <ul className="space-y-1 text-xs text-muted-foreground">
                            {pkg.notIncluded.map((item, i) => (
                              <li key={i} className="flex items-start gap-2">
                                <span className="text-destructive">✗</span>
                                {item}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  )}
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
            {[
              {
                title: "Expert Planning",
                description: "Our travel specialists design itineraries tailored to your preferences and budget",
              },
              {
                title: "24/7 Support",
                description: "Round-the-clock customer service ensures help is always available during your journey",
              },
              {
                title: "Best Price Guarantee",
                description: "Competitive pricing with exclusive partnerships for exclusive travel deals",
              },
              {
                title: "Visa Assistance",
                description: "Complete visa documentation support and guidance for all destinations",
              },
              {
                title: "Travel Insurance",
                description: "Comprehensive travel insurance included to protect your investment",
              },
              {
                title: "Flexible Booking",
                description: "Easy modification and cancellation policies for your peace of mind",
              },
            ].map((benefit, idx) => (
              <div key={idx} className="bg-white p-6 rounded-xl shadow-sm hover:shadow-lg transition">
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
