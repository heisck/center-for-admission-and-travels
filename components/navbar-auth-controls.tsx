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
    <div className="hidden xl:flex min-w-[188px] justify-end gap-2 items-center">
      {user ? (
        <div className="relative flex justify-end">
          <button
            onClick={() => setShowUserMenu((current) => !current)}
            className="flex max-w-[12rem] items-center gap-2 px-4 py-2 text-primary border border-primary rounded-lg hover:bg-primary hover:text-white transition text-sm font-semibold whitespace-nowrap"
          >
            <UserIcon className="w-4 h-4 flex-shrink-0" />
            <span className="min-w-0 truncate">{user.displayName || user.username}</span>
          </button>
          {showUserMenu ? (
            <div
              ref={userMenuRef}
              className="absolute right-0 mt-2 w-[min(92vw,20rem)] bg-white rounded-lg shadow-lg border border-border py-2 z-50"
            >
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
          ) : null}
        </div>
      ) : isLoading ? (
        <div className="h-10 w-[180px] rounded-lg border border-border bg-slate-100 animate-pulse" />
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
