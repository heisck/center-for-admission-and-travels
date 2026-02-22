'use client'

import { useEffect, useState } from 'react'
import { AdminToolbar } from '@/components/admin/admin-toolbar'
import { Mail, Loader2, Download } from 'lucide-react'

export default function AdminNewsletterPage() {
  const [subscribers, setSubscribers] = useState<{ id: string; email: string; createdAt: string }[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchSubscribers() {
      try {
        const res = await fetch('/api/admin/newsletter')
        const data = await res.json()
        if (data.success) {
          setSubscribers(data.subscribers)
        }
      } catch {
        setSubscribers([])
      } finally {
        setLoading(false)
      }
    }
    fetchSubscribers()
  }, [])

  const exportCsv = () => {
    const headers = ['Email', 'Subscribed At']
    const rows = subscribers.map((s) => [s.email, new Date(s.createdAt).toLocaleString()])
    const csv = [headers.join(','), ...rows.map((r) => r.map((c) => `"${c}"`).join(','))].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `newsletter-subscribers-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <>
      <AdminToolbar />
      <main className="min-h-screen bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Newsletter Subscribers</h1>
              <p className="text-muted-foreground mt-1">People who signed up via the footer or newsletter page</p>
            </div>
            <button
              onClick={exportCsv}
              disabled={loading || subscribers.length === 0}
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition disabled:opacity-50"
            >
              <Download size={18} />
              Export CSV
            </button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-10 h-10 animate-spin text-primary" />
            </div>
          ) : subscribers.length === 0 ? (
            <div className="bg-white rounded-xl border border-border p-12 text-center">
              <Mail className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <p className="text-lg text-muted-foreground">No subscribers yet</p>
              <p className="text-sm text-muted-foreground mt-2">Subscribers will appear here when they sign up on the site</p>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-border overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 border-b border-border">
                    <tr>
                      <th className="text-left px-6 py-4 font-semibold text-foreground">Email</th>
                      <th className="text-left px-6 py-4 font-semibold text-foreground">Subscribed</th>
                    </tr>
                  </thead>
                  <tbody>
                    {subscribers.map((s) => (
                      <tr key={s.id} className="border-b border-border last:border-0">
                        <td className="px-6 py-4">{s.email}</td>
                        <td className="px-6 py-4 text-muted-foreground text-sm">
                          {new Date(s.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </main>
    </>
  )
}
