'use client'

/**
 * Admin media / Cloudinary hygiene
 * Scan and remove unused Cloudinary assets so production storage stays clean.
 */

import { useState } from 'react'
import { Loader2, Search, Trash2, ImageIcon, AlertTriangle } from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'

type CleanupReport = {
  configured: boolean
  scanned: number
  referenced: number
  orphanCount: number
  deletedCount?: number
  failedCount?: number
  dryRun: boolean
  orphans?: Array<{ publicId: string; secureUrl: string }>
}

export default function AdminMediaPage() {
  const [scanning, setScanning] = useState(false)
  const [cleaning, setCleaning] = useState(false)
  const [report, setReport] = useState<CleanupReport | null>(null)

  const scan = async () => {
    setScanning(true)
    try {
      const res = await fetch('/api/admin/images/cleanup', {
        method: 'GET',
        credentials: 'include',
        cache: 'no-store',
      })
      const json = await res.json()
      if (!json.success) {
        toast.error(json.error || 'Scan failed')
        return
      }
      const data = json.data
      setReport({
        configured: data.configured !== false,
        scanned: data.scanned ?? 0,
        referenced: data.referenced ?? 0,
        orphanCount: data.orphanCount ?? data.orphans?.length ?? 0,
        dryRun: true,
        orphans: data.orphans || [],
      })
      if (data.configured === false) {
        toast.error('Cloudinary is not configured on this environment')
      } else {
        toast.success(`Found ${data.orphanCount ?? 0} unused image(s)`)
      }
    } catch (error: any) {
      toast.error(error?.message || 'Scan failed')
    } finally {
      setScanning(false)
    }
  }

  const cleanup = async () => {
    if (
      !window.confirm(
        'Permanently delete unused Cloudinary images that are not referenced by any package, page, gallery, team photo, or blog post?\n\nThis cannot be undone.'
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
        configured: data.configured !== false,
        scanned: data.scanned ?? 0,
        referenced: data.referenced ?? 0,
        orphanCount: data.orphanCount ?? 0,
        deletedCount: data.deleted?.length ?? 0,
        failedCount: data.failed?.length ?? 0,
        dryRun: false,
        orphans: data.orphans || [],
      })
      toast.success(`Deleted ${data.deleted?.length ?? 0} unused image(s)`)
    } catch (error: any) {
      toast.error(error?.message || 'Cleanup failed')
    } finally {
      setCleaning(false)
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 overflow-x-hidden">
      <div className="max-w-4xl mx-auto px-3 sm:px-4 md:px-6 py-6 sm:py-8 space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Media &amp; Cloudinary</h1>
          <p className="text-muted-foreground mt-2">
            Keep production storage clean. When you replace or delete images in Packages, Home,
            Travel gallery, About, Service pages, or Blog, the system removes the old Cloudinary
            files. Use this page to remove leftovers (for example old home-page assets).
          </p>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3 text-sm text-amber-950">
          <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">Safe by design</p>
            <p className="mt-1">
              Cleanup only deletes images under the{' '}
              <code className="text-xs bg-amber-100 px-1 rounded">center-for-admission-and-travels</code>{' '}
              Cloudinary folder that are not referenced in the database. Local files in{' '}
              <code className="text-xs bg-amber-100 px-1 rounded">/public</code> are never deleted.
            </p>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-border shadow-sm p-6 space-y-4">
          <div className="flex items-center gap-2">
            <ImageIcon className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-semibold">Unused image cleanup</h2>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={scan}
              disabled={scanning || cleaning}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-900 text-white text-sm font-medium hover:bg-slate-800 disabled:opacity-50"
            >
              {scanning ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              Scan unused images
            </button>
            <button
              type="button"
              onClick={cleanup}
              disabled={scanning || cleaning}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700 disabled:opacity-50"
            >
              {cleaning ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
              Delete unused images
            </button>
          </div>

          {report ? (
            <div className="rounded-lg bg-slate-50 border border-slate-200 p-4 text-sm space-y-2">
              <p>
                <span className="font-medium">Cloudinary configured:</span>{' '}
                {report.configured ? 'Yes' : 'No'}
              </p>
              <p>
                <span className="font-medium">Assets scanned:</span> {report.scanned}
              </p>
              <p>
                <span className="font-medium">Referenced IDs tracked:</span> {report.referenced}
              </p>
              <p>
                <span className="font-medium">Unused found:</span> {report.orphanCount}
              </p>
              {typeof report.deletedCount === 'number' ? (
                <p>
                  <span className="font-medium">Deleted:</span> {report.deletedCount}
                  {typeof report.failedCount === 'number' && report.failedCount > 0
                    ? ` (${report.failedCount} failed)`
                    : ''}
                </p>
              ) : null}
              {report.orphans && report.orphans.length > 0 ? (
                <div className="mt-3 max-h-48 overflow-y-auto">
                  <p className="font-medium mb-1">Sample public IDs:</p>
                  <ul className="list-disc pl-5 text-xs text-muted-foreground space-y-0.5">
                    {report.orphans.slice(0, 30).map((o) => (
                      <li key={o.publicId} className="break-all">
                        {o.publicId}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Run a scan first to see how many unused images exist, then delete if you are sure.
            </p>
          )}
        </div>

        <div className="bg-white rounded-xl border border-border shadow-sm p-6 space-y-3 text-sm">
          <h2 className="text-lg font-semibold">Where images are managed</h2>
          <ul className="list-disc pl-5 space-y-1.5 text-muted-foreground">
            <li>
              <Link href="/admin/home" className="text-primary hover:underline">
                Home
              </Link>{' '}
              — hero portrait (first image), featured packages
            </li>
            <li>
              <Link href="/admin/packages" className="text-primary hover:underline">
                Packages
              </Link>{' '}
              — package card photos (DestinationCard style on the public site)
            </li>
            <li>
              <Link href="/admin/travel-tours" className="text-primary hover:underline">
                Travel &amp; Tours
              </Link>{' '}
              — globe gallery + featured cards
            </li>
            <li>
              <Link href="/admin/study-abroad" className="text-primary hover:underline">
                Study / Work / Network
              </Link>{' '}
              — service page hero + destination images (also feed home service cards)
            </li>
            <li>
              <Link href="/admin/about" className="text-primary hover:underline">
                About
              </Link>{' '}
              — hero, founder, team
            </li>
            <li>
              <Link href="/admin/blog" className="text-primary hover:underline">
                Blog
              </Link>{' '}
              — cover images
            </li>
          </ul>
        </div>
      </div>
    </main>
  )
}
