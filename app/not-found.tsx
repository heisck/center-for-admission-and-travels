import Link from "next/link"
import { Home, Package, Phone, BookOpen, Compass } from "lucide-react"

import PublicNavbar from "@/components/public-navbar"
import Footer from "@/components/footer-server"
import { getSiteChromeContent } from "@/lib/public-content"

export default async function NotFound() {
  const chrome = await getSiteChromeContent()

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <PublicNavbar />

      <main className="flex-1 relative overflow-hidden">
        {/* Brand gradient wash — same system as packages / home heroes */}
        <div className="absolute inset-0 bg-gradient-to-br from-orange-50 via-white to-red-50" />
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-orange-200/40 blur-3xl" />
        <div className="absolute -bottom-32 -left-24 w-96 h-96 rounded-full bg-red-200/30 blur-3xl" />

        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-orange-600 mb-4">
            CA Travels · CFAAT
          </p>

          <p className="text-[7rem] sm:text-[9rem] font-extrabold leading-none bg-gradient-to-r from-orange-500 via-orange-600 to-red-600 bg-clip-text text-transparent select-none">
            404
          </p>

          <h1 className="mt-2 text-3xl sm:text-4xl font-bold text-slate-900">
            Page not found
          </h1>
          <p className="mt-4 text-lg text-slate-600 max-w-xl mx-auto leading-relaxed">
            That link doesn&apos;t match a page on Center for Admission and Travels.
            The post may be unpublished, the URL may be outdated, or the path was mistyped.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-6 py-3.5 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-xl hover:shadow-xl transition text-sm font-semibold"
            >
              <Home className="w-4 h-4" />
              Back to home
            </Link>
            <Link
              href="/packages"
              className="inline-flex items-center gap-2 px-6 py-3.5 border-2 border-orange-200 text-orange-800 bg-white rounded-xl hover:bg-orange-50 transition text-sm font-semibold"
            >
              <Package className="w-4 h-4" />
              Browse packages
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 px-6 py-3.5 border border-slate-200 text-slate-800 bg-white rounded-xl hover:bg-slate-50 transition text-sm font-semibold"
            >
              <Phone className="w-4 h-4" />
              Contact us
            </Link>
          </div>

          <div className="mt-14 grid sm:grid-cols-3 gap-4 text-left">
            {[
              { href: "/blog", label: "Blog & guides", icon: BookOpen, desc: "Tips for study, work, and travel" },
              { href: "/travel-tours", label: "Travel & tours", icon: Compass, desc: "Curated international packages" },
              { href: "/study-abroad-ghana", label: "Study abroad", icon: Package, desc: "Pathways from Ghana" },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="group rounded-2xl border border-orange-100 bg-white/80 backdrop-blur p-5 hover:border-orange-300 hover:shadow-md transition"
              >
                <item.icon className="w-5 h-5 text-orange-600 mb-2" />
                <p className="font-semibold text-slate-900 group-hover:text-orange-700 transition">
                  {item.label}
                </p>
                <p className="text-xs text-slate-500 mt-1">{item.desc}</p>
              </Link>
            ))}
          </div>
        </div>
      </main>

      <Footer contact={chrome.contact} footer={chrome.footer} />
    </div>
  )
}
