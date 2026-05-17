"use client"

import Link from "next/link"
import Image from "next/image"
import { useState, useEffect, useRef } from "react"
import { usePathname } from "next/navigation"
import { Menu, X, User as UserIcon, LogOut, CreditCard } from "lucide-react"
import { useCurrentUser } from "@/hooks/use-current-user"
import { getHeaderNavLinks, NAV_LINKS as DEFAULT_NAV_LINKS, type SiteNavLink } from "@/components/site-navigation"
import './navbar.css'

interface NavbarProps {
  navLinks?: SiteNavLink[]
}

export default function Navbar({ navLinks }: NavbarProps = {}) {
  const NAV_LINKS = navLinks ?? DEFAULT_NAV_LINKS
  const HEADER_NAV_LINKS = getHeaderNavLinks(NAV_LINKS)
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
        <div className="flex justify-between items-center h-16 min-[1920px]:h-20 min-[2560px]:h-24">
          <Link href="/" className="flex items-center flex-shrink-0">
            <Image
              src="/images/ca-20logo.png"
              alt="Center for Admission and Travels"
              width={64}
              height={64}
              priority
              sizes="(min-width: 2560px) 64px, (min-width: 1920px) 48px, 40px"
              className="h-10 min-[1920px]:h-12 min-[2560px]:h-16 w-auto object-contain"
            />
          </Link>

          {/* Desktop Menu */}
          <div className="hidden xl:flex items-center justify-center gap-1 min-w-0">
            {HEADER_NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-2.5 py-2 transition text-sm font-medium whitespace-nowrap ${
                  isActive(link.href)
                    ? 'text-orange-600 font-semibold'
                    : 'text-foreground hover:text-orange-600'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="hidden xl:flex min-w-[188px] justify-end gap-2 items-center">
            {user ? (
              <div className="relative flex justify-end">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex max-w-[12rem] items-center gap-2 px-4 py-2 text-primary border border-primary rounded-lg hover:bg-primary hover:text-white transition text-sm font-semibold whitespace-nowrap"
                >
                  <UserIcon className="w-4 h-4 flex-shrink-0" />
                  <span className="min-w-0 truncate">{user.displayName || user.username}</span>
                </button>
                {showUserMenu && (
                  <div ref={userMenuRef} className="absolute right-0 mt-2 w-[min(92vw,20rem)] bg-white rounded-lg shadow-lg border border-border py-2 z-50">
                    <div className="min-w-0 px-4 py-2 border-b border-border">
                      <p className="truncate text-sm font-semibold text-foreground" title={user.displayName || user.username}>
                        {user.displayName || user.username}
                      </p>
                      <p className="break-all text-xs leading-snug text-muted-foreground" title={user.email}>
                        {user.email}
                      </p>
                    </div>
                    <Link
                      href="/profile"
                      onClick={() => setShowUserMenu(false)}
                      className="w-full px-4 py-2 text-left text-sm text-foreground hover:bg-muted flex items-center gap-2"
                    >
                      <UserIcon className="w-4 h-4 flex-shrink-0" />
                      My Profile
                    </Link>
                    <Link
                      href="/my-payments"
                      onClick={() => setShowUserMenu(false)}
                      className="w-full px-4 py-2 text-left text-sm text-foreground hover:bg-muted flex items-center gap-2"
                    >
                      <CreditCard className="w-4 h-4 flex-shrink-0" />
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
                      <LogOut className="w-4 h-4 flex-shrink-0" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : isLoading ? (
              <div className="h-10 w-[180px] rounded-lg border border-border bg-slate-100 animate-pulse" />
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
          <button onClick={() => setIsOpen(!isOpen)} className="xl:hidden p-2 hover:bg-muted rounded-lg">
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="xl:hidden pb-4 space-y-2">
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
                <div className="min-w-0 px-4 py-2">
                  <p className="truncate text-sm font-semibold text-foreground" title={user.displayName || user.username}>
                    {user.displayName || user.username}
                  </p>
                  <p className="break-all text-xs leading-snug text-muted-foreground" title={user.email}>
                    {user.email}
                  </p>
                </div>
                <Link
                  href="/profile"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-2 px-4 py-2 text-foreground hover:text-orange-600 text-sm font-medium"
                >
                  <UserIcon className="w-4 h-4 flex-shrink-0" />
                  My Profile
                </Link>
                <Link
                  href="/my-payments"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-2 px-4 py-2 text-foreground hover:text-orange-600 text-sm font-medium"
                >
                  <CreditCard className="w-4 h-4 flex-shrink-0" />
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
