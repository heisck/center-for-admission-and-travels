'use client'

import { useState, useEffect } from 'react'
import { CreditCard, Save, Eye, EyeOff, CheckCircle2, AlertCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function AdminPaymentSettingsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showSecretKey, setShowSecretKey] = useState(false)
  const [settings, setSettings] = useState({
    paystackPublicKey: '',
    paystackSecretKey: '',
    currency: 'GHS',
    baseUrl: '',
  })
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/admin/payment-settings')
      const result = await response.json()

      if (result.success) {
        setSettings({
          paystackPublicKey: result.data.paystackPublicKey || '',
          paystackSecretKey: result.data.paystackSecretKey || '',
          currency: result.data.currency || 'GHS',
          baseUrl: result.data.baseUrl || '',
        })
      }
    } catch (error) {
      console.error('Error fetching settings:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setMessage(null)

    try {
      const response = await fetch('/api/admin/payment-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      })

      const result = await response.json()

      if (result.success) {
        setMessage({
          type: 'success',
          text: result.message || 'Settings saved successfully! Please update your .env file and restart the server.',
        })
      } else {
        setMessage({ type: 'error', text: result.error || 'Failed to save settings' })
      }
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Failed to save settings' })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-muted-foreground mt-4">Loading payment settings...</p>
        </div>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border border-border p-6 mb-6">
          <div className="flex items-center gap-3 mb-2">
            <CreditCard className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-bold text-foreground">Payment Settings</h1>
          </div>
          <p className="text-muted-foreground">
            Configure your Paystack payment gateway credentials and settings
          </p>
        </div>

        {/* Configuration Status */}
        <div className="bg-white rounded-xl shadow-sm border border-border p-6 mb-6">
          <h2 className="text-xl font-semibold text-foreground mb-4">Configuration Status</h2>
          <div className="flex items-center gap-3">
            {settings.paystackPublicKey && settings.paystackSecretKey ? (
              <>
                <CheckCircle2 className="w-5 h-5 text-green-500" />
                <span className="text-green-700 font-medium">Payment gateway is configured</span>
              </>
            ) : (
              <>
                <AlertCircle className="w-5 h-5 text-orange-500" />
                <span className="text-orange-700 font-medium">
                  Payment gateway is not configured. Please add your API keys below.
                </span>
              </>
            )}
          </div>
        </div>

        {/* Settings Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-border p-6">
          <div className="space-y-6">
            {/* Paystack Public Key */}
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">
                Paystack Public Key
              </label>
              <input
                type="text"
                value={settings.paystackPublicKey}
                onChange={(e) =>
                  setSettings({ ...settings, paystackPublicKey: e.target.value })
                }
                placeholder="pk_test_..."
                className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
              <p className="text-xs text-muted-foreground mt-1">
                Your Paystack public key (starts with pk_test_ or pk_live_)
              </p>
            </div>

            {/* Paystack Secret Key */}
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">
                Paystack Secret Key
              </label>
              <div className="relative">
                <input
                  type={showSecretKey ? 'text' : 'password'}
                  value={settings.paystackSecretKey}
                  onChange={(e) =>
                    setSettings({ ...settings, paystackSecretKey: e.target.value })
                  }
                  placeholder="sk_test_..."
                  className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary pr-12"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowSecretKey(!showSecretKey)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showSecretKey ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Your Paystack secret key (starts with sk_test_ or sk_live_). Keep this secure!
              </p>
            </div>

            {/* Currency */}
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">
                Currency
              </label>
              <select
                value={settings.currency}
                onChange={(e) => setSettings({ ...settings, currency: e.target.value })}
                className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="GHS">GHS (Ghanaian Cedis)</option>
                <option value="NGN">NGN (Nigerian Naira)</option>
                <option value="USD">USD (US Dollars)</option>
                <option value="EUR">EUR (Euros)</option>
              </select>
            </div>

            {/* Base URL */}
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">
                Base URL
              </label>
              <input
                type="url"
                value={settings.baseUrl}
                onChange={(e) => setSettings({ ...settings, baseUrl: e.target.value })}
                placeholder="https://yourdomain.com"
                className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
              <p className="text-xs text-muted-foreground mt-1">
                Your website's base URL (used for payment callbacks)
              </p>
            </div>

            {/* Message */}
            {message && (
              <div
                className={`p-4 rounded-lg ${
                  message.type === 'success'
                    ? 'bg-green-50 text-green-800 border border-green-200'
                    : 'bg-red-50 text-red-800 border border-red-200'
                }`}
              >
                <div className="flex items-start gap-2">
                  {message.type === 'success' ? (
                    <CheckCircle2 className="w-5 h-5 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-5 h-5 mt-0.5" />
                  )}
                  <div className="flex-1">
                    <p className="font-medium">{message.text}</p>
                    {message.type === 'success' && (
                      <div className="mt-3 p-3 bg-white rounded border border-green-200">
                        <p className="text-sm font-mono text-xs whitespace-pre-wrap">
                          {message.text.includes('.env') ? message.text : ''}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <div className="flex gap-4">
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary/90 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save size={18} />
                {saving ? 'Saving...' : 'Save Settings'}
              </button>
              <button
                type="button"
                onClick={() => router.back()}
                className="px-6 py-3 border border-border rounded-lg font-semibold hover:bg-slate-50 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </form>

        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mt-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">Setup Instructions</h3>
          <ol className="list-decimal list-inside space-y-2 text-sm text-blue-800">
            <li>Sign up for a Paystack account at https://paystack.com</li>
            <li>Get your API keys from the Paystack dashboard</li>
            <li>Add the keys to your .env file:
              <pre className="mt-2 p-3 bg-white rounded border border-blue-200 text-xs overflow-x-auto">
{`NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_test_...
PAYSTACK_SECRET_KEY=sk_test_...
PAYMENT_CURRENCY=GHS
NEXT_PUBLIC_BASE_URL=https://yourdomain.com`}
              </pre>
            </li>
            <li>Restart your development server after updating .env</li>
            <li>Test payments using Paystack test keys (pk_test_ and sk_test_)</li>
            <li>Switch to live keys (pk_live_ and sk_live_) when ready for production</li>
          </ol>
        </div>
      </div>
    </main>
  )
}
