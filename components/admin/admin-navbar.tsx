'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'
import { usePathname } from 'next/navigation'
import { Menu, X } from 'lucide-react'
import { AdminToolbar } from './admin-toolbar'

const ADMIN_NAV_LINKS = [
  { href: '/admin', label: 'Home', mobileLabel: 'Home', exact: true },
  { href: '/admin/about', label: 'About', mobileLabel: 'About' },
  { href: '/admin/study-abroad', label: 'Study', mobileLabel: 'Study Abroad' },
  { href: '/admin/work-abroad', label: 'Work', mobileLabel: 'Work Abroad' },
  { href: '/admin/travel-tours', label: 'Travel', mobileLabel: 'Travel & Tours' },
  { href: '/admin/global-network', label: 'Network', mobileLabel: 'Global Network' },
  { href: '/admin/contact', label: 'Contact & Links', mobileLabel: 'Contact & Social Links' },
  { href: '/admin/legal', label: 'Legal', mobileLabel: 'Legal Pages' },
  { href: '/admin/newsletter', label: 'Newsletter', mobileLabel: 'Newsletter' },
  { href: '/admin/blog', label: 'Blog', mobileLabel: 'Blog' },
  { href: '/admin/payments', label: 'Payments', mobileLabel: 'Payments' },
]

export function AdminNavbar() {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()

  const isActive = (href: string, exact?: boolean) => {
    if (exact) return pathname === href
    return pathname === href || pathname.startsWith(href + '/')
  }

  return (
    <>
      <AdminToolbar />
      <nav className="sticky top-[60px] z-50 bg-white/95 backdrop-blur border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/admin" className="flex items-center">
              <Image
                src="/images/ca-20logo.png"
                alt="Center for Admission and Travels"
                width={45}
                height={45}
                className="h-17 w-auto"
              />
            </Link>

            {/* Desktop Menu */}
            <div className="hidden md:flex space-x-1">
              {ADMIN_NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3 py-2 transition text-sm font-medium ${
                    isActive(link.href, link.exact)
                      ? 'text-orange-600 font-semibold'
                      : 'text-foreground hover:text-orange-600'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            <div className="hidden md:flex gap-3 md:gap-2">
              <Link
                href="/"
                target="_blank"
                className="px-4 md:px-4 py-2 text-primary border border-primary rounded-lg hover:bg-primary hover:text-white transition text-sm font-semibold"
              >
                View Site
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button onClick={() => setIsOpen(!isOpen)} className="md:hidden p-2 hover:bg-muted rounded-lg">
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

          {/* Mobile Menu */}
          {isOpen && (
            <div className="md:hidden pb-4 space-y-2">
              {ADMIN_NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className={`block px-3 py-2 text-sm font-medium ${
                    isActive(link.href, link.exact)
                      ? 'text-orange-600 font-semibold'
                      : 'text-foreground hover:text-orange-600'
                  }`}
                >
                  {link.mobileLabel}
                </Link>
              ))}
              <div className="border-t pt-4 space-y-2 mt-4">
                <Link
                  href="/"
                  target="_blank"
                  onClick={() => setIsOpen(false)}
                  className="block px-4 py-2 text-primary border border-primary rounded-lg text-center font-semibold text-sm"
                >
                  View Site
                </Link>
              </div>
            </div>
          )}
        </div>
      </nav>
    </>
  )
}
