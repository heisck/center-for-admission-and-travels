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
      <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center gap-4">
        {/* Left: Branding */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white font-bold text-sm">
            A
          </div>
          <span className="font-semibold text-foreground">Admin Panel</span>
        </div>

        {/* Middle: Undo/Redo Controls */}
        <div className="flex items-center gap-2 border border-slate-200 rounded-lg p-1 bg-slate-50">
          <button
            onClick={undo}
            disabled={!canUndo}
            className="p-2 hover:bg-slate-200 rounded-md transition disabled:opacity-50 disabled:cursor-not-allowed text-slate-700 hover:text-slate-900"
            title="Undo (Ctrl+Z)"
            aria-label="Undo"
          >
            <Undo2 size={18} />
          </button>
          <div className="w-px h-6 bg-slate-300" />
          <button
            onClick={redo}
            disabled={!canRedo}
            className="p-2 hover:bg-slate-200 rounded-md transition disabled:opacity-50 disabled:cursor-not-allowed text-slate-700 hover:text-slate-900"
            title="Redo (Ctrl+Y)"
            aria-label="Redo"
          >
            <Redo2 size={18} />
          </button>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleReset}
            className="px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition flex items-center gap-2"
            title="Reset all changes"
          >
            <RotateCcw size={16} />
            Reset
          </button>

          <button
            className="px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition flex items-center gap-2"
            title="Save changes"
          >
            <Save size={16} />
            Save
          </button>

          <Link
            href="/"
            target="_blank"
            className="px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition flex items-center gap-2"
            title="Preview site"
          >
            <Eye size={16} />
            Preview
          </Link>

          <div className="w-px h-6 bg-slate-300" />

          <Link
            href="/admin-login"
            className="px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition flex items-center gap-2"
            title="Logout"
          >
            <LogOut size={16} />
            Logout
          </Link>
        </div>
      </div>
    </div>
  )
}
