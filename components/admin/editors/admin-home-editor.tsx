'use client'

import { useAdmin } from '@/context/admin-context'
import { EditableText } from '../editable-text'
import { ImageEditor } from '../image-editor'
import { Trash2, Plus } from 'lucide-react'
import { useState } from 'react'

export default function AdminHomeEditor() {
  const { content, updateHomeHero, updateServices } = useAdmin()
  const [showAddService, setShowAddService] = useState(false)
  const [newService, setNewService] = useState({
    id: '',
    icon: 'Plus',
    title: '',
    description: '',
  })

  const hero = content.home.hero
  const services = content.home.services

  const ROUTE_OPTIONS = [
    { value: '/study-abroad', label: 'Study Abroad' },
    { value: '/work-abroad', label: 'Work Abroad' },
    { value: '/travel-tours', label: 'Travel & Tours' },
    { value: '/global-network', label: 'Global Network' },
  ] as const

  const handleAddService = () => {
    if (newService.title.trim()) {
      const service = {
        ...newService,
        id: Date.now().toString(),
        // Pin public URL by slot so title renames never 404
        route: ROUTE_OPTIONS[services.length]?.value || ROUTE_OPTIONS[0].value,
      }
      updateServices([...services, service])
      setNewService({ id: '', icon: 'Plus', title: '', description: '' })
      setShowAddService(false)
    }
  }

  const handleDeleteService = (id: string) => {
    updateServices(services.filter((s) => s.id !== id))
  }

  const handleUpdateService = (id: string, field: string, value: string) => {
    const updated = services.map((s) =>
      s.id === id ? { ...s, [field]: value } : s
    )
    updateServices(updated)
  }

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="bg-white rounded-xl shadow-sm border border-border p-8">
        <h2 className="text-2xl font-bold mb-6 text-foreground">Hero Section</h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-foreground mb-2">Main Title</label>
            <EditableText
              value={hero.title}
              onChange={(value) => updateHomeHero({ title: value })}
              variant="title"
              fontSize="2xl"
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-foreground mb-2">Subtitle</label>
            <EditableText
              value={hero.subtitle}
              onChange={(value) => updateHomeHero({ subtitle: value })}
              variant="subtitle"
              fontSize="xl"
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-foreground mb-2">Description</label>
            <textarea
              value={hero.description}
              onChange={(e) => updateHomeHero({ description: e.target.value })}
              className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">CTA 1 Text</label>
              <input
                type="text"
                value={hero.cta1Text}
                onChange={(e) => updateHomeHero({ cta1Text: e.target.value })}
                className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          <div>
            <label className="block text-sm font-semibold text-foreground mb-2">CTA 2 Text</label>
            <input
              type="text"
              value={hero.cta2Text}
              onChange={(e) => updateHomeHero({ cta2Text: e.target.value })}
              className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <ImageEditor
            images={hero.images}
            onChange={(images) => updateHomeHero({ images })}
            maxImages={6}
            label="Hero Section Images"
          />
        </div>

          <div>
            <label className="block text-sm font-semibold text-foreground mb-3">Statistics</label>
            <div className="space-y-3">
              {hero.stats.map((stat, idx) => (
                <div key={idx} className="flex gap-3">
                  <input
                    type="text"
                    value={stat.value}
                    onChange={(e) => {
                      const newStats = [...hero.stats]
                      newStats[idx].value = e.target.value
                      updateHomeHero({ stats: newStats })
                    }}
                    placeholder="Value"
                    className="flex-1 px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <input
                    type="text"
                    value={stat.label}
                    onChange={(e) => {
                      const newStats = [...hero.stats]
                      newStats[idx].label = e.target.value
                      updateHomeHero({ stats: newStats })
                    }}
                    placeholder="Label (e.g., Success Stories)"
                    className="flex-1 px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Services Section */}
      <div className="bg-white rounded-xl shadow-sm border border-border p-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-foreground">Services</h2>
          <button
            onClick={() => setShowAddService(true)}
            className="px-4 py-2 bg-primary text-white rounded-lg font-medium hover:shadow-lg transition flex items-center gap-2"
          >
            <Plus size={16} /> Add Service
          </button>
        </div>

        <p className="text-sm text-muted-foreground mb-4">
          Titles and descriptions are free-form. Public URLs stay stable via the
          &quot;Links to&quot; route below — not the title text.
        </p>
        <div className="space-y-4">
          {services.map((service, idx) => (
            <div key={service.id} className="border border-border rounded-lg p-4">
              <div className="flex justify-between items-start mb-3">
                <input
                  type="text"
                  value={service.title}
                  onChange={(e) => handleUpdateService(service.id, 'title', e.target.value)}
                  className="text-lg font-semibold px-2 py-1 border border-border rounded flex-1 focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <button
                  onClick={() => handleDeleteService(service.id)}
                  className="p-2 hover:bg-red-50 rounded-lg transition text-red-600 ml-2"
                >
                  <Trash2 size={18} />
                </button>
              </div>
              <textarea
                value={service.description}
                onChange={(e) => handleUpdateService(service.id, 'description', e.target.value)}
                placeholder="Service description"
                className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                rows={2}
              />
              <div className="mt-3 flex items-center gap-2 text-xs">
                <label className="text-muted-foreground font-medium shrink-0">Links to:</label>
                <select
                  value={service.route || ROUTE_OPTIONS[idx]?.value || ROUTE_OPTIONS[0].value}
                  onChange={(e) => handleUpdateService(service.id, 'route', e.target.value)}
                  className="px-2 py-1 border border-border rounded bg-white text-foreground font-mono flex-1"
                >
                  {ROUTE_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.value} ({opt.label})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          ))}
        </div>

        {showAddService && (
          <div className="mt-4 border border-border rounded-lg p-4 bg-slate-50">
            <input
              type="text"
              value={newService.title}
              onChange={(e) => setNewService({ ...newService, title: e.target.value })}
              placeholder="Service title"
              className="w-full px-3 py-2 border border-border rounded-lg mb-3 focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <textarea
              value={newService.description}
              onChange={(e) => setNewService({ ...newService, description: e.target.value })}
              placeholder="Service description"
              className="w-full px-3 py-2 border border-border rounded-lg mb-3 focus:outline-none focus:ring-2 focus:ring-primary"
              rows={2}
            />
            <div className="flex gap-2">
              <button
                onClick={handleAddService}
                className="flex-1 px-4 py-2 bg-primary text-white rounded-lg font-medium hover:shadow-lg transition"
              >
                Add Service
              </button>
              <button
                onClick={() => setShowAddService(false)}
                className="flex-1 px-4 py-2 bg-slate-200 text-foreground rounded-lg font-medium hover:bg-slate-300 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
