'use client'

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { services as servicesData } from '@/data/services'

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

interface HistoryState {
  content: AdminContent
  timestamp: number
}

interface AdminContextType {
  content: AdminContent
  updateContent: (updates: Partial<AdminContent>) => void
  updateHomeHero: (updates: Partial<AdminContent['home']['hero']>) => void
  updateServices: (services: AdminContent['home']['services']) => void
  updateAbout: (updates: Partial<AdminContent['about']>) => void
  updatePackages: (packages: AdminContent['packages']) => void
  updatePackage: (id: number, updates: Partial<AdminContent['packages'][0]>) => void
  addPackage: (pkg: AdminContent['packages'][0]) => void
  deletePackage: (id: number) => void
  updateTravelTours: (updates: Partial<AdminContent['travelTours']>) => void
  updateTravelToursHero: (updates: Partial<AdminContent['travelTours']['hero']>) => void
  updateTravelToursFeatured: (featured: AdminContent['travelTours']['featured']) => void
  updateTravelToursBenefits: (benefits: AdminContent['travelTours']['benefits']) => void
  updateContact: (updates: Partial<AdminContent['contact']>) => void
  updateFooter: (updates: Partial<AdminContent['footer']>) => void
  updateServicePage: (serviceId: string, updates: Partial<AdminContent['servicePages'][0]>) => void
  undo: () => void
  redo: () => void
  canUndo: boolean
  canRedo: boolean
  resetToDefault: () => void
}

const AdminContext = createContext<AdminContextType | undefined>(undefined)

const defaultContent: AdminContent = {
  home: {
    hero: {
      title: 'Looking To Travel',
      subtitle: '& Enrich Your Future',
      description: 'Welcome to Center for Admission and Travels, where your dreams of studying, working, and traveling abroad become reality. We guide you with honesty, professionalism, and care every step of the way.',
      cta1Text: 'View Our Services',
      cta2Text: 'Contact Us',
      stats: [
        { value: '50+', label: 'Success Stories' },
        { value: '15+', label: 'Destinations' },
        { value: '100%', label: 'Satisfaction' },
      ],
      images: [
        '/images/thisshouldbeintegrated5.jpg',
        '/images/integrate.jpg',
        '/images/integrate1.jpg',
      ],
    },
    services: [
      {
        id: 'study',
        icon: 'GraduationCap',
        title: 'Study Abroad',
        description: 'Admission guidance, university selection, and visa processing for top institutions worldwide',
      },
      {
        id: 'work',
        icon: 'Briefcase',
        title: 'Work Abroad',
        description: 'Job placement assistance and relocation support in verified international companies',
      },
      {
        id: 'travel',
        icon: 'Plane',
        title: 'Travel & Tours',
        description: 'Curated travel packages to Dubai, Europe, Asia, and more with full support',
      },
      {
        id: 'network',
        icon: 'Globe',
        title: 'Global Network',
        description: 'Partnerships with accredited universities and verified employers worldwide',
      },
    ],
  },
  about: {
    heroTitle: 'About Center for Admission and Travels',
    heroSubtitle: 'Your trusted partner in global opportunities. We believe every journey is unique, and our team is dedicated to guiding you with honesty, professionalism, and care from start to finish.',
    heroImage: '/images/thisshouldbeintegrated4.jpg',
    mission: {
      title: 'Our Mission',
      description: 'To provide trusted, personalized, and professional services in international education, travel, and job placements. We are dedicated to guiding students to study abroad, facilitating smooth and affordable travel, and providing pathways for work opportunities.',
      points: [
        'Honest and transparent guidance',
        'Professional expertise and care',
        'Personalized attention for every client',
      ],
    },
    vision: {
      title: 'Our Vision',
      description: 'To be Ghana\'s leading gateway to global education, travel, and work opportunities; empowering individuals to explore the world, gain international experience, and unlock their full potential.',
      points: [
        'Global network of partners',
        'Technology-driven solutions',
        'Inspiring international success',
      ],
    },
    coreValues: [
      { id: '1', title: 'Integrity', description: 'Honesty and ethical practices in all dealings' },
      { id: '2', title: 'Professionalism', description: 'Expert service with dedication and expertise' },
      { id: '3', title: 'Customer First', description: 'Your needs drive everything we do' },
      { id: '4', title: 'Transparency', description: 'Clear communication without hidden costs' },
      { id: '5', title: 'Respect', description: 'Value every individual and their journey' },
      { id: '6', title: 'Confidentiality', description: 'Your information is safe with us' },
    ],
    founder: {
      name: 'George Owusu Ntim',
      title: 'Meet Our Founder',
      description: 'George Owusu Ntim is the visionary Director of Center for Admission and Travels. With a strong background in international education, travel coordination, and client advisory services, he leads the company with excellence and integrity. George is committed to helping students, travellers, and professionals access global opportunities through reliable guidance, transparent processes, and personalized support.',
      image: '/images/founder.jpg',
      vision: "Ghana's leading gateway to global opportunities",
      mission: 'Trusted, personalized, professional services',
      values: 'Integrity, professionalism, transparency, and care',
    },
    team: [
      {
        id: '1',
        name: 'George Owusu Ntim',
        role: 'Founder, Managing Director & Chief Travel Consultant',
        image: '/images/USETHIS IMAGE FOR THE TEAM MEMBER TO REPLACE THE ONE OF THE FOUNDER.jpg',
        description: '',
      },
      {
        id: '2',
        name: 'Sadat Abdul Wahab',
        role: 'Travel Consultant',
        image: '/images/team2.jpg',
        description: 'Sadat Abdul Wahab is a dedicated Travel Consultant with in-depth knowledge of visa procedures, ticketing, and travel planning. He works closely with clients to create tailored travel solutions that fit their goals and budgets.',
      },
      {
        id: '3',
        name: 'Drake Nana Adjei Afram',
        role: 'Accountant',
        image: '/images/team1.jpg',
        description: 'Drake Nana Adjei Afram oversees all financial operations at Center for Admission and Travels. As the company\'s Accountant, he is responsible for budgeting, invoicing, reconciliation, and maintaining accurate financial records.',
      },
      {
        id: '4',
        name: 'Esther Adjei Konamah',
        role: 'Administrative & Front Desk Officer',
        image: '/images/team3.jpg',
        description: 'Esther Adjei Konamah ensures the smooth daily operation of our office. As the Administrative and Front Desk Officer, she warmly welcomes clients, manages enquiries, organizes appointments, and maintains efficient office systems.',
      },
    ],
    successStories: [
      {
        name: 'Ama Boateng',
        program: 'Computer Science at Oxford University',
        quote: 'CFAAT made my dream of studying at Oxford a reality. Their guidance was invaluable throughout the entire process.',
      },
      {
        name: 'Kwame Mensah',
        program: 'Medicine at Cambridge University',
        quote: 'From application to visa approval, CFAAT was with me every step. I highly recommend their services to anyone serious about studying abroad.',
      },
      {
        name: 'Abena Osei',
        program: 'Business Administration at Harvard University',
        quote: 'The team at CFAAT understood my goals and matched me with the perfect university. Life-changing experience!',
      },
    ],
  },
  packages: [
    {
      id: 1,
      name: 'Dubai Experience',
      category: 'travel',
      duration: '6 Days / 5 Nights',
      price: 1299,
      description: 'Discover the perfect blend of ultramodern luxury and Arabian heritage in the City of Gold.',
      highlights: [
        'Burj Khalifa - World\'s tallest building',
        'Desert Safari - Thrilling dune adventure',
        'Dhow Cruise Dinner - Traditional sailing experience',
        'Dubai Mall & Gold Souk - Shopping and culture',
        'Palm Jumeirah - Iconic island and beaches',
        'Spice Market - Authentic Arabian culture',
      ],
      images: ['/dubai-burj-khalifa-city-skyline.jpg'],
      itinerary: 'Day 1-6 itinerary...',
      included: ['5 nights accommodation', 'Daily breakfast', 'Airport transfers'],
      notIncluded: ['International flights', 'Visa', 'Personal expenses'],
    },
    {
      id: 2,
      name: 'Europe Multi-City',
      category: 'travel',
      duration: '10 Days / 9 Nights',
      price: 1899,
      description: 'Experience Paris, Amsterdam, and Rome in one unforgettable journey.',
      highlights: [
        'Paris - Eiffel Tower and Louvre',
        'Amsterdam - Canal tours and culture',
        'Rome - Colosseum and Vatican',
        'Local cuisine experiences',
        'Professional guided tours',
        'Comfortable transportation',
      ],
      images: ['/europe-paris-eiffel-tower-landmarks.jpg'],
      itinerary: 'Days 1-10 itinerary...',
      included: ['9 nights accommodation', 'Daily breakfast', 'All major attractions'],
      notIncluded: ['International flights', 'Visas', 'Personal expenses'],
    },
  ],
  services: [
    {
      id: 'study-abroad',
      title: 'Study Abroad',
      description: 'Your pathway to global education',
      icon: 'GraduationCap',
      sections: [
        {
          title: 'University Selection',
          content: 'We help you find the perfect university based on your academic goals and preferences.',
          image: '/images/integrate.jpg',
        },
        {
          title: 'Application Assistance',
          content: 'Expert guidance through the entire application process.',
          image: '/images/integrate1.jpg',
        },
        {
          title: 'Visa Processing',
          content: 'Complete visa support and documentation preparation.',
          image: '/images/integrate2.jpg',
        },
      ],
    },
    {
      id: 'work-abroad',
      title: 'Work Abroad',
      description: 'Career opportunities on the global stage',
      icon: 'Briefcase',
      sections: [
        {
          title: 'Job Placement',
          content: 'Connect with verified international employers.',
          image: '/images/integrate3.jpg',
        },
        {
          title: 'Work Visa Support',
          content: 'Navigate work visa requirements with expert help.',
          image: '/images/integrate.jpg',
        },
      ],
    },
    {
      id: 'travel-tours',
      title: 'Travel & Tours',
      description: 'Explore the world with confidence',
      icon: 'Plane',
      sections: [
        {
          title: 'Curated Packages',
          content: 'Carefully selected travel packages for unforgettable experiences.',
          image: '/images/integrate1.jpg',
        },
      ],
    },
  ],
  travelTours: {
    hero: {
      title: 'Travel & Tours',
      description: 'Explore our carefully curated collection of travel experiences designed to create unforgettable memories. From exotic beaches to historic landmarks, cultural immersion to adventure activities, we offer comprehensive travel packages with full support.',
      paragraph: 'Center for Admission and Travels delivers end-to-end travel solutions with transparency, expertise, and dedication to ensure your journey is smooth, enjoyable, and hassle-free.',
      image: '/images/integrate1.jpg',
    },
    featured: [
      {
        id: '1',
        name: 'Dubai Experience',
        description: 'Discover the perfect blend of ultramodern luxury and Arabian heritage in the City of Gold.',
        duration: '6 Days',
        price: 899,
        image: '/dubai-burj-khalifa-city-skyline.jpg',
        highlights: ['Burj Khalifa', 'Desert Safari', 'Dhow Cruise Dinner', 'Dubai Mall', 'Palm Jumeirah'],
      },
      {
        id: '2',
        name: 'European Tour',
        description: 'Experience the charm of Europe this summer.',
        duration: '7 Days',
        price: 1299,
        image: '/europe-paris-eiffel-tower-landmarks.jpg',
        highlights: ['Paris', 'Amsterdam', 'Rome', 'Guided Tours', 'Museum Visits'],
      },
      {
        id: '3',
        name: 'Asia Explorer',
        description: 'Immerse yourself in the colors and cultures of Asia.',
        duration: '5 Days',
        price: 799,
        image: '/asia-tropical-beaches-thailand-temples.jpg',
        highlights: ['Thailand', 'Singapore', 'Malaysia', 'City Tours', 'Tropical Islands'],
      },
    ],
    benefits: [
      {
        id: '1',
        title: 'Expert Planning',
        description: 'Our travel specialists design itineraries tailored to your preferences and budget',
      },
      {
        id: '2',
        title: '24/7 Support',
        description: 'Round-the-clock customer service ensures help is always available during your journey',
      },
      {
        id: '3',
        title: 'Best Price Guarantee',
        description: 'Competitive pricing with exclusive partnerships for exclusive travel deals',
      },
      {
        id: '4',
        title: 'Visa Assistance',
        description: 'Complete visa documentation support and guidance for all destinations',
      },
      {
        id: '5',
        title: 'Travel Insurance',
        description: 'Comprehensive travel insurance included to protect your investment',
      },
      {
        id: '6',
        title: 'Flexible Booking',
        description: 'Easy modification and cancellation policies for your peace of mind',
      },
    ],
  },
  contact: {
    phone: '+233 248 422 663',
    email: 'info@centerforadmissionandtravels.com',
    address: {
      street: 'BA14 Chinkara Street, Gumani',
      city: 'Tamale',
      region: 'Northern Region',
      country: 'Ghana',
    },
    whatsappNumber: '+233248422663',
  },
  footer: {
    companyDescription: 'Unlocking global opportunities for education, work, and travel.',
    socialLinks: [
      { platform: 'Facebook', url: 'https://facebook.com' },
      { platform: 'LinkedIn', url: 'https://linkedin.com' },
      { platform: 'Twitter', url: 'https://twitter.com' },
    ],
  },
  servicePages: servicesData.map((service) => ({
    id: service.id,
    title: service.title,
    description: service.description,
    icon: service.icon,
    route: service.route,
    heroImage: service.heroImage,
    bannerTitle: service.bannerTitle,
    bannerSubtitle: service.bannerSubtitle,
    overview: service.overview,
    whyStudyOutsideThisCountry: service.whyStudyOutsideThisCountry,
    benefits: service.benefits || [],
    requirements: service.requirements || [],
    countries: service.countries || [],
    visaGuidance: service.visaGuidance || '',
    successStories: service.successStories,
    scholarships: service.scholarships,
  })),
}

const STORAGE_KEY = 'admin_content'
const HISTORY_STORAGE_KEY = 'admin_history'
const HISTORY_INDEX_STORAGE_KEY = 'admin_history_index'

// Helper function to load from localStorage
const loadFromStorage = (): AdminContent | null => {
  if (typeof window === 'undefined') return null
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      return JSON.parse(stored) as AdminContent
    }
  } catch (error) {
    console.error('Error loading from localStorage:', error)
  }
  return null
}

// Helper function to save to localStorage with quota handling
const saveToStorage = (content: AdminContent): boolean => {
  if (typeof window === 'undefined') return false
  try {
    const contentStr = JSON.stringify(content)
    localStorage.setItem(STORAGE_KEY, contentStr)
    return true
  } catch (error: any) {
    // Handle quota exceeded error
    if (error.name === 'QuotaExceededError' || error.code === 22) {
      console.warn('localStorage quota exceeded. Attempting cleanup...')
      
      // Try to clear old history and retry
      try {
        localStorage.removeItem(HISTORY_STORAGE_KEY)
        localStorage.removeItem(HISTORY_INDEX_STORAGE_KEY)
        const contentStr = JSON.stringify(content)
        localStorage.setItem(STORAGE_KEY, contentStr)
        console.warn('Cleared history to save current content. History has been reset.')
        return true
      } catch (retryError) {
        console.error('Failed to save even after cleanup:', retryError)
        // Show user-friendly warning
        if (typeof window !== 'undefined') {
          setTimeout(() => {
            alert('Storage limit reached. Your changes are saved in memory but may be lost on page refresh. Please export your content to save it permanently.')
          }, 100)
        }
        return false
      }
    }
    console.error('Error saving to localStorage:', error)
    return false
  }
}

// Helper function to load history from localStorage
const loadHistoryFromStorage = (): HistoryState[] | null => {
  if (typeof window === 'undefined') return null
  try {
    const stored = localStorage.getItem(HISTORY_STORAGE_KEY)
    if (stored) {
      return JSON.parse(stored) as HistoryState[]
    }
  } catch (error) {
    console.error('Error loading history from localStorage:', error)
  }
  return null
}

// Maximum history entries to keep (to prevent storage bloat)
const MAX_HISTORY_ENTRIES = 10

// Helper function to save history to localStorage (limited size)
const saveHistoryToStorage = (history: HistoryState[]): boolean => {
  if (typeof window === 'undefined') return false
  
  // Limit history size to prevent storage bloat
  const limitedHistory = history.slice(-MAX_HISTORY_ENTRIES)
  
  try {
    const historyStr = JSON.stringify(limitedHistory)
    // Check size before saving (rough estimate: 5MB limit)
    if (historyStr.length > 4 * 1024 * 1024) {
      console.warn('History too large, keeping only most recent entries')
      // Keep only last 5 entries if still too large
      const minimalHistory = history.slice(-5)
      localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(minimalHistory))
      return true
    }
    localStorage.setItem(HISTORY_STORAGE_KEY, historyStr)
    return true
  } catch (error: any) {
    // Silently fail for history - it's less critical than current content
    if (error.name === 'QuotaExceededError' || error.code === 22) {
      console.warn('History storage quota exceeded. History will not be persisted.')
      // Try to save minimal history
      try {
        const minimalHistory = history.slice(-3)
        localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(minimalHistory))
      } catch {
        // If even minimal history fails, just don't save it
        localStorage.removeItem(HISTORY_STORAGE_KEY)
      }
    }
    return false
  }
}

export function AdminProvider({ children }: { children: React.ReactNode }) {
  // Initialize from localStorage or use default
  // Will be updated from API on mount
  const [content, setContent] = useState<AdminContent>(() => {
    const stored = loadFromStorage()
    return stored || defaultContent
  })
  const [isLoading, setIsLoading] = useState(true)

  // Load content from database on mount
  useEffect(() => {
    const loadContentFromAPI = async () => {
      try {
        const response = await fetch('/api/content')
        const result = await response.json()
        if (result.success && result.data) {
          setContent(result.data)
          // Database is the source of truth - no localStorage needed
        } else {
          // Fallback to localStorage only if API fails (for offline support)
          const stored = loadFromStorage()
          if (stored) {
            setContent(stored)
          }
        }
      } catch (error) {
        console.error('Error loading content from API:', error)
        // Fallback to localStorage only if API fails
        const stored = loadFromStorage()
        if (stored) {
          setContent(stored)
        }
      } finally {
        setIsLoading(false)
      }
    }

    loadContentFromAPI()
  }, [])
  
  const [history, setHistory] = useState<HistoryState[]>(() => {
    const stored = loadHistoryFromStorage()
    if (stored && stored.length > 0) {
      // Limit loaded history to MAX_HISTORY_ENTRIES
      return stored.slice(-MAX_HISTORY_ENTRIES)
    }
    const initialContent = loadFromStorage() || defaultContent
    return [{ content: initialContent, timestamp: Date.now() }]
  })
  
  const [historyIndex, setHistoryIndex] = useState(() => {
    if (typeof window === 'undefined') return 0
    try {
      const stored = localStorage.getItem(HISTORY_INDEX_STORAGE_KEY)
      if (stored !== null) {
        const index = parseInt(stored, 10)
        if (!isNaN(index)) {
          return index
        }
      }
    } catch (error) {
      console.error('Error loading history index from localStorage:', error)
    }
    const storedHistory = loadHistoryFromStorage()
    if (storedHistory && storedHistory.length > 0) {
      return storedHistory.length - 1
    }
    return 0
  })

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

  const updateContent = useCallback((updates: Partial<AdminContent>) => {
    const newContent = { ...content, ...updates }
    updateHistory(newContent)
  }, [content, updateHistory])

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

  const updatePackage = useCallback(async (id: string | number, updates: Partial<AdminContent['packages'][0]>) => {
    // Optimistic update
    const newPackages = content.packages.map((pkg) =>
      String(pkg.id) === String(id) ? { ...pkg, ...updates } : pkg
    )
    const newContent = { ...content, packages: newPackages }
    updateHistory(newContent)

    // Sync to database
    try {
      const response = await fetch('/api/admin/content/packages', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: String(id), ...updates }),
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

  const deletePackage = useCallback(async (id: string | number) => {
    // Optimistic update
    const newPackages = content.packages.filter((pkg) => String(pkg.id) !== String(id))
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

  const undo = useCallback(() => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1
      setHistoryIndex(newIndex)
      setContent(history[newIndex].content)
      if (typeof window !== 'undefined') {
        localStorage.setItem(HISTORY_INDEX_STORAGE_KEY, newIndex.toString())
      }
    }
  }, [history, historyIndex])

  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1
      setHistoryIndex(newIndex)
      setContent(history[newIndex].content)
      if (typeof window !== 'undefined') {
        localStorage.setItem(HISTORY_INDEX_STORAGE_KEY, newIndex.toString())
      }
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
      if (!result.success) {
        console.error('Failed to save contact info:', result.error)
      }
    } catch (error) {
      console.error('Error syncing contact info:', error)
    }
  }, [content, updateHistory])

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
      if (!result.success) {
        console.error('Failed to save footer info:', result.error)
      }
    } catch (error) {
      console.error('Error syncing footer info:', error)
    }
  }, [content, updateHistory])

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

  const resetToDefault = useCallback(() => {
    const newHistory = [{ content: defaultContent, timestamp: Date.now() }]
    setHistory(newHistory)
    setHistoryIndex(0)
    setContent(defaultContent)
    // Database is the source of truth - no localStorage needed
  }, [])

  return (
    <AdminContext.Provider
      value={{
        content,
        updateContent,
        updateHomeHero,
        updateServices,
        updateAbout,
        updatePackages,
        updatePackage,
        addPackage,
        deletePackage,
        updateTravelTours,
        updateTravelToursHero,
        updateTravelToursFeatured,
        updateTravelToursBenefits,
        updateContact,
        updateFooter,
        updateServicePage,
        undo,
        redo,
        canUndo: historyIndex > 0,
        canRedo: historyIndex < history.length - 1,
        resetToDefault,
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
