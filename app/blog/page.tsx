"use client"

import { useScrollToTop } from "@/hooks/use-scroll-to-top"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import Link from "next/link"

export default function BlogPage() {
  useScrollToTop()

  return (
    <main className="min-h-screen bg-background">
      <Navbar />

      <section className="py-16 md:py-24 bg-gradient-to-br from-orange-50 to-red-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-4">
            <span className="bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
              Blog & News
            </span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl">
            Tips, updates, and stories about study abroad, work opportunities, and travel.
          </p>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-16 bg-slate-50 rounded-2xl border border-border">
            <p className="text-lg text-muted-foreground mb-6">
              New posts coming soon. Stay tuned for travel tips, visa guides, and success stories.
            </p>
            <Link
              href="/newsletter"
              className="inline-block px-6 py-3 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-lg font-semibold hover:shadow-lg transition"
            >
              Subscribe to get notified
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
