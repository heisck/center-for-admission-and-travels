"use client"

import { useState } from "react"
import { allCountries } from "@/data/countries"

interface SharedBookingFormProps {
  serviceType?: string
  onSubmitSuccess?: () => void
}

export default function SharedBookingForm({ serviceType: initialServiceType, onSubmitSuccess }: SharedBookingFormProps) {
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
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
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
          <label className="block text-sm font-semibold text-foreground mb-2">Service Type</label>
          <select
            name="serviceType"
            value={formData.serviceType}
            onChange={handleChange}
            required
            disabled={!!initialServiceType}
            className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition disabled:bg-muted disabled:cursor-not-allowed"
          >
            <option value="">Select a service</option>
            <option value="Study Abroad">Study Abroad</option>
            <option value="Work Abroad">Work Abroad</option>
            <option value="Global Network">Global Network</option>
          </select>
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
    </div>
  )
}
