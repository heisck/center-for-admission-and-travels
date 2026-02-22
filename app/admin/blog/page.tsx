'use client'

import { AdminToolbar } from '@/components/admin/admin-toolbar'
import { FileText } from 'lucide-react'

export default function AdminBlogPage() {
  return (
    <>
      <AdminToolbar />
      <main className="min-h-screen bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Blog Management</h1>
          <p className="text-muted-foreground mb-8">Create and manage blog posts</p>

          <div className="bg-white rounded-xl border border-border p-12 text-center">
            <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <p className="text-lg text-foreground font-medium mb-2">Coming soon</p>
            <p className="text-muted-foreground max-w-md mx-auto">
              Blog post creation and management will be available in a future update. The public blog page is live at /blog.
            </p>
          </div>
        </div>
      </main>
    </>
  )
}
