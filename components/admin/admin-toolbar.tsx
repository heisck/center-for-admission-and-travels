'use client'

import { useAdmin } from '@/context/admin-context'
import { Undo2, Redo2, Save, Eye, LogOut, ImageIcon } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export function AdminToolbar() {
  const { undo, redo, canUndo, canRedo, saveAll, isSaving } = useAdmin()
  const router = useRouter()
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const handleSave = async () => {
    await saveAll()
  }

  const handleLogout = async () => {
    if (isLoggingOut) return
    setIsLoggingOut(true)
    try {
      await fetch('/api/admin/auth/logout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })
    } catch {
      // If request fails, still redirect to login.
    } finally {
      setIsLoggingOut(false)
      router.push('/admin-login')
      router.refresh()
    }
  }

  return (
    <div className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-2 sm:py-3 flex justify-between items-center gap-2 sm:gap-4 overflow-x-auto">
        {/* Left: Branding */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="font-semibold text-foreground hidden sm:inline">Admin Panel</span>
        </div>

        {/* Middle: Undo/Redo Controls */}
        <div className="flex items-center gap-2 border border-slate-200 rounded-lg p-1 bg-slate-50 flex-shrink-0">
          <button
            onClick={undo}
            disabled={!canUndo}
            className="p-1.5 sm:p-2 hover:bg-slate-200 rounded-md transition disabled:opacity-50 disabled:cursor-not-allowed text-slate-700 hover:text-slate-900"
            title="Undo (Ctrl+Z)"
            aria-label="Undo"
          >
            <Undo2 size={16} className="sm:block" />
          </button>
          <div className="w-px h-6 bg-slate-300" />
          <button
            onClick={redo}
            disabled={!canRedo}
            className="p-1.5 sm:p-2 hover:bg-slate-200 rounded-md transition disabled:opacity-50 disabled:cursor-not-allowed text-slate-700 hover:text-slate-900"
            title="Redo (Ctrl+Y)"
            aria-label="Redo"
          >
            <Redo2 size={16} className="sm:block" />
          </button>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="p-1.5 sm:px-3 sm:py-2 text-xs sm:text-sm font-medium text-white bg-primary hover:bg-primary/90 rounded-lg transition flex items-center gap-1 sm:gap-2 flex-shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Save all changes to database"
          >
            <Save size={16} />
            <span className="hidden sm:inline">{isSaving ? 'Saving...' : 'Save'}</span>
          </button>

          <Link
            href="/"
            target="_blank"
            className="p-1.5 sm:px-3 sm:py-2 text-xs sm:text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition flex items-center gap-1 sm:gap-2 flex-shrink-0"
            title="Preview site"
          >
            <Eye size={16} />
            <span className="hidden md:inline">Preview</span>
          </Link>

          <Link
            href="/admin/media"
            className="p-1.5 sm:px-3 sm:py-2 text-xs sm:text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition flex items-center gap-1 sm:gap-2 flex-shrink-0"
            title="Media & Cloudinary cleanup"
          >
            <ImageIcon size={16} />
            <span className="hidden md:inline">Media</span>
          </Link>

          <div className="w-px h-6 bg-slate-300 hidden sm:block" />

          <button
            type="button"
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="p-1.5 sm:px-3 sm:py-2 text-xs sm:text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition flex items-center gap-1 sm:gap-2 flex-shrink-0"
            title="Logout"
          >
            <LogOut size={16} />
            <span className="hidden md:inline">{isLoggingOut ? 'Logging out...' : 'Logout'}</span>
          </button>
        </div>
      </div>
    </div>
  )
}
