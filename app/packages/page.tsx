"use client"

import { useScrollToTop } from "@/hooks/use-scroll-to-top"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import Link from "next/link"
import Image from "next/image"
import { useState } from "react"

interface Package {
  id: number
  name: string
  category: string
  duration: string
  price: number
  description: string
  highlights: string[]
  image: string
}

const packages: Package[] = [
  {
    id: 1,
    name: "Dubai Experience",
    category: "travel",
    duration: "6 Days",
    price: 899,
    description: "Discover luxury and adventure in the City of Gold",
    highlights: ["Burj Khalifa", "Desert Safari", "Dhow Cruise Dinner", "Dubai Mall", "Palm Jumeirah"],
    image: "/dubai-burj-khalifa-city-skyline.jpg",
  },
  {
    id: 2,
    name: "European Tour",
    category: "travel",
    duration: "7 Days",
    price: 1299,
    description: "Experience the charm of Europe this summer",
    highlights: ["Paris", "Amsterdam", "Rome", "Guided Tours", "Museum Visits"],
    image: "/europe-paris-eiffel-tower-landmarks.jpg",
  },
  {
    id: 3,
    name: "Asia Explorer",
    category: "travel",
    duration: "5 Days",
    price: 799,
    description: "Immerse yourself in the colors and cultures of Asia",
    highlights: ["Thailand", "Singapore", "Malaysia", "City Tours", "Tropical Islands"],
    image: "/asia-tropical-beaches-thailand-temples.jpg",
  },
  {
    id: 4,
    name: "UK Study Program",
    category: "study",
    duration: "Varies",
    price: 0,
    description: "University admission and visa support",
    highlights: ["Top Universities", "Visa Guidance", "Accommodation", "Pre-departure Orientation"],
    image: "/united-kingdom-big-ben-london-university.jpg",
  },
  {
    id: 5,
    name: "USA Education",
    category: "study",
    duration: "Varies",
    price: 0,
    description: "Gateway to American universities",
    highlights: ["Ivy League Support", "Scholarship Assistance", "IELTS Prep", "Complete Support"],
    image: "/statue-of-liberty-nyc.png",
  },
  {
    id: 6,
    name: "Canada Job Program",
    category: "work",
    duration: "Placement",
    price: 0,
    description: "Work visa and job placement support",
    highlights: ["Job Matching", "Visa Processing", "Interview Coaching", "Relocation Support"],
    image: "/canada-niagara-falls-toronto-city.jpg",
  },
]

export default function Packages() {
  useScrollToTop()
  const [filter, setFilter] = useState("all")

  const filtered = filter === "all" ? packages : packages.filter((p) => p.category === filter)

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
          <div className="grid md:grid-cols-3 gap-8">
            {filtered.map((pkg) => (
              <div
                key={pkg.id}
                className="group bg-white border border-border rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2"
              >
                <div className="h-48 relative overflow-hidden bg-gray-200">
                  <Image
                    src={pkg.image || "/placeholder.svg"}
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
                    {pkg.highlights.slice(0, 3).map((h, i) => (
                      <div key={i} className="flex items-center space-x-2 text-sm">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                        <span className="text-foreground">{h}</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-between items-center pt-6 border-t">
                    <span className="text-2xl font-bold text-primary">
                      {pkg.price > 0 ? `$${pkg.price}` : "Contact"}
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
        </div>
      </section>

      <Footer />
    </main>
  )
}
