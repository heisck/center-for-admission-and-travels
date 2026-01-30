'use client'

import { useAdmin } from '@/context/admin-context'
import { useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'

export default function AdminContactEditor() {
  const { content, updateContact, updateFooter } = useAdmin()
  const [showAddSocial, setShowAddSocial] = useState(false)
  const [newSocial, setNewSocial] = useState({
    platform: '',
    url: '',
  })

  const contact = content.contact
  const footer = content.footer

  const handleDeleteSocial = (platform: string) => {
    const updated = footer.socialLinks.filter((link) => link.platform !== platform)
    updateFooter({ socialLinks: updated })
  }

  const handleAddSocial = () => {
    if (newSocial.platform.trim() && newSocial.url.trim()) {
      const updated = [...footer.socialLinks, newSocial]
      updateFooter({ socialLinks: updated })
      setNewSocial({ platform: '', url: '' })
      setShowAddSocial(false)
    }
  }

  const handleUpdateSocial = (platform: string, field: string, value: string) => {
    const updated = footer.socialLinks.map((link) =>
      link.platform === platform ? { ...link, [field]: value } : link
    )
    updateFooter({ socialLinks: updated })
  }

  return (
    <div className="space-y-8">
      {/* Contact Information */}
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
              placeholder="+233 248 422 663"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-foreground mb-2">Email Address</label>
            <input
              type="email"
              value={contact.email}
              onChange={(e) => updateContact({ email: e.target.value })}
              className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="info@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-foreground mb-2">WhatsApp Number</label>
            <input
              type="tel"
              value={contact.whatsappNumber}
              onChange={(e) => updateContact({ whatsappNumber: e.target.value })}
              className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="+233248422663"
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
            </div>
          </div>
        </div>
      </div>

      {/* Footer Information */}
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
              <h3 className="text-lg font-semibold text-foreground">Social Media Links</h3>
              <button
                onClick={() => setShowAddSocial(true)}
                className="px-4 py-2 bg-primary text-white rounded-lg font-medium hover:shadow-lg transition flex items-center gap-2"
              >
                <Plus size={16} /> Add Link
              </button>
            </div>

            <div className="space-y-4">
              {footer.socialLinks.map((link) => (
                <div key={link.platform} className="bg-slate-50 border border-border rounded-lg p-4">
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1 space-y-3">
                      <input
                        type="text"
                        value={link.platform}
                        onChange={(e) => handleUpdateSocial(link.platform, 'platform', e.target.value)}
                        placeholder="Platform name (e.g., Facebook, LinkedIn, Twitter)"
                        className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary font-semibold"
                      />
                      <input
                        type="url"
                        value={link.url}
                        onChange={(e) => handleUpdateSocial(link.platform, 'url', e.target.value)}
                        placeholder="https://..."
                        className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                    <button
                      onClick={() => handleDeleteSocial(link.platform)}
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
              <div className="mt-4 bg-slate-50 border border-border rounded-lg p-4 space-y-3">
                <h4 className="font-semibold text-foreground">Add New Social Link</h4>
                <input
                  type="text"
                  value={newSocial.platform}
                  onChange={(e) => setNewSocial({ ...newSocial, platform: e.target.value })}
                  placeholder="Platform name (e.g., Facebook, LinkedIn, Twitter)"
                  className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <input
                  type="url"
                  value={newSocial.url}
                  onChange={(e) => setNewSocial({ ...newSocial, url: e.target.value })}
                  placeholder="https://..."
                  className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleAddSocial}
                    className="flex-1 px-4 py-2 bg-primary text-white rounded-lg font-medium hover:shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={!newSocial.platform.trim() || !newSocial.url.trim()}
                  >
                    Add Link
                  </button>
                  <button
                    onClick={() => {
                      setShowAddSocial(false)
                      setNewSocial({ platform: '', url: '' })
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
