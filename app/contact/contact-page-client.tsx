'use client'

import type React from "react"
import { useState } from "react"
import { Loader2, Mail, MapPin, Phone } from "lucide-react"
import { toast } from "sonner"

import { buildWhatsAppUrl, normalizePhoneForTel } from "@/lib/contact-utils"
import type { ContactContent } from "@/lib/public-content"

interface ContactPageClientProps {
  contact: ContactContent
}

export default function ContactPageClient({ contact }: ContactPageClientProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  })
  const [submitting, setSubmitting] = useState(false)

  const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [event.target.name]: event.target.value })
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setSubmitting(true)
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || "Failed to send message")
      toast.success("Message sent! We'll get back to you soon.")
      setFormData({ name: "", email: "", phone: "", subject: "", message: "" })
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Something went wrong. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  const phone = contact.phone?.trim() || ""
  const phoneHref = normalizePhoneForTel(phone)
  const email = contact.email?.trim() || ""
  const city = contact.address?.city?.trim() || ""
  const region = contact.address?.region?.trim() || ""
  const street = contact.address?.street?.trim() || ""
  const country = contact.address?.country?.trim() || ""
  const whatsappHref = buildWhatsAppUrl(contact.whatsappNumber)
  const latitude = contact.location?.latitude
  const longitude = contact.location?.longitude
  const hasCoordinates = Number.isFinite(latitude) && Number.isFinite(longitude)
  const mapsHref = hasCoordinates
    ? `https://www.google.com/maps?q=${latitude},${longitude}`
    : [street, city, region, country].filter(Boolean).length > 0
      ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent([street, city, region, country].filter(Boolean).join(', '))}`
      : ""

  return (
    <>
      <section className="py-16 md:py-24 bg-gradient-to-br from-orange-50 to-red-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-4">
            <span className="bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
              Get in Touch
            </span>
          </h1>
          <p className="text-xl text-muted-foreground">We're here to help you start your global journey</p>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-16">
            <div>
              <h2 className="text-3xl font-bold mb-8 text-foreground">Send us a Message</h2>
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
                  disabled={submitting}
                  className="w-full px-6 py-3 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-lg font-semibold hover:shadow-lg transition disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {submitting && <Loader2 className="w-5 h-5 animate-spin" />}
                  {submitting ? "Sending..." : "Send Message"}
                </button>
              </form>
            </div>

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
                    {phone && phoneHref ? (
                      <a href={`tel:${phoneHref}`} className="text-muted-foreground hover:text-primary transition">
                        {phone}
                      </a>
                    ) : (
                      <p className="text-muted-foreground">Phone not set</p>
                    )}
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-orange-100 to-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Mail className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-bold text-foreground mb-1">Email</h4>
                    {email ? (
                      <a href={`mailto:${email}`} className="text-muted-foreground break-all hover:text-primary transition">
                        {email}
                      </a>
                    ) : (
                      <p className="text-muted-foreground">Email not set</p>
                    )}
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-orange-100 to-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-bold text-foreground mb-1">Office Location</h4>
                    {(city || region) && <p className="text-muted-foreground">{[city, region].filter(Boolean).join(', ')}</p>}
                    {street && <p className="text-muted-foreground">{street}</p>}
                    {country && <p className="text-muted-foreground">{country}</p>}
                    {!city && !region && !street && !country && <p className="text-muted-foreground">Address not set</p>}
                    {mapsHref ? (
                      <a
                        href={mapsHref}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block mt-2 text-primary font-semibold hover:underline"
                      >
                        Open in Google Maps
                      </a>
                    ) : null}
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t">
                {whatsappHref ? (
                  <a
                    href={whatsappHref}
                    className="w-full inline-flex items-center justify-center px-6 py-3 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-600 transition"
                  >
                    Chat on WhatsApp
                  </a>
                ) : (
                  <button
                    type="button"
                    disabled
                    className="w-full inline-flex items-center justify-center px-6 py-3 bg-slate-200 text-slate-500 rounded-lg font-semibold cursor-not-allowed"
                  >
                    WhatsApp Not Configured
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
