'use client'

/**
 * Home page hero — MinimalistHero with CA Travels brand + local cutout portrait.
 * Get Started matches CTA "Get Started Today": sign in if logged out, contact if logged in.
 */

import { useEffect, useState } from 'react'

import { MinimalistHero } from '@/components/ui/minimalist-hero'
import type { HomeHeroContent } from '@/lib/public-content'
import { hasUserSessionHint } from '@/hooks/use-current-user'

interface HomeMinimalistHeroProps {
  hero: HomeHeroContent
}

/** Fixed hero headline placement: top-left + orange bottom-right */
/** \n forces multi-line wrap on every screen size */
function getOverlayText(): { part1: string; part2: string } {
  return {
    part1: 'looking to\ntravel &',
    part2: 'study\nabroad?',
  }
}

/** The public hero always uses this transparent local brand asset. */
const HERO_IMAGE = '/images/hero/ca-travels-hero-portrait.png'

export default function HomeMinimalistHero({ hero }: HomeMinimalistHeroProps) {
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  useEffect(() => {
    setIsLoggedIn(hasUserSessionHint())
  }, [])

  const description =
    hero.description?.trim() ||
    hero.subtitle?.trim() ||
    'Study abroad, work abroad, and travel packages from Ghana — guided with honesty and care.'

  // Same destinations as CTASection "Get Started Today"
  const getStartedHref = isLoggedIn ? '/contact' : '/signin'
  const getStartedLabel = isLoggedIn ? 'Contact Us Today' : 'Get Started'
  return (
    <MinimalistHero
      hideNav
      logoText="CA Travels"
      mainText={description}
      readMoreLink={getStartedHref}
      readMoreLabel={getStartedLabel}
      imageSrc={HERO_IMAGE}
      imageAlt="Young woman traveler with a bag — Center for Admission and Travels"
      overlayText={getOverlayText()}
      socialLinks={[]}
      locationText=""
    />
  )
}
