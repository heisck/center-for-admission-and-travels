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
              className="h-11 w-auto"
            />
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex space-x-8">
            <Link href="/" className="text-foreground hover:text-orange-600 transition text-sm font-medium">
              Home
            </Link>
            <Link href="/about" className="text-foreground hover:text-orange-600 transition text-sm font-medium">
              About
            </Link>
            <Link href="/packages" className="text-foreground hover:text-orange-600 transition text-sm font-medium">
              Packages
            </Link>
            <Link href="/contact" className="text-foreground hover:text-orange-600 transition text-sm font-medium">
              Contact
            </Link>
          </div>

          <Link
            href="/auth"
            className="hidden md:inline-block px-6 py-2 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-lg hover:shadow-lg transition text-sm font-semibold"
          >
            Get Started
          </Link>

          {/* Mobile Menu Button */}
          <button onClick={() => setIsOpen(!isOpen)} className="md:hidden p-2 hover:bg-muted rounded-lg">
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden pb-4 space-y-4">
            <Link href="/" className="block text-foreground hover:text-orange-600 text-sm font-medium">
              Home
            </Link>
            <Link href="/about" className="block text-foreground hover:text-orange-600 text-sm font-medium">
              About
            </Link>
            <Link href="/packages" className="block text-foreground hover:text-orange-600 text-sm font-medium">
              Packages
            </Link>
            <Link href="/contact" className="block text-foreground hover:text-orange-600 text-sm font-medium">
              Contact
            </Link>
            <Link
              href="/auth"
              className="block w-full px-4 py-2 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-lg text-center font-semibold text-sm"
            >
              Get Started
            </Link>
          </div>
        )}
      </div>
    </nav>
  )
}
