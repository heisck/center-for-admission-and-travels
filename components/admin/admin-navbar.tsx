'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Settings, LogOut } from 'lucide-react'

export function AdminNavbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex justify-between items-center">
        <Link href="/admin" className="flex items-center gap-2">
          <div className="relative w-8 h-8">
            <Image
              src="/images/ca-20logo.png"
              alt="Center for Admission and Travels"
              width={32}
              height={32}
            />
          </div>
          <span className="font-bold text-foreground hidden sm:inline">Admin Panel</span>
        </Link>

        <div className="flex items-center gap-2">
          <Link
            href="/"
            className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition rounded-lg hover:bg-slate-100"
          >
            View Website
          </Link>
          <div className="w-px h-6 bg-border hidden sm:block"></div>
          <Link
            href="/admin"
            className="px-4 py-2 text-sm text-foreground font-medium transition rounded-lg hover:bg-slate-100 flex items-center gap-2"
          >
            <Settings size={16} />
            Dashboard
          </Link>
          <button className="p-2 text-muted-foreground hover:text-foreground transition rounded-lg hover:bg-slate-100">
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </nav>
  )
}
