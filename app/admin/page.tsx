'use client'

import { useState, useEffect, useMemo } from 'react'

import { useAdmin } from '@/context/admin-context'
import { useAdminWorkspace } from '@/context/admin-workspace-context'
import { MinimalistHero } from '@/components/ui/minimalist-hero'
import ServicesGrid from '@/components/services-grid'
import HomeFeaturedPackages from '@/components/home-featured-packages'
import HomeLatestBlog from '@/components/home-latest-blog'
import CTASection from '@/components/cta-section'
import Footer from '@/components/footer'
import { EditableTextareaWrapper } from '@/components/admin/editable-content'
import { ServiceEditOverlay } from '@/components/admin/overlays/service-edit-overlay'
import { PackageEditOverlay } from '@/components/admin/overlays/package-edit-overlay'
import { BlogPostEditOverlay } from '@/components/admin/overlays/blog-post-edit-overlay'
import type { PackageDestinationItem } from '@/components/package-destination-grid'
import type { BlogPostSummary, PackageCardContent, HomeServiceContent } from '@/lib/public-content'

const HERO_IMAGE = '/images/hero/ca-travels-hero-portrait.png'

const DEFAULT_SERVICE_ROUTES = [
  '/study-abroad',
  '/work-abroad',
  '/travel-tours',
  '/global-network',
]

export default function AdminHomePage() {
  const { content, updateHomeHero, updateServices, updatePackage, deletePackage, isLoading } = useAdmin()
  const { mode } = useAdminWorkspace()
  const { hero, services } = content.home
  const [blogPosts, setBlogPosts] = useState<BlogPostSummary[]>([])

  const [selectedServiceForEdit, setSelectedServiceForEdit] = useState<HomeServiceContent | null>(null)
  const [selectedPackageForEdit, setSelectedPackageForEdit] = useState<PackageDestinationItem | null>(null)
  const [selectedPostForEdit, setSelectedPostForEdit] = useState<BlogPostSummary | null>(null)
  const [isCreatingNewPost, setIsCreatingNewPost] = useState(false)

  useEffect(() => {
    let isMounted = true
    async function fetchBlog() {
      try {
        const res = await fetch('/api/blog')
        const data = await res.json()
        if (isMounted && data.success && Array.isArray(data.data)) {
          setBlogPosts(data.data.slice(0, 3))
        }
      } catch {
        // Silent catch
      }
    }
    fetchBlog()
    return () => {
      isMounted = false
    }
  }, [])

  const heroDescription = useMemo(() => {
    const text =
      hero.description?.trim() ||
      hero.subtitle?.trim() ||
      'Study abroad, work abroad, and travel packages from Ghana — guided with honesty and care.'

    return (
      <EditableTextareaWrapper
        value={text}
        onChange={(value) => updateHomeHero({ description: value })}
        rows={3}
        className="text-sm sm:text-base leading-relaxed text-neutral-600 max-w-sm bg-transparent"
        placeholder="Edit hero description..."
      />
    )
  }, [hero.description, hero.subtitle, updateHomeHero])

  const mappedServices: HomeServiceContent[] = useMemo(() => {
    const rawServices = (services || []) as any[]
    return rawServices.map((s, idx) => {
      const canonicalRoute = s.route || s.href || DEFAULT_SERVICE_ROUTES[idx % DEFAULT_SERVICE_ROUTES.length]
      return {
        id: s.id,
        title: s.title,
        description: s.description || '',
        icon: s.icon || 'Globe',
        href: canonicalRoute,
        image: s.image,
      }
    })
  }, [services])

  const featuredPackagesList: PackageCardContent[] = useMemo(() => {
    const all = content.packages || []
    if (content.home.featuredPackages && content.home.featuredPackages.length > 0) {
      return content.home.featuredPackages.map((fp) => {
        const full = all.find((p) => p.id === fp.id)
        if (full) return full as PackageCardContent
        return {
          id: fp.id,
          name: fp.name,
          description: fp.description,
          category: (fp.category || 'travel') as 'travel' | 'study' | 'work',
          duration: fp.duration,
          price: fp.price,
          currency: 'GHS',
          highlights: fp.highlights || [],
          itinerary: '',
          images: fp.images || [],
          included: [],
          notIncluded: [],
        }
      })
    }
    return all.slice(0, 4) as PackageCardContent[]
  }, [content.packages, content.home.featuredPackages])

  const handleSaveService = (serviceId: string, updates: Partial<HomeServiceContent>) => {
    const rawServices = (services || []) as any[]
    const updated = rawServices.map((s) => {
      if (s.id === serviceId) {
        return {
          ...s,
          title: updates.title ?? s.title,
          description: updates.description ?? s.description,
          route: updates.href ?? s.route ?? s.href,
          image: updates.image !== undefined ? updates.image : s.image,
        }
      }
      return s
    })
    updateServices(updated)
    setSelectedServiceForEdit(null)
  }

  const handleSavePackage = (pkgId: string, updates: Partial<PackageDestinationItem>) => {
    updatePackage(pkgId, updates as any)
    setSelectedPackageForEdit(null)
  }

  const handleDeletePackage = (pkgId: string) => {
    deletePackage(pkgId)
    setSelectedPackageForEdit(null)
  }

  if (isLoading) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-muted-foreground">Loading content...</p>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-background">
      {/* 1. Minimalist Hero — exact public hero UI */}
      <div className="relative">
        <MinimalistHero
          hideNav
          logoText="CA Travels"
          mainText={heroDescription}
          readMoreLink="/contact"
          readMoreLabel="Get Started"
          imageSrc={HERO_IMAGE}
          imageAlt="Young woman traveler with a bag — Center for Admission and Travels"
          overlayText={{
            part1: 'looking to\ntravel &',
            part2: 'study\nabroad?',
          }}
          socialLinks={[]}
          locationText=""
        />
      </div>

      {/* 2. Services Grid — exact public RollingTextList UI */}
      <div className="relative">
        <ServicesGrid
          services={mappedServices}
          isEditable={mode === 'edit'}
          onEditService={
            mode === 'edit'
              ? (service) => setSelectedServiceForEdit(service)
              : undefined
          }
        />
      </div>

      {/* 3. Featured Packages — exact public PackageDestinationGrid UI */}
      <div className="relative">
        <HomeFeaturedPackages
          featuredPackages={featuredPackagesList}
          isEditable={mode === 'edit'}
          onEditPackage={
            mode === 'edit'
              ? (pkg) => setSelectedPackageForEdit(pkg)
              : undefined
          }
        />
      </div>

      {/* 4. Latest Blog Posts — exact public HomeLatestBlog UI */}
      <div className="relative">
        <HomeLatestBlog
          posts={blogPosts}
          isEditable={mode === 'edit'}
          onEditPost={(post) => {
            if (mode === 'edit') {
              setIsCreatingNewPost(false)
              setSelectedPostForEdit(post)
            }
          }}
          onAddPost={() => {
            if (mode === 'edit') {
              setSelectedPostForEdit(null)
              setIsCreatingNewPost(true)
            }
          }}
        />
      </div>

      {/* 5. CTA Section — exact public CTA UI */}
      <CTASection />

      {/* 6. Footer — exact public Footer UI */}
      <Footer />

      {/* In-place Service Edit Overlay (Drawer on mobile, Dialog on desktop) */}
      {selectedServiceForEdit && (
        <ServiceEditOverlay
          open={Boolean(selectedServiceForEdit)}
          onOpenChange={(open) => !open && setSelectedServiceForEdit(null)}
          service={selectedServiceForEdit}
          onSave={handleSaveService}
        />
      )}

      {/* In-place Package Edit Overlay (Drawer on mobile, Dialog on desktop) */}
      {selectedPackageForEdit && (
        <PackageEditOverlay
          open={Boolean(selectedPackageForEdit)}
          onOpenChange={(open) => !open && setSelectedPackageForEdit(null)}
          packageData={selectedPackageForEdit}
          onSave={handleSavePackage}
          onDelete={handleDeletePackage}
        />
      )}

      {/* In-place Blog Post Edit Overlay (Drawer on mobile, Dialog on desktop) */}
      {(selectedPostForEdit || isCreatingNewPost) && (
        <BlogPostEditOverlay
          open={Boolean(selectedPostForEdit || isCreatingNewPost)}
          onOpenChange={(open) => {
            if (!open) {
              setSelectedPostForEdit(null)
              setIsCreatingNewPost(false)
            }
          }}
          post={selectedPostForEdit}
          isNew={isCreatingNewPost}
          onSaved={(savedPost) => {
            setBlogPosts((prev) => {
              const idx = prev.findIndex((p) => p.id === savedPost.id)
              if (idx >= 0) {
                const next = [...prev]
                next[idx] = savedPost
                return next
              }
              return [savedPost, ...prev].slice(0, 3)
            })
            setSelectedPostForEdit(null)
            setIsCreatingNewPost(false)
          }}
          onDeleted={(postId) => {
            setBlogPosts((prev) => prev.filter((p) => p.id !== postId))
            setSelectedPostForEdit(null)
            setIsCreatingNewPost(false)
          }}
        />
      )}
    </main>
  )
}
