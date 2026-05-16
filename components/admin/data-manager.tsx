'use client'

import { useAdmin } from '@/context/admin-context'
import { Download } from 'lucide-react'

export function DataManager() {
  const { content } = useAdmin()

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

  return (
    <div className="flex gap-2">
      <button
        onClick={handleExport}
        className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:shadow-lg transition flex items-center gap-2 text-sm"
        title="Export current content as JSON"
      >
        <Download size={16} /> Export
      </button>
    </div>
  )
}
