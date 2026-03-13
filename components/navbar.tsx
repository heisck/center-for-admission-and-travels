"use client"

import Link from "next/link"
import Image from "next/image"
import { useState, useEffect, useRef } from "react"
import { usePathname } from "next/navigation"
import { Menu, X, User as UserIcon, LogOut, CreditCard } from "lucide-react"
import { useCurrentUser } from "@/hooks/use-current-user"
import './navbar.css'

const NAV_LINKS = [
  { href: '/', label: 'Home', mobileLabel: 'Home' },
  { href: '/about', label: 'About', mobileLabel: 'About' },
  { href: '/packages', label: 'Packages', mobileLabel: 'Packages' },
  { href: '/study-abroad', label: 'Study', mobileLabel: 'Study Abroad' },
  { href: '/work-abroad', label: 'Work', mobileLabel: 'Work Abroad' },
  { href: '/travel-tours', label: 'Travel', mobileLabel: 'Travel & Tours' },
  { href: '/global-network', label: 'Network', mobileLabel: 'Global Network' },
  { href: '/blog', label: 'Blog', mobileLabel: 'Blog' },
  { href: '/newsletter', label: 'Newsletter', mobileLabel: 'Newsletter' },
  { href: '/contact', label: 'Contact', mobileLabel: 'Contact' },
]

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const { user, isLoading, logout } = useCurrentUser()
  const userMenuRef = useRef<HTMLDivElement>(null)
  const pathname = usePathname()

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/'
    return pathname === href || pathname.startsWith(href + '/')
  }

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false)
      }
    }

    if (showUserMenu) {
      document.addEventListener("mousedown", handleClickOutside)
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [showUserMenu])

  return (
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center flex-shrink-0">
            <Image
              src="/images/ca-20logo.png"
              alt="Center for Admission and Travels"
              width={40}
              height={40}
              className="h-10 w-auto object-contain"
            />
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex space-x-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3 py-2 transition text-sm font-medium ${
                  isActive(link.href)
                    ? 'text-orange-600 font-semibold'
                    : 'text-foreground hover:text-orange-600'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="hidden md:flex min-w-[240px] justify-end gap-3 md:gap-2 items-center">
            {user ? (
              <div className="relative flex justify-end">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 px-4 py-2 text-primary border border-primary rounded-lg hover:bg-primary hover:text-white transition text-sm font-semibold whitespace-nowrap"
                >
                  <UserIcon className="w-4 h-4" />
                  <span>{user.displayName || user.username}</span>
                </button>
                {showUserMenu && (
                  <div ref={userMenuRef} className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-border py-2 z-50">
                    <div className="px-4 py-2 border-b border-border">
                      <p className="text-sm font-semibold text-foreground">{user.displayName || user.username}</p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                    </div>
                    <Link
                      href="/profile"
                      onClick={() => setShowUserMenu(false)}
                      className="w-full px-4 py-2 text-left text-sm text-foreground hover:bg-muted flex items-center gap-2"
                    >
                      <UserIcon className="w-4 h-4" />
                      My Profile
                    </Link>
                    <Link
                      href="/my-payments"
                      onClick={() => setShowUserMenu(false)}
                      className="w-full px-4 py-2 text-left text-sm text-foreground hover:bg-muted flex items-center gap-2"
                    >
                      <CreditCard className="w-4 h-4" />
                      My Payments
                    </Link>
                    <button
                      onClick={async () => {
                        await logout()
                        setShowUserMenu(false)
                        window.location.href = "/"
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-foreground hover:bg-muted flex items-center gap-2"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : isLoading ? (
              <div className="h-10 w-[220px] rounded-lg border border-border bg-slate-100 animate-pulse" />
            ) : (
              <>
                <Link
                  href="/signin"
                  className="px-4 md:px-4 py-2 text-primary border border-primary rounded-lg hover:bg-primary hover:text-white transition text-sm font-semibold whitespace-nowrap"
                >
                  Sign In
                </Link>
                <Link
                  href="/signup"
                  className="px-4 md:px-4 py-2 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-lg hover:shadow-lg transition text-sm font-semibold signup-button whitespace-nowrap"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button onClick={() => setIsOpen(!isOpen)} className="md:hidden p-2 hover:bg-muted rounded-lg">
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden pb-4 space-y-2">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className={`block px-3 py-2 text-sm font-medium ${
                  isActive(link.href)
                    ? 'text-orange-600 font-semibold'
                    : 'text-foreground hover:text-orange-600'
                }`}
              >
                {link.mobileLabel}
              </Link>
            ))}
            {user ? (
              <div className="border-t pt-4 space-y-2 mt-4">
                <div className="px-4 py-2">
                  <p className="text-sm font-semibold text-foreground">{user.displayName || user.username}</p>
                  <p className="text-xs text-muted-foreground">{user.email}</p>
                </div>
                <Link
                  href="/profile"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-2 px-4 py-2 text-foreground hover:text-orange-600 text-sm font-medium"
                >
                  <UserIcon className="w-4 h-4" />
                  My Profile
                </Link>
                <Link
                  href="/my-payments"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-2 px-4 py-2 text-foreground hover:text-orange-600 text-sm font-medium"
                >
                  <CreditCard className="w-4 h-4" />
                  My Payments
                </Link>
                <button
                  onClick={async () => {
                    setIsOpen(false)
                    await logout()
                    window.location.href = "/"
                  }}
                  className="block w-full px-4 py-2 text-primary border border-primary rounded-lg text-center font-semibold text-sm"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="border-t pt-4 space-y-2 mt-4">
                <Link
                  href="/signin"
                  onClick={() => setIsOpen(false)}
                  className="block px-4 py-2 text-primary border border-primary rounded-lg text-center font-semibold text-sm"
                >
                  Sign In
                </Link>
                <Link
                  href="/signup"
                  onClick={() => setIsOpen(false)}
                  className="block w-full px-4 py-2 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-lg text-center font-semibold text-sm"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  )
}
