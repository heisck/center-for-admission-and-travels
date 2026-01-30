'use client'

import { useAdmin } from '@/context/admin-context'
import Footer from '@/components/footer'
import { Phone, Mail, MapPin } from 'lucide-react'
import {
  EditableTextWrapper,
  EditableTextareaWrapper,
} from '@/components/admin/editable-content'

export default function AdminContactPage() {
  const { content, updateContact } = useAdmin()
  const { contact } = content

  return (
    <main className="min-h-screen bg-background">
      {/* Hero */}
      <section className="py-16 md:py-24 bg-gradient-to-br from-orange-50 to-red-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-4 text-foreground">
            Get in Touch
          </h1>
          <p className="text-xl text-muted-foreground">We're here to help you start your global journey</p>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-16">
            {/* Contact Form - Visual Only */}
            <div>
              <h2 className="text-3xl font-bold mb-8 text-foreground">Send us a Message</h2>
              <div className="space-y-6 opacity-60">
                <div className="p-4 border border-border rounded-lg bg-slate-50">
                  <p className="text-sm text-muted-foreground mb-2">Name</p>
                  <div className="h-10 bg-white border border-border rounded"></div>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="p-4 border border-border rounded-lg bg-slate-50">
                    <p className="text-sm text-muted-foreground mb-2">Email</p>
                    <div className="h-10 bg-white border border-border rounded"></div>
                  </div>
                  <div className="p-4 border border-border rounded-lg bg-slate-50">
                    <p className="text-sm text-muted-foreground mb-2">Phone</p>
                    <div className="h-10 bg-white border border-border rounded"></div>
                  </div>
                </div>
                <div className="p-4 border border-border rounded-lg bg-slate-50">
                  <p className="text-sm text-muted-foreground mb-2">Subject</p>
                  <div className="h-10 bg-white border border-border rounded"></div>
                </div>
                <div className="p-4 border border-border rounded-lg bg-slate-50">
                  <p className="text-sm text-muted-foreground mb-2">Message</p>
                  <div className="h-32 bg-white border border-border rounded"></div>
                </div>
                <div className="h-12 bg-gradient-to-r from-orange-500 to-red-600 rounded-lg"></div>
              </div>
              <p className="text-xs text-muted-foreground mt-4 italic">
                Contact form appears on the public site. This is a visual placeholder.
              </p>
            </div>

            {/* Contact Info - Editable */}
            <div className="space-y-8">
              <div>
                <h2 className="text-3xl font-bold mb-8 text-foreground">Contact Information</h2>
              </div>

              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-orange-100 to-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Phone className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-foreground mb-1">Phone</h4>
                    <EditableTextWrapper
                      value={contact.phone}
                      onChange={(value) => updateContact({ phone: value })}
                      variant="body"
                      className="text-muted-foreground"
                    />
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-orange-100 to-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Mail className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-foreground mb-1">Email</h4>
                    <EditableTextWrapper
                      value={contact.email}
                      onChange={(value) => updateContact({ email: value })}
                      variant="body"
                      className="text-muted-foreground break-all"
                    />
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-orange-100 to-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-foreground mb-1">Office Location</h4>
                    <EditableTextWrapper
                      value={contact.address.city}
                      onChange={(value) => updateContact({ address: { ...contact.address, city: value } })}
                      variant="body"
                      className="text-muted-foreground"
                    />
                    <EditableTextWrapper
                      value={contact.address.region}
                      onChange={(value) => updateContact({ address: { ...contact.address, region: value } })}
                      variant="body"
                      className="text-muted-foreground block"
                    />
                    <EditableTextWrapper
                      value={contact.address.street}
                      onChange={(value) => updateContact({ address: { ...contact.address, street: value } })}
                      variant="body"
                      className="text-muted-foreground block"
                    />
                    <EditableTextWrapper
                      value={contact.address.country}
                      onChange={(value) => updateContact({ address: { ...contact.address, country: value } })}
                      variant="body"
                      className="text-muted-foreground block"
                    />
                  </div>
                </div>
              </div>

              {/* WhatsApp CTA */}
              <div className="pt-4 border-t">
                <a
                  href={`https://wa.me/${contact.whatsappNumber.replace(/[^0-9]/g, '')}`}
                  className="w-full inline-flex items-center justify-center px-6 py-3 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-600 transition"
                >
                  Chat on WhatsApp
                </a>
                <div className="mt-2">
                  <label className="block text-xs font-semibold text-foreground mb-1">
                    WhatsApp Number
                  </label>
                  <EditableTextWrapper
                    value={contact.whatsappNumber}
                    onChange={(value) => updateContact({ whatsappNumber: value })}
                    variant="body"
                    className="text-sm"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
