'use client'

import { useAdmin } from '@/context/admin-context'
import { Download, Upload } from 'lucide-react'
import { useRef, useState } from 'react'
import type { AdminContent } from '@/context/admin-context'

export function DataManager() {
  const { content, updateContent, resetToDefault } = useAdmin()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isImporting, setIsImporting] = useState(false)

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

  // Basic validation function to check if imported data has the expected structure
  const validateImportedData = (data: any): data is AdminContent => {
    if (!data || typeof data !== 'object') return false
    
    // Check for required top-level properties
    const requiredKeys = ['home', 'about', 'packages', 'travelTours', 'contact', 'footer', 'servicePages']
    for (const key of requiredKeys) {
      if (!(key in data)) {
        return false
      }
    }
    
    // Basic structure validation
    if (!data.home?.hero || !Array.isArray(data.packages) || !Array.isArray(data.servicePages)) {
      return false
    }
    
    return true
  }

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsImporting(true)
    const reader = new FileReader()
    
    reader.onload = (event) => {
      try {
        const imported = JSON.parse(event.target?.result as string)
        
        // Validate the imported data structure
        if (!validateImportedData(imported)) {
          alert('Invalid file format. The file does not match the expected admin content structure.')
          setIsImporting(false)
          // Reset file input
          if (fileInputRef.current) {
            fileInputRef.current.value = ''
          }
          return
        }

        // Confirm with user before importing (since this will replace all current content)
        const confirmed = window.confirm(
          'This will replace all current content with the imported data. This action cannot be undone. Do you want to continue?'
        )

        if (confirmed) {
          // Update the content with imported data
          updateContent(imported as AdminContent)
          alert('Content imported successfully!')
        }
      } catch (error) {
        console.error('Import error:', error)
        alert('Error importing file. Please ensure it is a valid JSON file.')
      } finally {
        setIsImporting(false)
        // Reset file input
        if (fileInputRef.current) {
          fileInputRef.current.value = ''
        }
      }
    }

    reader.onerror = () => {
      alert('Error reading file. Please try again.')
      setIsImporting(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }

    reader.readAsText(file)
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
        disabled={isImporting}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:shadow-lg transition flex items-center gap-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
        title="Import content from JSON file"
      >
        <Upload size={16} /> {isImporting ? 'Importing...' : 'Import'}
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
