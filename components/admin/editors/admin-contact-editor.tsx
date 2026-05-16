'use client'

import { useState } from 'react'
import { Link2, Plus, Trash2 } from 'lucide-react'
import { useAdmin } from '@/context/admin-context'
import { detectSocialPlatform, normalizeSocialLink, normalizeSocialUrl } from '@/lib/social-links'

export default function AdminContactEditor() {
  const { content, updateContact, updateFooter } = useAdmin()
  const [showAddSocial, setShowAddSocial] = useState(false)
  const [newSocialUrl, setNewSocialUrl] = useState('')

  const contact = content.contact
  const footer = content.footer
  const socialLinks = footer.socialLinks || []

  const updateMapCoordinate = (field: 'latitude' | 'longitude', rawValue: string) => {
    const value = rawValue.trim()
    if (!value) {
      updateContact({
        location: {
          ...contact.location,
          [field]: null,
        },
      })
      return
    }

    const parsed = Number(value)
    if (!Number.isFinite(parsed)) return

    updateContact({
      location: {
        ...contact.location,
        [field]: parsed,
      },
    })
  }

  const handleAddSocial = () => {
    const normalized = normalizeSocialUrl(newSocialUrl)
    if (!normalized) return

    const updated = [...socialLinks, normalizeSocialLink({ url: normalized })]
    updateFooter({ socialLinks: updated })
    setNewSocialUrl('')
    setShowAddSocial(false)
  }

  const handleDeleteSocial = (index: number) => {
    const updated = socialLinks.filter((_, idx) => idx !== index)
    updateFooter({ socialLinks: updated })
  }

  const handleUpdateSocialUrl = (index: number, url: string) => {
    const updated = socialLinks.map((link, idx) => {
      if (idx !== index) return link
      return {
        ...link,
        url,
        platform: detectSocialPlatform(url),
      }
    })
    updateFooter({ socialLinks: updated })
  }

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-xl shadow-sm border border-border p-8">
        <h2 className="text-2xl font-bold mb-6 text-foreground">Contact Information</h2>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-foreground mb-2">Phone Number</label>
            <input
              type="tel"
              value={contact.phone}
              onChange={(e) => updateContact({ phone: e.target.value })}
              className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Phone number"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-foreground mb-2">Public & Contact Form Email</label>
            <input
              type="email"
              value={contact.email}
              onChange={(e) => updateContact({ email: e.target.value })}
              className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="contact@centerforadmissionandtravels.com"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Shown on the website and used as the inbox for contact form notifications.
            </p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-foreground mb-2">WhatsApp Number</label>
            <input
              type="tel"
              value={contact.whatsappNumber}
              onChange={(e) => updateContact({ whatsappNumber: e.target.value })}
              className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="WhatsApp number"
            />
            <p className="text-xs text-muted-foreground mt-1">Used for WhatsApp contact links</p>
          </div>

          <div className="border-t border-border pt-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">Office Address</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">Street Address</label>
                <input
                  type="text"
                  value={contact.address.street}
                  onChange={(e) =>
                    updateContact({
                      address: { ...contact.address, street: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Street address"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">City</label>
                  <input
                    type="text"
                    value={contact.address.city}
                    onChange={(e) =>
                      updateContact({
                        address: { ...contact.address, city: e.target.value },
                      })
                    }
                    className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="City"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">Region</label>
                  <input
                    type="text"
                    value={contact.address.region}
                    onChange={(e) =>
                      updateContact({
                        address: { ...contact.address, region: e.target.value },
                      })
                    }
                    className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Region"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">Country</label>
                  <input
                    type="text"
                    value={contact.address.country}
                    onChange={(e) =>
                      updateContact({
                        address: { ...contact.address, country: e.target.value },
                      })
                    }
                    className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Country"
                  />
                </div>
              </div>

              <div className="border-t border-border pt-4">
                <h4 className="text-base font-semibold text-foreground mb-3">Google Maps Coordinates</h4>
                <p className="text-xs text-muted-foreground mb-3">
                  Paste latitude and longitude from Google Maps to make the footer location open exact directions.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1">Latitude</label>
                    <input
                      type="number"
                      step="any"
                      value={contact.location.latitude ?? ''}
                      onChange={(e) => updateMapCoordinate('latitude', e.target.value)}
                      placeholder="9.4075"
                      className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1">Longitude</label>
                    <input
                      type="number"
                      step="any"
                      value={contact.location.longitude ?? ''}
                      onChange={(e) => updateMapCoordinate('longitude', e.target.value)}
                      placeholder="-0.8531"
                      className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-border p-8">
        <h2 className="text-2xl font-bold mb-6 text-foreground">Footer Information</h2>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-foreground mb-2">Company Description</label>
            <textarea
              value={footer.companyDescription}
              onChange={(e) => updateFooter({ companyDescription: e.target.value })}
              className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Brief description of your company"
              rows={3}
            />
            <p className="text-xs text-muted-foreground mt-1">This appears in the footer alongside the company logo</p>
          </div>

          <div className="border-t border-border pt-6">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="text-lg font-semibold text-foreground">Social Media Links</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Click Add Link, paste URL only. Platform type is detected automatically.
                </p>
              </div>
              <button
                onClick={() => setShowAddSocial(true)}
                className="px-4 py-2 bg-primary text-white rounded-lg font-medium hover:shadow-lg transition flex items-center gap-2"
              >
                <Plus size={16} /> Add Link
              </button>
            </div>

            <div className="space-y-4">
              {socialLinks.map((link, index) => (
                <div key={link.id || `${link.platform}-${index}`} className="bg-slate-50 border border-border rounded-lg p-4">
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1 space-y-3">
                      <div className="inline-flex items-center px-2 py-1 rounded bg-slate-200 text-xs font-semibold text-slate-700">
                        {detectSocialPlatform(link.url)}
                      </div>
                      <input
                        type="url"
                        value={link.url}
                        onChange={(e) => handleUpdateSocialUrl(index, e.target.value)}
                        placeholder="https://facebook.com/yourpage"
                        className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                    <button
                      onClick={() => handleDeleteSocial(index)}
                      className="p-2 hover:bg-red-50 rounded-lg transition text-red-600 flex-shrink-0"
                      title="Delete social link"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {showAddSocial && (
              <div className="mt-4 bg-primary/5 border border-primary/20 rounded-lg p-4 space-y-4">
                <h4 className="font-semibold text-foreground flex items-center gap-2">
                  <Link2 size={18} /> Add New Social Link
                </h4>
                <input
                  type="url"
                  value={newSocialUrl}
                  onChange={(e) => setNewSocialUrl(e.target.value)}
                  placeholder="Paste profile URL (e.g. https://x.com/yourhandle)"
                  className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleAddSocial}
                    className="flex-1 px-4 py-2 bg-primary text-white rounded-lg font-medium hover:shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={!newSocialUrl.trim()}
                  >
                    Add Link
                  </button>
                  <button
                    onClick={() => {
                      setShowAddSocial(false)
                      setNewSocialUrl('')
                    }}
                    className="flex-1 px-4 py-2 bg-slate-200 text-foreground rounded-lg font-medium hover:bg-slate-300 transition"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

