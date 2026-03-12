'use client'

import type React from "react"
import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { CreditCard, Smartphone, MessageCircle, Loader2, AlertCircle, Shield, Clock, MapPin, LogIn } from "lucide-react"

import { useUserAuth } from "@/context/user-auth-context"
import { buildWhatsAppUrl } from "@/lib/contact-utils"

interface PackageData {
  id: string
  name: string
  description: string
  price: number
  duration: string
  category: string
  highlights: string[]
  images: string[]
}

interface FormErrors {
  fullName?: string
  email?: string
  phone?: string
  momoPhone?: string
}

interface CheckoutClientProps {
  supportWhatsAppNumber: string
}

export default function CheckoutClient({ supportWhatsAppNumber }: CheckoutClientProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const packageId = searchParams.get("id")
  const { user, isLoading: authLoading } = useUserAuth()
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [packageData, setPackageData] = useState<PackageData | null>(null)
  const [paymentMethod, setPaymentMethod] = useState<"card" | "momo" | "whatsapp">("card")
  const [formErrors, setFormErrors] = useState<FormErrors>({})
  const [bookingSuccess, setBookingSuccess] = useState(false)
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    momoNetwork: "mtn",
    momoPhone: "",
    notes: "",
  })

  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        fullName: user.displayName || user.username || prev.fullName,
        email: user.email || prev.email,
      }))
    }
  }, [user])

  useEffect(() => {
    if (!packageId) {
      setError("No package selected")
      setLoading(false)
      return
    }

    const fetchPackage = async () => {
      try {
        const response = await fetch(`/api/packages/${packageId}`)
        const result = await response.json()
        if (result.success) {
          setPackageData(result.data)
        } else {
          setError(result.error || "Package not found")
        }
      } catch {
        setError("Failed to load package details")
      } finally {
        setLoading(false)
      }
    }

    fetchPackage()
  }, [packageId])

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (formErrors[name as keyof FormErrors]) {
      setFormErrors((prev) => ({ ...prev, [name]: undefined }))
    }
  }

  const validateForm = (): boolean => {
    const errors: FormErrors = {}

    if (!formData.fullName.trim() || formData.fullName.trim().length < 2) {
      errors.fullName = "Please enter your full name"
    }

    if (!formData.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = "Please enter a valid email address"
    }

    if (!formData.phone.trim() || formData.phone.replace(/\D/g, "").length < 9) {
      errors.phone = "Please enter a valid phone number"
    }

    if (paymentMethod === "momo") {
      if (!formData.momoPhone.trim() || formData.momoPhone.replace(/\D/g, "").length < 9) {
        errors.momoPhone = "Please enter a valid mobile money number"
      }
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setError(null)

    if (!validateForm()) return
    if (!packageData) {
      setError("Package information is missing")
      return
    }

    setProcessing(true)

    try {
      if (paymentMethod === "whatsapp") {
        await fetch("/api/bookings", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            packageId: packageData.id,
            fullName: formData.fullName,
            email: formData.email,
            phone: formData.phone,
            notes: formData.notes,
            method: "whatsapp",
          }),
        })

        const message = [
          `Hi, I'd like to book the *${packageData.name}* package.`,
          ``,
          `*Package Details:*`,
          `- Price: GHS ${packageData.price.toLocaleString()}`,
          `- Duration: ${packageData.duration}`,
          `- Category: ${packageData.category}`,
          ``,
          `*My Details:*`,
          `- Name: ${formData.fullName}`,
          `- Email: ${formData.email}`,
          `- Phone: ${formData.phone}`,
          formData.notes ? `- Notes: ${formData.notes}` : "",
          ``,
          `Please help me complete this booking. Thank you!`,
        ].filter(Boolean).join("\n")

        const whatsappUrl = buildWhatsAppUrl(supportWhatsAppNumber, message)
        if (!whatsappUrl) {
          setError("WhatsApp contact is not configured right now. Please choose Card/Mobile Money or try again shortly.")
          setProcessing(false)
          return
        }

        window.open(whatsappUrl, "_blank")
        setBookingSuccess(true)
        setProcessing(false)
        return
      }

      const response = await fetch("/api/payment/initialize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          packageId: packageData.id,
          email: formData.email,
          name: formData.fullName,
          phone: formData.phone,
          paymentMethod: paymentMethod === "momo" ? "mobile_money" : "card",
          metadata: {
            momoPhone: paymentMethod === "momo" ? formData.momoPhone : undefined,
            momoNetwork: paymentMethod === "momo" ? formData.momoNetwork : undefined,
          },
        }),
      })

      const result = await response.json()

      if (result.success && result.data.authorizationUrl) {
        window.location.href = result.data.authorizationUrl
      } else {
        setError(result.error || "Payment could not be started. Please check your Paystack keys are configured.")
        setProcessing(false)
      }
    } catch {
      setError("Something went wrong. Please try again.")
      setProcessing(false)
    }
  }

  const packagePrice = packageData?.price || 0

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
              Please sign in or create an account to complete your booking. This helps us keep track of your payments and booking history.
            </p>
            <div className="flex gap-4 justify-center">
              <Link
                href={`/signin?redirect=/checkout?id=${packageId}`}
                className="px-6 py-3 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-lg font-semibold hover:shadow-lg transition"
              >
                Sign In
              </Link>
              <Link
                href={`/signup?redirect=/checkout?id=${packageId}`}
                className="px-6 py-3 border border-border rounded-lg font-semibold hover:bg-slate-50 transition"
              >
                Create Account
              </Link>
            </div>
          </div>
        </div>
      </section>
    )
  }

  if (loading || authLoading) {
    return (
      <section className="py-32">
        <div className="max-w-md mx-auto text-center">
          <Loader2 className="w-10 h-10 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading package...</p>
        </div>
      </section>
    )
  }

  if (error && !packageData) {
    return (
      <section className="py-32">
        <div className="max-w-md mx-auto text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-foreground mb-2">Package Not Found</h2>
          <p className="text-muted-foreground mb-6">{error}</p>
          <button
            onClick={() => router.push("/packages")}
            className="px-6 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary/90 transition"
          >
            Browse Packages
          </button>
        </div>
      </section>
    )
  }

  if (bookingSuccess) {
    return (
      <section className="py-32">
        <div className="max-w-lg mx-auto text-center bg-white border border-green-200 rounded-2xl p-10">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Shield className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-3">Booking Request Sent!</h2>
          <p className="text-muted-foreground mb-2">
            We've received your booking for <span className="font-semibold text-foreground">{packageData?.name}</span>.
          </p>
          <p className="text-muted-foreground mb-8">
            Our team will contact you within 24 hours via email and WhatsApp to confirm details and complete your payment.
          </p>
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => router.push("/packages")}
              className="px-6 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary/90 transition"
            >
              Browse More Packages
            </button>
            <button
              onClick={() => router.push("/")}
              className="px-6 py-3 border border-border rounded-lg font-semibold hover:bg-slate-50 transition"
            >
              Go Home
            </button>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-16 bg-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-2">
          <span className="bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
            Complete Your Booking
          </span>
        </h1>
        <p className="text-muted-foreground mb-8">You're one step away from an amazing experience.</p>

        {error ? (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        ) : null}

        <div className="grid lg:grid-cols-5 gap-8">
          <div className="lg:col-span-3">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="bg-white border border-border rounded-xl p-6">
                <h3 className="text-lg font-bold mb-5 text-foreground">1. Your Details</h3>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="fullName" className="block text-sm font-medium text-foreground mb-1.5">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="fullName"
                      name="fullName"
                      placeholder="e.g. Kwame Asante"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      required
                      autoComplete="name"
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${formErrors.fullName ? "border-red-400" : "border-border"}`}
                    />
                    {formErrors.fullName ? <p className="text-red-500 text-xs mt-1">{formErrors.fullName}</p> : null}
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-foreground mb-1.5">
                        Email <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        placeholder="you@example.com"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        readOnly={!!user?.email}
                        autoComplete="email"
                        className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${user?.email ? "bg-slate-50 text-muted-foreground cursor-not-allowed" : ""} ${formErrors.email ? "border-red-400" : "border-border"}`}
                      />
                      {formErrors.email ? <p className="text-red-500 text-xs mt-1">{formErrors.email}</p> : null}
                    </div>
                    <div>
                      <label htmlFor="phone" className="block text-sm font-medium text-foreground mb-1.5">
                        Phone <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        placeholder="0241234567"
                        value={formData.phone}
                        onChange={handleInputChange}
                        required
                        autoComplete="tel"
                        className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${formErrors.phone ? "border-red-400" : "border-border"}`}
                      />
                      {formErrors.phone ? <p className="text-red-500 text-xs mt-1">{formErrors.phone}</p> : null}
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white border border-border rounded-xl p-6">
                <h3 className="text-lg font-bold mb-5 text-foreground">2. Payment Method</h3>
                <div className="space-y-3">
                  <label className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition ${paymentMethod === "card" ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"}`}>
                    <input type="radio" name="paymentMethod" value="card" checked={paymentMethod === "card"} onChange={() => setPaymentMethod("card")} className="w-4 h-4 text-primary" />
                    <CreditCard className="w-5 h-5 text-primary ml-3" />
                    <div className="ml-3 flex-1">
                      <span className="font-semibold text-foreground">Credit / Debit Card</span>
                      <p className="text-xs text-muted-foreground">Visa, Mastercard — processed securely by Paystack</p>
                    </div>
                  </label>

                  <label className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition ${paymentMethod === "momo" ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"}`}>
                    <input type="radio" name="paymentMethod" value="momo" checked={paymentMethod === "momo"} onChange={() => setPaymentMethod("momo")} className="w-4 h-4 text-primary" />
                    <Smartphone className="w-5 h-5 text-primary ml-3" />
                    <div className="ml-3 flex-1">
                      <span className="font-semibold text-foreground">Mobile Money</span>
                      <p className="text-xs text-muted-foreground">MTN MoMo, Vodafone Cash, AirtelTigo Money</p>
                    </div>
                  </label>

                  <label className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition ${paymentMethod === "whatsapp" ? "border-green-500 bg-green-50" : "border-border hover:border-green-400"}`}>
                    <input type="radio" name="paymentMethod" value="whatsapp" checked={paymentMethod === "whatsapp"} onChange={() => setPaymentMethod("whatsapp")} className="w-4 h-4 text-green-600" />
                    <MessageCircle className="w-5 h-5 text-green-600 ml-3" />
                    <div className="ml-3 flex-1">
                      <span className="font-semibold text-foreground">Book via WhatsApp</span>
                      <p className="text-xs text-muted-foreground">Opens WhatsApp with your booking details pre-filled</p>
                    </div>
                  </label>
                </div>
              </div>

              {paymentMethod === "card" ? (
                <div className="bg-slate-50 border border-border rounded-xl p-5 flex items-start gap-3">
                  <Shield className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-foreground mb-1">Secure Card Payment</p>
                    <p className="text-xs text-muted-foreground">
                      After clicking "Pay Now", you'll be redirected to Paystack's secure payment page to enter your card details. Your card information never touches our servers.
                    </p>
                  </div>
                </div>
              ) : null}

              {paymentMethod === "momo" ? (
                <div className="bg-white border border-border rounded-xl p-6 space-y-4">
                  <h3 className="text-lg font-bold text-foreground">Mobile Money Details</h3>
                  <div>
                    <label htmlFor="momoNetwork" className="block text-sm font-medium text-foreground mb-1.5">
                      Network <span className="text-red-500">*</span>
                    </label>
                    <select id="momoNetwork" name="momoNetwork" value={formData.momoNetwork} onChange={handleInputChange} className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary">
                      <option value="mtn">MTN Mobile Money</option>
                      <option value="vodafone">Vodafone Cash</option>
                      <option value="airteltigo">AirtelTigo Money</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="momoPhone" className="block text-sm font-medium text-foreground mb-1.5">
                      MoMo Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      id="momoPhone"
                      name="momoPhone"
                      placeholder="0241234567"
                      value={formData.momoPhone}
                      onChange={handleInputChange}
                      required
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${formErrors.momoPhone ? "border-red-400" : "border-border"}`}
                    />
                    {formErrors.momoPhone ? <p className="text-red-500 text-xs mt-1">{formErrors.momoPhone}</p> : null}
                  </div>
                  <div className="bg-slate-50 border border-border rounded-lg p-3 flex items-start gap-2">
                    <Shield className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <p className="text-xs text-muted-foreground">
                      You'll be redirected to Paystack to approve the payment from your mobile money wallet.
                    </p>
                  </div>
                </div>
              ) : null}

              {paymentMethod === "whatsapp" ? (
                <div className="bg-white border border-green-200 rounded-xl p-6 space-y-4">
                  <h3 className="text-lg font-bold text-foreground">WhatsApp Booking</h3>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
                    <MessageCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-green-900 mb-1">How it works</p>
                      <ol className="text-xs text-green-800 space-y-1 list-decimal list-inside">
                        <li>Fill in your details above</li>
                        <li>Click "Open WhatsApp" below</li>
                        <li>WhatsApp opens with your booking details pre-filled</li>
                        <li>Send the message to our team to complete booking</li>
                      </ol>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">Additional Notes (Optional)</label>
                    <textarea
                      name="notes"
                      value={formData.notes}
                      onChange={handleInputChange}
                      placeholder="Any special requests or questions..."
                      rows={2}
                      className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
                    />
                  </div>
                </div>
              ) : null}

              <button
                type="submit"
                disabled={processing}
                className="w-full px-6 py-4 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-xl font-bold text-lg hover:shadow-xl transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {processing ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Processing...
                  </>
                ) : paymentMethod === "whatsapp" ? (
                  <>
                    <MessageCircle className="w-5 h-5" />
                    Open WhatsApp to Book
                  </>
                ) : (
                  `Pay GHS ${packagePrice.toLocaleString()} Now`
                )}
              </button>
            </form>
          </div>

          <div className="lg:col-span-2">
            <div className="bg-white border border-border rounded-xl p-6 sticky top-24">
              <h3 className="text-lg font-bold mb-5 text-foreground">Order Summary</h3>

              {packageData ? (
                <>
                  {packageData.images?.[0] ? (
                    <div className="relative h-40 rounded-lg overflow-hidden mb-4 bg-gray-100">
                      <Image
                        src={packageData.images[0]}
                        alt={packageData.name}
                        fill
                        className="object-cover"
                        sizes="(max-width: 1024px) 100vw, 360px"
                      />
                    </div>
                  ) : null}

                  <h4 className="font-bold text-foreground mb-1">{packageData.name}</h4>
                  <p className="text-sm text-muted-foreground mb-4">{packageData.description}</p>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="w-4 h-4" />
                      <span>{packageData.duration}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="w-4 h-4" />
                      <span className="capitalize">{packageData.category}</span>
                    </div>
                  </div>

                  {packageData.highlights?.length > 0 ? (
                    <div className="border-t border-border pt-4 mb-4">
                      <p className="text-xs font-semibold text-muted-foreground uppercase mb-2">Highlights</p>
                      <ul className="space-y-1">
                        {packageData.highlights.slice(0, 4).map((highlight, index) => (
                          <li key={index} className="flex items-start gap-2 text-xs text-foreground">
                            <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                            {highlight}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : null}

                  <div className="border-t border-border pt-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Package Price</span>
                      <span className="font-semibold text-foreground">GHS {packagePrice.toLocaleString()}</span>
                    </div>
                  </div>
                  <div className="border-t border-border mt-3 pt-3">
                    <div className="flex justify-between text-xl font-bold text-primary">
                      <span>Total</span>
                      <span>GHS {packagePrice.toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
                    <Shield className="w-4 h-4 text-green-600" />
                    <span>Payments secured by Paystack</span>
                  </div>
                </>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
