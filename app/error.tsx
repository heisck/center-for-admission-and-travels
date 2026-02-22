"use client"

import Link from "next/link"
import { AlertTriangle } from "lucide-react"
import { useEffect } from "react"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center max-w-lg">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-red-100">
          <AlertTriangle className="h-10 w-10 text-red-600" />
        </div>
        <h1 className="text-3xl font-bold text-foreground sm:text-4xl">
          Something went wrong
        </h1>
        <p className="mt-4 text-muted-foreground">
          An unexpected error occurred. Please try again, or return to the home
          page if the problem persists.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={reset}
            className="px-6 py-3 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-lg hover:shadow-lg transition text-sm font-semibold"
          >
            Try Again
          </button>
          <Link
            href="/"
            className="px-6 py-3 text-primary border border-primary rounded-lg hover:bg-primary hover:text-white transition text-sm font-semibold"
          >
            Go Home
          </Link>
        </div>
      </div>
    </main>
  )
}
