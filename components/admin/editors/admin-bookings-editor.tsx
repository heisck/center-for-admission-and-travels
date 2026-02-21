'use client'

import { useState, useEffect, useCallback } from 'react'
import { Loader2, RefreshCw, Eye, MessageCircle, CreditCard, Smartphone, ChevronDown, ChevronUp } from 'lucide-react'

interface Booking {
  id: string
  reference: string
  amount: number
  currency: string
  status: string
  paymentMethod: string | null
  customerEmail: string
  customerName: string | null
  customerPhone: string | null
  packageId: string | null
  metadata: any
  createdAt: string
  updatedAt: string
}

interface Pagination {
  page: number
  limit: number
  total: number
  totalPages: number
}

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  processing: 'bg-blue-100 text-blue-800 border-blue-200',
  success: 'bg-green-100 text-green-800 border-green-200',
  failed: 'bg-red-100 text-red-800 border-red-200',
  cancelled: 'bg-gray-100 text-gray-600 border-gray-200',
}

const METHOD_ICONS: Record<string, React.ReactNode> = {
  whatsapp: <MessageCircle className="w-4 h-4 text-green-600" />,
  card: <CreditCard className="w-4 h-4 text-blue-600" />,
  mobile_money: <Smartphone className="w-4 h-4 text-yellow-600" />,
  form: <Eye className="w-4 h-4 text-purple-600" />,
}

export default function AdminBookingsEditor() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 20, total: 0, totalPages: 0 })
  const [statusFilter, setStatusFilter] = useState('all')
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const fetchBookings = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: String(pagination.page),
        limit: String(pagination.limit),
        status: statusFilter,
      })
      const res = await fetch(`/api/admin/bookings?${params}`)
      const result = await res.json()
      if (result.success) {
        setBookings(result.data.bookings)
        setPagination(result.data.pagination)
      }
    } catch {
      console.error('Failed to fetch bookings')
    } finally {
      setLoading(false)
    }
  }, [pagination.page, pagination.limit, statusFilter])

  useEffect(() => {
    fetchBookings()
  }, [fetchBookings])

  const updateStatus = async (id: string, newStatus: string) => {
    try {
      const res = await fetch('/api/admin/bookings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: newStatus }),
      })
      if (res.ok) {
        setBookings((prev) =>
          prev.map((b) => (b.id === id ? { ...b, status: newStatus } : b))
        )
      }
    } catch {
      console.error('Failed to update booking status')
    }
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

  const getMethodLabel = (method: string | null) => {
    if (!method) return 'Unknown'
    const labels: Record<string, string> = {
      whatsapp: 'WhatsApp',
      card: 'Card',
      mobile_money: 'Mobile Money',
      form: 'Website Form',
    }
    return labels[method] || method
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Bookings & Inquiries</h2>
          <p className="text-sm text-muted-foreground">
            {pagination.total} total booking{pagination.total !== 1 ? 's' : ''}
          </p>
        </div>
        <button
          onClick={fetchBookings}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 border border-border rounded-lg hover:bg-slate-50 transition disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        {['all', 'pending', 'processing', 'success', 'failed', 'cancelled'].map((s) => (
          <button
            key={s}
            onClick={() => {
              setStatusFilter(s)
              setPagination((p) => ({ ...p, page: 1 }))
            }}
            className={`px-3 py-1.5 text-sm font-medium rounded-lg border transition ${
              statusFilter === s
                ? 'bg-primary text-white border-primary'
                : 'bg-white text-foreground border-border hover:bg-slate-50'
            }`}
          >
            {s === 'all' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>

      {/* Bookings list */}
      {loading ? (
        <div className="text-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-3" />
          <p className="text-muted-foreground">Loading bookings...</p>
        </div>
      ) : bookings.length === 0 ? (
        <div className="text-center py-12 bg-slate-50 rounded-xl border border-border">
          <p className="text-muted-foreground">No bookings found.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {bookings.map((booking) => (
            <div
              key={booking.id}
              className="bg-white border border-border rounded-xl overflow-hidden"
            >
              {/* Summary row */}
              <div
                className="p-4 flex items-center gap-4 cursor-pointer hover:bg-slate-50 transition"
                onClick={() => setExpandedId(expandedId === booking.id ? null : booking.id)}
              >
                <div className="flex-shrink-0">
                  {METHOD_ICONS[booking.paymentMethod || ''] || <Eye className="w-4 h-4" />}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="font-semibold text-foreground text-sm truncate">
                      {booking.customerName || 'Unknown'}
                    </p>
                    <span className={`text-xs px-2 py-0.5 rounded-full border ${STATUS_COLORS[booking.status] || STATUS_COLORS.pending}`}>
                      {booking.status}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground truncate">
                    {booking.customerEmail} · {booking.customerPhone || 'No phone'}
                  </p>
                </div>

                <div className="text-right flex-shrink-0">
                  <p className="font-bold text-foreground text-sm">
                    {booking.currency} {booking.amount.toLocaleString()}
                  </p>
                  <p className="text-xs text-muted-foreground">{formatDate(booking.createdAt)}</p>
                </div>

                {expandedId === booking.id ? (
                  <ChevronUp className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                )}
              </div>

              {/* Expanded details */}
              {expandedId === booking.id && (
                <div className="border-t border-border p-4 bg-slate-50 space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground uppercase mb-1">Customer</p>
                      <p className="text-foreground">{booking.customerName}</p>
                      <p className="text-muted-foreground">{booking.customerEmail}</p>
                      <p className="text-muted-foreground">{booking.customerPhone || '—'}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground uppercase mb-1">Booking</p>
                      <p className="text-foreground">Ref: {booking.reference}</p>
                      <p className="text-muted-foreground">Method: {getMethodLabel(booking.paymentMethod)}</p>
                      {booking.metadata?.packageName && (
                        <p className="text-muted-foreground">Package: {booking.metadata.packageName}</p>
                      )}
                    </div>
                  </div>

                  {booking.metadata?.notes && (
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground uppercase mb-1">Notes</p>
                      <p className="text-sm text-foreground bg-white border border-border rounded-lg p-3">
                        {booking.metadata.notes}
                      </p>
                    </div>
                  )}

                  {/* Status update */}
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase mb-2">Update Status</p>
                    <div className="flex gap-2 flex-wrap">
                      {['pending', 'processing', 'success', 'cancelled'].map((s) => (
                        <button
                          key={s}
                          onClick={() => updateStatus(booking.id, s)}
                          disabled={booking.status === s}
                          className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition disabled:opacity-40 disabled:cursor-not-allowed ${
                            booking.status === s
                              ? STATUS_COLORS[s]
                              : 'bg-white text-foreground border-border hover:bg-slate-100'
                          }`}
                        >
                          {s.charAt(0).toUpperCase() + s.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Quick WhatsApp reply */}
                  {booking.customerPhone && (
                    <a
                      href={`https://wa.me/${booking.customerPhone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                        `Hi ${booking.customerName}, regarding your booking (Ref: ${booking.reference}) for ${booking.metadata?.packageName || 'our package'}. `
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition"
                    >
                      <MessageCircle className="w-4 h-4" />
                      Reply on WhatsApp
                    </a>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => setPagination((p) => ({ ...p, page: p.page - 1 }))}
            disabled={pagination.page <= 1}
            className="px-3 py-1.5 text-sm border border-border rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <span className="text-sm text-muted-foreground">
            Page {pagination.page} of {pagination.totalPages}
          </span>
          <button
            onClick={() => setPagination((p) => ({ ...p, page: p.page + 1 }))}
            disabled={pagination.page >= pagination.totalPages}
            className="px-3 py-1.5 text-sm border border-border rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      )}
    </div>
  )
}
