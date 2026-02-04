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

import React, { createContext, useContext, useState, useEffect } from 'react'

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
  }
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
    highlights: string[]
    itinerary: string
    images: string[]
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
      image: string
      highlights: string[]
    }>
    benefits: Array<{
      id: string
      title: string
      description: string
    }>
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
  }
  footer: {
    companyDescription: string
    socialLinks: Array<{
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
      highlights: string[]
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

export function PublicContentProvider({ children }: { children: React.ReactNode }) {
  const [content, setContent] = useState<PublicContent | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchContent = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch('/api/content')
      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch content')
      }

      setContent(result.data)
    } catch (err: any) {
      console.error('Error fetching public content:', err)
      setError(err.message || 'Failed to load content')
      // Keep existing content on error (graceful degradation)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchContent()
  }, [])

  return (
    <PublicContentContext.Provider
      value={{
        content,
        loading,
        error,
        refetch: fetchContent,
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
