'use client'

import { useState, useEffect } from 'react'
import Footer from '@/components/footer'
import { FileText, Save, Loader2 } from 'lucide-react'

const LEGAL_PAGES = [
  { slug: 'privacy', title: 'Privacy Policy', route: '/privacy' },
  { slug: 'terms', title: 'Terms and Conditions', route: '/terms' },
  { slug: 'refund-policy', title: 'Refund Policy', route: '/refund-policy' },
] as const

export default function AdminLegalPage() {
  const [activeSlug, setActiveSlug] = useState<string>('privacy')
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const fetchPage = async (slug: string) => {
    setIsLoading(true)
    try {
      const res = await fetch(`/api/legal/${slug}`)
      const data = await res.json()
      if (data.success && data.data) {
        setTitle(data.data.title)
        const raw = data.data.content || ''
        const isPlaceholder = /<p>Edit this content in Admin/.test(raw) || raw.trim() === ''
        setContent(isPlaceholder ? '' : raw)
      } else {
        setTitle(LEGAL_PAGES.find((p) => p.slug === slug)?.title || slug)
        setContent('')
      }
    } catch {
      setTitle(LEGAL_PAGES.find((p) => p.slug === slug)?.title || slug)
      setContent('')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchPage(activeSlug)
  }, [activeSlug])

  const handleSave = async () => {
    setIsSaving(true)
    setSaveMessage(null)
    try {
      const res = await fetch(`/api/legal/${activeSlug}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, content }),
      })
      const data = await res.json()
      if (data.success) {
        setSaveMessage({ type: 'success', text: 'Saved successfully!' })
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('content-updated'))
        }
      } else {
        setSaveMessage({ type: 'error', text: data.error || 'Failed to save' })
      }
    } catch {
      setSaveMessage({ type: 'error', text: 'Failed to save' })
    } finally {
      setIsSaving(false)
    }
  }

  const currentPage = LEGAL_PAGES.find((p) => p.slug === activeSlug)

  return (
    <main className="min-h-screen bg-background">
      <section className="py-16 md:py-24 bg-gradient-to-br from-orange-50 to-red-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Legal Pages</h1>
          <p className="text-muted-foreground">Edit Privacy Policy, Terms & Conditions, and Refund Policy</p>
        </div>
      </section>

      <section className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar - page selector */}
          <div className="lg:w-56 flex-shrink-0">
            <nav className="space-y-1">
              {LEGAL_PAGES.map((page) => (
                <button
                  key={page.slug}
                  onClick={() => setActiveSlug(page.slug)}
                  className={`w-full flex items-center gap-2 px-4 py-3 rounded-lg text-left text-sm font-medium transition ${
                    activeSlug === page.slug
                      ? 'bg-primary text-white'
                      : 'text-foreground hover:bg-muted'
                  }`}
                >
                  <FileText className="w-4 h-4" />
                  {page.title}
                </button>
              ))}
            </nav>
          </div>

          {/* Editor */}
          <div className="flex-1 min-w-0">
            <div className="bg-white rounded-xl border border-border shadow-sm p-6">
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <>
                  <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1">Page Title</label>
                      <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full max-w-md px-3 py-2 border border-border rounded-lg text-foreground"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <a
                        href={currentPage?.route}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-primary hover:underline"
                      >
                        View on site →
                      </a>
                      <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 disabled:opacity-50"
                      >
                        {isSaving ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Save className="w-4 h-4" />
                        )}
                        Save
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">
                      Content (plain text)
                    </label>
                    <p className="text-xs text-muted-foreground mb-2">
                      Use plain text. Blank lines create new paragraphs. Links: paste the full URL (e.g. https://example.com).
                    </p>
                    <textarea
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      rows={24}
                      className="w-full px-3 py-2 border border-border rounded-lg text-sm text-foreground whitespace-pre-wrap"
                      placeholder="Write the legal page content here..."
                    />
                  </div>

                  {saveMessage && (
                    <p
                      className={`mt-4 text-sm ${
                        saveMessage.type === 'success' ? 'text-green-600' : 'text-red-600'
                      }`}
                    >
                      {saveMessage.text}
                    </p>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
