'use client'

import { useState, useEffect } from 'react'
import Footer from '@/components/footer'
import { FileText, Save, Loader2 } from 'lucide-react'

const LEGAL_PAGES = [
  { slug: 'privacy', title: 'Privacy Policy', route: '/privacy' },
  { slug: 'terms', title: 'Terms and Conditions', route: '/terms' },
  { slug: 'refund-policy', title: 'Refund Policy', route: '/refund-policy' },
] as const

const DEFAULT_CONTENT: Record<string, string> = {
  terms: `1. Introduction

Welcome to Center for Admission and Travels ("CFAAT"). These Terms and Conditions govern your use of our services, including study abroad consultancy, work abroad placement, travel packages, and related services. By accessing our website or using our services, you agree to be bound by these terms.

2. Acceptance of Terms

By creating an account, making a booking, or using any of our services, you acknowledge that you have read, understood, and agree to these Terms and Conditions. If you do not agree, please do not use our services.

3. Services Provided

CFAAT offers:
- Study abroad admission guidance and visa processing
- Work abroad job placement and visa assistance
- Travel and tour packages
- Global network and partnership services

4. User Obligations

You agree to:
- Provide accurate and complete information
- Comply with all applicable laws and visa requirements
- Pay fees and charges as agreed
- Not use our services for any unlawful purpose

5. Fees and Payment

Payment terms will be specified in your service agreement or booking confirmation. Fees are generally non-refundable except as stated in our Refund Policy.

6. Limitation of Liability

CFAAT shall not be liable for any indirect, incidental, or consequential damages arising from your use of our services. Our liability is limited to the amount paid for the specific service in question.

7. Changes to Terms

We may update these terms from time to time. Continued use of our services after changes constitutes acceptance of the updated terms.

8. Contact

For questions about these terms, contact us at info@centerforadmissionandtravels.com or +233 248 422 663.`,
  privacy: `1. Information We Collect

We collect information you provide when using our services, including name, email, phone number, and documents required for visa or admission applications.

2. How We Use Your Information

We use your information to provide our services, process applications, communicate with you, and improve our offerings.

3. Data Protection

We take reasonable measures to protect your personal information and do not sell it to third parties.

4. Contact

For privacy enquiries, contact info@centerforadmissionandtravels.com.`,
  'refund-policy': `1. General Policy

Refund eligibility depends on the service and stage of processing. Please contact us before making a booking to understand the specific terms for your service.

2. Cancellations

Cancellation terms vary by service. Study and work visa services may have non-refundable components once processing has begun.

3. Contact

For refund requests, contact info@centerforadmissionandtravels.com or +233 248 422 663.`,
}

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
        setContent(isPlaceholder ? (DEFAULT_CONTENT[slug] || '') : raw)
      } else {
        setTitle(LEGAL_PAGES.find((p) => p.slug === slug)?.title || slug)
        setContent(DEFAULT_CONTENT[slug] || '')
      }
    } catch {
      setTitle(LEGAL_PAGES.find((p) => p.slug === slug)?.title || slug)
      setContent(DEFAULT_CONTENT[slug] || '')
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
                      placeholder="1. Introduction

Welcome to Center for Admission and Travels. These terms govern your use of our services..."
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
