'use client'

/**
 * Package grid using DestinationCard (card-21).
 * Click a card → on-page details panel with Book Now → /checkout?id=
 */

import { useEffect, useRef } from 'react'
import Link from 'next/link'
import { ArrowRight, CheckCircle, Clock, X } from 'lucide-react'

import { DestinationCard } from '@/components/ui/card-21'
import { formatMoney } from '@/lib/currency'
import { cn } from '@/lib/utils'

export type PackageDestinationItem = {
  id: string
  name: string
  description: string
  category?: string
  duration?: string
  price: number
  currency?: string
  highlights?: string[]
  itinerary?: string
  images?: string[]
  /** Single image fallback (travel-tours featured) */
  image?: string
  included?: string[]
  notIncluded?: string[]
  /** Optional override for checkout / book link */
  bookHref?: string
}

const CATEGORY_THEME: Record<string, string> = {
  study: '210 70% 32%',
  work: '24 90% 42%',
  travel: '160 45% 28%',
}

const CATEGORY_LABEL: Record<string, string> = {
  study: 'Study',
  work: 'Work',
  travel: 'Travel',
}

function themeFor(category?: string): string {
  const key = (category || 'travel').toLowerCase()
  return CATEGORY_THEME[key] || '24 95% 40%'
}

function labelFor(category?: string): string {
  const key = (category || '').toLowerCase()
  return CATEGORY_LABEL[key] || (category ? category : 'Package')
}

function imageFor(pkg: PackageDestinationItem): string {
  const fromList = pkg.images?.find((u) => typeof u === 'string' && u.trim().length > 0)
  if (fromList) return fromList.trim()
  if (typeof pkg.image === 'string' && pkg.image.trim()) return pkg.image.trim()
  // Stable local fallback so missing admin images never break the card layout
  return '/images/ca-20logo.png'
}

function statsFor(pkg: PackageDestinationItem): string {
  const cat = labelFor(pkg.category)
  const duration = (pkg.duration || '').trim()
  const price = formatMoney(pkg.price, pkg.currency)
  const parts = [cat, duration, price].filter(Boolean)
  return parts.length ? parts.join(' · ') : 'View package'
}

export type PackageDestinationGridProps = {
  packages: PackageDestinationItem[]
  /** Currently open package id (controlled) */
  selectedId: string | null
  onSelect: (id: string | null) => void
  /** Grid columns */
  className?: string
  gridClassName?: string
  /** Hide book if no real package checkout */
  bookLabel?: string
}

export function PackageDestinationGrid({
  packages,
  selectedId,
  onSelect,
  className,
  gridClassName,
  bookLabel = 'Book Now',
}: PackageDestinationGridProps) {
  const detailsRef = useRef<HTMLDivElement>(null)
  const cardRefs = useRef<Map<string, HTMLDivElement>>(new Map())
  const lastOpenedId = useRef<string | null>(null)
  const selected = packages.find((p) => p.id === selectedId) || null

  useEffect(() => {
    if (selectedId) {
      // Opening details — remember which card, then scroll to the panel
      lastOpenedId.current = selectedId
      const t = window.setTimeout(() => {
        detailsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
      }, 80)
      return () => window.clearTimeout(t)
    }

    // Closing details — return to the card the user clicked
    const returnTo = lastOpenedId.current
    if (!returnTo) return
    const t = window.setTimeout(() => {
      const el = cardRefs.current.get(returnTo)
      el?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }, 60)
    return () => window.clearTimeout(t)
  }, [selectedId])

  const handleClose = () => {
    onSelect(null)
  }

  if (packages.length === 0) return null

  return (
    <div className={cn('w-full', className)}>
      <div
        className={cn(
          'grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 md:gap-8',
          gridClassName
        )}
      >
        {packages.map((pkg) => (
          <div
            key={pkg.id}
            id={`package-card-${pkg.id}`}
            ref={(node) => {
              if (node) cardRefs.current.set(pkg.id, node)
              else cardRefs.current.delete(pkg.id)
            }}
            className="h-[380px] sm:h-[420px] md:h-[450px] w-full scroll-mt-28"
          >
            <DestinationCard
              imageUrl={imageFor(pkg)}
              location={pkg.name}
              flag=""
              stats={statsFor(pkg)}
              themeColor={themeFor(pkg.category)}
              selected={selectedId === pkg.id}
              onClick={() => onSelect(selectedId === pkg.id ? null : pkg.id)}
            />
          </div>
        ))}
      </div>

      {/* On-page details panel */}
      {selected ? (
        <div
          ref={detailsRef}
          id={`package-details-${selected.id}`}
          className="mt-8 md:mt-10 scroll-mt-24"
        >
          <div className="relative overflow-hidden rounded-3xl border border-orange-100 bg-white shadow-[0_18px_50px_rgba(15,23,42,0.08)]">
            <div
              className="absolute inset-x-0 top-0 h-1.5"
              style={{ backgroundColor: `hsl(${themeFor(selected.category)})` }}
            />

            <div className="flex flex-col lg:flex-row">
              {/* Image */}
              <div className="relative h-52 w-full shrink-0 bg-slate-100 lg:h-auto lg:w-[38%] min-h-[220px]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={imageFor(selected)}
                  alt={selected.name}
                  className="absolute inset-0 h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent lg:bg-gradient-to-r" />
                <div className="absolute bottom-4 left-4 right-4 lg:hidden">
                  <span className="inline-block rounded-full bg-white/90 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-orange-800">
                    {labelFor(selected.category)}
                  </span>
                </div>
              </div>

              {/* Body */}
              <div className="flex min-w-0 flex-1 flex-col p-5 sm:p-7 md:p-8">
                <div className="mb-4 flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <span className="mb-2 hidden lg:inline-block rounded-full bg-orange-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-orange-800">
                      {labelFor(selected.category)}
                    </span>
                    <h3 className="text-2xl sm:text-3xl font-bold text-foreground leading-tight">
                      {selected.name}
                    </h3>
                    {selected.duration ? (
                      <p className="mt-2 inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground">
                        <Clock className="h-4 w-4 text-orange-600" />
                        {selected.duration}
                      </p>
                    ) : null}
                  </div>
                  <button
                    type="button"
                    onClick={handleClose}
                    className="shrink-0 rounded-full border border-border p-2 text-muted-foreground hover:bg-slate-50 hover:text-foreground transition"
                    aria-label="Close package details"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                {selected.description ? (
                  <p className="text-muted-foreground leading-relaxed mb-5">
                    {selected.description}
                  </p>
                ) : null}

                {selected.highlights && selected.highlights.length > 0 ? (
                  <div className="mb-5">
                    <h4 className="text-sm font-semibold text-foreground mb-2">Highlights</h4>
                    <ul className="grid sm:grid-cols-2 gap-2">
                      {selected.highlights.map((item, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-foreground">
                          <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-orange-600" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}

                {(selected.included?.length || selected.notIncluded?.length) ? (
                  <div className="mb-5 grid sm:grid-cols-2 gap-5">
                    {selected.included && selected.included.length > 0 ? (
                      <div>
                        <h4 className="text-sm font-semibold text-foreground mb-2">Included</h4>
                        <ul className="space-y-1.5">
                          {selected.included.map((item, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-green-500" />
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ) : null}
                    {selected.notIncluded && selected.notIncluded.length > 0 ? (
                      <div>
                        <h4 className="text-sm font-semibold text-foreground mb-2">Not included</h4>
                        <ul className="space-y-1.5">
                          {selected.notIncluded.map((item, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-red-400" />
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ) : null}
                  </div>
                ) : null}

                {selected.itinerary?.trim() ? (
                  <div className="mb-5">
                    <h4 className="text-sm font-semibold text-foreground mb-2">Itinerary</h4>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">
                      {selected.itinerary}
                    </p>
                  </div>
                ) : null}

                <div className="mt-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-t border-border pt-5">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-muted-foreground font-semibold">
                      Package price
                    </p>
                    <p className="text-2xl font-bold text-foreground">
                      {formatMoney(selected.price, selected.currency)}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={handleClose}
                      className="px-5 py-2.5 rounded-xl border border-border text-sm font-semibold text-foreground hover:bg-slate-50 transition"
                    >
                      Close
                    </button>
                    <Link
                      href={selected.bookHref || `/checkout?id=${selected.id}`}
                      className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-orange-600 to-red-600 text-white text-sm font-semibold shadow-lg shadow-orange-500/20 hover:opacity-95 transition"
                    >
                      {bookLabel}
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}

export default PackageDestinationGrid
