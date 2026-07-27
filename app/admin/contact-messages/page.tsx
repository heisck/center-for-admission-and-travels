'use client'

import { useEffect, useState } from 'react'
import { Mail, MessageSquare, Phone, User, Loader2, Check, ChevronDown, ChevronUp, ChevronLeft, ChevronRight } from 'lucide-react'

interface ContactMessage {
  id: string
  name: string
  email: string
  phone: string | null
  subject: string
  message: string
  read: boolean
  createdAt: string
}

export default function AdminContactMessagesPage() {
  const [messages, setMessages] = useState<ContactMessage[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [unreadCount, setUnreadCount] = useState(0)

  const fetchMessages = async (requestedPage: number) => {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/contact-messages?page=${requestedPage}&limit=20`, { credentials: 'include' })
      const data = await res.json()
      if (data.success) {
        setMessages(data.data.messages)
        setPage(data.data.pagination.page)
        setTotalPages(Math.max(1, data.data.pagination.totalPages))
        setUnreadCount(data.data.unreadTotal)
      }
    } catch {
      setMessages([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMessages(page)
  }, [page])

  const markAsRead = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/contact-messages/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ read: true }),
      })
      const data = await res.json()
      if (data.success) {
        setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, read: true } : m)))
        setUnreadCount((count) => Math.max(0, count - 1))
        window.dispatchEvent(new Event('admin-notifications-update'))
      }
    } catch {}
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Contact Messages</h1>
          <p className="text-muted-foreground mt-2">
            Messages sent via the contact form. {unreadCount > 0 && (
              <span className="text-primary font-semibold">{unreadCount} unread</span>
            )}
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-10 h-10 animate-spin text-primary" />
          </div>
        ) : messages.length === 0 ? (
          <div className="bg-white rounded-xl border border-border p-12 text-center">
            <MessageSquare className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <p className="text-lg text-muted-foreground">No messages yet</p>
            <p className="text-sm text-muted-foreground mt-2">Messages from the contact form will appear here</p>
          </div>
        ) : (
          <div className="space-y-3">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`bg-white rounded-xl border overflow-hidden transition ${
                  msg.read ? 'border-border' : 'border-primary/50 bg-primary/5'
                }`}
              >
                <button
                  onClick={() => {
                    setExpandedId(expandedId === msg.id ? null : msg.id)
                    if (!msg.read) markAsRead(msg.id)
                  }}
                  className="w-full px-6 py-4 flex items-center justify-between gap-4 text-left hover:bg-slate-50/50"
                >
                  <div className="flex items-center gap-4 min-w-0 flex-1">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                        msg.read ? 'bg-slate-200' : 'bg-primary/20 text-primary'
                      }`}
                    >
                      <Mail className="w-5 h-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-foreground">{msg.name}</span>
                        {!msg.read && (
                          <span className="px-2 py-0.5 rounded text-xs font-medium bg-primary text-white">
                            New
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground truncate">{msg.subject}</p>
                    </div>
                    <span className="text-xs text-muted-foreground flex-shrink-0">
                      {new Date(msg.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  {expandedId === msg.id ? (
                    <ChevronUp className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                  )}
                </button>

                {expandedId === msg.id && (
                  <div className="px-6 pb-6 pt-0 border-t border-border">
                    <div className="space-y-3 mt-4">
                      <div className="flex items-center gap-2 text-sm">
                        <User className="w-4 h-4 text-muted-foreground" />
                        <span>{msg.name}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Mail className="w-4 h-4 text-muted-foreground" />
                        <a href={`mailto:${msg.email}`} className="text-primary hover:underline">
                          {msg.email}
                        </a>
                      </div>
                      {msg.phone && (
                        <div className="flex items-center gap-2 text-sm">
                          <Phone className="w-4 h-4 text-muted-foreground" />
                          <a href={`tel:${msg.phone}`} className="text-primary hover:underline">
                            {msg.phone}
                          </a>
                        </div>
                      )}
                      <div className="pt-3">
                        <p className="text-sm font-medium text-muted-foreground mb-1">Message</p>
                        <p className="text-foreground whitespace-pre-wrap bg-slate-50 rounded-lg p-4">
                          {msg.message}
                        </p>
                      </div>
                      {!msg.read && (
                        <button
                          onClick={() => markAsRead(msg.id)}
                          className="inline-flex items-center gap-2 px-3 py-1.5 text-sm bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition"
                        >
                          <Check size={14} /> Mark as read
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
            {totalPages > 1 ? (
              <div className="flex items-center justify-between pt-4">
                <button
                  type="button"
                  onClick={() => setPage((current) => Math.max(1, current - 1))}
                  disabled={page <= 1 || loading}
                  className="inline-flex items-center gap-2 rounded-lg border border-border bg-white px-4 py-2 text-sm font-medium disabled:opacity-50"
                >
                  <ChevronLeft size={16} /> Previous
                </button>
                <span className="text-sm text-muted-foreground">
                  Page {page} of {totalPages}
                </span>
                <button
                  type="button"
                  onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
                  disabled={page >= totalPages || loading}
                  className="inline-flex items-center gap-2 rounded-lg border border-border bg-white px-4 py-2 text-sm font-medium disabled:opacity-50"
                >
                  Next <ChevronRight size={16} />
                </button>
              </div>
            ) : null}
          </div>
        )}
      </div>
    </main>
  )
}
