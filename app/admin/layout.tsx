'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { AdminNavbar } from '@/components/admin/admin-navbar'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check for admin session cookie
    const sessionCookie = document.cookie
      .split('; ')
      .find((row) => row.startsWith('admin_session='))

    if (!sessionCookie) {
      router.push('/admin-login')
    } else {
      setIsAuthenticated(true)
      setIsLoading(false)
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
    <div className="min-h-screen bg-background overflow-x-hidden">
      <AdminNavbar />
      <main className="w-full">
        {children}
      </main>
    </div>
  )
}
