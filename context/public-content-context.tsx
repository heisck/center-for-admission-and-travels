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
import type { PublicContentPayload } from '@/lib/public-content'

const PUBLIC_CONTENT_VERSION_KEY = 'public_content_version'
const PUBLIC_CONTENT_CACHE_KEY = 'public_content_payload'
const PUBLIC_CONTENT_CACHE_TTL_MS = 5 * 60_000

export type PublicContent = PublicContentPayload

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
