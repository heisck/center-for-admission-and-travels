import Link from 'next/link'
import Image from 'next/image'

import type { PackageCardContent } from '@/lib/public-content'

interface HomeFeaturedPackagesProps {
  featuredPackages: PackageCardContent[]
}

export default function HomeFeaturedPackages({ featuredPackages }: HomeFeaturedPackagesProps) {
  if (featuredPackages.length === 0) return null

  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="text-foreground">Featured </span>
            <span className="bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
              Packages
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Hand-picked experiences we want you to see. Explore these popular packages and find your perfect journey.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {featuredPackages.map((pkg) => {
            const img = pkg.images?.[0]?.trim()
            return (
              <Link
                key={pkg.id}
                href={`/packages?highlight=${pkg.id}`}
                className="group block bg-white rounded-2xl border border-border overflow-hidden hover:border-primary hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2"
              >
                <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
                  {img ? (
                    <Image
                      src={img}
                      alt={pkg.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                  ) : null}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4">
                    <span className="inline-block px-3 py-1 bg-primary/90 text-white text-xs font-semibold rounded-full uppercase tracking-wide">
                      {pkg.category}
                    </span>
                    <h3 className="text-xl font-bold text-white mt-2 drop-shadow-lg">{pkg.name}</h3>
                  </div>
                </div>
                <div className="p-6">
                  <p className="text-muted-foreground line-clamp-2 mb-4">{pkg.description}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-primary font-bold text-lg">
                      {pkg.price > 0
                        ? `${(pkg as any).currency || 'GHS'} ${pkg.price.toLocaleString()}`
                        : 'Contact Us'}
                    </span>
                    <span className="text-primary font-semibold text-sm group-hover:translate-x-1 transition-transform">
                      View details →
                    </span>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>

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
