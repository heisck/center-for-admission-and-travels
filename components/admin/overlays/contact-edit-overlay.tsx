'use client'

import React, { useState, useEffect } from 'react'
import { AdminOverlay } from '@/components/admin/admin-overlay'
import { Check, Plus, Trash2, Globe, Phone, MapPin } from 'lucide-react'
import type { AdminContent } from '@/context/admin-context'
import { detectSocialPlatform, normalizeSocialLink, normalizeSocialUrl } from '@/lib/social-links'

interface ContactEditOverlayProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  contact: AdminContent['contact']
  footer: AdminContent['footer']
  onSave: (
    contactUpdates: Partial<AdminContent['contact']>,
    footerUpdates?: Partial<AdminContent['footer']>
  ) => void
}

export function ContactEditOverlay({
  open,
  onOpenChange,
  contact,
  footer,
  onSave,
}: ContactEditOverlayProps) {
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [whatsappNumber, setWhatsappNumber] = useState('')
  const [street, setStreet] = useState('')
  const [city, setCity] = useState('')
  const [region, setRegion] = useState('')
  const [country, setCountry] = useState('')
  const [latitude, setLatitude] = useState<string>('')
  const [longitude, setLongitude] = useState<string>('')
  const [socialLinks, setSocialLinks] = useState<Array<{ id?: string; platform: string; url: string }>>([])
  const [newSocialUrl, setNewSocialUrl] = useState('')

  useEffect(() => {
    if (contact) {
      setPhone(contact.phone || '')
      setEmail(contact.email || '')
      setWhatsappNumber(contact.whatsappNumber || '')
      setStreet(contact.address?.street || '')
      setCity(contact.address?.city || '')
      setRegion(contact.address?.region || '')
      setCountry(contact.address?.country || '')
      setLatitude(
        contact.location?.latitude !== null && contact.location?.latitude !== undefined
          ? String(contact.location.latitude)
          : ''
      )
      setLongitude(
        contact.location?.longitude !== null && contact.location?.longitude !== undefined
          ? String(contact.location.longitude)
          : ''
      )
    }
    if (footer?.socialLinks) {
      setSocialLinks(footer.socialLinks)
    }
  }, [contact, footer])

  const handleAddSocial = () => {
    const normalized = normalizeSocialUrl(newSocialUrl)
    if (!normalized) return
    const newLink = normalizeSocialLink({ url: normalized })
    setSocialLinks((prev) => [...prev, newLink])
    setNewSocialUrl('')
  }

  const handleRemoveSocial = (index: number) => {
    setSocialLinks((prev) => prev.filter((_, idx) => idx !== index))
  }

  const handleUpdateSocialUrl = (index: number, url: string) => {
    setSocialLinks((prev) =>
      prev.map((item, idx) => {
        if (idx !== index) return item
        return {
          ...item,
          url,
          platform: detectSocialPlatform(url),
        }
      })
    )
  }

  const handleDone = (e: React.FormEvent) => {
    e.preventDefault()

    const parsedLat = latitude.trim() ? Number(latitude.trim()) : null
    const parsedLng = longitude.trim() ? Number(longitude.trim()) : null

    const contactUpdates: Partial<AdminContent['contact']> = {
      phone: phone.trim(),
      email: email.trim(),
      whatsappNumber: whatsappNumber.trim(),
      address: {
        street: street.trim(),
        city: city.trim(),
        region: region.trim(),
        country: country.trim(),
      },
      location: {
        latitude: Number.isFinite(parsedLat) ? parsedLat : null,
        longitude: Number.isFinite(parsedLng) ? parsedLng : null,
      },
    }

    const footerUpdates: Partial<AdminContent['footer']> = {
      socialLinks,
    }

    onSave(contactUpdates, footerUpdates)
    onOpenChange(false)
  }

  return (
    <AdminOverlay
      open={open}
      onOpenChange={onOpenChange}
      title="Edit Contact & Office Information"
      description="Update phone, email, WhatsApp, physical address, and social links. Click Done when finished."
    >
      <form onSubmit={handleDone} className="space-y-6">
        {/* Core Channels */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <Phone className="w-3.5 h-3.5 text-orange-600" /> Contact Channels
          </h3>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-foreground mb-1.5">
                Phone Number
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/30"
                placeholder="+233 55 123 4567"
              />
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-semibold text-foreground mb-1.5">
                WhatsApp Number
              </label>
              <input
                type="tel"
                value={whatsappNumber}
                onChange={(e) => setWhatsappNumber(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/30"
                placeholder="+233 55 123 4567"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-semibold text-foreground mb-1.5">
              Public & Contact Form Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/30"
              placeholder="info@centerforadmissionandtravels.com"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Used as the public contact email and destination inbox for website messages.
            </p>
          </div>
        </div>

        {/* Physical Office Address */}
        <div className="space-y-4 pt-4 border-t border-border">
          <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-orange-600" /> Office Location & Map
          </h3>

          <div>
            <label className="block text-xs sm:text-sm font-semibold text-foreground mb-1.5">
              Street / Building Address
            </label>
            <input
              type="text"
              value={street}
              onChange={(e) => setStreet(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/30"
              placeholder="e.g. Ring Road Central, Near Circle"
            />
          </div>

          <div className="grid sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5">City</label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-border bg-background text-foreground text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/30"
                placeholder="Accra"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5">Region / State</label>
              <input
                type="text"
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-border bg-background text-foreground text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/30"
                placeholder="Greater Accra"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5">Country</label>
              <input
                type="text"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-border bg-background text-foreground text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/30"
                placeholder="Ghana"
              />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">
                Latitude <span className="text-muted-foreground font-normal">(optional)</span>
              </label>
              <input
                type="text"
                value={latitude}
                onChange={(e) => setLatitude(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-border bg-background text-foreground text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/30"
                placeholder="e.g. 5.5600"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">
                Longitude <span className="text-muted-foreground font-normal">(optional)</span>
              </label>
              <input
                type="text"
                value={longitude}
                onChange={(e) => setLongitude(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-border bg-background text-foreground text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/30"
                placeholder="e.g. -0.2057"
              />
            </div>
          </div>
        </div>

        {/* Social Media Links */}
        <div className="space-y-4 pt-4 border-t border-border">
          <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <Globe className="w-3.5 h-3.5 text-orange-600" /> Social Links & Channels
          </h3>

          <div className="space-y-2.5">
            {socialLinks.map((item, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <span className="shrink-0 w-24 text-xs font-semibold capitalize px-2 py-1.5 bg-slate-100 rounded-lg text-slate-700 text-center truncate">
                  {item.platform || 'Link'}
                </span>
                <input
                  type="url"
                  value={item.url}
                  onChange={(e) => handleUpdateSocialUrl(idx, e.target.value)}
                  className="flex-1 px-3 py-1.5 text-xs sm:text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-orange-500/30"
                  placeholder="https://..."
                />
                <button
                  type="button"
                  onClick={() => handleRemoveSocial(idx)}
                  className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition shrink-0"
                  title="Remove social link"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          <div className="flex gap-2">
            <input
              type="url"
              value={newSocialUrl}
              onChange={(e) => setNewSocialUrl(e.target.value)}
              placeholder="Paste social profile URL (e.g. https://instagram.com/cfaattravels)"
              className="flex-1 px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-orange-500/30"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  handleAddSocial()
                }
              }}
            />
            <button
              type="button"
              onClick={handleAddSocial}
              disabled={!newSocialUrl.trim()}
              className="px-3.5 py-2 rounded-xl bg-orange-50 border border-orange-200 text-orange-700 hover:bg-orange-100 text-xs sm:text-sm font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 shrink-0"
            >
              <Plus className="w-4 h-4" /> Add Link
            </button>
          </div>
        </div>

        {/* Footer Actions */}
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
