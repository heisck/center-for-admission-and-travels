'use client'

/**
 * Minimalist Hero — large solid orange disc + large portrait (not clickable).
 * Disc is not clipped; no inner rings/lines on the circle.
 */

import Link from 'next/link'
import type { LucideIcon } from 'lucide-react'
import { ArrowRight } from 'lucide-react'
import { motion } from 'motion/react'

import { cn } from '@/lib/utils'

export type MinimalistHeroNavLink = {
  label: string
  href: string
}

export type MinimalistHeroSocialLink = {
  icon: LucideIcon
  href: string
  label?: string
}

export type MinimalistHeroProps = {
  logoText?: string
  navLinks?: MinimalistHeroNavLink[]
  mainText?: string
  readMoreLink?: string
  readMoreLabel?: string
  imageSrc: string
  imageAlt?: string
  overlayText?: {
    part1: string
    part2: string
  }
  socialLinks?: MinimalistHeroSocialLink[]
  locationText?: string
  className?: string
  hideNav?: boolean
  accentClass?: {
    circle: string
    circleGlow: string
    text: string
    textHover: string
    borderHover: string
  }
}

const DEFAULT_ACCENT = {
  circle: 'bg-orange-500',
  circleGlow: 'shadow-[0_0_80px_rgba(249,115,22,0.35)]',
  text: 'text-orange-600',
  textHover: 'hover:text-orange-500',
  borderHover: 'hover:border-orange-500 hover:text-orange-600',
}

function OverlayLines({
  text,
  className,
}: {
  text: string
  className?: string
}) {
  const lines = text.split(/\n+/).map((l) => l.trim()).filter(Boolean)
  return (
    <span className={cn('block font-black uppercase leading-[0.9] tracking-tighter', className)}>
      {lines.map((line, i) => (
        <span key={i} className="block whitespace-nowrap">
          {line}
        </span>
      ))}
    </span>
  )
}

export function MinimalistHero({
  logoText = 'CA Travels',
  mainText = '',
  readMoreLink = '#',
  readMoreLabel = 'Explore services',
  imageSrc,
  imageAlt = '',
  overlayText = { part1: 'unlock the', part2: 'world.' },
  className,
  hideNav = false,
  accentClass = DEFAULT_ACCENT,
}: MinimalistHeroProps) {
  const accent = { ...DEFAULT_ACCENT, ...accentClass }

  return (
    <section
      className={cn(
        'relative w-full bg-transparent text-neutral-900 overflow-visible',
        className
      )}
    >
      {/* In-flow square stage — full orange disc always visible */}
      <div className="relative z-0 mx-auto flex w-full justify-center px-2 pt-10 pb-14 sm:pt-14 sm:pb-16 md:pt-16 md:pb-20">
        <div
          className={cn(
            'relative shrink-0',
            'w-[min(96vw,34rem)]',
            'sm:w-[min(88vw,40rem)]',
            'md:w-[min(78vw,44rem)]',
            'lg:w-[48rem]',
            'aspect-square'
          )}
        >
          {/* Solid orange circle only — slow spin, no rings/lines */}
          <div
            className={cn(
              'hero-globe-spin absolute left-1/2 top-1/2 h-full w-full rounded-full',
              accent.circle,
              accent.circleGlow
            )}
            aria-hidden
          />

          {/* Large portrait — not clickable */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.08 }}
            className="absolute inset-0 z-10 flex items-end justify-center pointer-events-none"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imageSrc}
              alt={imageAlt}
              className="h-[108%] w-[108%] max-w-none -translate-y-[2%] object-contain object-bottom select-none"
              draggable={false}
            />
          </motion.div>
        </div>
      </div>

      {/* Headlines — always multi-line via \n */}
      <div className="pointer-events-none absolute inset-0 z-20">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.12 }}
          className="absolute left-4 top-5 sm:left-8 sm:top-8 md:left-12 md:top-10 text-neutral-900 text-[clamp(2rem,7.5vw,5.5rem)] drop-shadow-sm"
        >
          <OverlayLines text={overlayText.part1} />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.22 }}
          className={cn(
            'absolute right-4 bottom-6 sm:right-8 sm:bottom-10 md:right-12 md:bottom-12 text-[clamp(2rem,7.5vw,5.5rem)] drop-shadow-sm',
            accent.text
          )}
        >
          <OverlayLines text={overlayText.part2} className="text-right" />
        </motion.div>
      </div>

      {/* Copy + Get Started — middle left */}
      <div className="pointer-events-none absolute inset-0 z-10">
        <div className="pointer-events-auto absolute left-4 top-1/2 w-[min(100%-2rem,22rem)] -translate-y-1/2 sm:left-8 md:left-12">
          {!hideNav ? (
            <div className="mb-6">
              <Link
                href="/"
                className="text-lg sm:text-xl font-black tracking-tight text-neutral-900"
              >
                {logoText}
              </Link>
            </div>
          ) : null}
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            className="text-sm sm:text-base leading-relaxed text-neutral-600 max-w-sm bg-transparent"
          >
            {mainText}
          </motion.p>
          {readMoreLink ? (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.12 }}
              className="mt-8"
            >
              <Link
                href={readMoreLink}
                className="group inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-lg bg-gradient-to-r from-orange-500 to-red-600 text-white text-sm font-semibold shadow-lg shadow-orange-500/25 hover:shadow-xl hover:opacity-95 transition transform hover:scale-[1.02]"
              >
                {readMoreLabel}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </motion.div>
          ) : null}
        </div>
      </div>
    </section>
  )
}

export default MinimalistHero
