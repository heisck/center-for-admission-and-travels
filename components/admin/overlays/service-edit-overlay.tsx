'use client'

import React, { useState, useEffect } from 'react'
import { AdminOverlay } from '@/components/admin/admin-overlay'
import { ImageUploadField } from '@/components/admin/image-upload-field'
import type { HomeServiceContent } from '@/lib/public-content'
import { Check } from 'lucide-react'

const ROUTE_OPTIONS = [
  { value: '/study-abroad', label: 'Study Abroad (/study-abroad)' },
  { value: '/work-abroad', label: 'Work Abroad (/work-abroad)' },
  { value: '/travel-tours', label: 'Travel & Tours (/travel-tours)' },
  { value: '/global-network', label: 'Travel Documentation / Services (/global-network)' },
]

interface ServiceEditOverlayProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  service: HomeServiceContent | null
  onSave: (serviceId: string, updates: Partial<HomeServiceContent>) => void
}

export function ServiceEditOverlay({
  open,
  onOpenChange,
  service,
  onSave,
}: ServiceEditOverlayProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [href, setHref] = useState('/study-abroad')
  const [image, setImage] = useState('')

  useEffect(() => {
    if (service) {
      setTitle(service.title || '')
      setDescription(service.description || '')
      setHref(service.href || '/study-abroad')
      setImage(service.image || '')
    }
  }, [service])

  if (!service) return null

  const handleDone = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(service.id, {
      title: title.trim() || service.title,
      description: description.trim(),
      href: href.trim() || service.href,
      image: image.trim() || undefined,
    })
    onOpenChange(false)
  }

  return (
    <AdminOverlay
      open={open}
      onOpenChange={onOpenChange}
      title={`Edit Service: ${service.title || 'Service'}`}
      description="Update service title, details, and destination link. Click Done when finished."
    >
      <form onSubmit={handleDone} className="space-y-4">
        <div>
          <label className="block text-xs sm:text-sm font-semibold text-foreground mb-1.5">
            Service Title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/30"
            placeholder="e.g. Study Abroad"
          />
        </div>

        <div>
          <label className="block text-xs sm:text-sm font-semibold text-foreground mb-1.5">
            Short Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/30"
            placeholder="Brief description of the service..."
          />
        </div>

        <div>
          <label className="block text-xs sm:text-sm font-semibold text-foreground mb-1.5">
            Destination Route / Page
          </label>
          <select
            value={href}
            onChange={(e) => setHref(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/30"
          >
            {ROUTE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <ImageUploadField
          value={image}
          onChange={setImage}
          label="Custom Service Image (optional)"
          folder="services"
          helperText="Upload image from desktop or leave empty for default service photo"
        />

        <div className="pt-4 flex items-center justify-end gap-3 border-t border-border mt-6">
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="px-4 py-2.5 rounded-xl border border-border text-sm font-medium text-muted-foreground hover:bg-slate-100 dark:hover:bg-neutral-800 transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-red-600 text-white text-sm font-semibold shadow-sm hover:shadow transition"
          >
            <Check className="w-4 h-4" />
            Done
          </button>
        </div>
      </form>
    </AdminOverlay>
  )
}
