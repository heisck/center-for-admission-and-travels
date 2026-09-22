'use client'

import { ExternalLink, Eye, Pencil, RefreshCw } from 'lucide-react'
import { usePathname } from 'next/navigation'
import { type ReactNode, useEffect, useMemo, useState } from 'react'

const PUBLIC_PAGE_BY_ADMIN_ROUTE: Record<string, string> = {
  '/admin': '/', '/admin/home': '/', '/admin/about': '/about',
  '/admin/packages': '/packages', '/admin/study-abroad': '/study-abroad',
  '/admin/work-abroad': '/work-abroad', '/admin/travel-tours': '/travel-tours',
  '/admin/global-network': '/global-network', '/admin/contact': '/contact',
  '/admin/newsletter': '/newsletter', '/admin/blog': '/blog',
}

export function AdminPageWorkspace({ children }: { children: ReactNode }) {
  const publicPath = PUBLIC_PAGE_BY_ADMIN_ROUTE[usePathname()]
  const [mode, setMode] = useState<'preview' | 'edit'>('preview')
  const [previewVersion, setPreviewVersion] = useState(0)

  useEffect(() => {
    const refresh = () => setPreviewVersion((version) => version + 1)
    window.addEventListener('content-updated', refresh)
    return () => window.removeEventListener('content-updated', refresh)
  }, [])

  const previewUrl = useMemo(
    () => publicPath ? `${publicPath}${publicPath.includes('?') ? '&' : '?'}adminPreview=${previewVersion}` : '',
    [previewVersion, publicPath],
  )

  if (!publicPath) return children

  return (
    <div className="min-h-screen bg-slate-100">
      <div className="sticky top-[116px] xl:top-[124px] z-40 border-b border-slate-200 bg-white/95 px-4 py-2 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3">
          <div className="inline-flex rounded-lg border border-slate-200 bg-slate-50 p-1">
            <button type="button" onClick={() => setMode('preview')} className={`inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-semibold ${mode === 'preview' ? 'bg-white text-orange-600 shadow-sm' : 'text-slate-600'}`}>
              <Eye className="h-4 w-4" /> Live page
            </button>
            <button type="button" onClick={() => setMode('edit')} className={`inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-semibold ${mode === 'edit' ? 'bg-white text-orange-600 shadow-sm' : 'text-slate-600'}`}>
              <Pencil className="h-4 w-4" /> Edit content
            </button>
          </div>
          <div className="flex items-center gap-2">
            <button type="button" onClick={() => setPreviewVersion((version) => version + 1)} className="inline-flex items-center gap-2 rounded-md border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
              <RefreshCw className="h-4 w-4" /><span className="hidden sm:inline">Refresh</span>
            </button>
            <a href={publicPath} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-md border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
              <ExternalLink className="h-4 w-4" /><span className="hidden sm:inline">Open page</span>
            </a>
          </div>
        </div>
      </div>
      {mode === 'preview' ? (
        <iframe key={previewUrl} src={previewUrl} title={`Live preview of ${publicPath}`} className="block min-h-[calc(100vh-180px)] w-full border-0 bg-white" />
      ) : children}
    </div>
  )
}
