"use client"

import { createContext, useContext, useEffect, useState, ReactNode } from "react"

interface User {
  id: string
  username: string
  email: string
  displayName: string | null
  phone: string | null
}

interface UserAuthContextType {
  user: User | null
  isLoading: boolean
  refreshUser: () => Promise<void>
  logout: () => Promise<void>
}

const UserAuthContext = createContext<UserAuthContextType | undefined>(undefined)

const USER_SESSION_HINT_COOKIE = "user_session_hint"

function hasUserSessionHint() {
  if (typeof document === "undefined") return false

  return document.cookie
    .split(";")
    .map((part) => part.trim())
    .some((part) => part === `${USER_SESSION_HINT_COOKIE}=1`)
}

function clearUserSessionHint() {
  if (typeof document === "undefined") return

  const secureSuffix = window.location.protocol === "https:" ? "; Secure" : ""
  document.cookie = `${USER_SESSION_HINT_COOKIE}=; Max-Age=0; Path=/; SameSite=Strict${secureSuffix}`
}

export function UserAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(() => hasUserSessionHint())

  const refreshUser = async () => {
    if (!hasUserSessionHint()) {
      clearUserSessionHint()
      setUser(null)
      setIsLoading(false)
      return
    }

    setIsLoading(true)

    try {
      const res = await fetch("/api/auth/me", { cache: "no-store" })
      const data = await res.json()
      const nextUser = data.user || null
      if (!nextUser) {
        clearUserSessionHint()
      }
      setUser(nextUser)
    } catch (error) {
      console.error("Failed to fetch user:", error)
      setUser(null)
    } finally {
      setIsLoading(false)
    }
  }

  const logout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" })
      clearUserSessionHint()
      setUser(null)
      setIsLoading(false)
      window.location.href = "/"
    } catch (error) {
      console.error("Logout failed:", error)
    }
  }

  useEffect(() => {
    // Only fetch user on client side
    if (typeof window !== "undefined") {
      if (hasUserSessionHint()) {
        refreshUser()
      } else {
        setIsLoading(false)
      }
    } else {
      setIsLoading(false)
    }
  }, [])

  return (
    <UserAuthContext.Provider value={{ user, isLoading, refreshUser, logout }}>
      {children}
    </UserAuthContext.Provider>
  )
}

export function useUserAuth() {
  const context = useContext(UserAuthContext)
  if (context === undefined) {
    throw new Error("useUserAuth must be used within a UserAuthProvider")
  }
  return context
}
