'use client'

import { useEffect, useState } from 'react'
import { AlertCircle, CheckCircle2, CreditCard, Loader2, ShieldCheck } from 'lucide-react'

type PaymentSettingsStatus = {
  paystackPublicKeyConfigured: boolean
  paystackSecretKeyConfigured: boolean
  isConfigured: boolean
  currency: string
  baseUrlConfigured: boolean
  webhookAllowlistConfigured: boolean
}

export default function AdminPaymentSettingsPage() {
  const [status, setStatus] = useState<PaymentSettingsStatus | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    fetch('/api/admin/payment-settings', { cache: 'no-store' })
      .then(async (response) => {
        const result = await response.json()
        if (!response.ok || !result.success) {
          throw new Error(result.error || 'Failed to load payment settings')
        }
        if (active) setStatus(result.data)
      })
      .catch((loadError) => {
        if (active) setError(loadError instanceof Error ? loadError.message : 'Failed to load payment settings')
      })
    return () => {
      active = false
    }
  }, [])

  if (!status && !error) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" aria-label="Loading payment settings" />
      </div>
    )
  }

  return (
    <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6 rounded-xl border border-border bg-white p-6 shadow-sm">
        <div className="mb-2 flex items-center gap-3">
          <CreditCard className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">Payment Settings</h1>
        </div>
        <p className="text-muted-foreground">
          Payment credentials are managed in the deployment platform and are never exposed or edited in the browser.
        </p>
      </div>

      {error ? (
        <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-5 text-red-800">
          <AlertCircle className="mt-0.5 h-5 w-5" />
          <p>{error}</p>
        </div>
      ) : status ? (
        <>
          <div className={`mb-6 rounded-xl border p-6 ${status.isConfigured ? 'border-green-200 bg-green-50' : 'border-amber-200 bg-amber-50'}`}>
            <div className="flex items-start gap-3">
              {status.isConfigured ? (
                <CheckCircle2 className="mt-0.5 h-6 w-6 text-green-700" />
              ) : (
                <AlertCircle className="mt-0.5 h-6 w-6 text-amber-700" />
              )}
              <div>
                <h2 className="font-semibold">
                  {status.isConfigured ? 'Paystack credentials are configured' : 'Paystack credentials are incomplete'}
                </h2>
                <p className="mt-1 text-sm opacity-80">
                  Public key: {status.paystackPublicKeyConfigured ? 'configured' : 'missing'} · Secret key:{' '}
                  {status.paystackSecretKeyConfigured ? 'configured' : 'missing'}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-semibold">Deployment checks</h2>
            </div>
            <dl className="grid gap-4 sm:grid-cols-2">
              <StatusItem label="Default currency" value={status.currency} ready />
              <StatusItem label="Canonical base URL" value={status.baseUrlConfigured ? 'Configured' : 'Missing'} ready={status.baseUrlConfigured} />
              <StatusItem label="Webhook IP allowlist" value={status.webhookAllowlistConfigured ? 'Configured' : 'Optional / not configured'} ready />
              <StatusItem label="Credential storage" value="Server environment only" ready />
            </dl>
            <p className="mt-6 text-sm text-muted-foreground">
              Update `NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY`, `PAYSTACK_SECRET_KEY`, `NEXT_PUBLIC_BASE_URL`, and related
              values in the hosting provider’s encrypted environment settings, then redeploy.
            </p>
          </div>
        </>
      ) : null}
    </main>
  )
}

function StatusItem({ label, value, ready }: { label: string; value: string; ready: boolean }) {
  return (
    <div className="rounded-lg border border-border p-4">
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd className={`mt-1 font-semibold ${ready ? 'text-foreground' : 'text-amber-700'}`}>{value}</dd>
    </div>
  )
}
