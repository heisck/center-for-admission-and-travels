'use client'

import { HelpCircle, Save, Edit2, Trash2, Undo2, RotateCcw } from 'lucide-react'
import { useState } from 'react'

export function AdminHelp() {
  const [isOpen, setIsOpen] = useState(false)

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 left-6 z-50 p-3 rounded-full bg-primary text-white shadow-lg hover:shadow-xl transition group"
        title="Help"
      >
        <HelpCircle size={20} />
        <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1 bg-foreground text-white text-xs rounded opacity-0 group-hover:opacity-100 transition whitespace-nowrap">
          Help & Guide
        </span>
      </button>
    )
  }

  return (
    <div className="fixed bottom-6 left-6 z-50 w-96 max-h-96 bg-white rounded-xl shadow-2xl border border-border overflow-hidden flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 to-red-600 text-white p-4 flex justify-between items-center">
        <h3 className="font-bold flex items-center gap-2">
          <HelpCircle size={18} /> Admin Guide
        </h3>
        <button
          onClick={() => setIsOpen(false)}
          className="text-white hover:bg-white/20 rounded transition p-1"
        >
          ✕
        </button>
      </div>

      {/* Content */}
      <div className="overflow-y-auto flex-1 p-4 space-y-4 text-sm">
        <div>
          <h4 className="font-semibold text-foreground mb-2 flex items-center gap-2">
            <Edit2 size={16} /> Editing Text
          </h4>
          <p className="text-muted-foreground">
            Click on any text to edit it directly. Press Enter to save or Escape to cancel. Inline edits appear with an edit icon on hover.
          </p>
        </div>

        <div>
          <h4 className="font-semibold text-foreground mb-2 flex items-center gap-2">
            <Trash2 size={16} /> Managing Content
          </h4>
          <p className="text-muted-foreground">
            Use the delete button to remove items like packages or team members. The add button (+) creates new items. All changes are automatically tracked.
          </p>
        </div>

        <div>
          <h4 className="font-semibold text-foreground mb-2 flex items-center gap-2">
            <Undo2 size={16} /> Undo & Redo
          </h4>
          <p className="text-muted-foreground">
            Use the undo/redo buttons in the header to navigate through your edit history. You can go back and forward through all changes.
          </p>
        </div>

        <div>
          <h4 className="font-semibold text-foreground mb-2 flex items-center gap-2">
            <RotateCcw size={16} /> Reset Changes
          </h4>
          <p className="text-muted-foreground">
            Click the Reset button to revert all changes back to the original default content. This cannot be undone, so use with caution.
          </p>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded p-3">
          <p className="text-blue-900 text-xs font-medium">
            All changes are stored locally in your browser. They do not affect your live website until you export or sync the data to your database.
          </p>
        </div>

        <div className="bg-green-50 border border-green-200 rounded p-3">
          <p className="text-green-900 text-xs font-medium">
            Use the live preview (on large screens) to see how your changes look in real-time as you make them.
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-border bg-slate-50 p-3 text-center text-xs text-muted-foreground">
        Pro tip: Use keyboard shortcuts to work faster. Press Ctrl+Z to undo and Ctrl+Y to redo.
      </div>
    </div>
  )
}
