"use client"

import { useScrollToTop } from "@/hooks/use-scroll-to-top"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import Link from "next/link"
import Image from "next/image"
import { useState } from "react"
import { usePublicContent } from "@/context/public-content-context"

export default function Packages() {
  useScrollToTop()
  const { content, loading } = usePublicContent()
  const [filter, setFilter] = useState("all")

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

  const packages = content?.packages || []
  const filtered = filter === "all" ? packages : packages.filter((p) => p.category === filter)

  // Debug: Log packages and filter state
  if (process.env.NODE_ENV === 'development') {
    console.log('Packages:', packages.length, 'Filter:', filter, 'Filtered:', filtered.length)
  }

  return (
    <main className="min-h-screen bg-background">
      <Navbar />

      {/* ... existing hero section ... */}
      <section className="py-16 md:py-24 bg-gradient-to-br from-orange-50 to-red-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center mb-12">
            {/* Image */}
            <div className="relative h-80 rounded-2xl overflow-hidden shadow-xl">
              <Image
                src="/images/thisshouldbeintegrated2.jpg"
                alt="Travel packages showcase"
                fill
                className="object-cover object-top"
              />
            </div>

            {/* Content */}
            <div>
              <h1 className="text-5xl md:text-6xl font-bold mb-4">
                <span className="bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                  Our Packages
                </span>
              </h1>
              <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
                Explore our carefully curated collection of study abroad, work placement, and travel experiences
                designed to match your unique aspirations. Whether you dream of international education, career
                advancement abroad, or unforgettable travel experiences, we have the perfect package for you.
              </p>
              <p className="text-lg text-muted-foreground">
                Center for Admission and Travels delivers end-to-end support with transparency, expertise, and
                dedication to your success.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ... existing filters section ... */}
      <section className="py-12 bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-4 justify-center flex-wrap">
            {[
              { value: "all", label: "All Packages" },
              { value: "study", label: "Study Abroad" },
              { value: "work", label: "Work Abroad" },
              { value: "travel", label: "Travel & Tours" },
            ].map((f) => (
              <button
                key={f.value}
                onClick={() => setFilter(f.value)}
                className={`px-6 py-2 rounded-lg font-semibold transition ${
                  filter === f.value
                    ? "bg-gradient-to-r from-orange-500 to-red-600 text-white"
                    : "bg-muted text-foreground hover:bg-border"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Packages Grid */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {filtered.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-xl text-muted-foreground mb-4">
                No packages found in this category.
              </p>
              <button
                onClick={() => setFilter("all")}
                className="px-6 py-2 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-lg font-semibold hover:shadow-lg transition"
              >
                View All Packages
              </button>
            </div>
          ) : (
            <div className="grid md:grid-cols-3 gap-8">
              {filtered.map((pkg) => (
                <div
                  key={pkg.id}
                  className="group bg-white border border-border rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2"
                >
                  <div className="h-48 relative overflow-hidden bg-gray-200">
                    <Image
                      src={pkg.images?.[0] || "/placeholder.svg"}
                      alt={pkg.name}
                      fill
                      className="object-cover object-center group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-black/10 group-hover:bg-black/5 transition"></div>
                  </div>
                  <div className="p-8">
                    <p className="text-primary text-sm font-semibold uppercase mb-2">{pkg.category}</p>
                    <h3 className="text-2xl font-bold mb-2">{pkg.name}</h3>
                    <p className="text-muted-foreground text-sm mb-4">{pkg.description}</p>
                    <p className="font-semibold text-foreground mb-4">{pkg.duration}</p>

                    <div className="space-y-2 mb-6">
                      {pkg.highlights?.slice(0, 3).map((h, i) => (
                        <div key={i} className="flex items-center space-x-2 text-sm">
                          <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                          <span className="text-foreground">{h}</span>
                        </div>
                      ))}
                    </div>

                    <div className="flex justify-between items-center pt-6 border-t">
                      <span className="text-2xl font-bold text-primary">
                        {pkg.price > 0 ? `GHS ${pkg.price.toLocaleString()}` : "Contact"}
                      </span>
                      <Link
                        href={`/checkout?id=${pkg.id}`}
                        className="px-4 py-2 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-lg text-sm font-semibold hover:shadow-lg transition"
                      >
                        Book
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </main>
  )
}
