'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { Menu, X } from 'lucide-react'
import { AdminToolbar } from './admin-toolbar'

interface NavLink {
  href: string
  label: string
  mobileLabel: string
  exact?: boolean
  badgeKey?: 'messages' | 'payments' | 'pendingPayments'
}

const ADMIN_NAV_LINKS: NavLink[] = [
  { href: '/admin', label: 'Home', mobileLabel: 'Home', exact: true },
  { href: '/admin/about', label: 'About', mobileLabel: 'About' },
  { href: '/admin/packages', label: 'Packages', mobileLabel: 'Packages' },
  { href: '/admin/study-abroad', label: 'Study', mobileLabel: 'Study Abroad' },
  { href: '/admin/work-abroad', label: 'Work', mobileLabel: 'Work Abroad' },
  { href: '/admin/travel-tours', label: 'Travel', mobileLabel: 'Travel & Tours' },
  { href: '/admin/global-network', label: 'Services', mobileLabel: 'Professional Services' },
  { href: '/admin/contact', label: 'Contact & Links', mobileLabel: 'Contact & Social Links' },
  { href: '/admin/contact-messages', label: 'Messages', mobileLabel: 'Contact Messages', badgeKey: 'messages' },
  { href: '/admin/legal', label: 'Legal', mobileLabel: 'Legal Pages' },
  { href: '/admin/newsletter', label: 'Newsletter', mobileLabel: 'Newsletter' },
  { href: '/admin/blog', label: 'Blog', mobileLabel: 'Blog' },
  { href: '/admin/media', label: 'Media', mobileLabel: 'Media Cleanup' },
  { href: '/admin/payments', label: 'Payments', mobileLabel: 'Payments', badgeKey: 'payments' },
  { href: '/admin/profile', label: 'Profile', mobileLabel: 'Admin Profile' },
]

export function AdminNavbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [badges, setBadges] = useState<{ unreadMessages: number; unviewedPayments: number; pendingPayments: number }>({
    unreadMessages: 0,
    unviewedPayments: 0,
    pendingPayments: 0,
  })
  const pathname = usePathname()

  const fetchBadges = () => {
    fetch('/api/admin/notifications', { credentials: 'include' })
      .then((r) => r.json())
      .then((data) => {
        if (data.success) {
          setBadges({
            unreadMessages: data.data.unreadMessages ?? 0,
            unviewedPayments: data.data.unviewedPayments ?? 0,
            pendingPayments: data.data.pendingPayments ?? 0,
          })
        }
      })
      .catch((error) => {
        console.error('[Admin Navbar] Failed to fetch notification badges:', error)
      })
  }

  useEffect(() => {
    fetchBadges()
  }, [pathname])

  useEffect(() => {
    const onUpdate = () => fetchBadges()
    window.addEventListener('admin-notifications-update', onUpdate)
    return () => window.removeEventListener('admin-notifications-update', onUpdate)
  }, [])

  const getBadgeCount = (link: NavLink) => {
    if (link.badgeKey === 'messages') return badges.unreadMessages
    if (link.badgeKey === 'payments') return badges.unviewedPayments + badges.pendingPayments
    return 0
  }

  const isActive = (href: string, exact?: boolean) => {
    if (exact) return pathname === href
    return pathname === href || pathname.startsWith(href + '/')
  }

  return (
    <>
      <AdminToolbar />
      <nav className="sticky top-[60px] z-50 bg-white/95 backdrop-blur border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14 xl:h-16">
            <Link href="/admin" className="flex items-center flex-shrink-0">
              <Image
                src="/images/ca-20logo.png"
                alt="Center for Admission and Travels"
                width={36}
                height={36}
                className="h-9 xl:h-10 w-auto object-contain"
              />
            </Link>

            {/* Desktop Menu */}
            <div className="hidden xl:flex flex-1 min-w-0 px-2 justify-center">
              <div className="flex items-center gap-0.5 overflow-x-auto whitespace-nowrap">
                {ADMIN_NAV_LINKS.map((link) => {
                  const count = getBadgeCount(link)
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={`inline-flex items-center gap-1 px-1.5 xl:px-2 py-2 transition text-[11px] xl:text-xs font-medium whitespace-nowrap ${
                        isActive(link.href, link.exact)
                          ? 'text-orange-600 font-semibold'
                          : 'text-foreground hover:text-orange-600'
                      }`}
                    >
                      {link.label}
                      {count > 0 && (
                        <span className="min-w-[16px] h-4 px-1 flex items-center justify-center text-[9px] font-bold bg-red-500 text-white rounded-full">
                          {count > 99 ? '99+' : count}
                        </span>
                      )}
                    </Link>
                  )
                })}
              </div>
            </div>

            <div className="hidden xl:flex gap-2 flex-shrink-0">
              <Link
                href="/"
                target="_blank"
                className="px-3 py-2 text-primary border border-primary rounded-lg hover:bg-primary hover:text-white transition text-xs font-semibold whitespace-nowrap"
              >
                View Site
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button onClick={() => setIsOpen(!isOpen)} className="xl:hidden p-2 hover:bg-muted rounded-lg">
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

          {/* Mobile Menu */}
          {isOpen && (
            <div className="xl:hidden pb-4 space-y-2">
              {ADMIN_NAV_LINKS.map((link) => {
                const count = getBadgeCount(link)
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setIsOpen(false)}
                    className={`flex items-center justify-between px-3 py-2 text-sm font-medium ${
                      isActive(link.href, link.exact)
                        ? 'text-orange-600 font-semibold'
                        : 'text-foreground hover:text-orange-600'
                    }`}
                  >
                    {link.mobileLabel}
                    {count > 0 && (
                      <span className="min-w-[20px] h-5 px-1.5 flex items-center justify-center text-xs font-bold bg-red-500 text-white rounded-full">
                        {count > 99 ? '99+' : count}
                      </span>
                    )}
                  </Link>
                )
              })}
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
