'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Navbar from '@/components/navbar'
import Footer from '@/components/footer'
import { CheckCircle2, XCircle, Loader2, AlertCircle } from 'lucide-react'
import Link from 'next/link'
import {
  clearPendingPaymentByReference,
  readLatestPendingPayment,
} from '@/lib/pending-payment-storage'

export default function PaymentCallbackPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen bg-background">
        <Navbar />
        <section className="py-20 bg-white">
          <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-white border border-border rounded-xl p-12 text-center">
              <Loader2 className="w-16 h-16 animate-spin text-primary mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-foreground mb-2">Loading...</h2>
            </div>
          </div>
        </section>
        <Footer />
      </main>
    }>
      <PaymentCallbackContent />
    </Suspense>
  )
}

function PaymentCallbackContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const referenceFromUrl = searchParams.get('reference')
  const [reference, setReference] = useState<string | null>(null)
  const [referenceLoaded, setReferenceLoaded] = useState(false)
  const [status, setStatus] = useState<'loading' | 'success' | 'failed' | 'pending'>('loading')
  const [paymentData, setPaymentData] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const storedReference = readLatestPendingPayment()?.reference || null
    setReference(referenceFromUrl || storedReference)
    setReferenceLoaded(true)
  }, [referenceFromUrl])

  useEffect(() => {
    if (!referenceLoaded) return

    if (!reference) {
      setStatus('failed')
      setError('Payment reference is missing')
      return
    }

    // Verify payment status
    const verifyPayment = async () => {
      try {
        const response = await fetch(`/api/payment/verify?reference=${reference}`)
        const result = await response.json()

        if (result.success) {
          setPaymentData(result.data)
          if (result.data.status === 'success') {
            setStatus('success')
          } else if (result.data.status === 'failed') {
            setStatus('failed')
          } else {
            setStatus('pending')
          }
          if (['success', 'failed', 'cancelled'].includes(result.data.status)) {
            clearPendingPaymentByReference(reference)
          }
        } else {
          setStatus('failed')
          setError(result.error || 'Failed to verify payment')
        }
      } catch (err: any) {
        setStatus('failed')
        setError(err.message || 'Failed to verify payment')
      }
    }

    verifyPayment()
  }, [reference, referenceLoaded])

  return (
    <main className="min-h-screen bg-background">
      <Navbar />

      <section className="py-20 bg-white">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          {status === 'loading' && (
            <div className="bg-white border border-border rounded-xl p-12 text-center">
              <Loader2 className="w-16 h-16 animate-spin text-primary mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-foreground mb-2">Verifying Payment</h2>
              <p className="text-muted-foreground">Please wait while we verify your payment...</p>
            </div>
          )}

          {status === 'success' && (
            <div className="bg-white border border-green-200 rounded-xl p-12 text-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="w-12 h-12 text-green-600" />
              </div>
              <h2 className="text-3xl font-bold text-green-900 mb-2">Payment Successful!</h2>
              <p className="text-muted-foreground mb-6">
                Thank you for your payment. Your booking has been confirmed.
              </p>
              {paymentData && (
                <div className="bg-slate-50 rounded-lg p-6 mb-6 text-left">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Reference:</span>
                      <span className="font-mono font-semibold">{paymentData.reference}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Amount:</span>
                      <span className="font-semibold">
                        {paymentData.currency} {paymentData.amount?.toLocaleString()}
                      </span>
                    </div>
                    {paymentData.itemName && (
                      <div className="flex justify-between gap-4">
                        <span className="text-muted-foreground">Booking:</span>
                        <span className="text-right font-semibold">{paymentData.itemName}</span>
                      </div>
                    )}
                    {paymentData.paidAt && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Paid At:</span>
                        <span className="font-semibold">
                          {new Date(paymentData.paidAt).toLocaleString()}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}
              <div className="flex gap-4 justify-center">
                <Link
                  href="/my-payments"
                  className="px-6 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary/90 transition"
                >
                  View My Payments
                </Link>
                <Link
                  href="/"
                  className="px-6 py-3 border border-border rounded-lg font-semibold hover:bg-slate-50 transition"
                >
                  Go Home
                </Link>
              </div>
            </div>
          )}

          {status === 'failed' && (
            <div className="bg-white border border-red-200 rounded-xl p-12 text-center">
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <XCircle className="w-12 h-12 text-red-600" />
              </div>
              <h2 className="text-3xl font-bold text-red-900 mb-2">Payment Failed</h2>
              <p className="text-muted-foreground mb-6">
                {error || 'Your payment could not be processed. Please try again.'}
              </p>
              <div className="flex gap-4 justify-center">
                <button
                  onClick={() => router.back()}
                  className="px-6 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary/90 transition"
                >
                  Try Again
                </button>
                <Link
                  href="/packages"
                  className="px-6 py-3 border border-border rounded-lg font-semibold hover:bg-slate-50 transition"
                >
                  Browse Packages
                </Link>
              </div>
            </div>
          )}

          {status === 'pending' && (
            <div className="bg-white border border-yellow-200 rounded-xl p-12 text-center">
              <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <AlertCircle className="w-12 h-12 text-yellow-600" />
              </div>
              <h2 className="text-3xl font-bold text-yellow-900 mb-2">Payment Pending</h2>
              <p className="text-muted-foreground mb-6">
                Your payment is being processed. You will receive a confirmation email once it's completed.
              </p>
              <div className="flex gap-4 justify-center">
                <Link
                  href="/"
                  className="px-6 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary/90 transition"
                >
                  Go Home
                </Link>
              </div>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </main>
  )
}
