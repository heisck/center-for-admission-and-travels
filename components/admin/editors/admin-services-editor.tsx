'use client'

import { useAdmin } from '@/context/admin-context'
import { ImageEditor } from '../image-editor'

export default function AdminServicesEditor() {
  const { content, updateServicePage } = useAdmin()

  if (content.servicePages.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center text-muted-foreground">
        No service pages found in the database yet.
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {content.servicePages.map((service) => (
        <div key={service.id} className="bg-white rounded-xl shadow-sm border border-border p-8">
          <div className="mb-6">
            <h2 className="text-2xl font-bold mb-4 text-foreground">
              {service.title || service.id}
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              <label className="block">
                <span className="block text-sm font-semibold text-foreground mb-2">Title</span>
                <input
                  type="text"
                  value={service.title}
                  onChange={(e) => updateServicePage(service.id, { title: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </label>

              <label className="block">
                <span className="block text-sm font-semibold text-foreground mb-2">Route</span>
                <input
                  type="text"
                  value={service.route}
                  onChange={(e) => updateServicePage(service.id, { route: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </label>
            </div>

            <label className="block mt-4">
              <span className="block text-sm font-semibold text-foreground mb-2">Description</span>
              <textarea
                value={service.description}
                onChange={(e) => updateServicePage(service.id, { description: e.target.value })}
                className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                rows={3}
              />
            </label>
          </div>

          <div className="space-y-4">
            <h3 className="text-xl font-bold text-foreground">Hero</h3>
            <label className="block">
              <span className="block text-sm font-semibold text-foreground mb-2">Banner Title</span>
              <input
                type="text"
                value={service.bannerTitle}
                onChange={(e) => updateServicePage(service.id, { bannerTitle: e.target.value })}
                className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </label>

            <label className="block">
              <span className="block text-sm font-semibold text-foreground mb-2">Banner Subtitle</span>
              <textarea
                value={service.bannerSubtitle}
                onChange={(e) => updateServicePage(service.id, { bannerSubtitle: e.target.value })}
                className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                rows={3}
              />
            </label>

            <ImageEditor
              images={service.heroImage ? [service.heroImage] : []}
              onChange={(images) => updateServicePage(service.id, { heroImage: images[0] || '' })}
              maxImages={1}
              label="Hero Image"
            />
          </div>

          <label className="block mt-6">
            <span className="block text-sm font-semibold text-foreground mb-2">Overview</span>
            <textarea
              value={service.overview || ''}
              onChange={(e) => updateServicePage(service.id, { overview: e.target.value })}
              className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              rows={4}
            />
          </label>
        </div>
      ))}
    </div>
  )
}
