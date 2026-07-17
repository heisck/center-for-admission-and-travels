'use client'

/**
 * Destination Card (card-21)
 * Source: 21st.dev — @ravikatiyar/components/card-21
 *
 * Travel destination card with full-bleed image, themed overlay,
 * and interactive 3D tilt on hover.
 */

import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import { motion, useMotionTemplate, useMotionValue, useSpring } from 'motion/react'
import { useCallback, useRef, type MouseEvent } from 'react'

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
   * Example: `"150 50% 25%"` → used as `hsl(var(--theme) / α)`
   */
  themeColor?: string
  className?: string
  /** Disable 3D tilt (useful for dense grids / reduced motion) */
  disableTilt?: boolean
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
  disableTilt = false,
}: DestinationCardProps) {
  const ref = useRef<HTMLDivElement>(null)

  const rotateX = useMotionValue(0)
  const rotateY = useMotionValue(0)
  const springX = useSpring(rotateX, { stiffness: 280, damping: 22, mass: 0.5 })
  const springY = useSpring(rotateY, { stiffness: 280, damping: 22, mass: 0.5 })

  const transform = useMotionTemplate`perspective(1000px) rotateX(${springX}deg) rotateY(${springY}deg)`

  const handleMove = useCallback(
    (e: MouseEvent<HTMLDivElement>) => {
      if (disableTilt || !ref.current) return
      const rect = ref.current.getBoundingClientRect()
      const px = (e.clientX - rect.left) / rect.width
      const py = (e.clientY - rect.top) / rect.height
      // Max tilt ~10°
      rotateY.set((px - 0.5) * 18)
      rotateX.set((0.5 - py) * 14)
    },
    [disableTilt, rotateX, rotateY]
  )

  const handleLeave = useCallback(() => {
    rotateX.set(0)
    rotateY.set(0)
  }, [rotateX, rotateY])

  const style = {
    // CSS variables for themed gradients / accents
    ['--dest-theme' as string]: themeColor,
    transformStyle: 'preserve-3d' as const,
  }

  const inner = (
    <motion.div
      ref={ref}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      style={{
        ...style,
        transform: disableTilt ? undefined : transform,
      }}
      className={cn(
        'group relative h-full w-full overflow-hidden rounded-3xl',
        'bg-neutral-900 shadow-xl shadow-black/20',
        'ring-1 ring-black/5 dark:ring-white/10',
        'transition-shadow duration-300 hover:shadow-2xl hover:shadow-black/30',
        'will-change-transform',
        className
      )}
    >
      {/* Background image */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={imageUrl}
        alt={location}
        className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
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
      <div
        className="absolute inset-0 flex flex-col justify-end p-5 sm:p-6"
        style={{ transform: 'translateZ(28px)' }}
      >
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
            <h3 className="truncate text-2xl font-bold tracking-tight text-white sm:text-3xl drop-shadow-md">
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
              'transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-6'
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

      {/* Hover sheen */}
      <div
        className="pointer-events-none absolute -inset-full opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{
          background:
            'linear-gradient(115deg, transparent 40%, rgba(255,255,255,0.12) 50%, transparent 60%)',
          transform: 'translateX(-30%)',
        }}
      />
    </motion.div>
  )

  const isExternal = href.startsWith('http://') || href.startsWith('https://')
  const isHash = href === '#' || href.startsWith('#')

  if (isHash) {
    return (
      <div className="block h-full w-full cursor-pointer" style={{ perspective: 1000 }}>
        {inner}
      </div>
    )
  }

  if (isExternal) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="block h-full w-full"
        style={{ perspective: 1000 }}
        aria-label={`Explore ${location}`}
      >
        {inner}
      </a>
    )
  }

  return (
    <Link
      href={href}
      className="block h-full w-full"
      style={{ perspective: 1000 }}
      aria-label={`Explore ${location}`}
    >
      {inner}
    </Link>
  )
}

export default DestinationCard
