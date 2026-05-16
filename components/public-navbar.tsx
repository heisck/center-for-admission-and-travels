import Image from "next/image"
import Link from "next/link"

import MobileNavbarMenu from "@/components/mobile-navbar-menu"
import NavbarAuthControls from "@/components/navbar-auth-controls"
import { getHeaderNavLinks } from "@/components/site-navigation"
import { getNavLinks } from "@/lib/nav-links"
import "./navbar.css"

interface PublicNavbarProps {
  currentPath?: string
}

function isLinkActive(href: string, currentPath?: string) {
  if (!currentPath) return false
  if (href === "/") return currentPath === "/"
  return currentPath === href || currentPath.startsWith(`${href}/`)
}

export default async function PublicNavbar({ currentPath }: PublicNavbarProps) {
  const navLinks = await getNavLinks()
  const headerNavLinks = getHeaderNavLinks(navLinks)
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
              className="h-10 min-[1920px]:h-12 min-[2560px]:h-16 w-auto object-contain"
            />
          </Link>

          <div className="hidden xl:flex items-center justify-center gap-1 min-w-0">
            {headerNavLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-2.5 py-2 transition text-sm font-medium whitespace-nowrap ${
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
          <MobileNavbarMenu currentPath={currentPath} navLinks={navLinks} />
        </div>
      </div>
    </nav>
  )
}
