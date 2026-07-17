'use client'

import { useState } from 'react'
import { Download, Trash2, Search, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

import { useAdmin } from '@/context/admin-context'

export function DataManager() {
  const { content } = useAdmin()
  const [scanning, setScanning] = useState(false)
  const [cleaning, setCleaning] = useState(false)
  const [report, setReport] = useState<{
    scanned: number
    orphanCount: number
    deletedCount?: number
    dryRun?: boolean
  } | null>(null)

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

  const scanOrphans = async () => {
    setScanning(true)
    setReport(null)
    try {
      const res = await fetch('/api/admin/images/cleanup', { method: 'GET', credentials: 'include' })
      const json = await res.json()
      if (!json.success) {
        toast.error(json.error || 'Scan failed')
        return
      }
      const data = json.data
      setReport({
        scanned: data.scanned,
        orphanCount: data.orphanCount ?? data.orphans?.length ?? 0,
        dryRun: true,
      })
      toast.success(
        data.configured === false
          ? 'Cloudinary is not configured'
          : `Found ${data.orphanCount ?? 0} unused Cloudinary image(s)`
      )
    } catch (error: any) {
      toast.error(error?.message || 'Scan failed')
    } finally {
      setScanning(false)
    }
  }

  const deleteOrphans = async () => {
    if (
      !window.confirm(
        'Delete unused Cloudinary images that are not referenced by any page, package, blog post, or gallery? This cannot be undone.'
      )
    ) {
      return
    }
    setCleaning(true)
    try {
      const res = await fetch('/api/admin/images/cleanup', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dryRun: false }),
      })
      const json = await res.json()
      if (!json.success) {
        toast.error(json.error || 'Cleanup failed')
        return
      }
      const data = json.data
      setReport({
        scanned: data.scanned,
        orphanCount: data.orphanCount ?? 0,
        deletedCount: data.deleted?.length ?? 0,
        dryRun: false,
      })
      toast.success(`Deleted ${data.deleted?.length ?? 0} unused image(s)`)
    } catch (error: any) {
      toast.error(error?.message || 'Cleanup failed')
    } finally {
      setCleaning(false)
    }
  }

  return (
    <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center flex-wrap">
      <button
        onClick={handleExport}
        className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:shadow-lg transition flex items-center gap-2 text-sm"
        title="Export current content as JSON"
      >
        <Download size={16} /> Export
      </button>
      <button
        onClick={scanOrphans}
        disabled={scanning || cleaning}
        className="px-4 py-2 bg-slate-800 text-white rounded-lg font-medium hover:bg-slate-700 transition flex items-center gap-2 text-sm disabled:opacity-50"
        title="Scan Cloudinary for unused images"
      >
        {scanning ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
        Scan unused images
      </button>
      <button
        onClick={deleteOrphans}
        disabled={scanning || cleaning}
        className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition flex items-center gap-2 text-sm disabled:opacity-50"
        title="Delete Cloudinary images not used by the site"
      >
        {cleaning ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
        Delete unused images
      </button>
      {report ? (
        <span className="text-xs text-muted-foreground self-center">
          Scanned {report.scanned} · Unused {report.orphanCount}
          {typeof report.deletedCount === 'number' ? ` · Deleted ${report.deletedCount}` : ''}
        </span>
      ) : null}
    </div>
  )
}
