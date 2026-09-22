'use client'

import { Suspense, useState, useMemo } from 'react'
import { Plus } from 'lucide-react'

import { useAdmin } from '@/context/admin-context'
import { useAdminWorkspace } from '@/context/admin-workspace-context'
import PackagesPageClient from '@/app/packages/packages-page-client'
import PackagesSeoPanel from '@/components/packages-seo-panel'
import Footer from '@/components/footer'
import { PackageEditOverlay } from '@/components/admin/overlays/package-edit-overlay'
import type { PackageDestinationItem } from '@/components/package-destination-grid'
import type { PackageCardContent } from '@/lib/public-content'

const PACKAGES_FAQS = [
  {
    question: 'What is CA Travels (CFAAT)?',
    answer:
      'Center for Admission and Travels (CA Travels / CFAAT) is a Ghana-based consultancy for study abroad, work abroad, and international travel packages, with admission guidance, visa support, and tour planning.',
  },
  {
    question: 'Can I book travel packages from Ghana with CA Travels?',
    answer:
      'Yes. Our packages page lists study, work, and travel options. You can book online via secure Paystack checkout or contact our team for custom travel abroad planning.',
  },
  {
    question: 'Do you help with study abroad and work abroad from Ghana?',
    answer:
      'Yes. CFAAT supports university admission pathways, documentation, and work-abroad guidance alongside leisure and tour packages to destinations such as Dubai, Europe, Asia, the UK, and Canada.',
  },
  {
    question: 'Do you support people travelling to Ghana or from Ghana?',
    answer:
      'We primarily serve clients in Ghana planning international study, work, and travel. Contact us for current itineraries, pricing, and destination support.',
  },
]

export default function AdminPackagesPage() {
  const { content, isLoading, updatePackage, addPackage, deletePackage } = useAdmin()
  const { mode } = useAdminWorkspace()
  const [editingPackage, setEditingPackage] = useState<PackageDestinationItem | null>(null)
  const [isCreatingNewPackage, setIsCreatingNewPackage] = useState(false)

  const packagesList: PackageCardContent[] = useMemo(() => {
    return (content.packages || []).map((p) => ({
      id: p.id,
      name: p.name,
      description: p.description,
      category: p.category,
      duration: p.duration,
      price: p.price,
      currency: p.currency,
      highlights: p.highlights,
      itinerary: p.itinerary,
      images: p.images,
      included: p.included,
      notIncluded: p.notIncluded,
    }))
  }, [content.packages])

  const handleSavePackage = (pkgId: string, updates: Partial<PackageDestinationItem>) => {
    if (isCreatingNewPackage) {
      addPackage({
        id: pkgId.startsWith('new-') ? `package-${Date.now()}` : pkgId,
        name: updates.name || 'New Package',
        description: updates.description || '',
        category: updates.category || 'travel',
        duration: updates.duration || 'Flexible',
        price: updates.price || 0,
        currency: updates.currency || 'GHS',
        highlights: updates.highlights || [],
        itinerary: updates.itinerary || '',
        images: updates.images || (updates.image ? [updates.image] : []),
        included: updates.included || [],
        notIncluded: updates.notIncluded || [],
      } as any)
      setIsCreatingNewPackage(false)
    } else {
      updatePackage(pkgId, updates as any)
      setEditingPackage(null)
    }
  }

  const handleDeletePackage = (pkgId: string) => {
    deletePackage(pkgId)
    setEditingPackage(null)
  }

  if (isLoading) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-muted-foreground">Loading packages...</p>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-transparent relative">
      {/* Edit Mode: Clean floating Add Package action button */}
      {mode === 'edit' && (
        <div className="fixed bottom-6 right-6 z-40">
          <button
            type="button"
            onClick={() => {
              setEditingPackage(null)
              setIsCreatingNewPackage(true)
            }}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-gradient-to-r from-orange-500 to-red-600 text-white font-semibold shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 transition-all text-sm sm:text-base"
          >
            <Plus className="w-5 h-5" />
            Add New Package
          </button>
        </div>
      )}

      {/* Main Packages Page — exact public layout, search, filters & cards */}
      <Suspense fallback={<div className="py-24" aria-hidden />}>
        <PackagesPageClient
          packages={packagesList}
          isEditable={mode === 'edit'}
          onEditPackage={(pkg) => {
            if (mode === 'edit') {
              setIsCreatingNewPackage(false)
              setEditingPackage(pkg)
            }
          }}
        />
      </Suspense>

      <PackagesSeoPanel faqs={PACKAGES_FAQS} />

      <Footer />

      {/* In-place adaptive overlay (Drawer on mobile, Dialog on desktop) */}
      {(editingPackage || isCreatingNewPackage) && (
        <PackageEditOverlay
          open={Boolean(editingPackage || isCreatingNewPackage)}
          onOpenChange={(open) => {
            if (!open) {
              setEditingPackage(null)
              setIsCreatingNewPackage(false)
            }
          }}
          packageData={editingPackage}
          isNew={isCreatingNewPackage}
          onSave={handleSavePackage}
          onDelete={handleDeletePackage}
        />
      )}
    </main>
  )
}
