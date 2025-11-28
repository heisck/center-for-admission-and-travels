"use client"

import Link from "next/link"
import Image from "next/image"
import { useState } from "react"
import { Menu, X } from "lucide-react"

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center">
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
            <Link href="/" className="px-3 py-2 text-foreground hover:text-orange-600 transition text-sm font-medium">
              Home
            </Link>
            <Link href="/about" className="px-3 py-2 text-foreground hover:text-orange-600 transition text-sm font-medium">
              About
            </Link>
            <Link href="/study-abroad" className="px-3 py-2 text-foreground hover:text-orange-600 transition text-sm font-medium">
              Study
            </Link>
            <Link href="/work-abroad" className="px-3 py-2 text-foreground hover:text-orange-600 transition text-sm font-medium">
              Work
            </Link>
            <Link href="/travel-tours" className="px-3 py-2 text-foreground hover:text-orange-600 transition text-sm font-medium">
              Travel
            </Link>
            <Link href="/global-network" className="px-3 py-2 text-foreground hover:text-orange-600 transition text-sm font-medium">
              Network
            </Link>
            <Link href="/contact" className="px-3 py-2 text-foreground hover:text-orange-600 transition text-sm font-medium">
              Contact
            </Link>
          </div>

          <div className="hidden md:flex gap-3">
            <Link
              href="/signin"
              className="px-4 py-2 text-primary border border-primary rounded-lg hover:bg-primary hover:text-white transition text-sm font-semibold"
            >
              Sign In
            </Link>
            <Link
              href="/signup"
              className="px-6 py-2 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-lg hover:shadow-lg transition text-sm font-semibold"
            >
              Sign Up
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
            <Link href="/" className="block px-3 py-2 text-foreground hover:text-orange-600 text-sm font-medium">
              Home
            </Link>
            <Link href="/about" className="block px-3 py-2 text-foreground hover:text-orange-600 text-sm font-medium">
              About
            </Link>
            <Link href="/study-abroad" className="block px-3 py-2 text-foreground hover:text-orange-600 text-sm font-medium">
              Study Abroad
            </Link>
            <Link href="/work-abroad" className="block px-3 py-2 text-foreground hover:text-orange-600 text-sm font-medium">
              Work Abroad
            </Link>
            <Link href="/travel-tours" className="block px-3 py-2 text-foreground hover:text-orange-600 text-sm font-medium">
              Travel & Tours
            </Link>
            <Link href="/global-network" className="block px-3 py-2 text-foreground hover:text-orange-600 text-sm font-medium">
              Global Network
            </Link>
            <Link href="/contact" className="block px-3 py-2 text-foreground hover:text-orange-600 text-sm font-medium">
              Contact
            </Link>
            <div className="border-t pt-4 space-y-2 mt-4">
              <Link
                href="/signin"
                className="block px-4 py-2 text-primary border border-primary rounded-lg text-center font-semibold text-sm"
              >
                Sign In
              </Link>
              <Link
                href="/signup"
                className="block w-full px-4 py-2 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-lg text-center font-semibold text-sm"
              >
                Sign Up
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
