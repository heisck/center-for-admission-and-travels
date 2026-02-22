"use client"

import { useScrollToTop } from "@/hooks/use-scroll-to-top"
import type React from "react"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import Image from "next/image"
import { Phone, Mail, MapPin, Loader2 } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"
import { usePublicContent } from "@/context/public-content-context"

export default function Contact() {
  useScrollToTop()
  const { content, loading } = usePublicContent()
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  })
  const [submitting, setSubmitting] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to send message")
      toast.success("Message sent! We'll get back to you soon.")
      setFormData({ name: "", email: "", phone: "", subject: "", message: "" })
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </main>
    )
  }

  const contact = content?.contact

  return (
    <main className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
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
            {/* Contact Form */}
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

            {/* Contact Info & Team Images */}
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
                    <a href={`tel:${contact?.phone?.replace(/\s/g, '') || '+233248422663'}`} className="text-muted-foreground hover:text-primary transition">
                      {contact?.phone || '+233 248 422 663'}
                    </a>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-orange-100 to-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Mail className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-bold text-foreground mb-1">Email</h4>
                    <a href={`mailto:${contact?.email || 'info@centerforadmissionandtravels.com'}`} className="text-muted-foreground break-all hover:text-primary transition">
                      {contact?.email || 'info@centerforadmissionandtravels.com'}
                    </a>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-orange-100 to-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-bold text-foreground mb-1">Office Location</h4>
                    <p className="text-muted-foreground">{contact?.address?.city || 'Tamale'}, {contact?.address?.region || 'Northern Region'}</p>
                    <p className="text-muted-foreground">{contact?.address?.street || 'BA14 Chinkara Street, Gumani'}</p>
                    <p className="text-muted-foreground">{contact?.address?.country || 'Ghana'}</p>
                  </div>
                </div>
              </div>

              {/* <div className="pt-8 border-t">
                <h3 className="text-lg font-bold text-foreground mb-6">Our Team</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="relative h-32 rounded-lg overflow-hidden shadow-md">
                    <Image src="/images/founder.jpg" alt="George" fill className="object-cover object-top" />
                  </div>
                  <div className="relative h-32 rounded-lg overflow-hidden shadow-md">
                    <Image src="/images/team1.jpg" alt="Sadat" fill className="object-cover object-top" />
                  </div>
                  <div className="relative h-32 rounded-lg overflow-hidden shadow-md">
                    <Image
                      src="/images/thisshouldbeintegrated1.jpg"
                      alt="Drake"
                      fill
                      className="object-cover object-top"
                    />
                  </div>
                  <div className="relative h-32 rounded-lg overflow-hidden shadow-md">
                    <Image src="/images/team3.jpg" alt="Esther" fill className="object-cover object-top" />
                  </div>
                </div>
              </div> */}

              {/* WhatsApp CTA */}
              <div className="pt-4 border-t">
                <a
                  href={`https://wa.me/${contact?.whatsappNumber?.replace(/\s/g, '').replace('+', '') || '233248422663'}`}
                  className="w-full inline-flex items-center justify-center px-6 py-3 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-600 transition"
                >
                  Chat on WhatsApp
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
