"use client"

import { useState, useEffect } from "react"
import Link from "next/link"

const STORAGE_KEY = "cookie_consent"

export default function CookieConsent() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) return

    const timer = setTimeout(() => setVisible(true), 1000)
    return () => clearTimeout(timer)
  }, [])

  function handleAccept() {
    localStorage.setItem(STORAGE_KEY, "accepted")
    setVisible(false)
  }

  function handleDecline() {
    localStorage.setItem(STORAGE_KEY, "declined")
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 animate-slide-up">
      <div className="mx-auto max-w-7xl px-4 pb-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center gap-4 rounded-xl bg-slate-900 p-4 sm:p-5 shadow-2xl border border-slate-700">
          <p className="flex-1 text-sm text-slate-300 text-center sm:text-left">
            We use cookies to improve your experience. By using our site, you
            agree to our use of cookies.{" "}
            <Link
              href="/privacy"
              className="underline text-orange-400 hover:text-orange-300 transition"
            >
              Learn more
            </Link>
          </p>
          <div className="flex gap-3 shrink-0">
            <button
              onClick={handleDecline}
              className="px-5 py-2 text-sm font-semibold text-slate-300 border border-slate-600 rounded-lg hover:bg-slate-800 transition"
            >
              Decline
            </button>
            <button
              onClick={handleAccept}
              className="px-5 py-2 text-sm font-semibold text-white bg-gradient-to-r from-orange-500 to-red-600 rounded-lg hover:shadow-lg transition"
            >
              Accept
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
