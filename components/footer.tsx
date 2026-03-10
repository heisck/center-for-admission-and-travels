"use client"

import Link from "next/link"
import Image from "next/image"
import { Phone, Mail, MapPin, Facebook, Linkedin, Twitter, Instagram, Youtube, Loader2, Globe, Send, Music2, MessageCircle } from "lucide-react"
import { usePublicContent } from "@/context/public-content-context"
import { useState } from "react"
import { toast } from "sonner"
import { normalizePhoneForTel } from "@/lib/contact-utils"
import { detectSocialPlatform, normalizeSocialUrl } from "@/lib/social-links"

export default function Footer() {
  const { content } = usePublicContent()
  const [newsletterEmail, setNewsletterEmail] = useState("")
  const [newsletterLoading, setNewsletterLoading] = useState(false)

  const contact = content?.contact
  const footer = content?.footer
  const phone = contact?.phone?.trim() || ''
  const email = contact?.email?.trim() || ''
  const phoneHref = normalizePhoneForTel(phone)
  const addressParts = [contact?.address?.city, contact?.address?.region, contact?.address?.street].filter(Boolean)
  const latitude = contact?.location?.latitude
  const longitude = contact?.location?.longitude
  const hasCoordinates = Number.isFinite(latitude) && Number.isFinite(longitude)
  const mapsHref = hasCoordinates
    ? `https://www.google.com/maps?q=${latitude},${longitude}`
    : addressParts.length > 0
      ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(addressParts.join(', '))}`
      : ''

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newsletterEmail.trim()) return
    setNewsletterLoading(true)
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: newsletterEmail }),
      })
      const data = await res.json()
      if (data.success) {
        toast.success(data.message)
        setNewsletterEmail("")
      } else {
        toast.error(data.error || "Subscription failed")
      }
    } catch {
      toast.error("Something went wrong. Please try again.")
    } finally {
      setNewsletterLoading(false)
    }
  }

  return (
    <footer className="bg-slate-900 text-white pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-5 gap-8 mb-12">
          {/* Brand + Newsletter */}
          <div className="md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <Image
                src="/images/ca-20logo.png"
                alt="Center for Admission and Travels"
                width={40}
                height={40}
                className="h-10 w-auto"
              />
              <span className="text-sm font-bold">Center for Admission & Travels</span>
            </div>
            <p className="text-slate-400 text-sm mb-6">
              {footer?.companyDescription?.trim() || "Company description not set"}
            </p>
            <form onSubmit={handleNewsletterSubmit} className="space-y-2">
              <label className="text-sm font-semibold block">Stay updated</label>
              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder="Your email"
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  disabled={newsletterLoading}
                  className="flex-1 px-3 py-2 rounded-lg bg-slate-800 border border-slate-600 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                />
                <button
                  type="submit"
                  disabled={newsletterLoading}
                  className="px-4 py-2 bg-primary text-white rounded-lg font-semibold text-sm hover:bg-primary/90 transition disabled:opacity-50 flex items-center gap-2"
                >
                  {newsletterLoading ? <Loader2 size={16} className="animate-spin" /> : "Subscribe"}
                </button>
              </div>
            </form>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-bold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>
                <Link href="/about" className="hover:text-primary transition">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/blog" className="hover:text-primary transition">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="/newsletter" className="hover:text-primary transition">
                  Newsletter
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-primary transition">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="font-bold mb-4">Services</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>
                <Link href="/study-abroad" className="hover:text-primary transition">
                  Study Abroad
                </Link>
              </li>
              <li>
                <Link href="/work-abroad" className="hover:text-primary transition">
                  Work Abroad
                </Link>
              </li>
              <li>
                <Link href="/travel-tours" className="hover:text-primary transition">
                  Travel & Tours
                </Link>
              </li>
              <li>
                <Link href="/global-network" className="hover:text-primary transition">
                  Global Network
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-bold mb-4">Legal</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>
                <Link href="/terms" className="hover:text-primary transition">
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-primary transition">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/refund-policy" className="hover:text-primary transition">
                  Refund Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-bold mb-4">Contact</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start space-x-2 text-slate-400">
                <Phone size={16} className="mt-1 flex-shrink-0 text-primary" />
                {phone && phoneHref ? (
                  <a href={`tel:${phoneHref}`} className="hover:text-primary transition">
                    {phone}
                  </a>
                ) : (
                  <span>Phone not set</span>
                )}
              </li>
              <li className="flex items-start space-x-2 text-slate-400">
                <Mail size={16} className="mt-1 flex-shrink-0 text-primary" />
                {email ? (
                  <a href={`mailto:${email}`} className="break-all hover:text-primary transition">
                    {email}
                  </a>
                ) : (
                  <span>Email not set</span>
                )}
              </li>
              <li className="flex items-start space-x-2 text-slate-400">
                <MapPin size={16} className="mt-1 flex-shrink-0 text-primary" />
                {mapsHref ? (
                  <a
                    href={mapsHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-primary transition"
                    title="Open location in Google Maps"
                  >
                    {addressParts.length > 0 ? addressParts.join(', ') : 'Open in Google Maps'}
                  </a>
                ) : (
                  <span>Address not set</span>
                )}
              </li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-slate-700 pt-8 mb-8">
          <div className="flex justify-between items-center flex-wrap gap-4">
            <p className="text-sm text-slate-400">
              © 2025 Center for Admission and Travels (CFAAT). All rights reserved.
            </p>
            <div className="flex space-x-4">
              {(() => {
                const links = footer?.socialLinks || []
                const seen = new Set<string>()
                const uniqueLinks = links.filter((link) => {
                  if (!link.url?.trim()) return false
                  const key = link.platform?.toLowerCase() || ''
                  if (seen.has(key)) return false
                  seen.add(key)
                  return true
                })

                if (uniqueLinks.length === 0) return null

                const iconMap: Record<string, typeof Facebook> = {
                  facebook: Facebook,
                  linkedin: Linkedin,
                  twitter: Twitter,
                  x: Twitter,
                  instagram: Instagram,
                  youtube: Youtube,
                  tiktok: Music2,
                  whatsapp: MessageCircle,
                  telegram: Send,
                  website: Globe,
                }

                return uniqueLinks.map((link, index) => {
                  const normalizedUrl = normalizeSocialUrl(link.url)
                  if (!normalizedUrl) return null

                  const detectedPlatform = detectSocialPlatform(link.url)
                  const key = detectedPlatform.toLowerCase() || link.platform?.toLowerCase() || 'website'
                  const Icon = iconMap[key] || Facebook
                  return (
                    <a
                      key={`${link.platform}-${index}`}
                      href={normalizedUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-slate-400 hover:text-primary transition"
                      title={detectedPlatform || link.platform || 'Social link'}
                    >
                      <Icon size={20} />
                    </a>
                  )
                })
              })()}
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
