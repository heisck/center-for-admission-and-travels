'use client'

import { AdminToolbar } from '@/components/admin/admin-toolbar'
import AdminPackagesEditor from '@/components/admin/editors/admin-packages-editor'

export default function AdminPackagesPage() {
  return (
    <>
      <AdminToolbar />
      <main className="min-h-screen bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground">Packages Editor</h1>
            <p className="text-muted-foreground mt-2">Manage travel, study, and work packages</p>
          </div>

          <AdminPackagesEditor />
        </div>
      </main>
    </>
  )
}
