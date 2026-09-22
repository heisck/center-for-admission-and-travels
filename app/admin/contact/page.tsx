'use client'

import { useState } from 'react'

import { useAdmin } from '@/context/admin-context'
import { useAdminWorkspace } from '@/context/admin-workspace-context'
import ContactPageClient from '@/app/contact/contact-page-client'
import Footer from '@/components/footer'
import { ContactEditOverlay } from '@/components/admin/overlays/contact-edit-overlay'

export default function AdminContactPage() {
  const { content, updateContact, updateFooter, isLoading } = useAdmin()
  const { mode } = useAdminWorkspace()
  const [isEditingContact, setIsEditingContact] = useState(false)

  if (isLoading) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-muted-foreground">Loading contact details...</p>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-background">
      {/* Main Contact Page — exact public layout and form */}
      <ContactPageClient
        contact={content.contact as any}
        isEditable={mode === 'edit'}
        onEditContact={() => setIsEditingContact(true)}
      />

      <Footer />

      {/* Adaptive In-place Overlay (Drawer on mobile, Dialog on desktop) */}
      {isEditingContact && (
        <ContactEditOverlay
          open={isEditingContact}
          onOpenChange={setIsEditingContact}
          contact={content.contact}
          footer={content.footer}
          onSave={(contactUpdates, footerUpdates) => {
            updateContact(contactUpdates)
            if (footerUpdates) {
              updateFooter(footerUpdates)
            }
          }}
        />
      )}
    </main>
  )
}
