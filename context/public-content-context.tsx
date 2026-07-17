/**
 * PUBLIC CONTENT CONTEXT
 * 
 * This context is for PUBLIC PAGES ONLY (not admin).
 * It fetches content from the database via API.
 * 
 * Admin pages should use AdminContext which writes to the database.
 * Public pages should use this context which reads from the database.
 */

'use client'

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react'

const PUBLIC_CONTENT_VERSION_KEY = 'public_content_version'
const PUBLIC_CONTENT_CACHE_KEY = 'public_content_payload'
const PUBLIC_CONTENT_CACHE_TTL_MS = 5 * 60_000

export interface PublicContent {
  home: {
    hero: {
      title: string
      subtitle: string
      description: string
      cta1Text: string
      cta2Text: string
      stats: Array<{ value: string; label: string }>
      images: string[]
    }
    services: Array<{
      id: string
      icon: string
      title: string
      description: string
    }>
    featuredPackages?: Array<{
      id: string
      name: string
      description: string
      category: string
      duration: string
      price: number
      currency?: string
      highlights: string[]
      images: string[]
    }>
  }
  blogPosts?: Array<{
    id: string
    slug: string
    title: string
    excerpt: string
    imageUrl: string | null
    packageId: string | null
    publishedAt: string | null
  }>
  about: {
    heroTitle: string
    heroSubtitle: string
    heroImage: string
    mission: {
      title: string
      description: string
      points: string[]
    }
    vision: {
      title: string
      description: string
      points: string[]
    }
    coreValues: Array<{
      id: string
      title: string
      description: string
    }>
    founder: {
      name: string
      title: string
      description: string
      image: string
      vision: string
      mission: string
      values: string
    }
    team: Array<{
      id: string
      name: string
      role: string
      image: string
      description: string
    }>
  }
  packages: Array<{
    id: string
    name: string
    description: string
    category: 'travel' | 'study' | 'work'
    duration: string
    price: number
    currency?: string
    highlights: string[]
    itinerary: string
    images: string[]
    included?: string[]
    notIncluded?: string[]
  }>
  travelTours: {
    hero: {
      title: string
      description: string
      paragraph: string
      image: string
    }
    featured: Array<{
      id: string
      name: string
      description: string
      duration: string
      price: number
      currency?: string
      image: string
      highlights: string[]
    }>
    benefits: Array<{
      id: string
      title: string
      description: string
    }>
    galleryImages: string[] // Images for DomeGallery animation
  }
  contact: {
    phone: string
    email: string
    address: {
      street: string
      city: string
      region: string
      country: string
    }
    whatsappNumber: string
    location: {
      latitude: number | null
      longitude: number | null
    }
  }
  footer: {
    companyDescription: string
    socialLinks: Array<{
      id?: string
      platform: string
      url: string
    }>
  }
  servicePages: Array<{
    id: string
    title: string
    description: string
    icon: string
    route: string
    heroImage: string
    bannerTitle: string
    bannerSubtitle: string
    overview?: string
    whyStudyOutsideThisCountry?: {
      title: string
      highlights?: string[]
    }
    benefits: string[]
    requirements: string[]
    countries: Array<{
      name: string
      description: string
      image: string
    }>
    visaGuidance: string
    successStories?: Array<{
      name: string
      program: string
      quote: string
    }>
    scholarships?: Array<{
      name: string
      amount: string
      description: string
    }>
  }>
}

interface PublicContentContextType {
  content: PublicContent | null
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
}

const PublicContentContext = createContext<PublicContentContextType | undefined>(undefined)

interface CachedPublicContentPayload {
  data: PublicContent
  cachedAt: number
}

function readCachedContent(): CachedPublicContentPayload | null {
  if (typeof window === 'undefined') return null

  try {
    const raw = window.sessionStorage.getItem(PUBLIC_CONTENT_CACHE_KEY)
    if (!raw) return null

    const parsed = JSON.parse(raw) as CachedPublicContentPayload
    if (!parsed?.data || typeof parsed.cachedAt !== 'number') {
      window.sessionStorage.removeItem(PUBLIC_CONTENT_CACHE_KEY)
      return null
    }

    if (Date.now() - parsed.cachedAt > PUBLIC_CONTENT_CACHE_TTL_MS) {
      window.sessionStorage.removeItem(PUBLIC_CONTENT_CACHE_KEY)
      return null
    }

    return parsed
  } catch {
    window.sessionStorage.removeItem(PUBLIC_CONTENT_CACHE_KEY)
    return null
  }
}

function writeCachedContent(data: PublicContent) {
  if (typeof window === 'undefined') return

  try {
    window.sessionStorage.setItem(
      PUBLIC_CONTENT_CACHE_KEY,
      JSON.stringify({
        data,
        cachedAt: Date.now(),
      } satisfies CachedPublicContentPayload)
    )
  } catch {
    // Ignore storage failures; network fetch still succeeds.
  }
}

function clearCachedContent() {
  if (typeof window === 'undefined') return
  window.sessionStorage.removeItem(PUBLIC_CONTENT_CACHE_KEY)
}

export function PublicContentProvider({ children }: { children: React.ReactNode }) {
  const [content, setContent] = useState<PublicContent | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const contentRef = useRef<PublicContent | null>(null)
  const lastFetchedAtRef = useRef<number>(0)

  useEffect(() => {
    contentRef.current = content
  }, [content])

  const fetchContent = useCallback(async (force = false) => {
    const isInitialLoad = !contentRef.current
    const lastFetchedAt = lastFetchedAtRef.current
    const recentlyFetched = Date.now() - lastFetchedAt < 30_000

    if (!force && !isInitialLoad && recentlyFetched) {
      return
    }

    if (isInitialLoad) setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/content', { cache: 'no-store' })
      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch content')
      }

      setContent(result.data)
      lastFetchedAtRef.current = Date.now()
      writeCachedContent(result.data)
    } catch (err: any) {
      console.error('Error fetching public content:', err)
      setError(err.message || 'Failed to load content')
      // Keep existing content on error (graceful degradation)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const cached = readCachedContent()
    if (cached) {
      setContent(cached.data)
      lastFetchedAtRef.current = cached.cachedAt
      setLoading(false)
      fetchContent(false)
      return
    }

    fetchContent(true)
  }, [fetchContent])

  // No refetch on pathname change - content is already loaded for all pages (home, about, contact, etc.)

  // Refetch when user returns to tab (catches changes made in another tab)
  useEffect(() => {
    const onFocus = () => fetchContent()
    window.addEventListener('focus', onFocus)
    return () => window.removeEventListener('focus', onFocus)
  }, [fetchContent])

  // Refetch when admin saves (so footer/contact updates show immediately)
  useEffect(() => {
    const onContentUpdated = () => {
      clearCachedContent()
      fetchContent(true)
    }
    window.addEventListener('content-updated', onContentUpdated)
    return () => window.removeEventListener('content-updated', onContentUpdated)
  }, [fetchContent])

  // Refetch across tabs/windows when admin updates content.
  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key === PUBLIC_CONTENT_VERSION_KEY) {
        clearCachedContent()
        fetchContent(true)
      }
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [fetchContent])

  return (
    <PublicContentContext.Provider
      value={{
        content,
        loading,
        error,
        refetch: () => fetchContent(true),
      }}
    >
      {children}
    </PublicContentContext.Provider>
  )
}

export function usePublicContent() {
  const context = useContext(PublicContentContext)
  if (context === undefined) {
    throw new Error('usePublicContent must be used within PublicContentProvider')
  }
  return context
}

/**
 * USAGE:
 * 
 * 1. Wrap your app layout with PublicContentProvider:
 *    <PublicContentProvider>
 *      {children}
 *    </PublicContentProvider>
 * 
 * 2. Use in public pages:
 *    const { content, loading } = usePublicContent()
 *    if (loading) return <Loading />
 *    if (!content) return <Error />
 *    
 *    // Use content.home, content.about, etc.
 * 
 * NOTE: This is READ-ONLY. For admin edits, use AdminContext.
 */
