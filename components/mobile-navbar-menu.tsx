"use client"

import Link from "next/link"
import { useState } from "react"
import { CreditCard, Menu, User as UserIcon, X } from "lucide-react"

import { useCurrentUser } from "@/hooks/use-current-user"
import { NAV_LINKS, type SiteNavLink } from "@/components/site-navigation"

interface MobileNavbarMenuProps {
  currentPath?: string
  navLinks?: SiteNavLink[]
}

function isLinkActive(href: string, currentPath?: string) {
  if (!currentPath) return false
  if (href === "/") return currentPath === "/"
  return currentPath === href || currentPath.startsWith(`${href}/`)
}

export default function MobileNavbarMenu({ currentPath, navLinks }: MobileNavbarMenuProps) {
  const [isOpen, setIsOpen] = useState(false)
  const { user, logout } = useCurrentUser()
  const links = navLinks ?? NAV_LINKS

  return (
    <div className="xl:hidden relative shrink-0">
      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        className="p-2 hover:bg-muted rounded-lg"
        aria-expanded={isOpen}
        aria-label={isOpen ? 'Close menu' : 'Open menu'}
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {isOpen ? (
        /*
          Compact panel — never full page width on tablet/mid sizes.
          Small phones only: allow almost full width via max-w calc.
        */
        <div
          className={[
            'absolute right-0 top-full mt-2 z-50',
            'w-64 sm:w-72',
            'max-w-[calc(100vw-1.5rem)]',
            'max-h-[calc(100dvh-5rem)] overflow-y-auto overflow-x-hidden',
            'rounded-xl border border-border bg-background/95 backdrop-blur-md shadow-xl',
            'p-4 space-y-2',
          ].join(' ')}
        >
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setIsOpen(false)}
              className={`block px-3 py-2 text-sm font-medium ${
                isLinkActive(link.href, currentPath)
                  ? "text-orange-600 font-semibold"
                  : "text-foreground hover:text-orange-600"
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
            <div className="border-t pt-4 mt-4 flex flex-row items-center gap-2">
              <Link
                href="/signin"
                onClick={() => setIsOpen(false)}
                className="flex-1 min-w-0 px-3 py-2 text-primary border border-primary rounded-lg text-center font-semibold text-sm whitespace-nowrap"
              >
                Sign In
              </Link>
              <Link
                href="/signup"
                onClick={() => setIsOpen(false)}
                className="flex-1 min-w-0 px-3 py-2 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-lg text-center font-semibold text-sm whitespace-nowrap"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      ) : null}
    </div>
  )
}
