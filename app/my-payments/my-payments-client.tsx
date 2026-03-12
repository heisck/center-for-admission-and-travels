'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Skeleton } from '@/components/ui/skeleton'
import { buildWhatsAppUrl } from '@/lib/contact-utils'
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

interface MyPaymentsClientProps {
  supportWhatsAppNumber: string
}

export default function MyPaymentsClient({ supportWhatsAppNumber }: MyPaymentsClientProps) {
  const { user, isLoading: authLoading } = useUserAuth()
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (authLoading) return
    if (!user) return

    const fetchPayments = async () => {
      try {
        const response = await fetch('/api/user/payments')
        const data = await response.json()
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

  const getFollowUpWhatsAppUrl = (payment: Payment) => {
    const packageName = payment.metadata?.packageName || 'my package'
    const message = [
      `Hi, I'd like to follow up on my payment.`,
      ``,
      `*Payment Details:*`,
      `- Reference: ${payment.reference}`,
      `- Package: ${packageName}`,
      `- Amount: ${payment.currency} ${payment.amount.toLocaleString()}`,
      `- Status: ${payment.status}`,
      ``,
      `Could you please help me with an update? Thank you!`,
    ].join('\n')

    return buildWhatsAppUrl(supportWhatsAppNumber, message)
  }

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })

  if (!authLoading && !user) {
    return (
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
    )
  }

  return (
    <section className="py-16 bg-white min-h-[60vh]">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">My Payments</h1>
          <p className="text-muted-foreground mt-1">Track your bookings and payment status.</p>
        </div>

        {(loading || authLoading) ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="bg-white border border-border rounded-xl p-5">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="flex-1 min-w-0 space-y-2">
                    <Skeleton className="h-5 w-[180px]" />
                    <Skeleton className="h-3 w-[140px]" />
                  </div>
                  <div className="text-right space-y-2">
                    <Skeleton className="h-6 w-[100px] ml-auto" />
                    <Skeleton className="h-5 w-[80px] rounded-full ml-auto" />
                  </div>
                </div>
                <div className="flex items-center gap-4 mb-3">
                  <Skeleton className="h-3 w-[70px]" />
                  <Skeleton className="h-3 w-[120px]" />
                </div>
                <div className="pt-2 border-t border-border">
                  <Skeleton className="h-9 w-[200px] rounded-lg" />
                </div>
              </div>
            ))}
          </div>
        ) : null}

        {error ? (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
            <XCircle className="w-10 h-10 text-red-400 mx-auto mb-3" />
            <p className="text-red-700">{error}</p>
          </div>
        ) : null}

        {!loading && !error && payments.length === 0 ? (
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
        ) : null}

        {!loading && !error && payments.length > 0 ? (
          <div className="space-y-4">
            {payments.map((payment) => {
              const statusConfig = STATUS_CONFIG[payment.status] || STATUS_CONFIG.pending
              const StatusIcon = statusConfig.icon
              const followUpUrl = getFollowUpWhatsAppUrl(payment)

              return (
                <div
                  key={payment.id}
                  className={`bg-white border ${statusConfig.border} rounded-xl p-5 transition hover:shadow-md`}
                >
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Package className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                        <h3 className="font-semibold text-foreground truncate">
                          {payment.metadata?.packageName || 'Payment'}
                        </h3>
                      </div>
                      <p className="text-xs text-muted-foreground font-mono">{payment.reference}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-lg font-bold text-foreground">
                        {payment.currency} {payment.amount.toLocaleString()}
                      </p>
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${statusConfig.bg} ${statusConfig.text}`}>
                        <StatusIcon className="w-3 h-3" />
                        {statusConfig.label}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
                    <span className="flex items-center gap-1">
                      {payment.paymentMethod === 'mobile_money' ? <Smartphone className="w-3 h-3" /> : <CreditCard className="w-3 h-3" />}
                      {payment.paymentMethod?.replace('_', ' ') || 'Card'}
                    </span>
                    <span>{formatDate(payment.createdAt)}</span>
                    {payment.adminViewedAt ? (
                      <span className="flex items-center gap-1 text-green-600">
                        <Eye className="w-3 h-3" />
                        Seen by team
                      </span>
                    ) : null}
                  </div>

                  {payment.adminNote ? (
                    <div className="bg-blue-50 border border-blue-100 rounded-lg px-4 py-3 mb-3">
                      <p className="text-xs font-semibold text-blue-700 mb-1">Note from our team:</p>
                      <p className="text-sm text-blue-900">{payment.adminNote}</p>
                    </div>
                  ) : null}

                  <div className="flex gap-3 pt-2 border-t border-border">
                    {followUpUrl ? (
                      <a
                        href={followUpUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg text-sm font-medium hover:bg-green-600 transition"
                      >
                        <MessageCircle className="w-4 h-4" />
                        Follow Up on WhatsApp
                      </a>
                    ) : (
                      <button
                        type="button"
                        disabled
                        className="flex items-center gap-2 px-4 py-2 bg-slate-200 text-slate-500 rounded-lg text-sm font-medium cursor-not-allowed"
                      >
                        <MessageCircle className="w-4 h-4" />
                        WhatsApp Not Configured
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        ) : null}
      </div>
    </section>
  )
}
