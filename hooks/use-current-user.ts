"use client"

import { useCallback, useEffect, useState } from "react"

export interface CurrentUser {
  id: string
  username: string
  email: string
  displayName: string | null
  phone: string | null
}

const USER_SESSION_HINT_COOKIE = "user_session_hint"

export function hasUserSessionHint() {
  if (typeof document === "undefined") return false

  return document.cookie
    .split(";")
    .map((part) => part.trim())
    .some((part) => part === `${USER_SESSION_HINT_COOKIE}=1`)
}

export function clearUserSessionHint() {
  if (typeof document === "undefined") return

  const secureSuffix = window.location.protocol === "https:" ? "; Secure" : ""
  document.cookie = `${USER_SESSION_HINT_COOKIE}=; Max-Age=0; Path=/; SameSite=Strict${secureSuffix}`
}

export function useCurrentUser() {
  const [user, setUser] = useState<CurrentUser | null>(null)
  const [isLoading, setIsLoading] = useState(() => hasUserSessionHint())

  const refreshUser = useCallback(async () => {
    if (!hasUserSessionHint()) {
      clearUserSessionHint()
      setUser(null)
      setIsLoading(false)
      return null
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
      return nextUser
    } catch (error) {
      console.error("Failed to fetch user:", error)
      setUser(null)
      return null
    } finally {
      setIsLoading(false)
    }
  }, [])

  const logout = useCallback(async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" })
    } catch (error) {
      console.error("Logout failed:", error)
    } finally {
      clearUserSessionHint()
      setUser(null)
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    if (typeof window === "undefined") {
      setIsLoading(false)
      return
    }

    if (hasUserSessionHint()) {
      refreshUser()
      return
    }

    setIsLoading(false)
  }, [refreshUser])

  return { user, isLoading, refreshUser, logout }
}
