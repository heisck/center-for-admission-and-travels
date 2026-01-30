'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'
import { Menu, X } from 'lucide-react'
import { AdminToolbar } from './admin-toolbar'

export function AdminNavbar() {
  const [isOpen, setIsOpen] = useState(false)

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

            {/* Desktop Menu - Same as main site but pointing to admin routes */}
            <div className="hidden md:flex space-x-1">
              <Link href="/admin" className="px-3 py-2 text-foreground hover:text-orange-600 transition text-sm font-medium">
                Home
              </Link>
              <Link href="/admin/about" className="px-3 py-2 text-foreground hover:text-orange-600 transition text-sm font-medium">
                About
              </Link>
              <Link href="/admin/study-abroad" className="px-3 py-2 text-foreground hover:text-orange-600 transition text-sm font-medium">
                Study
              </Link>
              <Link href="/admin/work-abroad" className="px-3 py-2 text-foreground hover:text-orange-600 transition text-sm font-medium">
                Work
              </Link>
              <Link href="/admin/travel-tours" className="px-3 py-2 text-foreground hover:text-orange-600 transition text-sm font-medium">
                Travel
              </Link>
              <Link href="/admin/global-network" className="px-3 py-2 text-foreground hover:text-orange-600 transition text-sm font-medium">
                Network
              </Link>
              <Link href="/admin/contact" className="px-3 py-2 text-foreground hover:text-orange-600 transition text-sm font-medium">
                Contact
              </Link>
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
              <Link href="/admin" className="block px-3 py-2 text-foreground hover:text-orange-600 text-sm font-medium">
                Home
              </Link>
              <Link href="/admin/about" className="block px-3 py-2 text-foreground hover:text-orange-600 text-sm font-medium">
                About
              </Link>
              <Link href="/admin/study-abroad" className="block px-3 py-2 text-foreground hover:text-orange-600 text-sm font-medium">
                Study Abroad
              </Link>
              <Link href="/admin/work-abroad" className="block px-3 py-2 text-foreground hover:text-orange-600 text-sm font-medium">
                Work Abroad
              </Link>
              <Link href="/admin/travel-tours" className="block px-3 py-2 text-foreground hover:text-orange-600 text-sm font-medium">
                Travel & Tours
              </Link>
              <Link href="/admin/global-network" className="block px-3 py-2 text-foreground hover:text-orange-600 text-sm font-medium">
                Global Network
              </Link>
              <Link href="/admin/contact" className="block px-3 py-2 text-foreground hover:text-orange-600 text-sm font-medium">
                Contact
              </Link>
              <div className="border-t pt-4 space-y-2 mt-4">
                <Link
                  href="/"
                  target="_blank"
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
