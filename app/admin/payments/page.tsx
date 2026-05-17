'use client'

import { useEffect, useState, useCallback } from 'react'
import {
  Search,
  ChevronLeft,
  ChevronRight,
  X,
  CreditCard,
  Smartphone,
  User,
  Mail,
  Phone,
  Calendar,
  Hash,
  Package,
  Loader2,
  RefreshCw,
  MessageCircle,
  Eye,
  Save,
} from 'lucide-react'

interface PaymentUser {
  id: string
  username: string
  email: string
  displayName: string | null
}

interface Payment {
  id: string
  reference: string
  amount: number
  currency: string
  status: 'pending' | 'processing' | 'success' | 'failed' | 'cancelled'
  paymentMethod: string | null
  customerEmail: string
  customerName: string | null
  customerPhone: string | null
  packageId: string | null
  userId: string | null
  user: PaymentUser | null
  newsletterSubscribed?: boolean | null
  metadata: any
  paystackData: any
  adminNote: string | null
  adminViewedAt: string | null
  createdAt: string
  updatedAt: string
}

interface Pagination {
  page: number
  limit: number
  total: number
  totalPages: number
}

const STATUS_CONFIG: Record<string, { label: string; bg: string; text: string }> = {
  success: { label: 'Success', bg: 'bg-green-100', text: 'text-green-700' },
  pending: { label: 'Pending', bg: 'bg-yellow-100', text: 'text-yellow-700' },
  processing: { label: 'Processing', bg: 'bg-blue-100', text: 'text-blue-700' },
  failed: { label: 'Failed', bg: 'bg-red-100', text: 'text-red-700' },
  cancelled: { label: 'Cancelled', bg: 'bg-slate-100', text: 'text-slate-600' },
}

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([])
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 20, total: 0, totalPages: 0 })
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null)
  const [adminNote, setAdminNote] = useState('')
  const [savingNote, setSavingNote] = useState(false)
  const [noteSaved, setNoteSaved] = useState(false)
  const [recheckingPayment, setRecheckingPayment] = useState(false)
  const [recheckMessage, setRecheckMessage] = useState('')

  const fetchPayments = useCallback(async (page = 1) => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page: String(page), limit: '20' })
      if (statusFilter !== 'all') params.set('status', statusFilter)
      if (searchQuery) params.set('search', searchQuery)

      const res = await fetch(`/api/admin/payments?${params}`)
      const data = await res.json()
      if (data.success) {
        setPayments(data.data.payments)
        setPagination(data.data.pagination)
      }
    } catch (err) {
      console.error('Failed to fetch payments:', err)
    } finally {
      setLoading(false)
    }
  }, [statusFilter, searchQuery])

  useEffect(() => {
    fetchPayments(1)
  }, [fetchPayments])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setSearchQuery(searchInput)
  }

  const clearSearch = () => {
    setSearchInput('')
    setSearchQuery('')
  }

  const openPaymentDetail = async (p: Payment) => {
    setSelectedPayment(p)
    setAdminNote(p.adminNote || '')
    setNoteSaved(false)
    setRecheckMessage('')

    if (!p.adminViewedAt) {
      try {
        const res = await fetch(`/api/admin/payments/${p.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ adminViewedAt: new Date().toISOString() }),
        })
        const data = await res.json()
        if (data.success) {
          setSelectedPayment(data.data)
          setPayments((prev) =>
            prev.map((item) => (item.id === p.id ? { ...item, adminViewedAt: data.data.adminViewedAt } : item))
          )
          window.dispatchEvent(new Event('admin-notifications-update'))
        }
      } catch (err) {
        console.error('Failed to mark as viewed:', err)
      }
    }
  }

  const saveAdminNote = async () => {
    if (!selectedPayment) return
    setSavingNote(true)
    setNoteSaved(false)
    try {
      const res = await fetch(`/api/admin/payments/${selectedPayment.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminNote }),
      })
      const data = await res.json()
      if (data.success) {
        setSelectedPayment(data.data)
        setPayments((prev) =>
          prev.map((item) => (item.id === selectedPayment.id ? { ...item, adminNote: data.data.adminNote } : item))
        )
        setNoteSaved(true)
        setTimeout(() => setNoteSaved(false), 2000)
      }
    } catch (err) {
      console.error('Failed to save note:', err)
    } finally {
      setSavingNote(false)
    }
  }

  const recheckSelectedPayment = async () => {
    if (!selectedPayment) return
    setRecheckingPayment(true)
    setRecheckMessage('')

    try {
      const res = await fetch(`/api/admin/payments/${selectedPayment.id}/recheck`, {
        method: 'POST',
      })
      const data = await res.json()
      if (data.success) {
        setSelectedPayment(data.data)
        setPayments((prev) =>
          prev.map((item) => (item.id === selectedPayment.id ? data.data : item))
        )
        setRecheckMessage(data.message || 'Payment status refreshed.')
        window.dispatchEvent(new Event('admin-notifications-update'))
      } else {
        setRecheckMessage(data.error || 'Could not re-check payment.')
      }
    } catch (err) {
      console.error('Failed to re-check payment:', err)
      setRecheckMessage('Could not re-check payment.')
    } finally {
      setRecheckingPayment(false)
    }
  }

  const buildWhatsAppUrl = (p: Payment) => {
    const phone = p.customerPhone?.replace(/\D/g, '')
    if (!phone) return null
    const packageName = p.metadata?.packageName || 'your booking'
    const message = [
      `Hi ${p.customerName || 'there'},`,
      ``,
      `This is regarding your payment for *${packageName}*.`,
      `Reference: ${p.reference}`,
      `Amount: ${p.currency} ${p.amount.toLocaleString()}`,
      ``,
      `How can we assist you?`,
    ].join('\n')
    return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`
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

  const formatAmount = (amount: number, currency: string) => {
    return `${currency} ${amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}`
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Payments</h1>
          <p className="text-muted-foreground mt-1">
            {pagination.total} total payment{pagination.total !== 1 ? 's' : ''}
          </p>
        </div>
        <button
          onClick={() => fetchPayments(pagination.page)}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 border border-border rounded-lg hover:bg-slate-50 transition text-sm font-medium"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex gap-2 flex-wrap">
          {['all', 'success', 'pending', 'processing', 'failed', 'cancelled'].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                statusFilter === s
                  ? 'bg-primary text-white'
                  : 'bg-slate-100 text-muted-foreground hover:bg-slate-200'
              }`}
            >
              {s === 'all' ? 'All' : STATUS_CONFIG[s]?.label || s}
            </button>
          ))}
        </div>

        <form onSubmit={handleSearch} className="flex gap-2 sm:ml-auto">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search name, email, reference..."
              className="pl-9 pr-8 py-2 border border-border rounded-lg text-sm w-64 focus:outline-none focus:ring-2 focus:ring-primary"
            />
            {searchInput && (
              <button type="button" onClick={clearSearch} className="absolute right-2 top-1/2 -translate-y-1/2">
                <X className="w-4 h-4 text-muted-foreground hover:text-foreground" />
              </button>
            )}
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 transition"
          >
            Search
          </button>
        </form>
      </div>

      {/* Table */}
      <div className="bg-white border border-border rounded-xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : payments.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            <CreditCard className="w-12 h-12 mx-auto mb-4 opacity-30" />
            <p className="text-lg font-medium">No payments found</p>
            <p className="text-sm mt-1">
              {searchQuery || statusFilter !== 'all' ? 'Try adjusting your filters.' : 'Payments will appear here once customers start paying.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-slate-50">
                  <th className="text-left px-4 py-3 font-semibold text-muted-foreground w-8"></th>
                  <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Customer</th>
                  <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Reference</th>
                  <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Amount</th>
                  <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Method</th>
                  <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Status</th>
                  <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Date</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((p) => {
                  const sc = STATUS_CONFIG[p.status] || STATUS_CONFIG.pending
                  const isUnviewed = !p.adminViewedAt
                  return (
                    <tr
                      key={p.id}
                      onClick={() => openPaymentDetail(p)}
                      className={`border-b border-border last:border-b-0 hover:bg-slate-50 cursor-pointer transition ${isUnviewed ? 'bg-orange-50/50' : ''}`}
                    >
                      <td className="px-4 py-3">
                        {isUnviewed && (
                          <span className="inline-block w-2.5 h-2.5 rounded-full bg-orange-500" title="Not viewed yet" />
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className={`font-medium text-foreground ${isUnviewed ? 'font-bold' : ''}`}>{p.customerName || '-'}</div>
                        <div className="text-xs text-muted-foreground">{p.customerEmail}</div>
                        {p.user && (
                          <div className="text-xs text-primary mt-0.5">@{p.user.username}</div>
                        )}
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{p.reference}</td>
                      <td className="px-4 py-3 font-semibold text-foreground whitespace-nowrap">
                        {formatAmount(p.amount, p.currency)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                          {p.paymentMethod === 'mobile_money' ? (
                            <Smartphone className="w-3.5 h-3.5" />
                          ) : (
                            <CreditCard className="w-3.5 h-3.5" />
                          )}
                          <span className="text-xs capitalize">{p.paymentMethod?.replace('_', ' ') || 'card'}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${sc.bg} ${sc.text}`}>
                          {sc.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
                        {formatDate(p.createdAt)}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <p className="text-sm text-muted-foreground">
            Page {pagination.page} of {pagination.totalPages}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => fetchPayments(pagination.page - 1)}
              disabled={pagination.page <= 1 || loading}
              className="flex items-center gap-1 px-3 py-1.5 border border-border rounded-lg text-sm hover:bg-slate-50 transition disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" /> Previous
            </button>
            <button
              onClick={() => fetchPayments(pagination.page + 1)}
              disabled={pagination.page >= pagination.totalPages || loading}
              className="flex items-center gap-1 px-3 py-1.5 border border-border rounded-lg text-sm hover:bg-slate-50 transition disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Next <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {selectedPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setSelectedPayment(null)}>
          <div
            className="bg-white rounded-2xl max-w-lg w-full max-h-[85vh] overflow-y-auto shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white border-b border-border px-6 py-4 flex items-center justify-between rounded-t-2xl">
              <h2 className="text-lg font-bold text-foreground">Payment Details</h2>
              <button onClick={() => setSelectedPayment(null)} className="p-1 hover:bg-slate-100 rounded-lg transition">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="px-6 py-5 space-y-5">
              {/* Status badge + amount */}
              {(() => {
                const sc = STATUS_CONFIG[selectedPayment.status] || STATUS_CONFIG.pending
                return (
                  <div className="flex items-center justify-between">
                    <span className={`inline-flex px-3 py-1 rounded-full text-sm font-semibold ${sc.bg} ${sc.text}`}>
                      {sc.label}
                    </span>
                    <span className="text-2xl font-bold text-foreground">
                      {formatAmount(selectedPayment.amount, selectedPayment.currency)}
                    </span>
                  </div>
                )
              })()}

              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <button
                  onClick={recheckSelectedPayment}
                  disabled={recheckingPayment}
                  className="inline-flex items-center justify-center gap-2 px-3 py-2 border border-border rounded-lg text-sm font-semibold hover:bg-slate-50 transition disabled:opacity-50"
                >
                  <RefreshCw className={`w-4 h-4 ${recheckingPayment ? 'animate-spin' : ''}`} />
                  Re-check Paystack
                </button>
                {recheckMessage && (
                  <span className="text-xs text-muted-foreground">{recheckMessage}</span>
                )}
              </div>

              {/* Viewed indicator */}
              {selectedPayment.adminViewedAt && (
                <div className="flex items-center gap-2 text-xs text-green-600">
                  <Eye className="w-3.5 h-3.5" />
                  Viewed on {formatDate(selectedPayment.adminViewedAt)}
                </div>
              )}

              {/* Details grid */}
              <div className="space-y-3">
                <DetailRow icon={<Hash className="w-4 h-4" />} label="Reference" value={selectedPayment.reference} mono />
                <DetailRow icon={<Calendar className="w-4 h-4" />} label="Date" value={formatDate(selectedPayment.createdAt)} />
                <DetailRow
                  icon={selectedPayment.paymentMethod === 'mobile_money' ? <Smartphone className="w-4 h-4" /> : <CreditCard className="w-4 h-4" />}
                  label="Method"
                  value={selectedPayment.paymentMethod?.replace('_', ' ') || 'Card'}
                />
                {selectedPayment.metadata?.packageName && (
                  <DetailRow icon={<Package className="w-4 h-4" />} label="Package" value={selectedPayment.metadata.packageName} />
                )}
              </div>

              {/* Customer info */}
              <div className="border-t border-border pt-4">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase mb-3">Customer</h3>
                <div className="space-y-3">
                  <DetailRow icon={<User className="w-4 h-4" />} label="Name" value={selectedPayment.customerName || '-'} />
                  <DetailRow icon={<Mail className="w-4 h-4" />} label="Email" value={selectedPayment.customerEmail} />
                  {selectedPayment.customerPhone && (
                    <DetailRow icon={<Phone className="w-4 h-4" />} label="Phone" value={selectedPayment.customerPhone} />
                  )}
                  {selectedPayment.user && (
                    <DetailRow icon={<User className="w-4 h-4" />} label="Account" value={`@${selectedPayment.user.username} (${selectedPayment.user.email})`} />
                  )}
                  {selectedPayment.newsletterSubscribed != null && (
                    <DetailRow
                      icon={<Mail className="w-4 h-4" />}
                      label="Newsletter"
                      value={selectedPayment.newsletterSubscribed ? 'Subscribed' : 'Not subscribed'}
                    />
                  )}
                </div>
              </div>

              {/* WhatsApp contact button */}
              {(() => {
                const waUrl = buildWhatsAppUrl(selectedPayment)
                if (!waUrl) return null
                return (
                  <div className="border-t border-border pt-4">
                    <a
                      href={waUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-600 transition"
                    >
                      <MessageCircle className="w-5 h-5" />
                      Contact on WhatsApp
                    </a>
                  </div>
                )
              })()}

              {/* Mobile money details */}
              {selectedPayment.metadata?.momoPhone && (
                <div className="border-t border-border pt-4">
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase mb-3">Mobile Money</h3>
                  <div className="space-y-3">
                    <DetailRow icon={<Phone className="w-4 h-4" />} label="MoMo Number" value={selectedPayment.metadata.momoPhone} />
                    {selectedPayment.metadata.momoNetwork && (
                      <DetailRow icon={<Smartphone className="w-4 h-4" />} label="Network" value={selectedPayment.metadata.momoNetwork.toUpperCase()} />
                    )}
                  </div>
                </div>
              )}

              {/* Paystack data summary */}
              {selectedPayment.paystackData?.paid_at && (
                <div className="border-t border-border pt-4">
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase mb-3">Paystack</h3>
                  <div className="space-y-3">
                    <DetailRow icon={<Calendar className="w-4 h-4" />} label="Paid At" value={formatDate(selectedPayment.paystackData.paid_at)} />
                    {selectedPayment.paystackData.channel && (
                      <DetailRow icon={<CreditCard className="w-4 h-4" />} label="Channel" value={selectedPayment.paystackData.channel} />
                    )}
                    {selectedPayment.paystackData.ip_address && (
                      <DetailRow icon={<Hash className="w-4 h-4" />} label="IP Address" value={selectedPayment.paystackData.ip_address} />
                    )}
                  </div>
                </div>
              )}

              {/* Admin Note */}
              <div className="border-t border-border pt-4">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase mb-3">Admin Note</h3>
                <p className="text-xs text-muted-foreground mb-2">
                  The customer will see this note on their payment history page.
                </p>
                <textarea
                  value={adminNote}
                  onChange={(e) => setAdminNote(e.target.value)}
                  placeholder="Add a note for this payment (e.g. visa documents processed, booking confirmed)..."
                  rows={3}
                  className="w-full px-3 py-2 border border-border rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <div className="flex items-center gap-3 mt-2">
                  <button
                    onClick={saveAdminNote}
                    disabled={savingNote}
                    className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 transition disabled:opacity-50"
                  >
                    {savingNote ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Save Note
                  </button>
                  {noteSaved && (
                    <span className="text-sm text-green-600 font-medium">Saved!</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function DetailRow({
  icon,
  label,
  value,
  mono,
}: {
  icon: React.ReactNode
  label: string
  value: string
  mono?: boolean
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 text-muted-foreground">{icon}</div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className={`text-sm text-foreground ${mono ? 'font-mono' : ''} break-all`}>{value}</p>
      </div>
    </div>
  )
}
