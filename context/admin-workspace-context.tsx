'use client'

import React, { createContext, useContext, useState, useEffect, useMemo } from 'react'
import { usePathname } from 'next/navigation'

export const PUBLIC_PAGE_BY_ADMIN_ROUTE: Record<string, string> = {
  '/admin': '/',
  '/admin/home': '/',
  '/admin/about': '/about',
  '/admin/packages': '/packages',
  '/admin/study-abroad': '/study-abroad',
  '/admin/work-abroad': '/work-abroad',
  '/admin/travel-tours': '/travel-tours',
  '/admin/global-network': '/global-network',
  '/admin/contact': '/contact',
  '/admin/newsletter': '/newsletter',
  '/admin/blog': '/blog',
}

interface AdminWorkspaceContextType {
  mode: 'preview' | 'edit'
  setMode: (mode: 'preview' | 'edit') => void
  previewVersion: number
  refreshPreview: () => void
  publicPath: string | null
  previewUrl: string
  isEditablePage: boolean
}

const AdminWorkspaceContext = createContext<AdminWorkspaceContextType | undefined>(undefined)

export function AdminWorkspaceProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const publicPath = PUBLIC_PAGE_BY_ADMIN_ROUTE[pathname] || null
  const [mode, setMode] = useState<'preview' | 'edit'>('preview')
  const [previewVersion, setPreviewVersion] = useState(0)

  const refreshPreview = () => setPreviewVersion((v) => v + 1)

  useEffect(() => {
    const handleUpdate = () => refreshPreview()
    window.addEventListener('content-updated', handleUpdate)
    return () => window.removeEventListener('content-updated', handleUpdate)
  }, [])

  const previewUrl = useMemo(() => {
    if (!publicPath) return ''
    return `${publicPath}${publicPath.includes('?') ? '&' : '?'}adminPreview=${previewVersion}`
  }, [publicPath, previewVersion])

  return (
    <AdminWorkspaceContext.Provider
      value={{
        mode,
        setMode,
        previewVersion,
        refreshPreview,
        publicPath,
        previewUrl,
        isEditablePage: Boolean(publicPath),
      }}
    >
      {children}
    </AdminWorkspaceContext.Provider>
  )
}

export function useAdminWorkspace() {
  const context = useContext(AdminWorkspaceContext)
  if (!context) {
    throw new Error('useAdminWorkspace must be used within an AdminWorkspaceProvider')
  }
  return context
}
