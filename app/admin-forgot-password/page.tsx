'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Mail, Loader2, ArrowLeft, CheckCircle2 } from 'lucide-react'

export default function AdminForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!email.trim()) {
      setError('Please enter your admin email address')
      return
    }

    setIsLoading(true)
    try {
      const res = await fetch('/api/admin/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const data = await res.json()
      if (data.success) {
        setSent(true)
      } else {
        setError(data.error || 'Something went wrong')
      }
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-lg flex items-center justify-center mx-auto mb-4 shadow-lg bg-white border border-orange-100 p-2">
            <Image
              src="/images/ca-20logo.png"
              alt="Center for Admission and Travels"
              width={48}
              height={48}
              className="w-full h-full object-contain"
            />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Admin Password Reset</h1>
          <p className="text-muted-foreground text-sm">Enter your admin email to receive a reset link</p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8">
          {sent ? (
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-xl font-bold text-foreground mb-3">Check Your Email</h2>
              <p className="text-muted-foreground mb-6 text-sm">
                If an admin account exists for <strong>{email}</strong>, we&apos;ve sent a password reset link. Check your inbox and spam folder.
              </p>
              <Link
                href="/admin-login"
                className="inline-flex items-center gap-2 text-orange-600 font-semibold hover:text-orange-700 transition"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Admin Login
              </Link>
            </div>
          ) : (
            <>
              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">Admin Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
                    <input
                      type="email"
                      placeholder="Admin email address"
                      autoComplete="email"
                      className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full px-4 py-2.5 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-lg font-semibold hover:shadow-lg transition disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    'Send Reset Link'
                  )}
                </button>
              </form>

              <div className="text-center">
                <Link
                  href="/admin-login"
                  className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition text-sm"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to Admin Login
                </Link>
              </div>
            </>
          )}
        </div>

        <div className="text-center mt-8">
          <Link href="/" className="text-primary hover:underline font-semibold text-sm">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  )
}
