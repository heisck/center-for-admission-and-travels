'use client'

import { useAdmin } from '@/context/admin-context'
import { ImageEditor } from '../image-editor'

export default function AdminServicesEditor() {
  const { content, updateContent } = useAdmin()

  const handleUpdateService = (id: string, field: string, value: any) => {
    const updatedServices = content.services.map((svc) =>
      svc.id === id ? { ...svc, [field]: value } : svc
    )
    updateContent({ services: updatedServices })
  }

  const handleUpdateSection = (serviceId: string, sectionIdx: number, field: string, value: string) => {
    const updatedServices = content.services.map((svc) => {
      if (svc.id === serviceId) {
        const newSections = [...svc.sections]
        newSections[sectionIdx] = { ...newSections[sectionIdx], [field]: value }
        return { ...svc, sections: newSections }
      }
      return svc
    })
    updateContent({ services: updatedServices })
  }

  return (
    <div className="space-y-8">
      {content.services.map((service) => (
        <div key={service.id} className="bg-white rounded-xl shadow-sm border border-border p-8">
          <div className="mb-6">
            <h2 className="text-2xl font-bold mb-4 text-foreground">
              {service.title}
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">Title</label>
                <input
                  type="text"
                  value={service.title}
                  onChange={(e) => handleUpdateService(service.id, 'title', e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">Description</label>
                <textarea
                  value={service.description}
                  onChange={(e) => handleUpdateService(service.id, 'description', e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  rows={3}
                />
              </div>
            </div>
          </div>

          {/* Sections */}
          <div>
            <h3 className="text-xl font-bold mb-4 text-foreground">Content Sections</h3>
            <div className="space-y-4">
              {service.sections.map((section, idx) => (
                <div key={idx} className="bg-slate-50 rounded-lg border border-border p-4">
                  <input
                    type="text"
                    value={section.title}
                    onChange={(e) => handleUpdateSection(service.id, idx, 'title', e.target.value)}
                    placeholder="Section title"
                    className="w-full px-3 py-2 border border-border rounded-lg mb-3 focus:outline-none focus:ring-2 focus:ring-primary font-semibold"
                  />

                  <textarea
                    value={section.content}
                    onChange={(e) => handleUpdateSection(service.id, idx, 'content', e.target.value)}
                    placeholder="Section content"
                    className="w-full px-3 py-2 border border-border rounded-lg mb-3 focus:outline-none focus:ring-2 focus:ring-primary"
                    rows={3}
                  />

                  {section.image && (
                    <div className="mt-3">
                      <ImageEditor
                        images={[section.image]}
                        onChange={(images) => handleUpdateSection(service.id, idx, 'image', images[0] || '')}
                        maxImages={1}
                        label="Section Image"
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
