'use client'

import { useEffect, useMemo, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Search, ArrowRight, ChevronDown, ChevronUp } from "lucide-react"
import { useSearchParams } from "next/navigation"

import type { PackageCardContent } from "@/lib/public-content"

type PackageFilter = "all" | "study" | "work" | "travel"

const FILTERS: Array<{ value: PackageFilter; label: string }> = [
  { value: "all", label: "All Packages" },
  { value: "study", label: "Study Abroad" },
  { value: "work", label: "Work Abroad" },
  { value: "travel", label: "Travel & Tours" },
]

interface PackagesPageClientProps {
  packages: PackageCardContent[]
}

export default function PackagesPageClient({ packages }: PackagesPageClientProps) {
  const searchParams = useSearchParams()
  const [filter, setFilter] = useState<PackageFilter>("all")
  const [searchQuery, setSearchQuery] = useState(() => searchParams.get("q") ?? "")
  const [expandedPackageId, setExpandedPackageId] = useState<string | null>(null)

  useEffect(() => {
    const q = searchParams.get("q")
    if (q !== null) setSearchQuery(q)
  }, [searchParams])

  const filteredPackages = useMemo(() => {
    let result = filter === "all" ? packages : packages.filter((pkg) => pkg.category === filter)
    if (searchQuery.trim()) {
      const query = searchQuery.trim().toLowerCase()
      result = result.filter((pkg) => {
        const haystack = [pkg.name, pkg.description, pkg.category, pkg.duration, ...(pkg.highlights || [])]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
        return haystack.includes(query)
      })
    }
    return result
  }, [filter, packages, searchQuery])

  return (
    <>
      <section className="relative overflow-hidden py-16 md:py-20">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(249,115,22,0.16),transparent_40%),radial-gradient(circle_at_bottom_left,rgba(234,88,12,0.10),transparent_40%)] pointer-events-none" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-semibold tracking-tight text-orange-900">
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
                onChange={(event) => setSearchQuery(event.target.value)}
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
                      ? "bg-gradient-to-r from-orange-600 to-red-600 text-white shadow"
                      : "bg-white text-orange-700 border border-orange-200 hover:border-orange-400 hover:text-orange-800"
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
                className="mt-6 px-5 py-2.5 rounded-xl bg-gradient-to-r from-orange-600 to-red-600 text-white font-semibold hover:opacity-95 transition"
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
                    <h3 className="text-xl font-semibold text-orange-950 tracking-tight">{pkg.name}</h3>
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

                    <div className="mt-6 pt-5 border-t border-slate-100 flex items-center justify-between gap-2">
                      <p className="text-xl font-semibold text-slate-900">
                        {pkg.price > 0 ? `GHS ${pkg.price.toLocaleString()}` : "Contact Us"}
                      </p>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setExpandedPackageId((current) => (current === pkg.id ? null : pkg.id))}
                          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-orange-200 text-orange-700 text-sm font-semibold hover:bg-orange-50 transition"
                        >
                          {expandedPackageId === pkg.id ? "Hide Details" : "View Details"}
                          {expandedPackageId === pkg.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>
                        <Link
                          href={`/checkout?id=${pkg.id}`}
                          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-orange-600 to-red-600 text-white text-sm font-semibold hover:opacity-95 transition"
                        >
                          Book Now
                          <ArrowRight className="w-4 h-4" />
                        </Link>
                      </div>
                    </div>

                    {expandedPackageId === pkg.id ? (
                      <div className="mt-4 border-t border-orange-100 pt-4 space-y-4">
                        <div>
                          <h4 className="text-sm font-semibold text-orange-900 mb-2">All Highlights</h4>
                          {pkg.highlights?.length ? (
                            <ul className="space-y-1.5">
                              {pkg.highlights.map((item, index) => (
                                <li key={index} className="text-sm text-slate-700 flex items-start gap-2">
                                  <span className="w-1.5 h-1.5 rounded-full bg-orange-500 mt-2 flex-shrink-0" />
                                  {item}
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <p className="text-sm text-slate-500">No highlights added yet.</p>
                          )}
                        </div>

                        <div className="grid sm:grid-cols-2 gap-4">
                          <div>
                            <h4 className="text-sm font-semibold text-orange-900 mb-2">Included</h4>
                            {pkg.included?.length ? (
                              <ul className="space-y-1.5">
                                {pkg.included.map((item, index) => (
                                  <li key={index} className="text-sm text-slate-700 flex items-start gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 mt-2 flex-shrink-0" />
                                    {item}
                                  </li>
                                ))}
                              </ul>
                            ) : (
                              <p className="text-sm text-slate-500">No included items listed.</p>
                            )}
                          </div>
                          <div>
                            <h4 className="text-sm font-semibold text-orange-900 mb-2">Not Included</h4>
                            {pkg.notIncluded?.length ? (
                              <ul className="space-y-1.5">
                                {pkg.notIncluded.map((item, index) => (
                                  <li key={index} className="text-sm text-slate-700 flex items-start gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 mt-2 flex-shrink-0" />
                                    {item}
                                  </li>
                                ))}
                              </ul>
                            ) : (
                              <p className="text-sm text-slate-500">No exclusions listed.</p>
                            )}
                          </div>
                        </div>

                        {pkg.itinerary?.trim() ? (
                          <div>
                            <h4 className="text-sm font-semibold text-orange-900 mb-2">Itinerary</h4>
                            <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">
                              {pkg.itinerary}
                            </p>
                          </div>
                        ) : null}
                      </div>
                    ) : null}
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  )
}
