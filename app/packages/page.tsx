"use client"

import { Suspense, useEffect, useMemo, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Search, ArrowRight, Sparkles } from "lucide-react"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import { useScrollToTop } from "@/hooks/use-scroll-to-top"
import { useSearchParams } from "next/navigation"
import { usePublicContent } from "@/context/public-content-context"
import { Skeleton } from "@/components/ui/skeleton"

type PackageFilter = "all" | "study" | "work" | "travel"

const FILTERS: Array<{ value: PackageFilter; label: string }> = [
  { value: "all", label: "All Packages" },
  { value: "study", label: "Study Abroad" },
  { value: "work", label: "Work Abroad" },
  { value: "travel", label: "Travel & Tours" },
]

function PackagesLoadingState() {
  return (
    <main className="min-h-screen bg-[#f6f7fb]">
      <Navbar />
      <section className="relative overflow-hidden py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-4 max-w-3xl">
            <Skeleton className="h-12 w-[320px]" />
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-4/5" />
          </div>
          <div className="mt-10">
            <Skeleton className="h-14 w-full max-w-2xl rounded-2xl" />
          </div>
          <div className="mt-10 grid md:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="rounded-3xl border border-slate-200 bg-white p-4">
                <Skeleton className="aspect-[4/3] w-full rounded-2xl" />
                <div className="space-y-3 mt-4">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-7 w-4/5" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-10 w-32 rounded-xl" />
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

function PackagesContent() {
  useScrollToTop()
  const searchParams = useSearchParams()
  const { content, loading } = usePublicContent()
  const [filter, setFilter] = useState<PackageFilter>("all")
  const [searchQuery, setSearchQuery] = useState(() => searchParams.get("q") ?? "")

  useEffect(() => {
    const q = searchParams.get("q")
    if (q !== null) setSearchQuery(q)
  }, [searchParams])

  const filteredPackages = useMemo(() => {
    const packages = content?.packages ?? []
    let result = filter === "all" ? packages : packages.filter((p) => p.category === filter)
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase()
      result = result.filter((p) => {
        const haystack = [
          p.name,
          p.description,
          p.category,
          p.duration,
          ...(p.highlights || []),
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
        return haystack.includes(q)
      })
    }
    return result
  }, [content?.packages, filter, searchQuery])

  if (loading) {
    return <PackagesLoadingState />
  }

  return (
    <main className="min-h-screen bg-[#f6f7fb]">
      <Navbar />

      <section className="relative overflow-hidden py-16 md:py-20">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(249,115,22,0.12),transparent_40%),radial-gradient(circle_at_bottom_left,rgba(14,165,233,0.08),transparent_40%)] pointer-events-none" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/80 border border-slate-200 text-slate-700 text-sm font-medium backdrop-blur">
            <Sparkles className="w-4 h-4 text-orange-500" />
            Premium Curated Programs
          </div>
          <h1 className="mt-5 text-4xl sm:text-5xl md:text-6xl font-semibold tracking-tight text-slate-900">
            Packages Built For
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-red-600">
              Serious Global Goals
            </span>
          </h1>
          <p className="mt-5 max-w-3xl text-lg text-slate-600 leading-relaxed">
            Explore study, work, and travel options prepared with clear planning, verified pathways, and full support.
            Find your best fit and move from interest to action quickly.
          </p>

          <div className="mt-10">
            <div className="relative max-w-2xl">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="search"
                placeholder="Search destinations, programs, or keywords"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-300 shadow-sm"
              />
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-2.5">
            {FILTERS.map((item) => {
              const active = filter === item.value
              return (
                <button
                  key={item.value}
                  onClick={() => setFilter(item.value)}
                  className={`px-4 py-2 rounded-full text-sm font-semibold transition ${
                    active
                      ? "bg-slate-900 text-white shadow"
                      : "bg-white text-slate-600 border border-slate-200 hover:border-slate-300 hover:text-slate-900"
                  }`}
                >
                  {item.label}
                </button>
              )
            })}
          </div>
        </div>
      </section>

      <section className="pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {filteredPackages.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-3xl p-10 text-center">
              <h2 className="text-2xl font-semibold text-slate-900">No matching packages</h2>
              <p className="mt-2 text-slate-600">
                Try a different keyword or switch filters to see more options.
              </p>
              <button
                onClick={() => {
                  setFilter("all")
                  setSearchQuery("")
                }}
                className="mt-6 px-5 py-2.5 rounded-xl bg-slate-900 text-white font-semibold hover:bg-slate-800 transition"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredPackages.map((pkg) => (
                <article
                  key={pkg.id}
                  className="group rounded-3xl border border-slate-200 bg-white p-4 shadow-[0_1px_2px_rgba(15,23,42,0.05)] hover:shadow-[0_14px_35px_rgba(15,23,42,0.10)] transition-all duration-300"
                >
                  <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-slate-100">
                    <Image
                      src={pkg.images?.[0] || "/placeholder.svg"}
                      alt={pkg.name}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-white/90 border border-slate-200 text-xs font-semibold text-slate-700 capitalize">
                      {pkg.category}
                    </div>
                  </div>

                  <div className="px-1 pt-5">
                    <h3 className="text-xl font-semibold text-slate-900 tracking-tight">{pkg.name}</h3>
                    <p className="mt-2 text-sm text-slate-600 leading-relaxed line-clamp-2">{pkg.description}</p>
                    <p className="mt-3 text-sm font-medium text-slate-800">{pkg.duration}</p>

                    <div className="mt-4 flex flex-wrap gap-2">
                      {pkg.highlights?.slice(0, 3).map((highlight, idx) => (
                        <span
                          key={idx}
                          className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 text-xs font-medium"
                        >
                          {highlight}
                        </span>
                      ))}
                    </div>

                    <div className="mt-6 pt-5 border-t border-slate-100 flex items-center justify-between">
                      <p className="text-xl font-semibold text-slate-900">
                        {pkg.price > 0 ? `GHS ${pkg.price.toLocaleString()}` : "Contact Us"}
                      </p>
                      <Link
                        href={`/checkout?id=${pkg.id}`}
                        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 text-white text-sm font-semibold hover:bg-black transition"
                      >
                        Book Now
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </main>
  )
}

export default function PackagesPage() {
  return (
    <Suspense fallback={<PackagesLoadingState />}>
      <PackagesContent />
    </Suspense>
  )
}
