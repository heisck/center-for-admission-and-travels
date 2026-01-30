'use client'

import { AdminToolbar } from '@/components/admin/admin-toolbar'
import AdminContactEditor from '@/components/admin/editors/admin-contact-editor'

export default function AdminContactPage() {
  return (
    <>
      <AdminToolbar />
      <main className="min-h-screen bg-slate-50 overflow-x-hidden">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6 md:py-8 space-y-6 sm:space-y-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground">Contact & Footer Settings</h1>
            <p className="text-muted-foreground mt-2">Manage contact information and footer content</p>
          </div>

          <AdminContactEditor />
        </div>
      </main>
    </>
  )
}
