"use client"

import Link from "next/link"
import { useEffect, useRef, useState } from "react"
import { CreditCard, LogOut, User as UserIcon } from "lucide-react"

import { useCurrentUser } from "@/hooks/use-current-user"

export default function NavbarAuthControls() {
  const [showUserMenu, setShowUserMenu] = useState(false)
  const { user, isLoading, logout } = useCurrentUser()
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
    <div className="hidden md:flex min-w-[240px] justify-end gap-3 md:gap-2 items-center">
      {user ? (
        <div className="relative flex justify-end">
          <button
            onClick={() => setShowUserMenu((current) => !current)}
            className="flex items-center gap-2 px-4 py-2 text-primary border border-primary rounded-lg hover:bg-primary hover:text-white transition text-sm font-semibold whitespace-nowrap"
          >
            <UserIcon className="w-4 h-4" />
            <span>{user.displayName || user.username}</span>
          </button>
          {showUserMenu ? (
            <div
              ref={userMenuRef}
              className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-border py-2 z-50"
            >
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
          ) : null}
        </div>
      ) : isLoading ? (
        <div className="h-10 w-[220px] rounded-lg border border-border bg-slate-100 animate-pulse" />
      ) : (
        <>
          <Link
            href="/signin"
            className="px-4 py-2 text-primary border border-primary rounded-lg hover:bg-primary hover:text-white transition text-sm font-semibold whitespace-nowrap"
          >
            Sign In
          </Link>
          <Link
            href="/signup"
            className="px-4 py-2 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-lg hover:shadow-lg transition text-sm font-semibold signup-button whitespace-nowrap"
          >
            Sign Up
          </Link>
        </>
      )}
    </div>
  )
}
