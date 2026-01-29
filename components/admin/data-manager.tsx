'use client'

import { useAdmin } from '@/context/admin-context'
import { Download, Upload } from 'lucide-react'
import { useRef } from 'react'

export function DataManager() {
  const { content } = useAdmin()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleExport = () => {
    const dataStr = JSON.stringify(content, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `admin-content-${new Date().toISOString().slice(0, 10)}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        try {
          const imported = JSON.parse(event.target?.result as string)
          // You would dispatch an action to update the admin context with imported data
          alert('Import feature would update the content. Validation needed.')
        } catch (error) {
          alert('Error importing file. Please ensure it is a valid JSON file.')
        }
      }
      reader.readAsText(file)
    }
  }

  return (
    <div className="flex gap-2">
      <button
        onClick={handleExport}
        className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:shadow-lg transition flex items-center gap-2 text-sm"
        title="Export current content as JSON"
      >
        <Download size={16} /> Export
      </button>

      <button
        onClick={() => fileInputRef.current?.click()}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:shadow-lg transition flex items-center gap-2 text-sm"
        title="Import content from JSON file"
      >
        <Upload size={16} /> Import
      </button>

      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        onChange={handleImport}
        className="hidden"
      />
    </div>
  )
}
