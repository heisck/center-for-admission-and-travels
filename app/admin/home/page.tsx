'use client'

import { useAdmin } from '@/context/admin-context'
import { AdminToolbar } from '@/components/admin/admin-toolbar'
import {
  EditableTextWrapper,
  EditableTextareaWrapper,
  EditableImageListWrapper,
  EditableListWrapper,
  EditableSection,
} from '@/components/admin/editable-content'
import { Globe, Briefcase, Plane, GraduationCap } from 'lucide-react'

export default function AdminHomePage() {
  const { content, updateHomeHero, updateServices } = useAdmin()
  const { hero, services } = content.home

  return (
    <>
      <AdminToolbar />

      <main className="min-h-screen bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
          {/* Page Title */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground">Home Page Editor</h1>
            <p className="text-muted-foreground mt-2">
              Edit all content for your home page. Changes are saved automatically.
            </p>
          </div>

          {/* Hero Section Editor */}
          <EditableSection title="Hero Section">
            <div className="space-y-6">
              {/* Main Title */}
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">
                  Main Title
                </label>
                <EditableTextWrapper
                  value={hero.title}
                  onChange={(value) => updateHomeHero({ title: value })}
                  variant="title"
                />
              </div>

              {/* Subtitle */}
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">
                  Subtitle
                </label>
                <EditableTextWrapper
                  value={hero.subtitle}
                  onChange={(value) => updateHomeHero({ subtitle: value })}
                  variant="subtitle"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">
                  Description
                </label>
                <EditableTextareaWrapper
                  value={hero.description}
                  onChange={(value) => updateHomeHero({ description: value })}
                  rows={3}
                />
              </div>

              {/* CTA Text */}
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">
                    Primary CTA Text
                  </label>
                  <EditableTextWrapper
                    value={hero.cta1Text}
                    onChange={(value) => updateHomeHero({ cta1Text: value })}
                    variant="body"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">
                    Secondary CTA Text
                  </label>
                  <EditableTextWrapper
                    value={hero.cta2Text}
                    onChange={(value) => updateHomeHero({ cta2Text: value })}
                    variant="body"
                  />
                </div>
              </div>

              {/* Stats */}
              <div>
                <label className="block text-sm font-semibold text-foreground mb-4">
                  Stats
                </label>
                <div className="space-y-4">
                  {hero.stats.map((stat, idx) => (
                    <div key={idx} className="grid md:grid-cols-2 gap-4 p-4 bg-slate-100 rounded-lg">
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-2">
                          Value
                        </label>
                        <input
                          type="text"
                          value={stat.value}
                          onChange={(e) => {
                            const newStats = [...hero.stats]
                            newStats[idx] = { ...stat, value: e.target.value }
                            updateHomeHero({ stats: newStats })
                          }}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-2">
                          Label
                        </label>
                        <input
                          type="text"
                          value={stat.label}
                          onChange={(e) => {
                            const newStats = [...hero.stats]
                            newStats[idx] = { ...stat, label: e.target.value }
                            updateHomeHero({ stats: newStats })
                          }}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Hero Images */}
              <div>
                <label className="block text-sm font-semibold text-foreground mb-4">
                  Hero Images
                </label>
                <EditableImageListWrapper
                  images={hero.images}
                  onChange={(images) => updateHomeHero({ images })}
                  maxImages={6}
                  label="Hero Images"
                />
              </div>
            </div>
          </EditableSection>

          {/* Services Section Editor */}
          <EditableSection title="Services">
            <div className="space-y-6">
              <p className="text-muted-foreground text-sm">
                Edit each service card below. Services are displayed in a 2x2 grid on the home page.
              </p>

              {services.map((service, idx) => (
                <div
                  key={idx}
                  className="p-6 bg-slate-100 rounded-lg border border-slate-300 space-y-4"
                >
                  <div className="flex items-center justify-between mb-4 pb-4 border-b border-slate-300">
                    <h4 className="font-semibold text-foreground">Service {idx + 1}</h4>
                    <span className="text-xs bg-primary text-white px-3 py-1 rounded-full">
                      {service.id}
                    </span>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-2">
                      Title
                    </label>
                    <EditableTextWrapper
                      value={service.title}
                      onChange={(value) => {
                        const newServices = [...services]
                        newServices[idx] = { ...service, title: value }
                        updateServices(newServices)
                      }}
                      variant="heading"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-2">
                      Description
                    </label>
                    <EditableTextareaWrapper
                      value={service.description}
                      onChange={(value) => {
                        const newServices = [...services]
                        newServices[idx] = { ...service, description: value }
                        updateServices(newServices)
                      }}
                      rows={2}
                    />
                  </div>
                </div>
              ))}
            </div>
          </EditableSection>

          {/* Preview Note */}
          <div className="p-6 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="font-semibold text-blue-900 mb-2">Tips for Editing:</h3>
            <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
              <li>Click on any text to edit it inline</li>
              <li>Use the Undo/Redo buttons to revert changes</li>
              <li>Click Reset to return to default content</li>
              <li>All changes are automatically tracked in history</li>
            </ul>
          </div>
        </div>
      </main>
    </>
  )
}
