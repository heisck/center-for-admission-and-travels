'use client'

import React, { useState, useEffect } from 'react'
import { AdminOverlay } from '@/components/admin/admin-overlay'
import { ImageUploadField } from '@/components/admin/image-upload-field'
import type { PackageDestinationItem } from '@/components/package-destination-grid'
import { Check, Trash2 } from 'lucide-react'
import { SUPPORTED_CURRENCIES, type SupportedCurrency } from '@/lib/currency'

interface PackageEditOverlayProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  packageData: PackageDestinationItem | null
  onSave: (pkgId: string, updates: Partial<PackageDestinationItem>) => void
  onDelete?: (pkgId: string) => void
  isNew?: boolean
}

export function PackageEditOverlay({
  open,
  onOpenChange,
  packageData,
  onSave,
  onDelete,
  isNew = false,
}: PackageEditOverlayProps) {
  const [name, setName] = useState('')
  const [category, setCategory] = useState<'travel' | 'study' | 'work'>('travel')
  const [duration, setDuration] = useState('')
  const [price, setPrice] = useState(0)
  const [currency, setCurrency] = useState<SupportedCurrency>('GHS')
  const [description, setDescription] = useState('')
  const [image, setImage] = useState('')
  const [highlightsText, setHighlightsText] = useState('')
  const [includedText, setIncludedText] = useState('')
  const [notIncludedText, setNotIncludedText] = useState('')
  const [itinerary, setItinerary] = useState('')

  useEffect(() => {
    if (packageData) {
      setName(packageData.name || '')
      setCategory((packageData.category as any) || 'travel')
      setDuration(packageData.duration || '')
      setPrice(packageData.price || 0)
      setCurrency((packageData.currency as SupportedCurrency) || 'GHS')
      setDescription(packageData.description || '')
      setImage(packageData.image || (packageData.images && packageData.images[0]) || '')
      setHighlightsText((packageData.highlights || []).join('\n'))
      setIncludedText((packageData.included || []).join('\n'))
      setNotIncludedText((packageData.notIncluded || []).join('\n'))
      setItinerary(packageData.itinerary || '')
    } else {
      setName('')
      setCategory('travel')
      setDuration('')
      setPrice(0)
      setCurrency('GHS')
      setDescription('')
      setImage('')
      setHighlightsText('')
      setIncludedText('')
      setNotIncludedText('')
      setItinerary('')
    }
  }, [packageData])

  if (!packageData && !isNew) return null

  const handleDone = (e: React.FormEvent) => {
    e.preventDefault()
    const parseList = (text: string) =>
      text
        .split('\n')
        .map((l) => l.trim())
        .filter(Boolean)

    const updates: Partial<PackageDestinationItem> = {
      name: name.trim() || 'Untitled Package',
      category,
      duration: duration.trim() || 'Flexible',
      price: Number(price) || 0,
      currency,
      description: description.trim(),
      image: image.trim(),
      images: image.trim() ? [image.trim()] : (packageData?.images || []),
      highlights: parseList(highlightsText),
      included: parseList(includedText),
      notIncluded: parseList(notIncludedText),
      itinerary: itinerary.trim(),
    }

    onSave(packageData?.id || `new-${Date.now()}`, updates)
    onOpenChange(false)
  }

  return (
    <AdminOverlay
      open={open}
      onOpenChange={onOpenChange}
      title={isNew ? 'Add New Package' : `Edit Package: ${packageData?.name || 'Package'}`}
      description="Edit package information, pricing, highlights, and included perks. Click Done when finished."
    >
      <form onSubmit={handleDone} className="space-y-4">
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs sm:text-sm font-semibold text-foreground mb-1.5">
              Package Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/30"
              placeholder="e.g. Dubai Discovery Tour"
            />
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-semibold text-foreground mb-1.5">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as any)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/30"
            >
              <option value="travel">Travel & Tours</option>
              <option value="study">Study Abroad</option>
              <option value="work">Work Abroad</option>
            </select>
          </div>
        </div>

        <div className="grid sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs sm:text-sm font-semibold text-foreground mb-1.5">
              Duration
            </label>
            <input
              type="text"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/30"
              placeholder="e.g. 7 Days, 1 Semester"
            />
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-semibold text-foreground mb-1.5">
              Price
            </label>
            <input
              type="number"
              min="0"
              step="any"
              value={price}
              onChange={(e) => setPrice(Number(e.target.value) || 0)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/30"
              placeholder="0"
            />
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-semibold text-foreground mb-1.5">
              Currency
            </label>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value as SupportedCurrency)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/30"
            >
              {SUPPORTED_CURRENCIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>

        <ImageUploadField
          value={image}
          onChange={setImage}
          label="Package Photo"
          folder="packages"
          helperText="Upload a featured photo for this package from your desktop"
        />

        <div>
          <label className="block text-xs sm:text-sm font-semibold text-foreground mb-1.5">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/30"
            placeholder="Overview of the destination or package..."
          />
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs sm:text-sm font-semibold text-foreground mb-1">
              Highlights <span className="text-muted-foreground font-normal">(one per line)</span>
            </label>
            <textarea
              value={highlightsText}
              onChange={(e) => setHighlightsText(e.target.value)}
              rows={3}
              className="w-full px-3.5 py-2 rounded-xl border border-border bg-background text-foreground text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/30"
              placeholder="Guided City Tour&#10;Desert Safari&#10;Luxury Hotel"
            />
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-semibold text-foreground mb-1">
              Included Items <span className="text-muted-foreground font-normal">(one per line)</span>
            </label>
            <textarea
              value={includedText}
              onChange={(e) => setIncludedText(e.target.value)}
              rows={3}
              className="w-full px-3.5 py-2 rounded-xl border border-border bg-background text-foreground text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/30"
              placeholder="Airport Transfer&#10;Daily Breakfast&#10;Entry Tickets"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs sm:text-sm font-semibold text-foreground mb-1">
            Not Included Items <span className="text-muted-foreground font-normal">(one per line)</span>
          </label>
          <textarea
            value={notIncludedText}
            onChange={(e) => setNotIncludedText(e.target.value)}
            rows={2}
            className="w-full px-3.5 py-2 rounded-xl border border-border bg-background text-foreground text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/30"
            placeholder="Flight Tickets&#10;Personal Expenses"
          />
        </div>

        <div>
          <label className="block text-xs sm:text-sm font-semibold text-foreground mb-1">
            Itinerary <span className="text-muted-foreground font-normal">(optional schedule)</span>
          </label>
          <textarea
            value={itinerary}
            onChange={(e) => setItinerary(e.target.value)}
            rows={2}
            className="w-full px-3.5 py-2 rounded-xl border border-border bg-background text-foreground text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/30"
            placeholder="Day 1: Arrival and hotel check-in...&#10;Day 2: Morning tour..."
          />
        </div>

        <div className="pt-4 flex items-center justify-between gap-3 border-t border-border mt-6">
          <div>
            {!isNew && packageData && onDelete && (
              <button
                type="button"
                onClick={() => {
                  if (confirm(`Are you sure you want to delete "${packageData.name}"?`)) {
                    onDelete(packageData.id)
                    onOpenChange(false)
                  }
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 text-xs sm:text-sm font-medium transition"
              >
                <Trash2 className="w-4 h-4" />
                Delete Package
              </button>
            )}
          </div>
          <div className="flex items-center gap-3">
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
        </div>
      </form>
    </AdminOverlay>
  )
}
