'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/navbar'
import Footer from '@/components/footer'
import { useUserAuth } from '@/context/user-auth-context'
import {
  Loader2,
  CreditCard,
  Smartphone,
  MessageCircle,
  CheckCircle2,
  Clock,
  XCircle,
  AlertCircle,
  Eye,
  Package,
  LogIn,
} from 'lucide-react'

interface Payment {
  id: string
  reference: string
  amount: number
  currency: string
  status: 'pending' | 'processing' | 'success' | 'failed' | 'cancelled'
  paymentMethod: string | null
  customerName: string | null
  customerEmail: string
  customerPhone: string | null
  packageId: string | null
  metadata: any
  adminNote: string | null
  adminViewedAt: string | null
  createdAt: string
  updatedAt: string
}

const STATUS_CONFIG: Record<string, { label: string; icon: any; bg: string; text: string; border: string }> = {
  success: { label: 'Successful', icon: CheckCircle2, bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200' },
  pending: { label: 'Pending', icon: Clock, bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-200' },
  processing: { label: 'Processing', icon: Loader2, bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
  failed: { label: 'Failed', icon: XCircle, bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' },
  cancelled: { label: 'Cancelled', icon: AlertCircle, bg: 'bg-slate-50', text: 'text-slate-600', border: 'border-slate-200' },
}

const WHATSAPP_NUMBER = '233248422663'

export default function MyPaymentsPage() {
  const router = useRouter()
  const { user, isLoading: authLoading } = useUserAuth()
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (authLoading) return
    if (!user) return

    const fetchPayments = async () => {
      try {
        const res = await fetch('/api/user/payments')
        const data = await res.json()
        if (data.success) {
          setPayments(data.data)
        } else {
          setError(data.error || 'Failed to load payments')
        }
      } catch {
        setError('Failed to load payments')
      } finally {
        setLoading(false)
      }
    }

    fetchPayments()
  }, [user, authLoading])

  const buildWhatsAppUrl = (p: Payment) => {
    const packageName = p.metadata?.packageName || 'my package'
    const message = [
      `Hi, I'd like to follow up on my payment.`,
      ``,
      `*Payment Details:*`,
      `- Reference: ${p.reference}`,
      `- Package: ${packageName}`,
      `- Amount: ${p.currency} ${p.amount.toLocaleString()}`,
      `- Status: ${p.status}`,
      ``,
      `Could you please help me with an update? Thank you!`,
    ].join('\n')
    return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  // Auth gate
  if (!authLoading && !user) {
    return (
      <main className="min-h-screen bg-background">
        <Navbar />
        <section className="py-32">
          <div className="max-w-md mx-auto text-center">
            <div className="bg-white border border-border rounded-2xl p-10">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <LogIn className="w-8 h-8 text-primary" />
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-3">Sign In Required</h2>
              <p className="text-muted-foreground mb-8">
                Sign in to view your payment history and booking status.
              </p>
              <Link
                href="/signin?redirect=/my-payments"
                className="inline-block px-6 py-3 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-lg font-semibold hover:shadow-lg transition"
              >
                Sign In
              </Link>
            </div>
          </div>
        </section>
        <Footer />
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-background">
      <Navbar />

      <section className="py-16 bg-white min-h-[60vh]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground">My Payments</h1>
            <p className="text-muted-foreground mt-1">Track your bookings and payment status.</p>
          </div>

          {(loading || authLoading) && (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
              <XCircle className="w-10 h-10 text-red-400 mx-auto mb-3" />
              <p className="text-red-700">{error}</p>
            </div>
          )}

          {!loading && !error && payments.length === 0 && (
            <div className="text-center py-20">
              <CreditCard className="w-14 h-14 text-muted-foreground/30 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">No payments yet</h3>
              <p className="text-muted-foreground mb-6">Once you book a package, your payments will appear here.</p>
              <Link
                href="/packages"
                className="inline-block px-6 py-3 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-lg font-semibold hover:shadow-lg transition"
              >
                Browse Packages
              </Link>
            </div>
          )}

          {!loading && !error && payments.length > 0 && (
            <div className="space-y-4">
              {payments.map((p) => {
                const sc = STATUS_CONFIG[p.status] || STATUS_CONFIG.pending
                const StatusIcon = sc.icon
                return (
                  <div
                    key={p.id}
                    className={`bg-white border ${sc.border} rounded-xl p-5 transition hover:shadow-md`}
                  >
                    {/* Header row */}
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Package className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                          <h3 className="font-semibold text-foreground truncate">
                            {p.metadata?.packageName || 'Payment'}
                          </h3>
                        </div>
                        <p className="text-xs text-muted-foreground font-mono">{p.reference}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-lg font-bold text-foreground">
                          {p.currency} {p.amount.toLocaleString()}
                        </p>
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${sc.bg} ${sc.text}`}>
                          <StatusIcon className="w-3 h-3" />
                          {sc.label}
                        </span>
                      </div>
                    </div>

                    {/* Info row */}
                    <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
                      <span className="flex items-center gap-1">
                        {p.paymentMethod === 'mobile_money' ? <Smartphone className="w-3 h-3" /> : <CreditCard className="w-3 h-3" />}
                        {p.paymentMethod?.replace('_', ' ') || 'Card'}
                      </span>
                      <span>{formatDate(p.createdAt)}</span>
                      {p.adminViewedAt && (
                        <span className="flex items-center gap-1 text-green-600">
                          <Eye className="w-3 h-3" />
                          Seen by team
                        </span>
                      )}
                    </div>

                    {/* Admin note */}
                    {p.adminNote && (
                      <div className="bg-blue-50 border border-blue-100 rounded-lg px-4 py-3 mb-3">
                        <p className="text-xs font-semibold text-blue-700 mb-1">Note from our team:</p>
                        <p className="text-sm text-blue-900">{p.adminNote}</p>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-3 pt-2 border-t border-border">
                      <a
                        href={buildWhatsAppUrl(p)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg text-sm font-medium hover:bg-green-600 transition"
                      >
                        <MessageCircle className="w-4 h-4" />
                        Follow Up on WhatsApp
                      </a>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </main>
  )
}
