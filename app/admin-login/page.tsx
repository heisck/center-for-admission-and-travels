'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Eye, EyeOff, Lock, User } from 'lucide-react'

export default function AdminLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!email || !password) {
      setError('Please fill in all fields')
      return
    }

    setIsLoading(true)

    try {
      // Call the authentication API
      const response = await fetch('/api/admin/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      const result = await response.json()

      if (!result.success) {
        setError(result.error || 'Login failed. Please check your credentials.')
        return
      }

      // Redirect to admin dashboard
      router.push('/admin')
      router.refresh()
    } catch (err) {
      console.error('Login error:', err)
      setError('Login failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo/Header */}
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
          <h1 className="text-3xl font-bold text-foreground mb-2">Admin Login</h1>
          <p className="text-muted-foreground">Access the content management system</p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-lg p-8 space-y-6">
          {/* Error Message */}
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <div className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-red-600 text-sm font-bold">!</span>
              </div>
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          {/* Email / Username Field */}
          <div>
            <label htmlFor="email" className="block text-sm font-semibold text-foreground mb-2">
              Email or Username
            </label>
            <div className="relative">
              <User className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
              <input
                id="email"
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Admin email or username"
                className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition"
              />
            </div>
          </div>

          {/* Password Field */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label htmlFor="password" className="block text-sm font-semibold text-foreground">
                Password
              </label>
              <Link href="/admin-forgot-password" className="text-sm text-primary hover:underline">
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full pl-10 pr-10 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-muted-foreground hover:text-foreground transition"
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full px-4 py-2.5 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-lg font-semibold hover:shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Signing in...
              </>
            ) : (
              'Sign In'
            )}
          </button>

        </form>

        {/* Back Link */}
        <div className="text-center mt-8">
          <p className="text-muted-foreground">
            <Link href="/" className="text-primary hover:underline font-semibold">
              ← Back to Home
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
