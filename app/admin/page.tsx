'use client'

import { useScrollToTop } from '@/hooks/use-scroll-to-top'
import { AdminProvider } from '@/context/admin-context'
import AdminDashboard from '@/components/admin/admin-dashboard'

export default function Admin() {
  useScrollToTop()

  return (
    <AdminProvider>
      <main className="min-h-screen bg-background">
        <AdminDashboard />
      </main>
    </AdminProvider>
  )
}
