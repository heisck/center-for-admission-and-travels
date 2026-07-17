'use client'

/**
 * Destination Card (card-21)
 * Source: 21st.dev — @ravikatiyar/components/card-21
 *
 * Travel destination card with full-bleed image and themed overlay.
 * Hover: gentle scale-up only (no 3D tilt / “dance”).
 */

import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'

import { cn } from '@/lib/utils'

export type DestinationCardProps = {
  imageUrl: string
  location: string
  /** Optional emoji or short label (e.g. 🇮🇩) */
  flag?: string
  /** e.g. "1,345 Hotels • 24 Packages" */
  stats?: string
  href?: string
  /**
   * Theme color as HSL channels without `hsl()` wrapper.
   * Example: `"150 50% 25%"` → used as `hsl(... / α)`
   */
  themeColor?: string
  className?: string
  /** @deprecated Tilt removed — kept for API compatibility */
  disableTilt?: boolean
  /** When set, card acts as a button (details panel / custom handler) */
  onClick?: () => void
  /** Visual selected state (e.g. details open for this card) */
  selected?: boolean
}

const DEFAULT_THEME = '24 95% 40%' // brand-adjacent orange

export function DestinationCard({
  imageUrl,
  location,
  flag = '',
  stats = '',
  href = '#',
  themeColor = DEFAULT_THEME,
  className,
  onClick,
  selected = false,
}: DestinationCardProps) {
  const inner = (
    <div
      className={cn(
        'group relative h-full w-full overflow-hidden rounded-3xl',
        'bg-neutral-900 shadow-xl shadow-black/20',
        'ring-1 ring-black/5 dark:ring-white/10',
        // Small expand (no tilt): lift + scale like previous package cards
        'transition-all duration-300 ease-out',
        'hover:-translate-y-1.5 hover:scale-[1.02] hover:shadow-2xl hover:shadow-black/30',
        selected && 'ring-2 ring-orange-500 shadow-orange-500/25 -translate-y-1 scale-[1.01]',
        className
      )}
    >
      {/* Background image */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={imageUrl}
        alt={location}
        className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
        loading="lazy"
        draggable={false}
      />

      {/* Base vignette */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-black/10" />

      {/* Themed color wash */}
      <div
        className="absolute inset-0 opacity-55 mix-blend-multiply transition-opacity duration-500 group-hover:opacity-70"
        style={{
          background: `linear-gradient(to top, hsl(${themeColor} / 0.92) 0%, hsl(${themeColor} / 0.35) 42%, transparent 72%)`,
        }}
      />

      {/* Soft top light */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-1/3 bg-gradient-to-b from-white/15 to-transparent" />

      {/* Content */}
      <div className="absolute inset-0 flex flex-col justify-end p-5 sm:p-6">
        <div className="mb-3 flex items-start justify-between gap-3">
          <div className="min-w-0">
            {flag ? (
              <span
                className="mb-2 inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/15 text-xl backdrop-blur-md ring-1 ring-white/25"
                aria-hidden
              >
                {flag}
              </span>
            ) : null}
            <h3 className="line-clamp-2 text-xl font-bold tracking-tight text-white sm:text-2xl md:text-3xl drop-shadow-md">
              {location}
            </h3>
            {stats ? (
              <p className="mt-1.5 text-sm font-medium text-white/85 drop-shadow-sm line-clamp-2">
                {stats}
              </p>
            ) : null}
          </div>

          <span
            className={cn(
              'flex h-11 w-11 shrink-0 items-center justify-center rounded-full',
              'bg-white text-neutral-900 shadow-lg',
              'transition-transform duration-300 group-hover:scale-105'
            )}
            style={{
              boxShadow: `0 10px 30px hsl(${themeColor} / 0.45)`,
            }}
            aria-hidden
          >
            <ArrowUpRight className="h-5 w-5" strokeWidth={2.25} />
          </span>
        </div>

        {/* Theme accent bar */}
        <div
          className="h-1 w-12 rounded-full opacity-90 transition-all duration-500 group-hover:w-20"
          style={{ backgroundColor: `hsl(${themeColor})` }}
        />
      </div>
    </div>
  )

  const shellClass = 'block h-full w-full text-left'

  // Prefer onClick (packages details panel) over navigation
  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className={shellClass}
        aria-label={`View details for ${location}`}
        aria-pressed={selected}
      >
        {inner}
      </button>
    )
  }

  const isExternal = href.startsWith('http://') || href.startsWith('https://')
  const isHash = href === '#' || href.startsWith('#')

  if (isHash) {
    return <div className={`${shellClass} cursor-pointer`}>{inner}</div>
  }

  if (isExternal) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={shellClass}
        aria-label={`Explore ${location}`}
      >
        {inner}
      </a>
    )
  }

  return (
    <Link href={href} className={shellClass} aria-label={`Explore ${location}`}>
      {inner}
    </Link>
  )
}

export default DestinationCard
