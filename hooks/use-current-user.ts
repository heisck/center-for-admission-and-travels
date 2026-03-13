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

type CurrentUserStore = {
  user: CurrentUser | null
  resolved: boolean
  promise: Promise<CurrentUser | null> | null
  listeners: Set<() => void>
}

const currentUserStore: CurrentUserStore = {
  user: null,
  resolved: false,
  promise: null,
  listeners: new Set(),
}

function notifyCurrentUserListeners() {
  currentUserStore.listeners.forEach((listener) => listener())
}

function updateCurrentUserStore(user: CurrentUser | null, resolved: boolean) {
  currentUserStore.user = user
  currentUserStore.resolved = resolved
  notifyCurrentUserListeners()
}

function subscribeToCurrentUser(listener: () => void) {
  currentUserStore.listeners.add(listener)

  return () => {
    currentUserStore.listeners.delete(listener)
  }
}

function readCurrentUserSnapshot() {
  const hasHint = hasUserSessionHint()

  return {
    user: hasHint ? currentUserStore.user : null,
    isLoading: hasHint ? !currentUserStore.resolved : false,
  }
}

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

export function primeCurrentUserCache(user: CurrentUser | null) {
  updateCurrentUserStore(user, true)
}

export function useCurrentUser() {
  const [snapshot, setSnapshot] = useState(() => readCurrentUserSnapshot())

  const refreshUser = useCallback(async () => {
    if (!hasUserSessionHint()) {
      clearUserSessionHint()
      updateCurrentUserStore(null, true)
      return null
    }

    if (currentUserStore.promise) {
      return currentUserStore.promise
    }

    updateCurrentUserStore(currentUserStore.user, false)

    currentUserStore.promise = (async () => {
      const res = await fetch("/api/auth/me", { cache: "no-store" })
      const data = await res.json()
      const nextUser = data.user || null

      if (!nextUser) {
        clearUserSessionHint()
      }

      updateCurrentUserStore(nextUser, true)
      return nextUser
    })()
      .catch((error) => {
        console.error("Failed to fetch user:", error)
        updateCurrentUserStore(null, true)
        return null
      })
      .finally(() => {
        currentUserStore.promise = null
      })

    try {
      return await currentUserStore.promise
    } catch {
      return null
    }
  }, [])

  const logout = useCallback(async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" })
    } catch (error) {
      console.error("Logout failed:", error)
    } finally {
      clearUserSessionHint()
      updateCurrentUserStore(null, true)
    }
  }, [])

  useEffect(() => {
    const unsubscribe = subscribeToCurrentUser(() => {
      setSnapshot(readCurrentUserSnapshot())
    })

    if (!hasUserSessionHint()) {
      updateCurrentUserStore(null, true)
      return unsubscribe
    }

    if (!currentUserStore.resolved || currentUserStore.user === null) {
      void refreshUser()
    } else {
      setSnapshot(readCurrentUserSnapshot())
    }

    return unsubscribe
  }, [refreshUser])

  return { user: snapshot.user, isLoading: snapshot.isLoading, refreshUser, logout }
}
