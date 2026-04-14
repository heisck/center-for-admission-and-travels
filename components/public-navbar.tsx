import Image from "next/image"
import Link from "next/link"

import MobileNavbarMenu from "@/components/mobile-navbar-menu"
import NavbarAuthControls from "@/components/navbar-auth-controls"
import { NAV_LINKS } from "@/components/site-navigation"
import "./navbar.css"

interface PublicNavbarProps {
  currentPath?: string
}

function isLinkActive(href: string, currentPath?: string) {
  if (!currentPath) return false
  if (href === "/") return currentPath === "/"
  return currentPath === href || currentPath.startsWith(`${href}/`)
}

export default function PublicNavbar({ currentPath }: PublicNavbarProps) {
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

          <div className="hidden lg:flex space-x-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3 py-2 transition text-sm font-medium ${
                  isLinkActive(link.href, currentPath)
                    ? "text-orange-600 font-semibold"
                    : "text-foreground hover:text-orange-600"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          <NavbarAuthControls />
          <MobileNavbarMenu currentPath={currentPath} />
        </div>
      </div>
    </nav>
  )
}
