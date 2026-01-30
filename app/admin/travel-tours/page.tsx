'use client'

import { useAdmin } from '@/context/admin-context'
import { AdminToolbar } from '@/components/admin/admin-toolbar'
import { EditableTextWrapper, EditableTextareaWrapper, EditableListWrapper, EditableSection } from '@/components/admin/editable-content'

export default function AdminTravelToursPage() {
  const { content, updateTravelToursHero, updateTravelToursFeatured } = useAdmin()
  const { travelTours } = content

  const handleFeaturedUpdate = (idx: number, field: string, value: any) => {
    const newFeatured = [...travelTours.featured]
    newFeatured[idx] = { ...newFeatured[idx], [field]: value }
    updateTravelToursFeatured(newFeatured)
  }

  return (
    <>
      <AdminToolbar />
      <main className="min-h-screen bg-slate-50 overflow-x-hidden">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6 md:py-8 space-y-6 sm:space-y-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground">Travel Tours Editor</h1>
            <p className="text-muted-foreground mt-2">Manage travel packages and featured tours</p>
          </div>

          {/* Hero Section */}
          <EditableSection title="Travel Tours Hero">
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">Title</label>
                <EditableTextWrapper
                  value={travelTours.hero.title}
                  onChange={(value) => updateTravelToursHero({ title: value })}
                  variant="title"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">Description</label>
                <EditableTextareaWrapper
                  value={travelTours.hero.description}
                  onChange={(value) => updateTravelToursHero({ description: value })}
                  rows={3}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">Paragraph</label>
                <EditableTextareaWrapper
                  value={travelTours.hero.paragraph}
                  onChange={(value) => updateTravelToursHero({ paragraph: value })}
                  rows={2}
                />
              </div>
            </div>
          </EditableSection>

          {/* Featured Tours */}
          <EditableSection title="Featured Tours">
            <div className="space-y-6">
              {travelTours.featured.map((tour, idx) => (
                <div key={idx} className="p-6 bg-slate-100 rounded-lg border border-slate-300 space-y-4">
                  <h4 className="font-semibold text-foreground">Tour {idx + 1}</h4>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-foreground mb-2">Name</label>
                      <input
                        type="text"
                        value={tour.name}
                        onChange={(e) => handleFeaturedUpdate(idx, 'name', e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-foreground mb-2">Price</label>
                      <input
                        type="number"
                        value={tour.price}
                        onChange={(e) => handleFeaturedUpdate(idx, 'price', parseInt(e.target.value))}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-2">Description</label>
                    <textarea
                      value={tour.description}
                      onChange={(e) => handleFeaturedUpdate(idx, 'description', e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      rows={2}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-2">Duration</label>
                    <input
                      type="text"
                      value={tour.duration}
                      onChange={(e) => handleFeaturedUpdate(idx, 'duration', e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-2">Highlights</label>
                    <EditableListWrapper
                      items={tour.highlights}
                      onChange={(highlights) => handleFeaturedUpdate(idx, 'highlights', highlights)}
                      label="Highlights"
                    />
                  </div>
                </div>
              ))}
            </div>
          </EditableSection>
        </div>
      </main>
    </>
  )
}
