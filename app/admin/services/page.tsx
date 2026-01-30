'use client'

import { AdminToolbar } from '@/components/admin/admin-toolbar'
import AdminServicesEditor from '@/components/admin/editors/admin-services-editor'

export default function AdminServicesPage() {
  return (
    <>
      <AdminToolbar />
      <main className="min-h-screen bg-slate-50 overflow-x-hidden">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6 md:py-8 space-y-6 sm:space-y-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground">Services Editor</h1>
            <p className="text-muted-foreground mt-2">Edit service descriptions and content sections</p>
          </div>

          <AdminServicesEditor />
        </div>
      </main>
    </>
  )
}
