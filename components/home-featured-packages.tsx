'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'

import {
  PackageDestinationGrid,
  type PackageDestinationItem,
} from '@/components/package-destination-grid'
import type { PackageCardContent } from '@/lib/public-content'

interface HomeFeaturedPackagesProps {
  featuredPackages: PackageCardContent[]
}

export default function HomeFeaturedPackages({ featuredPackages }: HomeFeaturedPackagesProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const items: PackageDestinationItem[] = useMemo(
    () =>
      featuredPackages.map((pkg) => ({
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
    [featuredPackages]
  )

  if (items.length === 0) return null

  return (
    <section className="py-16 md:py-24 bg-transparent">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="text-foreground">Featured </span>
            <span className="bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
              Packages
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Hand-picked experiences we want you to see. Tap a card for full details, then book your journey.
          </p>
        </div>

        <PackageDestinationGrid
          packages={items}
          selectedId={selectedId}
          onSelect={setSelectedId}
          bookLabel="Book Now"
        />

        <div className="text-center mt-12">
          <Link
            href="/packages"
            className="inline-flex items-center gap-2 px-6 py-3 border-2 border-primary text-primary rounded-lg font-semibold hover:bg-primary hover:text-white transition"
          >
            View all packages
          </Link>
        </div>
      </div>
    </section>
  )
}
