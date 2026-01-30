'use client'

import { useAdmin } from '@/context/admin-context'
import Footer from '@/components/footer'
import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import { MapPin, Clock, DollarSign, CheckCircle } from 'lucide-react'
import DomeGallery from '@/app/travel-tours/DomeGallery'
import {
  EditableTextWrapper,
  EditableTextareaWrapper,
  EditableListWrapper,
} from '@/components/admin/editable-content'

export default function AdminTravelToursPage() {
  const { content, updateTravelToursHero, updateTravelToursFeatured } = useAdmin()
  const { travelTours } = content
  const [expandedPackage, setExpandedPackage] = useState<string | null>(null)

  const handleFeaturedUpdate = (idx: number, field: string, value: any) => {
    const newFeatured = [...travelTours.featured]
    newFeatured[idx] = { ...newFeatured[idx], [field]: value }
    updateTravelToursFeatured(newFeatured)
  }

  return (
    <main className="min-h-screen bg-background">
      {/* Hero Section - mirrors main travel-tours hero */}
      <section className="py-16 md:py-24 bg-gradient-to-br from-orange-50 to-red-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center mb-12">
            <div className="relative h-80 rounded-2xl overflow-hidden">
              <div style={{ width: '100%', height: '100%' }}>
                <DomeGallery />
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
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {travelTours.featured.map((pkg) => (
              <div
                key={pkg.id}
                className="group bg-white border border-border rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2"
              >
                <div className="h-64 relative overflow-hidden bg-gray-200">
                  {pkg.image && (
                    <Image
                      src={pkg.image}
                      alt={pkg.name}
                      fill
                      className="object-cover object-center group-hover:scale-105 transition-transform duration-300"
                    />
                  )}
                  <div className="absolute inset-0 bg-black/10 group-hover:bg-black/5 transition"></div>
                </div>

                <div className="p-8">
                  <div className="flex items-center gap-2 mb-3">
                    <MapPin className="w-4 h-4 text-primary" />
                    <span className="text-sm font-semibold text-primary uppercase">
                      {pkg.name.split(' ')[0]}
                    </span>
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
                    <div className="flex items-center gap-2 text-foreground">
                      <DollarSign className="w-4 h-4 text-primary" />
                      <span className="text-sm">
                        From $
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
                      <div className="mt-4">
                        <label className="block text-xs font-semibold text-foreground mb-1">
                          Image URL
                        </label>
                        <input
                          type="text"
                          value={pkg.image}
                          onChange={(e) => {
                            const idx = travelTours.featured.findIndex((f) => f.id === pkg.id)
                            handleFeaturedUpdate(idx, 'image', e.target.value)
                          }}
                          className="w-full px-2 py-1 border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                      </div>
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
            {[
              {
                title: 'Expert Planning',
                description: 'Our travel specialists design itineraries tailored to your preferences and budget',
              },
              {
                title: '24/7 Support',
                description: 'Round-the-clock customer service ensures help is always available during your journey',
              },
              {
                title: 'Best Price Guarantee',
                description: 'Competitive pricing with exclusive partnerships for exclusive travel deals',
              },
              {
                title: 'Visa Assistance',
                description: 'Complete visa documentation support and guidance for all destinations',
              },
              {
                title: 'Travel Insurance',
                description: 'Comprehensive travel insurance included to protect your investment',
              },
              {
                title: 'Flexible Booking',
                description: 'Easy modification and cancellation policies for your peace of mind',
              },
            ].map((benefit, idx) => (
              <div key={idx} className="bg-white p-6 rounded-xl shadow-sm hover:shadow-lg transition">
                <h3 className="text-lg font-bold text-primary mb-3">{benefit.title}</h3>
                <p className="text-muted-foreground">{benefit.description}</p>
              </div>
            ))}
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
