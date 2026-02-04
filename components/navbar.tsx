"use client"

import Link from "next/link"
import Image from "next/image"
import { useState, useEffect, useRef } from "react"
import { Menu, X, User as UserIcon, LogOut } from "lucide-react"
import { useUserAuth } from "@/context/user-auth-context"
import './navbar.css'

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const { user, isLoading, logout } = useUserAuth()
  const userMenuRef = useRef<HTMLDivElement>(null)

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

          <div className="hidden md:flex gap-3 md:gap-2 items-center">
            {isLoading ? (
              <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse" />
            ) : user ? (
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 px-4 py-2 text-primary border border-primary rounded-lg hover:bg-primary hover:text-white transition text-sm font-semibold"
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
                    <button
                      onClick={async () => {
                        await logout()
                        setShowUserMenu(false)
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-foreground hover:bg-muted flex items-center gap-2"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link
                  href="/signin"
                  className="px-4 md:px-4 py-2 text-primary border border-primary rounded-lg hover:bg-primary hover:text-white transition text-sm font-semibold"
                >
                  Sign In
                </Link>
                <Link
                  href="/signup"
                  className="px-4 md:px-4 py-2 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-lg hover:shadow-lg transition text-sm font-semibold signup-button"
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
            {user ? (
              <div className="border-t pt-4 space-y-2 mt-4">
                <div className="px-4 py-2">
                  <p className="text-sm font-semibold text-foreground">{user.displayName || user.username}</p>
                  <p className="text-xs text-muted-foreground">{user.email}</p>
                </div>
                <button
                  onClick={logout}
                  className="block w-full px-4 py-2 text-primary border border-primary rounded-lg text-center font-semibold text-sm"
                >
                  Sign Out
                </button>
              </div>
            ) : (
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
            )}
          </div>
        )}
      </div>
    </nav>
  )
}
