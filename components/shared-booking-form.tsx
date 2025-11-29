"use client"

import { useState } from "react"
import { allCountries } from "@/data/countries"
import { CreditCard } from "lucide-react"

interface SharedBookingFormProps {
  serviceType?: string
  onSubmitSuccess?: () => void
  onServiceChange?: (service: string) => void
}

export default function SharedBookingForm({ serviceType: initialServiceType, onSubmitSuccess, onServiceChange }: SharedBookingFormProps) {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    country: "",
    serviceType: initialServiceType || "",
    notes: "",
    paymentOption: "pay-later",
  })
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value,
    })

    if (name === "serviceType" && onServiceChange) {
      onServiceChange(value)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    setTimeout(() => {
      setSubmitted(true)
      setFormData({
        fullName: "",
        email: "",
        phone: "",
        country: "",
        serviceType: initialServiceType || "",
        notes: "",
        paymentOption: "pay-later",
      })
      setLoading(false)

      setTimeout(() => {
        setSubmitted(false)
        if (onSubmitSuccess) onSubmitSuccess()
      }, 5000)
    }, 1000)
  }

  return (
    <div className="max-w-2xl mx-auto">
      {submitted && (
        <div className="mb-6 p-4 bg-green-100 border border-green-300 text-green-700 rounded-lg animate-fade-in">
          Thank you! Your booking request has been received. We'll contact you within 24 hours to confirm your details.
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6 bg-white p-8 rounded-xl shadow-lg border border-border">
        <div>
          <label className="block text-sm font-semibold text-foreground mb-2">Service Type</label>
          <select
            name="serviceType"
            value={formData.serviceType}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition"
          >
            <option value="">Select a service</option>
            <option value="Study Abroad">Study Abroad</option>
            <option value="Work Abroad">Work Abroad</option>
            <option value="Travel & Tours">Travel & Tours</option>
          </select>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-foreground mb-2">Full Name</label>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              required
              placeholder="Your full name"
              className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-foreground mb-2">Email Address</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="your.email@example.com"
              className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition"
            />
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-foreground mb-2">Phone Number</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              required
              placeholder="+233 XXX XXX XXX"
              className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-foreground mb-2">Country of Interest</label>
            <select
              name="country"
              value={formData.country}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition"
            >
              <option value="">Select a country</option>
              {allCountries.map((country) => (
                <option key={country.name} value={country.name}>
                  {country.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-foreground mb-2">Additional Notes</label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            placeholder="Tell us about your goals and any specific requirements..."
            rows={4}
            className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition resize-none"
          ></textarea>
        </div>

        <div className="space-y-3">
          <label className="block text-sm font-semibold text-foreground mb-3">Payment Option</label>
          <div className="space-y-2">
            <label className="flex items-center p-3 border border-border rounded-lg cursor-pointer hover:bg-slate-50 transition">
              <input
                type="radio"
                name="paymentOption"
                value="pay-now"
                checked={formData.paymentOption === "pay-now"}
                onChange={handleChange}
                className="w-4 h-4 text-primary"
              />
              <span className="ml-3 font-semibold text-foreground">Pay Now</span>
            </label>
            <label className="flex items-center p-3 border border-border rounded-lg cursor-pointer hover:bg-slate-50 transition">
              <input
                type="radio"
                name="paymentOption"
                value="pay-later"
                checked={formData.paymentOption === "pay-later"}
                onChange={handleChange}
                className="w-4 h-4 text-primary"
              />
              <span className="ml-3 font-semibold text-foreground">Pay Later</span>
            </label>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full px-6 py-4 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-lg font-bold text-lg hover:shadow-xl transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Processing..." : formData.paymentOption === "pay-now" ? "Proceed to Payment" : "Submit Booking Request"}
        </button>

        <p className="text-xs text-muted-foreground text-center">
          We respect your privacy. Your information will only be used to process your booking request.
        </p>
      </form>

      {/* Conditional Checkout Section - Only show if "Pay Now" is selected */}
      {formData.paymentOption === "pay-now" && (
        <div className="mt-8 bg-white rounded-2xl shadow-xl p-8 border border-border">
          <div className="flex items-center gap-3 mb-6">
            <CreditCard className="w-6 h-6 text-primary" />
            <h3 className="text-2xl font-bold text-foreground">Payment Details</h3>
          </div>

          <div className="space-y-6">
            {/* Payment Summary */}
            <div className="bg-slate-50 rounded-lg p-6 border border-border">
              <h4 className="font-bold text-foreground mb-4">Order Summary</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Service:</span>
                  <span className="font-semibold">{formData.serviceType || "Not selected"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Name:</span>
                  <span className="font-semibold">{formData.fullName || "Not provided"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Country:</span>
                  <span className="font-semibold">{formData.country || "Not selected"}</span>
                </div>
                <div className="border-t pt-2 mt-4 flex justify-between">
                  <span className="font-bold">Total Amount:</span>
                  <span className="text-lg font-bold text-primary">GHS 500.00</span>
                </div>
              </div>
            </div>

            {/* Payment Methods */}
            <div>
              <h4 className="font-bold text-foreground mb-4">Select Payment Method</h4>
              <div className="grid gap-3">
                <label className="flex items-center p-4 border-2 border-border rounded-lg cursor-pointer hover:border-primary transition">
                  <input type="radio" name="paymentMethod" value="card" defaultChecked className="w-4 h-4 text-primary" />
                  <span className="ml-3 font-semibold text-foreground">Credit/Debit Card</span>
                </label>
                <label className="flex items-center p-4 border-2 border-border rounded-lg cursor-pointer hover:border-primary transition">
                  <input type="radio" name="paymentMethod" value="momo" className="w-4 h-4 text-primary" />
                  <span className="ml-3 font-semibold text-foreground">Mobile Money (MTN/Vodafone)</span>
                </label>
                <label className="flex items-center p-4 border-2 border-border rounded-lg cursor-pointer hover:border-primary transition">
                  <input type="radio" name="paymentMethod" value="bank" className="w-4 h-4 text-primary" />
                  <span className="ml-3 font-semibold text-foreground">Bank Transfer</span>
                </label>
              </div>
            </div>

            {/* Placeholder for Payment Processor Integration */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
              💳 Payment gateway (Stripe, Paystack, etc.) will be integrated here based on your choice.
            </div>

            <button
              type="button"
              className="w-full px-6 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg font-bold text-lg hover:shadow-xl transition"
            >
              Complete Payment
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
