'use client'

import { useMemo, useState } from 'react'

import {
  PackageDestinationGrid,
  type PackageDestinationItem,
} from '@/components/package-destination-grid'

export type TravelFeaturedPackage = {
  id: string
  name: string
  description: string
  duration: string
  price: number
  currency?: string
  image?: string
  highlights?: string[]
}

export default function TravelToursFeaturedPackages({
  packages,
}: {
  packages: TravelFeaturedPackage[]
}) {
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const items: PackageDestinationItem[] = useMemo(
    () =>
      packages.map((pkg) => ({
        id: pkg.id,
        name: pkg.name,
        description: pkg.description,
        category: 'travel',
        duration: pkg.duration,
        price: Number(pkg.price) || 0,
        currency: pkg.currency || 'GHS',
        highlights: pkg.highlights || [],
        image: pkg.image,
        // Travel-tours featured rows may not be checkout packages — send to packages list
        bookHref: `/packages?q=${encodeURIComponent(pkg.name)}`,
      })),
    [packages]
  )

  if (items.length === 0) return null

  return (
    <PackageDestinationGrid
      packages={items}
      selectedId={selectedId}
      onSelect={setSelectedId}
      bookLabel="View & Book"
      gridClassName="md:grid-cols-2 xl:grid-cols-2"
    />
  )
}
