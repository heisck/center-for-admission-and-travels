'use client'

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react'

export interface AdminContent {
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
      route?: string | null
    }>
    featuredPackages?: Array<{
      id: string
      name: string
      description: string
      category: string
      duration: string
      price: number
      highlights: string[]
      images: string[]
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
    successStories: Array<{
      id?: string
      name: string
      program: string
      quote: string
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
    included: string[]
    notIncluded: string[]
  }>
  services: Array<{
    id: string
    title: string
    description: string
    icon: string
    sections: Array<{
      title: string
      content: string
      image: string
    }>
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
    heroImagePosition: {
      x: number
      y: number
    }
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

interface HistoryState {
  content: AdminContent
  timestamp: number
}

interface AdminContextType {
  content: AdminContent
  isLoading: boolean
  updateHomeHero: (updates: Partial<AdminContent['home']['hero']>) => void
  updateServices: (services: AdminContent['home']['services']) => void
  updateHomeFeaturedPackages: (packageIds: string[]) => void
  updateAbout: (updates: Partial<AdminContent['about']>) => void
  updatePackages: (packages: AdminContent['packages']) => void
  updatePackage: (id: string, updates: Partial<AdminContent['packages'][0]>) => void
  addPackage: (pkg: AdminContent['packages'][0]) => void
  deletePackage: (id: string) => void
  updateTravelTours: (updates: Partial<AdminContent['travelTours']>) => void
  updateTravelToursHero: (updates: Partial<AdminContent['travelTours']['hero']>) => void
  updateTravelToursFeatured: (featured: AdminContent['travelTours']['featured']) => void
  updateTravelToursBenefits: (benefits: AdminContent['travelTours']['benefits']) => void
  updateTravelToursGalleryImages: (images: string[]) => void
  updateHomeHeroImages: (images: string[]) => void
  updateContact: (updates: Partial<AdminContent['contact']>) => void
  updateFooter: (updates: Partial<AdminContent['footer']>) => void
  updateServicePage: (serviceId: string, updates: Partial<AdminContent['servicePages'][0]>) => void
  undo: () => void
  redo: () => void
  canUndo: boolean
  canRedo: boolean
  saveAll: () => Promise<void>
  isSaving: boolean
}

const AdminContext = createContext<AdminContextType | undefined>(undefined)

const createEmptyContent = (): AdminContent => ({
  home: {
    hero: {
      title: '',
      subtitle: '',
      description: '',
      cta1Text: '',
      cta2Text: '',
      stats: [],
      images: [],
    },
    services: [],
    featuredPackages: [],
  },
  about: {
    heroTitle: '',
    heroSubtitle: '',
    heroImage: '',
    mission: {
      title: '',
      description: '',
      points: [],
    },
    vision: {
      title: '',
      description: '',
      points: [],
    },
    coreValues: [],
    founder: {
      name: '',
      title: '',
      description: '',
      image: '',
      vision: '',
      mission: '',
      values: '',
    },
    team: [],
    successStories: [],
  },
  packages: [],
  services: [],
  travelTours: {
    hero: {
      title: '',
      description: '',
      paragraph: '',
      image: '',
    },
    featured: [],
    benefits: [],
    galleryImages: [],
  },
  contact: {
    phone: '',
    email: '',
    address: {
      street: '',
      city: '',
      region: '',
      country: '',
    },
    whatsappNumber: '',
    location: {
      latitude: null,
      longitude: null,
    },
  },
  footer: {
    companyDescription: '',
    socialLinks: [],
  },
  servicePages: [],
})

const PUBLIC_CONTENT_VERSION_KEY = 'public_content_version'

// Helper function to check if value is an object
const isObject = (item: any): boolean => {
  return item && typeof item === 'object' && !Array.isArray(item)
}

// Deep merge helper function - keeps object shape intact without introducing seeded content.
const deepMerge = (target: any, source: any): any => {
  if (!source || typeof source !== 'object') {
    return target
  }
  
  const output = { ...target }
  
  Object.keys(source).forEach((key) => {
    const sourceValue = source[key]
    const targetValue = target[key]
    
    if (sourceValue === null || sourceValue === undefined) {
      // Skip null/undefined values, keep target
      return
    }
    
    if (Array.isArray(sourceValue)) {
      // For arrays, use source if it has items, otherwise keep target
      output[key] = sourceValue.length > 0 ? sourceValue : (targetValue || [])
    } else if (isObject(sourceValue)) {
      // Recursively merge nested objects
      if (isObject(targetValue)) {
        output[key] = deepMerge(targetValue, sourceValue)
      } else {
        output[key] = sourceValue
      }
    } else {
      // For primitives (strings, numbers, booleans)
      // Use source value if it's not empty, otherwise keep target
      if (typeof sourceValue === 'string' && sourceValue.trim() === '') {
        // Empty string - keep target if it exists
        if (targetValue && targetValue.trim() !== '') {
          output[key] = targetValue
        } else {
          output[key] = sourceValue
        }
      } else {
        // Non-empty value - use source
        output[key] = sourceValue
      }
    }
  })
  
  // Also merge keys from target that might not be in source
  Object.keys(target).forEach((key) => {
    if (!(key in source)) {
      output[key] = target[key]
    }
  })
  
  return output
}

const normalizeAdminContent = (data: Partial<AdminContent> | null | undefined): AdminContent =>
  deepMerge(createEmptyContent(), data || {}) as AdminContent

// Maximum history entries to keep (to prevent storage bloat)
const MAX_HISTORY_ENTRIES = 10

export function AdminProvider({ children }: { children: React.ReactNode }) {
  // Database content is loaded on mount. The empty shape only prevents editor crashes while loading.
  const [content, setContent] = useState<AdminContent>(() => createEmptyContent())
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [history, setHistory] = useState<HistoryState[]>(() => [
    { content: createEmptyContent(), timestamp: Date.now() },
  ])
  const [historyIndex, setHistoryIndex] = useState(0)

  const notifyPublicContentUpdated = useCallback(() => {
    if (typeof window === 'undefined') return
    const version = String(Date.now())
    try {
      window.localStorage.setItem(PUBLIC_CONTENT_VERSION_KEY, version)
    } catch {
      // Cross-tab notification is best effort; the current tab still receives the event below.
    }
    window.dispatchEvent(new CustomEvent('content-updated'))
  }, [])

  // Load content from database on mount
  useEffect(() => {
    let isMounted = true // Flag to prevent state updates if component unmounts
    
    const loadContentFromAPI = async () => {
      try {
        const response = await fetch('/api/content', { cache: 'no-store' })
        if (!response.ok) {
          throw new Error(`API returned ${response.status}`)
        }
        
        const result = await response.json()
        
        if (!isMounted) return // Don't update state if component unmounted
        
        if (result.success && result.data) {
          const mergedContent = normalizeAdminContent(result.data)
          
          if (isMounted) {
            setContent(mergedContent)
            setHistory([{ content: mergedContent, timestamp: Date.now() }])
            setHistoryIndex(0)
          }
        } else {
          console.warn('API returned unsuccessful response:', result)
          if (isMounted) {
            const emptyContent = createEmptyContent()
            setContent(emptyContent)
            setHistory([{ content: emptyContent, timestamp: Date.now() }])
            setHistoryIndex(0)
          }
        }
      } catch (error) {
        console.error('Error loading content from API:', error)
        if (isMounted) {
          const emptyContent = createEmptyContent()
          setContent(emptyContent)
          setHistory([{ content: emptyContent, timestamp: Date.now() }])
          setHistoryIndex(0)
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    loadContentFromAPI()
    
    // Cleanup function
    return () => {
      isMounted = false
    }
  }, []) // Empty deps - only run once on mount
  const updateHistory = useCallback((newContent: AdminContent) => {
    const newHistory = history.slice(0, historyIndex + 1)
    newHistory.push({ content: newContent, timestamp: Date.now() })
    
    // Limit history size in memory too (keep last MAX_HISTORY_ENTRIES)
    const limitedHistory = newHistory.length > MAX_HISTORY_ENTRIES 
      ? newHistory.slice(-MAX_HISTORY_ENTRIES)
      : newHistory
    
    setHistory(limitedHistory)
    const newIndex = limitedHistory.length - 1
    setHistoryIndex(newIndex)
    setContent(newContent)
    
    // History is kept in memory only - database is the source of truth for content
    // No localStorage needed since all content is saved to database via API
  }, [history, historyIndex])

  const updateHomeHero = useCallback(async (updates: Partial<AdminContent['home']['hero']>) => {
    // Optimistic update (update UI immediately)
    const newContent = {
      ...content,
      home: {
        ...content.home,
        hero: { ...content.home.hero, ...updates },
      },
    }
    updateHistory(newContent)

    // Sync to database via API
    try {
      const response = await fetch('/api/admin/content/home', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hero: newContent.home.hero }),
      })
      const result = await response.json()
      if (!result.success) {
        console.error('Failed to save to database:', result.error)
        // Could revert here if needed
      }
    } catch (error) {
      console.error('Error syncing to database:', error)
      // Could revert here if needed
    }
  }, [content, updateHistory])

  const updateServices = useCallback(async (services: AdminContent['home']['services']) => {
    // Optimistic update
    const newContent = {
      ...content,
      home: {
        ...content.home,
        services,
      },
    }
    updateHistory(newContent)

    // Sync to database
    try {
      const response = await fetch('/api/admin/content/home', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ services }),
      })
      const result = await response.json()
      if (!result.success) {
        console.error('Failed to save services:', result.error)
      }
    } catch (error) {
      console.error('Error syncing services:', error)
    }
  }, [content, updateHistory])

  const updateHomeFeaturedPackages = useCallback(async (packageIds: string[]) => {
    const featured = packageIds
      .map((id) => content.packages.find((p) => p.id === id))
      .filter(Boolean) as AdminContent['home']['featuredPackages']
    const newContent = {
      ...content,
      home: {
        ...content.home,
        featuredPackages: featured,
      },
    }
    updateHistory(newContent)

    try {
      const response = await fetch('/api/admin/content/home', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          featuredPackages: featured,
        }),
      })
      const result = await response.json()
      if (!result.success) {
        console.error('Failed to save featured packages:', result.error)
      }
    } catch (error) {
      console.error('Error syncing featured packages:', error)
    }
  }, [content, updateHistory])

  const updateAbout = useCallback(async (updates: Partial<AdminContent['about']>) => {
    // Optimistic update
    const newContent = {
      ...content,
      about: { ...content.about, ...updates },
    }
    updateHistory(newContent)

    // Sync to database
    try {
      const response = await fetch('/api/admin/content/about', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      })
      const result = await response.json()
      if (!result.success) {
        console.error('Failed to save about page:', result.error)
      }
    } catch (error) {
      console.error('Error syncing about page:', error)
    }
  }, [content, updateHistory])

  const updatePackages = useCallback(async (packages: AdminContent['packages']) => {
    // Optimistic update
    const newContent = { ...content, packages }
    updateHistory(newContent)

    // Sync to database - packages are managed individually via their own endpoints
    // This function is mainly for UI state updates
  }, [content, updateHistory])

  const updatePackage = useCallback(async (id: string, updates: Partial<AdminContent['packages'][0]>) => {
    // Optimistic update
    const newPackages = content.packages.map((pkg) =>
      pkg.id === id ? { ...pkg, ...updates } : pkg
    )
    const newContent = { ...content, packages: newPackages }
    updateHistory(newContent)

    // Sync to database
    try {
      const response = await fetch('/api/admin/content/packages', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...updates }),
      })
      const result = await response.json()
      if (!result.success) {
        console.error('Failed to save package:', result.error)
      }
    } catch (error) {
      console.error('Error syncing package:', error)
    }
  }, [content, updateHistory])

  const addPackage = useCallback(async (pkg: AdminContent['packages'][0]) => {
    // Optimistic update
    const newPackages = [...content.packages, pkg]
    const newContent = { ...content, packages: newPackages }
    updateHistory(newContent)

    // Sync to database
    try {
      const response = await fetch('/api/admin/content/packages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(pkg),
      })
      const result = await response.json()
      if (result.success && result.data) {
        // Update with the actual ID from database
        const updatedPackages = content.packages.map((p) =>
          p.id === pkg.id ? { ...p, id: result.data.id } : p
        )
        setContent({ ...content, packages: updatedPackages })
      } else {
        console.error('Failed to create package:', result.error)
      }
    } catch (error) {
      console.error('Error creating package:', error)
    }
  }, [content, updateHistory])

  const deletePackage = useCallback(async (id: string) => {
    // Optimistic update
    const newPackages = content.packages.filter((pkg) => pkg.id !== id)
    const newContent = { ...content, packages: newPackages }
    updateHistory(newContent)

    // Sync to database
    try {
      const response = await fetch(`/api/admin/content/packages?id=${id}`, {
        method: 'DELETE',
      })
      const result = await response.json()
      if (!result.success) {
        console.error('Failed to delete package:', result.error)
        // Revert on error
        setContent(content)
      }
    } catch (error) {
      console.error('Error deleting package:', error)
      // Revert on error
      setContent(content)
    }
  }, [content, updateHistory])

  const updateTravelTours = useCallback((updates: Partial<AdminContent['travelTours']>) => {
    const newContent = {
      ...content,
      travelTours: { ...content.travelTours, ...updates },
    }
    updateHistory(newContent)
  }, [content, updateHistory])

  const updateTravelToursHero = useCallback(async (updates: Partial<AdminContent['travelTours']['hero']>) => {
    // Optimistic update
    const newContent = {
      ...content,
      travelTours: {
        ...content.travelTours,
        hero: { ...content.travelTours.hero, ...updates },
      },
    }
    updateHistory(newContent)

    // Sync to database
    try {
      const response = await fetch('/api/admin/content/travel-tours', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hero: newContent.travelTours.hero }),
      })
      const result = await response.json()
      if (!result.success) {
        console.error('Failed to save travel tours hero:', result.error)
      }
    } catch (error) {
      console.error('Error syncing travel tours hero:', error)
    }
  }, [content, updateHistory])

  const updateTravelToursFeatured = useCallback(async (featured: AdminContent['travelTours']['featured']) => {
    // Optimistic update
    const newContent = {
      ...content,
      travelTours: { ...content.travelTours, featured },
    }
    updateHistory(newContent)

    // Sync to database
    try {
      const response = await fetch('/api/admin/content/travel-tours', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ featured }),
      })
      const result = await response.json()
      if (!result.success) {
        console.error('Failed to save travel tours featured:', result.error)
      }
    } catch (error) {
      console.error('Error syncing travel tours featured:', error)
    }
  }, [content, updateHistory])

  const updateTravelToursBenefits = useCallback(async (benefits: AdminContent['travelTours']['benefits']) => {
    // Optimistic update
    const newContent = {
      ...content,
      travelTours: { ...content.travelTours, benefits },
    }
    updateHistory(newContent)

    // Sync to database
    try {
      const response = await fetch('/api/admin/content/travel-tours', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ benefits }),
      })
      const result = await response.json()
      if (!result.success) {
        console.error('Failed to save travel tours benefits:', result.error)
      }
    } catch (error) {
      console.error('Error syncing travel tours benefits:', error)
    }
  }, [content, updateHistory])

  const updateTravelToursGalleryImages = useCallback(async (images: string[]) => {
    // Optimistic update
    const newContent = {
      ...content,
      travelTours: { ...content.travelTours, galleryImages: images },
    }
    updateHistory(newContent)

    // Sync to database
    try {
      const response = await fetch('/api/admin/content/travel-tours', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ galleryImages: images }),
      })
      const result = await response.json()
      if (!result.success) {
        console.error('Failed to save travel tours gallery images:', result.error)
      }
    } catch (error) {
      console.error('Error syncing travel tours gallery images:', error)
    }
  }, [content, updateHistory])

  const updateHomeHeroImages = useCallback(async (images: string[]) => {
    // Optimistic update
    const newContent = {
      ...content,
      home: {
        ...content.home,
        hero: { ...content.home.hero, images },
      },
    }
    updateHistory(newContent)

    // Sync to database
    try {
      const response = await fetch('/api/admin/content/home', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hero: { ...content.home.hero, images } }),
      })
      const result = await response.json()
      if (!result.success) {
        console.error('Failed to save home hero images:', result.error)
      }
    } catch (error) {
      console.error('Error syncing home hero images:', error)
    }
  }, [content, updateHistory])

  const undo = useCallback(() => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1
      setHistoryIndex(newIndex)
      setContent(history[newIndex].content)
    }
  }, [history, historyIndex])

  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1
      setHistoryIndex(newIndex)
      setContent(history[newIndex].content)
    }
  }, [history, historyIndex])

  const updateContact = useCallback(async (updates: Partial<AdminContent['contact']>) => {
    // Optimistic update
    const newContent = {
      ...content,
      contact: { ...content.contact, ...updates },
    }
    updateHistory(newContent)

    // Sync to database
    try {
      const response = await fetch('/api/admin/content/contact', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      })
      const result = await response.json()
      if (result.success) {
        notifyPublicContentUpdated()
      } else if (!result.success) {
        console.error('Failed to save contact info:', result.error)
      }
    } catch (error) {
      console.error('Error syncing contact info:', error)
    }
  }, [content, notifyPublicContentUpdated, updateHistory])

  const updateFooter = useCallback(async (updates: Partial<AdminContent['footer']>) => {
    // Optimistic update
    const newContent = {
      ...content,
      footer: { ...content.footer, ...updates },
    }
    updateHistory(newContent)

    // Sync to database
    try {
      const response = await fetch('/api/admin/content/footer', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      })
      const result = await response.json()
      if (result.success) {
        notifyPublicContentUpdated()
      } else if (!result.success) {
        console.error('Failed to save footer info:', result.error)
      }
    } catch (error) {
      console.error('Error syncing footer info:', error)
    }
  }, [content, notifyPublicContentUpdated, updateHistory])

  const updateServicePage = useCallback(async (serviceId: string, updates: Partial<AdminContent['servicePages'][0]>) => {
    // Optimistic update
    const newServicePages = content.servicePages.map((service) =>
      service.id === serviceId ? { ...service, ...updates } : service
    )
    const newContent = {
      ...content,
      servicePages: newServicePages,
    }
    updateHistory(newContent)

    // Sync to database
    try {
      const response = await fetch(`/api/admin/content/service-pages/${serviceId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      })
      const result = await response.json()
      if (!result.success) {
        console.error('Failed to save service page:', result.error)
      }
    } catch (error) {
      console.error('Error syncing service page:', error)
    }
  }, [content, updateHistory])

  const saveAll = useCallback(async () => {
    setIsSaving(true)
    try {
      // Save all sections to database with section names for error tracking
      const savePromises: Array<{ name: string; promise: Promise<Response> }> = [
        // Home
        {
          name: 'Home',
          promise: fetch('/api/admin/content/home', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              hero: content.home.hero,
              services: content.home.services,
            }),
          }),
        },
        // About
        {
          name: 'About',
          promise: fetch('/api/admin/content/about', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              heroTitle: content.about.heroTitle,
              heroSubtitle: content.about.heroSubtitle,
              heroImage: content.about.heroImage,
              mission: content.about.mission,
              vision: content.about.vision,
              coreValues: content.about.coreValues,
              founder: content.about.founder,
              team: content.about.team,
              successStories: content.about.successStories,
            }),
          }),
        },
        // Travel Tours
        {
          name: 'Travel Tours',
          promise: fetch('/api/admin/content/travel-tours', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              hero: content.travelTours.hero,
              featured: content.travelTours.featured,
              benefits: content.travelTours.benefits,
              galleryImages: content.travelTours.galleryImages,
            }),
          }),
        },
        // Contact
        {
          name: 'Contact',
          promise: fetch('/api/admin/content/contact', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(content.contact),
          }),
        },
        // Footer
        {
          name: 'Footer',
          promise: fetch('/api/admin/content/footer', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(content.footer),
          }),
        },
      ]

      // Save service pages
      content.servicePages.forEach((service) => {
        // Transform service page data to match API expectations
        const serviceData = {
          title: service.title,
          description: service.description,
          icon: service.icon,
          route: service.route,
          heroImage: service.heroImage,
          heroImagePosition: service.heroImagePosition || { x: 50, y: 50 },
          bannerTitle: service.bannerTitle,
          bannerSubtitle: service.bannerSubtitle,
          overview: service.overview,
          visaGuidance: service.visaGuidance,
          benefits: service.benefits || [],
          requirements: service.requirements || [],
          countries: (service.countries || []).map((c: any) => ({
            name: c.name,
            description: c.description,
            image: c.image,
          })),
          successStories: service.successStories || [],
          scholarships: service.scholarships || [],
          whyStudyOutsideThisCountry: service.whyStudyOutsideThisCountry,
        }
        
        savePromises.push({
          name: `Service: ${service.title || service.id}`,
          promise: fetch(`/api/admin/content/service-pages/${service.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(serviceData),
          }),
        })
      })

      const results = await Promise.allSettled(
        savePromises.map(async ({ name, promise }) => {
          try {
            const response = await promise
            const data = await response.json()
            return { 
              name,
              response, 
              data, 
              success: response.ok && data.success,
              error: data.error || (response.ok ? null : `HTTP ${response.status}`)
            }
          } catch (error: any) {
            return { name, error: error.message || 'Network error', success: false }
          }
        })
      )
      
      // Check for any failures and log details
      const failures: Array<{ name: string; error: string }> = []
      results.forEach((result) => {
        if (result.status === 'rejected') {
          failures.push({ name: 'Unknown', error: String(result.reason) })
        } else if (!result.value.success) {
          failures.push({ 
            name: result.value.name,
            error: result.value.error || 'Unknown error'
          })
        }
      })
      
      if (failures.length > 0) {
        console.error('Some saves failed:', failures)
        const errorDetails = failures.map((f) => 
          `• ${f.name}: ${f.error}`
        ).join('\n')
        console.error('Failed sections:', errorDetails)
        alert(`Saved with ${failures.length} error(s). Check console (F12) for details.\n\nFailed sections:\n${errorDetails}`)
      } else {
        // Clear undo/redo history after successful save
        const newHistory = [{ content, timestamp: Date.now() }]
        setHistory(newHistory)
        setHistoryIndex(0)
        notifyPublicContentUpdated()
        alert('All changes saved successfully!')
      }
    } catch (error) {
      console.error('Error saving all changes:', error)
      alert('Failed to save changes. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }, [content, notifyPublicContentUpdated])

  return (
    <AdminContext.Provider
      value={{
        content,
        isLoading,
        updateHomeHero,
        updateServices,
        updateHomeFeaturedPackages,
        updateAbout,
        updatePackages,
        updatePackage,
        addPackage,
        deletePackage,
        updateTravelTours,
        updateTravelToursHero,
        updateTravelToursFeatured,
        updateTravelToursBenefits,
        updateTravelToursGalleryImages,
        updateHomeHeroImages,
        updateContact,
        updateFooter,
        updateServicePage,
        undo,
        redo,
        canUndo: historyIndex > 0,
        canRedo: historyIndex < history.length - 1,
        saveAll,
        isSaving,
      }}
    >
      {children}
    </AdminContext.Provider>
  )
}

export function useAdmin() {
  const context = useContext(AdminContext)
  if (context === undefined) {
    throw new Error('useAdmin must be used within AdminProvider')
  }
  return context
}
