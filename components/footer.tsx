"use client"

import Link from "next/link"
import Image from "next/image"
import { Phone, Mail, MapPin, Facebook, Linkedin, Twitter } from "lucide-react"
import { usePublicContent } from "@/context/public-content-context"

export default function Footer() {
  const { content } = usePublicContent()
  
  const contact = content?.contact
  const footer = content?.footer
  return (
    <footer className="bg-slate-900 text-white pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-8 mb-12">
          {/* Brand */}
          <div>
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
            <p className="text-slate-400 text-sm">
              {footer?.companyDescription || "Unlocking global opportunities for education, work, and travel."}
            </p>
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

          {/* Contact */}
          <div>
            <h4 className="font-bold mb-4">Contact</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start space-x-2 text-slate-400">
                <Phone size={16} className="mt-1 flex-shrink-0 text-primary" />
                <a href={`tel:${contact?.phone?.replace(/\s/g, '') || '+233248422663'}`} className="hover:text-primary transition">
                  {contact?.phone || '+233 248 422 663'}
                </a>
              </li>
              <li className="flex items-start space-x-2 text-slate-400">
                <Mail size={16} className="mt-1 flex-shrink-0 text-primary" />
                <a href={`mailto:${contact?.email || 'info@centerforadmissionandtravels.com'}`} className="break-all hover:text-primary transition">
                  {contact?.email || 'info@centerforadmissionandtravels.com'}
                </a>
              </li>
              <li className="flex items-start space-x-2 text-slate-400">
                <MapPin size={16} className="mt-1 flex-shrink-0 text-primary" />
                <span>
                  {contact?.address?.city || 'Tamale'}, {contact?.address?.region || 'Northern Region'}, {contact?.address?.street || 'BA14 Chinkara Street, Gumani'}
                </span>
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
                // Ensure we only show one icon per platform even if the database has duplicates
                const seen = new Set<string>()
                const uniqueLinks = links.filter((link) => {
                  if (seen.has(link.platform)) return false
                  seen.add(link.platform)
                  return true
                })

                if (uniqueLinks.length === 0) {
                  return (
                    <>
                      <a href="#" className="text-slate-400 hover:text-primary transition">
                        <Facebook size={20} />
                      </a>
                      <a href="#" className="text-slate-400 hover:text-primary transition">
                        <Linkedin size={20} />
                      </a>
                      <a href="#" className="text-slate-400 hover:text-primary transition">
                        <Twitter size={20} />
                      </a>
                    </>
                  )
                }

                return uniqueLinks.map((link, index) => {
                  const Icon = link.platform === 'Facebook' ? Facebook : link.platform === 'LinkedIn' ? Linkedin : Twitter
                  return (
                    <a
                      key={link.id || `${link.platform}-${index}`}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-slate-400 hover:text-primary transition"
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
