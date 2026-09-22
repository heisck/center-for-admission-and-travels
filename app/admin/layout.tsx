'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { AdminHeader } from '@/components/admin/admin-header'
import { AdminProvider } from '@/context/admin-context'
import { AdminWorkspaceProvider } from '@/context/admin-workspace-context'
import { AdminPageWorkspace } from '@/components/admin/admin-page-workspace'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let isActive = true

    const checkSession = async () => {
      try {
        const res = await fetch('/api/admin/auth/session', {
          method: 'GET',
          credentials: 'include',
          cache: 'no-store',
        })

        if (!isActive) return

        if (res.ok) {
          setIsAuthenticated(true)
        } else {
          setIsAuthenticated(false)
          router.push('/admin-login')
        }
      } catch {
        if (!isActive) return
        setIsAuthenticated(false)
        router.push('/admin-login')
      } finally {
        if (isActive) setIsLoading(false)
      }
    }

    checkSession()

    return () => {
      isActive = false
    }
  }, [router])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-muted-foreground">Loading admin panel...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <AdminProvider>
      <AdminWorkspaceProvider>
        <div className="min-h-screen bg-background overflow-x-hidden">
          <AdminHeader />
          <div className="h-16 shrink-0" aria-hidden="true" />
          <main className="w-full">
            <AdminPageWorkspace>{children}</AdminPageWorkspace>
          </main>
        </div>
      </AdminWorkspaceProvider>
    </AdminProvider>
  )
}
