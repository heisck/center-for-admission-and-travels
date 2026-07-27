'use client'

import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react'
import { toast } from 'sonner'

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
    currency: string
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
      currency: string
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
const ADMIN_AUTOSAVE_DELAY_MS = 600

type AdminSaveJob = {
  label: string
  url: string
  body: unknown
  onSuccess?: () => void
}

type AdminSaveQueue = {
  timer?: ReturnType<typeof setTimeout>
  running: boolean
  latest?: AdminSaveJob
  promise?: Promise<void>
}

async function sendAdminJson(url: string, body: unknown, method = 'PUT') {
  const response = await fetch(url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })

  const result = await response.json().catch(() => null)
  if (!response.ok || !result?.success) {
    throw new Error(result?.error || `Request failed with status ${response.status}`)
  }

  return result
}

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
  const saveQueuesRef = useRef<Map<string, AdminSaveQueue>>(new Map())

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

  const drainAdminSaveQueue = useCallback(async (key: string) => {
    const queue = saveQueuesRef.current.get(key)
    if (!queue) return

    if (queue.timer) {
      clearTimeout(queue.timer)
      queue.timer = undefined
    }
    if (queue.running) {
      await queue.promise
      return
    }

    queue.running = true
    queue.promise = (async () => {
      while (queue.latest) {
        const job = queue.latest
        queue.latest = undefined
        try {
          await sendAdminJson(job.url, job.body)
          job.onSuccess?.()
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Unknown save error'
          console.error(`[Admin autosave] ${job.label} failed:`, error)
          toast.error(`${job.label} was not saved`, {
            description: `${message}. Your edits remain on screen; use Save to retry.`,
          })
        }
      }
    })().finally(() => {
      queue.running = false
      queue.promise = undefined
      if (!queue.latest && !queue.timer) {
        saveQueuesRef.current.delete(key)
      }
    })

    await queue.promise
  }, [])

  const queueAdminSave = useCallback((
    key: string,
    job: AdminSaveJob
  ) => {
    const queue = saveQueuesRef.current.get(key) || { running: false }
    queue.latest = job
    if (queue.timer) clearTimeout(queue.timer)
    queue.timer = setTimeout(() => {
      void drainAdminSaveQueue(key)
    }, ADMIN_AUTOSAVE_DELAY_MS)
    saveQueuesRef.current.set(key, queue)
  }, [drainAdminSaveQueue])

  const flushAdminSaveQueues = useCallback(async () => {
    const keys = Array.from(saveQueuesRef.current.keys())
    await Promise.all(keys.map((key) => drainAdminSaveQueue(key)))
  }, [drainAdminSaveQueue])

  useEffect(() => {
    const queues = saveQueuesRef.current
    return () => {
      for (const queue of queues.values()) {
        if (queue.timer) clearTimeout(queue.timer)
      }
      queues.clear()
    }
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
    queueAdminSave('home', {
      label: 'Home content',
      url: '/api/admin/content/home',
      body: {
        hero: newContent.home.hero,
        services: newContent.home.services,
        featuredPackages: newContent.home.featuredPackages || [],
      },
      onSuccess: notifyPublicContentUpdated,
    })
  }, [content, notifyPublicContentUpdated, queueAdminSave, updateHistory])

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
    queueAdminSave('home', {
      label: 'Home services',
      url: '/api/admin/content/home',
      body: {
        hero: newContent.home.hero,
        services: newContent.home.services,
        featuredPackages: newContent.home.featuredPackages || [],
      },
      onSuccess: notifyPublicContentUpdated,
    })
  }, [content, notifyPublicContentUpdated, queueAdminSave, updateHistory])

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
    queueAdminSave('home', {
      label: 'Featured packages',
      url: '/api/admin/content/home',
      body: {
        hero: newContent.home.hero,
        services: newContent.home.services,
        featuredPackages: featured,
      },
      onSuccess: notifyPublicContentUpdated,
    })
  }, [content, notifyPublicContentUpdated, queueAdminSave, updateHistory])

  const updateAbout = useCallback(async (updates: Partial<AdminContent['about']>) => {
    // Optimistic update
    const newContent = {
      ...content,
      about: { ...content.about, ...updates },
    }
    updateHistory(newContent)
    queueAdminSave('about', {
      label: 'About page',
      url: '/api/admin/content/about',
      body: newContent.about,
      onSuccess: notifyPublicContentUpdated,
    })
  }, [content, notifyPublicContentUpdated, queueAdminSave, updateHistory])

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
    const updatedPackage = newPackages.find((pkg) => pkg.id === id)
    if (updatedPackage) {
      queueAdminSave(`package:${id}`, {
        label: `Package "${updatedPackage.name || 'Untitled'}"`,
        url: '/api/admin/content/packages',
        body: updatedPackage,
        onSuccess: notifyPublicContentUpdated,
      })
    }
  }, [content, notifyPublicContentUpdated, queueAdminSave, updateHistory])

  const addPackage = useCallback(async (pkg: AdminContent['packages'][0]) => {
    // Optimistic update with temporary client id
    const newPackages = [...content.packages, pkg]
    const newContent = { ...content, packages: newPackages }
    updateHistory(newContent)

    try {
      const response = await fetch('/api/admin/content/packages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(pkg),
      })
      const result = await response.json()
      if (result.success && result.data) {
        // Replace temp package with server record (real id + normalized fields)
        setContent((prev) => {
          const replaced = prev.packages.map((p) =>
            p.id === pkg.id
              ? {
                  ...p,
                  ...result.data,
                  currency: result.data.currency || p.currency,
                  highlights: result.data.highlights || [],
                  images: result.data.images || [],
                  included: result.data.included || [],
                  notIncluded: result.data.notIncluded || [],
                  itinerary: result.data.itinerary || '',
                }
              : p
          )
          // If temp id was already lost from history, append server package
          const hasServerId = replaced.some((p) => p.id === result.data.id)
          const hasTemp = replaced.some((p) => p.id === pkg.id)
          const packages = hasServerId
            ? replaced
            : hasTemp
              ? replaced
              : [...replaced, result.data]
          return { ...prev, packages }
        })
        notifyPublicContentUpdated()
      } else {
        console.error('Failed to create package:', result.error)
        setContent(content)
        toast.error('Package was not created', {
          description: result.error || 'The server rejected the package.',
        })
      }
    } catch (error) {
      console.error('Error creating package:', error)
      setContent(content)
      toast.error('Package was not created', {
        description: error instanceof Error ? error.message : 'Network error',
      })
    }
  }, [content, notifyPublicContentUpdated, updateHistory])

  const deletePackage = useCallback(async (id: string) => {
    const previous = content
    // Optimistic update
    const newPackages = content.packages.filter((pkg) => pkg.id !== id)
    const newContent = { ...content, packages: newPackages }
    updateHistory(newContent)

    try {
      const response = await fetch(`/api/admin/content/packages?id=${id}`, {
        method: 'DELETE',
      })
      const result = await response.json()
      if (!result.success) {
        console.error('Failed to delete package:', result.error)
        setContent(previous)
        toast.error('Package was not deleted', {
          description: result.error || 'The server rejected the request.',
        })
      } else {
        notifyPublicContentUpdated()
      }
    } catch (error) {
      console.error('Error deleting package:', error)
      setContent(previous)
      toast.error('Package was not deleted', {
        description: error instanceof Error ? error.message : 'Network error',
      })
    }
  }, [content, notifyPublicContentUpdated, updateHistory])

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
    queueAdminSave('travel-tours', {
      label: 'Travel and tours content',
      url: '/api/admin/content/travel-tours',
      body: newContent.travelTours,
      onSuccess: notifyPublicContentUpdated,
    })
  }, [content, notifyPublicContentUpdated, queueAdminSave, updateHistory])

  const updateTravelToursFeatured = useCallback(async (featured: AdminContent['travelTours']['featured']) => {
    // Optimistic update
    const newContent = {
      ...content,
      travelTours: { ...content.travelTours, featured },
    }
    updateHistory(newContent)
    queueAdminSave('travel-tours', {
      label: 'Travel packages',
      url: '/api/admin/content/travel-tours',
      body: newContent.travelTours,
      onSuccess: notifyPublicContentUpdated,
    })
  }, [content, notifyPublicContentUpdated, queueAdminSave, updateHistory])

  const updateTravelToursBenefits = useCallback(async (benefits: AdminContent['travelTours']['benefits']) => {
    // Optimistic update
    const newContent = {
      ...content,
      travelTours: { ...content.travelTours, benefits },
    }
    updateHistory(newContent)
    queueAdminSave('travel-tours', {
      label: 'Travel benefits',
      url: '/api/admin/content/travel-tours',
      body: newContent.travelTours,
      onSuccess: notifyPublicContentUpdated,
    })
  }, [content, notifyPublicContentUpdated, queueAdminSave, updateHistory])

  const updateTravelToursGalleryImages = useCallback(async (images: string[]) => {
    // Optimistic update
    const newContent = {
      ...content,
      travelTours: { ...content.travelTours, galleryImages: images },
    }
    updateHistory(newContent)
    queueAdminSave('travel-tours', {
      label: 'Travel gallery',
      url: '/api/admin/content/travel-tours',
      body: newContent.travelTours,
      onSuccess: notifyPublicContentUpdated,
    })
  }, [content, notifyPublicContentUpdated, queueAdminSave, updateHistory])

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
    queueAdminSave('home', {
      label: 'Home hero images',
      url: '/api/admin/content/home',
      body: {
        hero: newContent.home.hero,
        services: newContent.home.services,
        featuredPackages: newContent.home.featuredPackages || [],
      },
      onSuccess: notifyPublicContentUpdated,
    })
  }, [content, notifyPublicContentUpdated, queueAdminSave, updateHistory])

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
    queueAdminSave('contact', {
      label: 'Contact information',
      url: '/api/admin/content/contact',
      body: newContent.contact,
      onSuccess: notifyPublicContentUpdated,
    })
  }, [content, notifyPublicContentUpdated, queueAdminSave, updateHistory])

  const updateFooter = useCallback(async (updates: Partial<AdminContent['footer']>) => {
    // Optimistic update
    const newContent = {
      ...content,
      footer: { ...content.footer, ...updates },
    }
    updateHistory(newContent)
    queueAdminSave('footer', {
      label: 'Footer information',
      url: '/api/admin/content/footer',
      body: newContent.footer,
      onSuccess: notifyPublicContentUpdated,
    })
  }, [content, notifyPublicContentUpdated, queueAdminSave, updateHistory])

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
    const service = newServicePages.find((item) => item.id === serviceId)
    if (service) {
      queueAdminSave(`service-page:${serviceId}`, {
        label: `${service.title || 'Service'} page`,
        url: `/api/admin/content/service-pages/${serviceId}`,
        body: service,
        onSuccess: notifyPublicContentUpdated,
      })
    }
  }, [content, notifyPublicContentUpdated, queueAdminSave, updateHistory])

  const saveAll = useCallback(async () => {
    setIsSaving(true)
    try {
      // Serialize behind any in-flight autosaves so an older response can never
      // overwrite this explicit full-state save.
      await flushAdminSaveQueues()

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
        toast.error(`Save failed for ${failures.length} section(s)`, {
          description: errorDetails,
          duration: 10_000,
        })
      } else {
        // Clear undo/redo history after successful save
        const newHistory = [{ content, timestamp: Date.now() }]
        setHistory(newHistory)
        setHistoryIndex(0)
        notifyPublicContentUpdated()
        toast.success('All changes saved successfully')
      }
    } catch (error) {
      console.error('Error saving all changes:', error)
      toast.error('Failed to save changes', {
        description: error instanceof Error ? error.message : 'Please try again.',
      })
    } finally {
      setIsSaving(false)
    }
  }, [content, flushAdminSaveQueues, notifyPublicContentUpdated])

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
