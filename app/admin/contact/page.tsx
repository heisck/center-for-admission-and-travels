'use client'

import AdminContactEditor from '@/components/admin/editors/admin-contact-editor'

export default function AdminContactPage() {
  return (
    <main className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Contact & Social Links</h1>
          <p className="text-muted-foreground mt-2">
            Edit contact information, office address, and social media links shown in the footer
          </p>
        </div>

        <AdminContactEditor />
      </div>
    </main>
  )
}
