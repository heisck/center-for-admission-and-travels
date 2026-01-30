'use client'

import { useAdmin } from '@/context/admin-context'
import Footer from '@/components/footer'
import { Phone, Mail, MapPin } from 'lucide-react'
import { useState } from 'react'
import {
  EditableTextWrapper,
  EditableTextareaWrapper,
} from '@/components/admin/editable-content'

export default function AdminContactPage() {
  const { content, updateContact } = useAdmin()
  const { contact } = content
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  })
  const [submitted, setSubmitted] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
    setTimeout(() => setSubmitted(false), 5000)
    setFormData({ name: '', email: '', phone: '', subject: '', message: '' })
  }

  return (
    <main className="min-h-screen bg-background">
      {/* Hero */}
      <section className="py-16 md:py-24 bg-gradient-to-br from-orange-50 to-red-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <EditableTextWrapper
            value="Get in Touch"
            onChange={() => {}}
            variant="title"
            className="text-4xl sm:text-5xl md:text-6xl font-bold mb-4"
          />
          <p className="text-xl text-muted-foreground">We're here to help you start your global journey</p>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-16">
            {/* Contact Form */}
            <div>
              <h2 className="text-3xl font-bold mb-8 text-foreground">Send us a Message</h2>
              {submitted && (
                <div className="mb-6 p-4 bg-green-100 border border-green-300 text-green-700 rounded-lg">
                  Thank you! We'll get back to you soon.
                </div>
              )}
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Your name"
                  />
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-2">Email</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="Your email"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-2">Phone</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="Your phone"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">Subject</label>
                  <select
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="">Select subject</option>
                    <option value="study">Study Abroad</option>
                    <option value="work">Work Abroad</option>
                    <option value="travel">Travel & Tours</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">Message</label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={6}
                    className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Your message"
                  ></textarea>
                </div>
                <button
                  type="submit"
                  className="w-full px-6 py-3 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-lg font-semibold hover:shadow-lg transition"
                >
                  Send Message
                </button>
              </form>
            </div>

            {/* Contact Info */}
            <div className="space-y-8">
              <div>
                <h2 className="text-3xl font-bold mb-8 text-foreground">Contact Information</h2>
              </div>

              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-orange-100 to-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Phone className="w-6 h-6 text-primary" />
                  </div>
                  <div>
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
                  <div>
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
                  <div>
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
                  <input
                    type="text"
                    value={contact.whatsappNumber}
                    onChange={(e) => updateContact({ whatsappNumber: e.target.value })}
                    className="w-full px-2 py-1 border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-primary"
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
