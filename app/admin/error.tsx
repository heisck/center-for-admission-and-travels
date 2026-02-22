"use client"

import Link from "next/link"
import { AlertTriangle } from "lucide-react"
import { useEffect } from "react"

export default function AdminError({
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
    <main className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="text-center max-w-lg rounded-xl bg-white p-10 shadow-lg border border-border">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
          <AlertTriangle className="h-8 w-8 text-red-600" />
        </div>
        <h1 className="text-2xl font-bold text-foreground">
          Admin Error
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Something went wrong in the admin panel. Please retry the operation or
          head back to the dashboard.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={reset}
            className="px-6 py-2.5 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-lg hover:shadow-lg transition text-sm font-semibold"
          >
            Try Again
          </button>
          <Link
            href="/admin"
            className="px-6 py-2.5 text-primary border border-primary rounded-lg hover:bg-primary hover:text-white transition text-sm font-semibold"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    </main>
  )
}
