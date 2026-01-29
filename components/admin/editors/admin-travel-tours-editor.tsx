'use client'

import { useAdmin } from '@/context/admin-context'
import { ImageEditor } from '../image-editor'
import { Trash2, Plus, ChevronDown, ChevronUp } from 'lucide-react'
import { useState } from 'react'

export default function AdminTravelToursEditor() {
  const { content, updateTravelToursHero, updateTravelToursFeatured } = useAdmin()
  const { travelTours } = content
  const { hero, featured } = travelTours
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id)
  }

  const handleUpdateHero = (key: string, value: string) => {
    updateTravelToursHero({ [key]: value } as any)
  }

  const handleUpdateFeatured = (id: string, key: string, value: any) => {
    const updated = featured.map((item) =>
      item.id === id ? { ...item, [key]: value } : item
    )
    updateTravelToursFeatured(updated)
  }

  const handleAddFeatured = () => {
    const newId = Math.random().toString()
    const newItem = {
      id: newId,
      name: 'New Package',
      description: 'Package description',
      duration: '5 Days',
      price: 999,
      image: '/placeholder.svg',
      highlights: ['Highlight 1', 'Highlight 2'],
    }
    updateTravelToursFeatured([...featured, newItem])
  }

  const handleDeleteFeatured = (id: string) => {
    updateTravelToursFeatured(featured.filter((item) => item.id !== id))
  }

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="bg-white border border-border rounded-xl p-6 space-y-4">
        <h3 className="text-lg font-bold text-foreground">Hero Section</h3>

        <div>
          <label className="block text-sm font-semibold text-foreground mb-2">Title</label>
          <input
            type="text"
            value={hero.title}
            onChange={(e) => handleUpdateHero('title', e.target.value)}
            className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-foreground mb-2">Description</label>
          <textarea
            value={hero.description}
            onChange={(e) => handleUpdateHero('description', e.target.value)}
            rows={4}
            className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-foreground mb-2">Additional Paragraph</label>
          <textarea
            value={hero.paragraph}
            onChange={(e) => handleUpdateHero('paragraph', e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <ImageEditor
          images={[hero.image]}
          onChange={(images) => handleUpdateHero('image', images[0] || '')}
          maxImages={1}
          label="Hero Image"
        />
      </div>

      {/* Featured Packages */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-foreground">Featured Packages</h3>
          <button
            onClick={handleAddFeatured}
            className="p-2 px-4 rounded-lg bg-gradient-to-r from-orange-500 to-red-600 text-white text-sm font-semibold hover:shadow-lg transition flex items-center gap-2"
          >
            <Plus size={16} /> Add Package
          </button>
        </div>

        {featured.map((item) => (
          <div key={item.id} className="bg-white border border-border rounded-xl overflow-hidden">
            {/* Header */}
            <div className="p-4 flex items-center justify-between cursor-pointer hover:bg-slate-50 transition">
              <div className="flex-1" onClick={() => toggleExpand(item.id)}>
                <h4 className="font-semibold text-foreground">{item.name}</h4>
                <p className="text-sm text-muted-foreground">${item.price} • {item.duration}</p>
              </div>
              <button
                onClick={() => toggleExpand(item.id)}
                className="p-2 hover:bg-slate-100 rounded-lg transition"
              >
                {expandedId === item.id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
              </button>
              <button
                onClick={() => handleDeleteFeatured(item.id)}
                className="p-2 hover:bg-red-50 rounded-lg transition text-red-600 ml-2"
              >
                <Trash2 size={18} />
              </button>
            </div>

            {/* Details */}
            {expandedId === item.id && (
              <div className="border-t border-border p-4 space-y-4 bg-slate-50">
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">Name</label>
                  <input
                    type="text"
                    value={item.name}
                    onChange={(e) => handleUpdateFeatured(item.id, 'name', e.target.value)}
                    className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">Description</label>
                  <textarea
                    value={item.description}
                    onChange={(e) => handleUpdateFeatured(item.id, 'description', e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-2">Duration</label>
                    <input
                      type="text"
                      value={item.duration}
                      onChange={(e) => handleUpdateFeatured(item.id, 'duration', e.target.value)}
                      className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-2">Price ($)</label>
                    <input
                      type="number"
                      value={item.price}
                      onChange={(e) => handleUpdateFeatured(item.id, 'price', Number(e.target.value))}
                      className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">Highlights</label>
                  <div className="space-y-2">
                    {item.highlights.map((highlight, idx) => (
                      <div key={idx} className="flex gap-2">
                        <input
                          type="text"
                          value={highlight}
                          onChange={(e) => {
                            const updated = [...item.highlights]
                            updated[idx] = e.target.value
                            handleUpdateFeatured(item.id, 'highlights', updated)
                          }}
                          className="flex-1 px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                        />
                        <button
                          onClick={() => {
                            const updated = item.highlights.filter((_, i) => i !== idx)
                            handleUpdateFeatured(item.id, 'highlights', updated)
                          }}
                          className="p-2 hover:bg-red-50 rounded-lg transition text-red-600"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                    <button
                      onClick={() => {
                        const updated = [...item.highlights, 'New highlight']
                        handleUpdateFeatured(item.id, 'highlights', updated)
                      }}
                      className="w-full py-2 border border-dashed border-border rounded-lg text-sm font-medium text-muted-foreground hover:bg-slate-50 transition"
                    >
                      + Add Highlight
                    </button>
                  </div>
                </div>

                <ImageEditor
                  images={[item.image]}
                  onChange={(images) => handleUpdateFeatured(item.id, 'image', images[0] || '')}
                  maxImages={1}
                  label="Package Image"
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
