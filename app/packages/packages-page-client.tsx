'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Search } from 'lucide-react'
import { useSearchParams } from 'next/navigation'

import {
  PackageDestinationGrid,
  type PackageDestinationItem,
} from '@/components/package-destination-grid'
import type { PackageCardContent } from '@/lib/public-content'

type PackageFilter = 'all' | 'study' | 'work' | 'travel'

const FILTERS: Array<{ value: PackageFilter; label: string }> = [
  { value: 'all', label: 'All Packages' },
  { value: 'study', label: 'Study Abroad' },
  { value: 'work', label: 'Work Abroad' },
  { value: 'travel', label: 'Travel & Tours' },
]

interface PackagesPageClientProps {
  packages: PackageCardContent[]
}

export default function PackagesPageClient({ packages }: PackagesPageClientProps) {
  const searchParams = useSearchParams()
  const [filter, setFilter] = useState<PackageFilter>('all')
  const [searchQuery, setSearchQuery] = useState(() => searchParams.get('q') ?? '')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [searchOpen, setSearchOpen] = useState(false)
  const searchInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const q = searchParams.get('q')
    if (q !== null) {
      setSearchQuery(q)
      if (q) setSearchOpen(true)
    }
    const filterParam = searchParams.get('filter')
    if (
      filterParam === 'study' ||
      filterParam === 'work' ||
      filterParam === 'travel' ||
      filterParam === 'all'
    ) {
      setFilter(filterParam)
    }
    const highlight = searchParams.get('highlight')
    if (highlight) {
      setSelectedId(highlight)
    }
  }, [searchParams])

  const toggleSearch = useCallback(() => {
    setSearchOpen((prev) => {
      if (!prev) {
        requestAnimationFrame(() => searchInputRef.current?.focus())
      }
      return !prev
    })
  }, [])

  const filteredPackages = useMemo(() => {
    let result = filter === 'all' ? packages : packages.filter((pkg) => pkg.category === filter)
    if (searchQuery.trim()) {
      const query = searchQuery.trim().toLowerCase()
      result = result.filter((pkg) => {
        const haystack = [
          pkg.name,
          pkg.description,
          pkg.category,
          pkg.duration,
          ...(pkg.highlights || []),
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase()
        return haystack.includes(query)
      })
    }
    return result
  }, [filter, packages, searchQuery])

  const gridItems: PackageDestinationItem[] = useMemo(
    () =>
      filteredPackages.map((pkg) => ({
        id: pkg.id,
        name: pkg.name,
        description: pkg.description,
        category: pkg.category,
        duration: pkg.duration,
        price: pkg.price,
        currency: pkg.currency,
        highlights: pkg.highlights,
        itinerary: pkg.itinerary,
        images: pkg.images,
        included: pkg.included,
        notIncluded: pkg.notIncluded,
        bookHref: `/checkout?id=${pkg.id}`,
      })),
    [filteredPackages]
  )

  // Clear selection if filtered out
  useEffect(() => {
    if (selectedId && !gridItems.some((p) => p.id === selectedId)) {
      setSelectedId(null)
    }
  }, [gridItems, selectedId])

  return (
    <>
      <section className="relative overflow-hidden py-16 md:py-24 bg-transparent">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-4">
            <span className="bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
              Packages Built For
            </span>
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-red-600">
              Serious Global Goals
            </span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl">
            Explore study, work, and travel options prepared with clear planning, verified pathways, and full support.
            Tap a package to view full details, then book when you&apos;re ready.
          </p>

          {/* Mobile: full-width search always visible */}
          <div className="mt-8 lg:hidden">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="search"
                placeholder="Search destinations, programs, or keywords"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-2xl border border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-300 shadow-sm"
              />
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
              {FILTERS.map((item) => {
                const active = filter === item.value
                return (
                  <button
                    key={item.value}
                    onClick={() => setFilter(item.value)}
                    className={`px-3 py-2 rounded-full text-sm font-semibold transition text-center ${
                      active
                        ? 'bg-gradient-to-r from-orange-600 to-red-600 text-white shadow'
                        : 'bg-white text-orange-700 border border-orange-200 hover:border-orange-400 hover:text-orange-800'
                    }`}
                  >
                    {item.label}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Desktop: collapsible search icon + filters on one row */}
          <div className="mt-8 hidden lg:flex items-center gap-2.5">
            <button
              type="button"
              onClick={toggleSearch}
              className={`flex-shrink-0 inline-flex items-center justify-center w-11 h-11 rounded-full border transition ${
                searchOpen || searchQuery
                  ? 'bg-gradient-to-r from-orange-600 to-red-600 text-white border-transparent shadow'
                  : 'bg-white text-orange-700 border-orange-200 hover:border-orange-400 hover:text-orange-800'
              }`}
              aria-label="Toggle search"
            >
              <Search className="w-5 h-5" />
            </button>

            <div
              className={`overflow-hidden transition-all duration-300 ease-in-out ${
                searchOpen ? 'max-w-md w-full opacity-100' : 'max-w-0 opacity-0'
              }`}
            >
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  ref={searchInputRef}
                  type="search"
                  placeholder="Search destinations, programs..."
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  onBlur={() => {
                    if (!searchQuery) setSearchOpen(false)
                  }}
                  className="w-full pl-10 pr-4 py-2.5 rounded-full border border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-300 shadow-sm text-sm"
                />
              </div>
            </div>

            {FILTERS.map((item) => {
              const active = filter === item.value
              return (
                <button
                  key={item.value}
                  onClick={() => setFilter(item.value)}
                  className={`px-4 py-2.5 rounded-full text-sm font-semibold transition whitespace-nowrap ${
                    active
                      ? 'bg-gradient-to-r from-orange-600 to-red-600 text-white shadow'
                      : 'bg-white text-orange-700 border border-orange-200 hover:border-orange-400 hover:text-orange-800'
                  }`}
                >
                  {item.label}
                </button>
              )
            })}
          </div>
        </div>
      </section>

      <section className="py-16 md:py-20 bg-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {gridItems.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-3xl p-10 text-center">
              <h2 className="text-2xl font-semibold text-slate-900">No matching packages</h2>
              <p className="mt-2 text-slate-600">
                Try a different keyword or switch filters to see more options.
              </p>
              <button
                onClick={() => {
                  setFilter('all')
                  setSearchQuery('')
                }}
                className="mt-6 px-5 py-2.5 rounded-xl bg-gradient-to-r from-orange-600 to-red-600 text-white font-semibold hover:opacity-95 transition"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <PackageDestinationGrid
              packages={gridItems}
              selectedId={selectedId}
              onSelect={setSelectedId}
              bookLabel="Book Now"
            />
          )}
        </div>
      </section>
    </>
  )
}
