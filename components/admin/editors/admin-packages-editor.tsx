'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp, Plus, Trash2 } from 'lucide-react'
import { useAdmin } from '@/context/admin-context'
import { ImageEditor } from '../image-editor'

type PackageCategory = 'travel' | 'study' | 'work'

export default function AdminPackagesEditor() {
  const { content, updatePackage, deletePackage, addPackage } = useAdmin()
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [showAddPackage, setShowAddPackage] = useState(false)
  const [newPackage, setNewPackage] = useState({
    name: '',
    category: 'travel' as PackageCategory,
    duration: '',
    price: 0,
    description: '',
  })

  const packages = content.packages

  const handleAddPackage = () => {
    if (!newPackage.name.trim() || !newPackage.duration.trim()) return

    const pkg = {
      id: `tmp-${Date.now()}`,
      ...newPackage,
      highlights: [] as string[],
      images: [] as string[],
      itinerary: '',
      included: [] as string[],
      notIncluded: [] as string[],
    }

    addPackage(pkg)
    setNewPackage({
      name: '',
      category: 'travel',
      duration: '',
      price: 0,
      description: '',
    })
    setShowAddPackage(false)
  }

  const handleUpdateField = <K extends keyof (typeof packages)[number]>(
    id: string,
    field: K,
    value: (typeof packages)[number][K]
  ) => {
    updatePackage(id, { [field]: value })
  }

  const updateListItem = (
    id: string,
    key: 'highlights' | 'included' | 'notIncluded',
    index: number,
    value: string
  ) => {
    const pkg = packages.find((p) => p.id === id)
    if (!pkg) return
    const updated = [...pkg[key]]
    updated[index] = value
    updatePackage(id, { [key]: updated })
  }

  const addListItem = (id: string, key: 'highlights' | 'included' | 'notIncluded') => {
    const pkg = packages.find((p) => p.id === id)
    if (!pkg) return
    updatePackage(id, { [key]: [...pkg[key], ''] })
  }

  const removeListItem = (id: string, key: 'highlights' | 'included' | 'notIncluded', index: number) => {
    const pkg = packages.find((p) => p.id === id)
    if (!pkg) return
    updatePackage(id, { [key]: pkg[key].filter((_, i) => i !== index) })
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-foreground">Travel Packages</h2>
        <button
          onClick={() => setShowAddPackage(true)}
          className="px-4 py-2 bg-primary text-white rounded-lg font-medium hover:shadow-lg transition flex items-center gap-2"
        >
          <Plus size={16} /> Add Package
        </button>
      </div>

      {showAddPackage && (
        <div className="bg-white rounded-xl shadow-sm border border-border p-8">
          <h3 className="text-xl font-bold mb-6 text-foreground">Create New Package</h3>

          <div className="space-y-4">
            <input
              type="text"
              value={newPackage.name}
              onChange={(e) => setNewPackage({ ...newPackage, name: e.target.value })}
              placeholder="Package name"
              className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />

            <select
              value={newPackage.category}
              onChange={(e) => setNewPackage({ ...newPackage, category: e.target.value as PackageCategory })}
              className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="travel">Travel</option>
              <option value="study">Study</option>
              <option value="work">Work</option>
            </select>

            <input
              type="text"
              value={newPackage.duration}
              onChange={(e) => setNewPackage({ ...newPackage, duration: e.target.value })}
              placeholder="Duration (e.g., 6 Days / 5 Nights)"
              className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />

            <input
              type="number"
              value={newPackage.price}
              onChange={(e) => setNewPackage({ ...newPackage, price: Number(e.target.value) || 0 })}
              placeholder="Price"
              className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />

            <textarea
              value={newPackage.description}
              onChange={(e) => setNewPackage({ ...newPackage, description: e.target.value })}
              placeholder="Description"
              className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              rows={3}
            />

            <div className="flex gap-2">
              <button
                onClick={handleAddPackage}
                className="flex-1 px-4 py-2 bg-primary text-white rounded-lg font-medium hover:shadow-lg transition"
              >
                Create Package
              </button>
              <button
                onClick={() => setShowAddPackage(false)}
                className="flex-1 px-4 py-2 bg-slate-200 text-foreground rounded-lg font-medium hover:bg-slate-300 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {packages.map((pkg) => (
          <div key={pkg.id} className="bg-white rounded-xl shadow-sm border border-border overflow-hidden">
            <div
              onClick={() => setExpandedId(expandedId === pkg.id ? null : pkg.id)}
              className="w-full px-8 py-6 flex justify-between items-center hover:bg-slate-50 transition cursor-pointer"
            >
              <div className="text-left flex-1">
                <h3 className="text-xl font-bold text-foreground">{pkg.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {pkg.duration} • GHS {pkg.price.toLocaleString()} • {pkg.category}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    deletePackage(pkg.id)
                  }}
                  className="p-2 hover:bg-red-50 rounded-lg transition text-red-600"
                >
                  <Trash2 size={18} />
                </button>
                {expandedId === pkg.id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
              </div>
            </div>

            {expandedId === pkg.id && (
              <div className="border-t border-border px-8 py-6 bg-slate-50 space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">Name</label>
                  <input
                    type="text"
                    value={pkg.name}
                    onChange={(e) => handleUpdateField(pkg.id, 'name', e.target.value)}
                    className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-2">Category</label>
                    <select
                      value={pkg.category}
                      onChange={(e) => handleUpdateField(pkg.id, 'category', e.target.value as PackageCategory)}
                      className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="travel">Travel</option>
                      <option value="study">Study</option>
                      <option value="work">Work</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-2">Duration</label>
                    <input
                      type="text"
                      value={pkg.duration}
                      onChange={(e) => handleUpdateField(pkg.id, 'duration', e.target.value)}
                      className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-2">Price</label>
                    <input
                      type="number"
                      value={pkg.price}
                      onChange={(e) => handleUpdateField(pkg.id, 'price', Number(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">Description</label>
                  <textarea
                    value={pkg.description}
                    onChange={(e) => handleUpdateField(pkg.id, 'description', e.target.value)}
                    className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    rows={3}
                  />
                </div>

                {(['highlights', 'included', 'notIncluded'] as const).map((key) => (
                  <div key={key}>
                    <div className="flex justify-between items-center mb-3">
                      <label className="block text-sm font-semibold text-foreground capitalize">
                        {key === 'notIncluded' ? 'Not Included' : key}
                      </label>
                      <button
                        onClick={() => addListItem(pkg.id, key)}
                        className="text-sm px-2 py-1 bg-primary text-white rounded hover:shadow transition"
                      >
                        Add
                      </button>
                    </div>
                    <div className="space-y-2">
                      {pkg[key].map((item, idx) => (
                        <div key={idx} className="flex gap-2">
                          <input
                            type="text"
                            value={item}
                            onChange={(e) => updateListItem(pkg.id, key, idx, e.target.value)}
                            className="flex-1 px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                          />
                          <button
                            onClick={() => removeListItem(pkg.id, key, idx)}
                            className="p-2 hover:bg-red-50 rounded-lg transition text-red-600"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}

                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">Itinerary</label>
                  <textarea
                    value={pkg.itinerary}
                    onChange={(e) => handleUpdateField(pkg.id, 'itinerary', e.target.value)}
                    className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    rows={5}
                  />
                </div>

                <ImageEditor
                  images={pkg.images}
                  onChange={(images) => handleUpdateField(pkg.id, 'images', images)}
                  maxImages={6}
                  label="Package Images"
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

