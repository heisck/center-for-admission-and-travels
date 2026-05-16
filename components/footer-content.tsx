import type { ComponentType } from "react"
import Link from "next/link"
import Image from "next/image"
import {
  Phone,
  Mail,
  MapPin,
  Facebook,
  Linkedin,
  Instagram,
  Youtube,
  Globe,
  Send,
  Music2,
  MessageCircle,
} from "lucide-react"

import NewsletterSignupForm from "@/components/newsletter-signup-form"
import { normalizePhoneForTel } from "@/lib/contact-utils"
import type { ContactContent, FooterContent } from "@/lib/public-content"
import { detectSocialPlatform, normalizeSocialUrl } from "@/lib/social-links"

function XBrandIcon({ size = 20, className }: { size?: number; className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      className={className}
      fill="currentColor"
      aria-hidden
    >
      <path d="M18.244 2H21l-6.51 7.44L22.14 22h-6.27l-4.91-6.42L5.29 22H2.53l6.96-7.95L1.91 2h6.43l4.44 5.9L18.24 2Zm-2.2 18h1.53L7.22 3.9H5.58L16.04 20Z" />
    </svg>
  )
}

const iconMap: Record<string, ComponentType<{ size?: number; className?: string }>> = {
  facebook: Facebook,
  linkedin: Linkedin,
  twitter: XBrandIcon,
  x: XBrandIcon,
  instagram: Instagram,
  youtube: Youtube,
  tiktok: Music2,
  whatsapp: MessageCircle,
  telegram: Send,
  website: Globe,
}

export const EMPTY_CONTACT: ContactContent = {
  phone: "",
  email: "",
  address: {
    street: "",
    city: "",
    region: "",
    country: "",
  },
  whatsappNumber: "",
  location: {
    latitude: null,
    longitude: null,
  },
}

export const EMPTY_FOOTER: FooterContent = {
  companyDescription: "",
  socialLinks: [],
}

function getUniqueSocialLinks(links: FooterContent["socialLinks"]) {
  const seen = new Set<string>()

  return (links || []).filter((link) => {
    if (!link.url?.trim()) return false

    const key = (link.platform?.trim().toLowerCase() || detectSocialPlatform(link.url).toLowerCase() || link.url).trim()
    if (seen.has(key)) return false

    seen.add(key)
    return true
  })
}

interface FooterServiceLink {
  href: string
  label: string
}

const DEFAULT_FOOTER_SERVICE_LINKS: FooterServiceLink[] = [
  { href: "/study-abroad", label: "Study Abroad" },
  { href: "/work-abroad", label: "Work Abroad" },
  { href: "/travel-tours", label: "Travel & Tours" },
  { href: "/global-network", label: "Global Network" },
]

interface FooterContentViewProps {
  contact: ContactContent
  footer: FooterContent
  serviceLinks?: FooterServiceLink[]
}

export default function FooterContentView({ contact, footer, serviceLinks }: FooterContentViewProps) {
  const resolvedServiceLinks = serviceLinks ?? DEFAULT_FOOTER_SERVICE_LINKS
  const phone = contact.phone?.trim() || ""
  const email = contact.email?.trim() || ""
  const phoneHref = normalizePhoneForTel(phone)
  const addressParts = [contact.address?.city, contact.address?.region, contact.address?.street].filter(Boolean)
  const latitude = contact.location?.latitude
  const longitude = contact.location?.longitude
  const hasCoordinates =
    typeof latitude === "number" &&
    Number.isFinite(latitude) &&
    typeof longitude === "number" &&
    Number.isFinite(longitude)
  const mapsHref = hasCoordinates
    ? `https://www.google.com/maps?q=${latitude},${longitude}`
    : addressParts.length > 0
      ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(addressParts.join(", "))}`
      : ""
  const socialLinks = getUniqueSocialLinks(footer.socialLinks)

  return (
    <footer className="bg-slate-900 text-white pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-5 gap-8 mb-12">
          <div className="md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <Image
                src="/images/ca-20logo.png"
                alt="Center for Admission and Travels"
                width={64}
                height={64}
                className="h-10 min-[1920px]:h-12 min-[2560px]:h-16 w-auto"
              />
              <span className="text-sm font-bold min-[1920px]:text-base min-[2560px]:text-lg">Center for Admission & Travels</span>
            </div>
            <p className="text-slate-400 text-sm mb-6">
              {footer.companyDescription?.trim() || "Company description not set"}
            </p>
            <NewsletterSignupForm />
          </div>

          <div>
            <h4 className="font-bold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li><Link href="/about" className="hover:text-primary transition">About Us</Link></li>
              <li><Link href="/blog" className="hover:text-primary transition">Blog</Link></li>
              <li><Link href="/newsletter" className="hover:text-primary transition">Newsletter</Link></li>
              <li><Link href="/contact" className="hover:text-primary transition">Contact</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-4">Services</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              {resolvedServiceLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="hover:text-primary transition">{link.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-4">Legal</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li><Link href="/terms" className="hover:text-primary transition">Terms & Conditions</Link></li>
              <li><Link href="/privacy" className="hover:text-primary transition">Privacy Policy</Link></li>
              <li><Link href="/refund-policy" className="hover:text-primary transition">Refund Policy</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-4">Contact</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start space-x-2 text-slate-400">
                <Phone size={16} className="mt-1 flex-shrink-0 text-primary" />
                {phone && phoneHref ? <a href={`tel:${phoneHref}`} className="hover:text-primary transition">{phone}</a> : <span>Phone not set</span>}
              </li>
              <li className="flex items-start space-x-2 text-slate-400">
                <Mail size={16} className="mt-1 flex-shrink-0 text-primary" />
                {email ? <a href={`mailto:${email}`} className="break-all hover:text-primary transition">{email}</a> : <span>Email not set</span>}
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
                    {addressParts.length > 0 ? addressParts.join(", ") : "Open in Google Maps"}
                  </a>
                ) : (
                  <span>Address not set</span>
                )}
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-700 pt-8 mb-8">
          <div className="flex justify-between items-center flex-wrap gap-4">
            <p className="text-sm text-slate-400">
              © 2025 Center for Admission and Travels (CFAAT). All rights reserved.
            </p>
            <div className="flex space-x-4">
              {socialLinks.map((link, index) => {
                const normalizedUrl = normalizeSocialUrl(link.url)
                if (!normalizedUrl) return null

                const detectedPlatform = detectSocialPlatform(link.url)
                const key = detectedPlatform.toLowerCase() || link.platform?.toLowerCase() || "website"
                const Icon = iconMap[key] || Globe

                return (
                  <a
                    key={`${link.platform}-${index}`}
                    href={normalizedUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-slate-400 hover:text-primary transition"
                    title={detectedPlatform || link.platform || "Social link"}
                  >
                    <Icon size={20} />
                  </a>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
