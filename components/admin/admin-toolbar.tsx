'use client'

import { useAdmin } from '@/context/admin-context'
import { Undo2, Redo2, RotateCcw, Save, Eye, LogOut } from 'lucide-react'
import Link from 'next/link'

export function AdminToolbar() {
  const { undo, redo, canUndo, canRedo, resetToDefault } = useAdmin()

  const handleReset = () => {
    if (window.confirm('Are you sure you want to reset all changes to default? This cannot be undone.')) {
      resetToDefault()
    }
  }

  return (
    <div className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-2 sm:py-3 flex justify-between items-center gap-2 sm:gap-4 overflow-x-auto">
        {/* Left: Branding */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
            A
          </div>
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
            onClick={handleReset}
            className="p-1.5 sm:px-3 sm:py-2 text-xs sm:text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition flex items-center gap-1 sm:gap-2 flex-shrink-0"
            title="Reset all changes"
          >
            <RotateCcw size={16} />
            <span className="hidden sm:inline">Reset</span>
          </button>

          <button
            className="p-1.5 sm:px-3 sm:py-2 text-xs sm:text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition flex items-center gap-1 sm:gap-2 flex-shrink-0"
            title="Save changes"
          >
            <Save size={16} />
            <span className="hidden sm:inline">Save</span>
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

          <div className="w-px h-6 bg-slate-300 hidden sm:block" />

          <Link
            href="/admin-login"
            className="p-1.5 sm:px-3 sm:py-2 text-xs sm:text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition flex items-center gap-1 sm:gap-2 flex-shrink-0"
            title="Logout"
          >
            <LogOut size={16} />
            <span className="hidden md:inline">Logout</span>
          </Link>
        </div>
      </div>
    </div>
  )
}
