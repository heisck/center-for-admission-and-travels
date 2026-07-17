'use client'

import { useAdmin } from '@/context/admin-context'
import Footer from '@/components/footer'
import Link from 'next/link'
import { useState } from 'react'
import { MapPin, Clock, DollarSign, CheckCircle, Plus, Trash2 } from 'lucide-react'
import { EditableImage } from '@/components/admin/editable-image'
import {
  EditableTextWrapper,
  EditableTextareaWrapper,
  EditableListWrapper,
} from '@/components/admin/editable-content'
import DomeGallery from '@/app/travel-tours/DomeGallery'
import { ImageEditor } from '@/components/admin/image-editor'

export default function AdminTravelToursPage() {
  const { content, updateTravelToursHero, updateTravelToursFeatured, updateTravelToursBenefits, updateTravelToursGalleryImages } = useAdmin()
  const { travelTours } = content
  const [expandedPackage, setExpandedPackage] = useState<string | null>(null)
  
  const galleryImages = travelTours.galleryImages || []

  const handleFeaturedUpdate = (idx: number, field: string, value: any) => {
    const newFeatured = [...travelTours.featured]
    newFeatured[idx] = { ...newFeatured[idx], [field]: value }
    updateTravelToursFeatured(newFeatured)
  }

  const handleAddPackage = () => {
    const newPackage = {
      id: Date.now().toString(),
      name: 'New Package',
      description: 'Package description',
      duration: '3 Days',
      price: 500,
      currency: 'GHS',
      image: '',
      highlights: ['Highlight 1', 'Highlight 2'],
    }
    updateTravelToursFeatured([...travelTours.featured, newPackage])
  }

  const handleDeletePackage = (id: string) => {
    if (confirm('Are you sure you want to delete this package?')) {
      updateTravelToursFeatured(travelTours.featured.filter((p) => p.id !== id))
    }
  }

  return (
    <main className="min-h-screen bg-background">
      {/* Hero Section - mirrors main travel-tours hero */}
      <section className="py-16 md:py-24 bg-gradient-to-br from-orange-50 to-red-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center mb-12">
            {/* DomeGallery Animation - mirrors main page exactly */}
            <div className="relative">
              <div className="relative h-80 rounded-2xl overflow-hidden">
                {galleryImages.length > 0 ? (
                  <DomeGallery
                    images={galleryImages.map((img) => ({ src: img, alt: '' }))}
                    autoRotate
                    autoRotateSpeed={0.12}
                  />
                ) : (
                  <div className="w-full h-full bg-slate-200 border-2 border-dashed border-slate-400 flex items-center justify-center text-slate-500 text-sm text-center px-4">
                    No images yet. Add images below to see the animation.
                  </div>
                )}
              </div>
              {/* Image Editor for DomeGallery */}
              <div className="mt-4 p-4 bg-white rounded-lg border border-border">
                <ImageEditor
                  images={galleryImages}
                  onChange={updateTravelToursGalleryImages}
                  maxImages={20}
                  label="Gallery Images (for Dome Animation)"
                />
              </div>
            </div>

            <div>
              <EditableTextWrapper
                value={travelTours.hero.title}
                onChange={(value) => updateTravelToursHero({ title: value })}
                variant="title"
                className="text-4xl sm:text-5xl md:text-6xl font-bold mb-4"
              />
              <EditableTextareaWrapper
                value={travelTours.hero.description}
                onChange={(value) => updateTravelToursHero({ description: value })}
                rows={4}
                className="text-lg text-muted-foreground mb-6 leading-relaxed"
              />
              <EditableTextareaWrapper
                value={travelTours.hero.paragraph}
                onChange={(value) => updateTravelToursHero({ paragraph: value })}
                rows={3}
                className="text-lg text-muted-foreground leading-relaxed"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Featured Packages - mirrors main packages grid */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                Featured Packages
              </span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Choose from our curated destinations and create your perfect travel experience
            </p>
            <button
              onClick={handleAddPackage}
              className="mt-4 px-6 py-2 bg-primary text-white rounded-lg font-semibold hover:shadow-lg transition flex items-center gap-2 mx-auto"
            >
              <Plus size={20} />
              Add Package
            </button>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {travelTours.featured.map((pkg) => (
              <div
                key={pkg.id}
                className="group bg-white border border-border rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2"
              >
                <div className="h-64 relative overflow-hidden bg-gray-200 rounded-t-2xl">
                  <EditableImage
                    src={pkg.image}
                    alt={pkg.name}
                    onChange={(value) => {
                      const idx = travelTours.featured.findIndex((f) => f.id === pkg.id)
                      handleFeaturedUpdate(idx, 'image', value)
                    }}
                    fill
                    className="rounded-t-2xl"
                    objectFit="cover"
                  />
                </div>

                <div className="p-8">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-primary" />
                      <span className="text-sm font-semibold text-primary uppercase">
                        {pkg.name.split(' ')[0]}
                      </span>
                    </div>
                    <button
                      onClick={() => handleDeletePackage(pkg.id)}
                      className="p-2 hover:bg-red-50 rounded-lg transition text-red-600"
                      title="Delete package"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>

                  <EditableTextWrapper
                    value={pkg.name}
                    onChange={(value) => {
                      const idx = travelTours.featured.findIndex((f) => f.id === pkg.id)
                      handleFeaturedUpdate(idx, 'name', value)
                    }}
                    variant="heading"
                    className="text-2xl font-bold mb-3 text-foreground"
                  />
                  <EditableTextareaWrapper
                    value={pkg.description}
                    onChange={(value) => {
                      const idx = travelTours.featured.findIndex((f) => f.id === pkg.id)
                      handleFeaturedUpdate(idx, 'description', value)
                    }}
                    rows={2}
                    className="text-muted-foreground text-sm mb-6"
                  />

                  <div className="space-y-3 mb-6">
                    <div className="flex items-center gap-2 text-foreground">
                      <Clock className="w-4 h-4 text-primary" />
                      <EditableTextWrapper
                        value={pkg.duration}
                        onChange={(value) => {
                          const idx = travelTours.featured.findIndex((f) => f.id === pkg.id)
                          handleFeaturedUpdate(idx, 'duration', value)
                        }}
                        variant="body"
                        className="text-sm"
                      />
                    </div>
                    <div className="flex items-center gap-2 text-foreground flex-wrap">
                      <DollarSign className="w-4 h-4 text-primary" />
                      <span className="text-sm">
                        From{' '}
                        <select
                          value={pkg.currency || 'GHS'}
                          onChange={(e) => {
                            const idx = travelTours.featured.findIndex((f) => f.id === pkg.id)
                            handleFeaturedUpdate(idx, 'currency', e.target.value)
                          }}
                          className="mx-1 px-1 py-0.5 border border-border rounded text-sm bg-white"
                        >
                          <option value="GHS">GHS</option>
                          <option value="USD">USD</option>
                          <option value="EUR">EUR</option>
                          <option value="GBP">GBP</option>
                        </select>
                        <EditableTextWrapper
                          value={pkg.price.toString()}
                          onChange={(value) => {
                            const idx = travelTours.featured.findIndex((f) => f.id === pkg.id)
                            handleFeaturedUpdate(idx, 'price', parseInt(value) || 0)
                          }}
                          variant="body"
                          className="inline"
                        />{' '}
                        per person
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2 mb-6">
                    {pkg.highlights.slice(0, 3).map((h, i) => (
                      <div key={i} className="flex items-start space-x-2 text-sm">
                        <CheckCircle className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                        <EditableTextWrapper
                          value={h}
                          onChange={(value) => {
                            const idx = travelTours.featured.findIndex((f) => f.id === pkg.id)
                            const newHighlights = [...pkg.highlights]
                            newHighlights[i] = value
                            handleFeaturedUpdate(idx, 'highlights', newHighlights)
                          }}
                          variant="body"
                          className="text-foreground flex-1"
                        />
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={() => setExpandedPackage(expandedPackage === pkg.id ? null : pkg.id)}
                    className="w-full mb-3 px-4 py-2 border border-primary text-primary rounded-lg text-sm font-semibold hover:bg-primary hover:text-white transition"
                  >
                    {expandedPackage === pkg.id ? 'Hide Details' : 'View Details'}
                  </button>

                  <Link
                    href={`/checkout?id=${pkg.id}`}
                    className="w-full inline-block px-4 py-3 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-lg text-center font-semibold hover:shadow-lg transition"
                  >
                    Book Package
                  </Link>

                  {expandedPackage === pkg.id && (
                    <div className="mt-6 pt-6 border-t border-border animate-fade-in">
                      <h4 className="font-bold text-foreground mb-3">All Highlights</h4>
                      <EditableListWrapper
                        items={pkg.highlights}
                        onChange={(highlights) => {
                          const idx = travelTours.featured.findIndex((f) => f.id === pkg.id)
                          handleFeaturedUpdate(idx, 'highlights', highlights)
                        }}
                        label="Highlights"
                        placeholder="Add highlight"
                      />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Section */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center mb-12">
            <span className="bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
              Why Choose CFAAT for Your Travel?
            </span>
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            {travelTours.benefits?.map((benefit, idx) => (
              <div key={benefit.id || idx} className="bg-white p-6 rounded-xl shadow-sm hover:shadow-lg transition relative">
                <button
                  onClick={() => {
                    if (confirm('Are you sure you want to delete this benefit?')) {
                      const newBenefits = travelTours.benefits.filter((_, i) => i !== idx)
                      updateTravelToursBenefits(newBenefits)
                    }
                  }}
                  className="absolute top-4 right-4 p-1 text-red-500 hover:text-red-700 transition"
                  title="Delete benefit"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <EditableTextWrapper
                  value={benefit.title}
                  onChange={(value) => {
                    const newBenefits = [...travelTours.benefits]
                    newBenefits[idx] = { ...newBenefits[idx], title: value }
                    updateTravelToursBenefits(newBenefits)
                  }}
                  variant="title"
                  className="text-lg font-bold text-primary mb-3 pr-8"
                />
                <EditableTextareaWrapper
                  value={benefit.description}
                  onChange={(value) => {
                    const newBenefits = [...travelTours.benefits]
                    newBenefits[idx] = { ...newBenefits[idx], description: value }
                    updateTravelToursBenefits(newBenefits)
                  }}
                  rows={2}
                  className="text-muted-foreground"
                />
              </div>
            ))}
          </div>

          <div className="mt-8 text-center">
            <button
              onClick={() => {
                const newBenefits = [
                  ...travelTours.benefits,
                  {
                    id: Date.now().toString(),
                    title: 'New Benefit',
                    description: 'Benefit description',
                  },
                ]
                updateTravelToursBenefits(newBenefits)
              }}
              className="px-4 py-2 border border-primary text-primary rounded-lg text-sm font-semibold hover:bg-primary hover:text-white transition flex items-center gap-2 mx-auto"
            >
              <Plus className="w-4 h-4" />
              Add Benefit
            </button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-orange-500 to-red-600 rounded-2xl p-12 text-center text-white">
            <h2 className="text-4xl font-bold mb-4">Ready to Explore the World?</h2>
            <p className="text-lg mb-8 max-w-2xl mx-auto">
              Don't see your dream destination? Contact our travel specialists to create a custom package just for you.
            </p>
            <Link
              href="/admin/contact"
              className="inline-block px-8 py-4 bg-white text-primary rounded-lg font-bold hover:shadow-lg transition"
            >
              Create Custom Package
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
