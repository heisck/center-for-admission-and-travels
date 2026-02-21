"use client"

import { useState } from "react"
import { allCountries } from "@/data/countries"

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
  })
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })

    if (name === "serviceType" && onServiceChange) {
      onServiceChange(value)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          packageId: "general-inquiry",
          fullName: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          notes: `Service: ${formData.serviceType} | Country: ${formData.country} | ${formData.notes}`,
          method: "form",
        }),
      })

      if (response.ok) {
        setSubmitted(true)
        setFormData({
          fullName: "",
          email: "",
          phone: "",
          country: "",
          serviceType: initialServiceType || "",
          notes: "",
        })

        setTimeout(() => {
          setSubmitted(false)
          if (onSubmitSuccess) onSubmitSuccess()
        }, 5000)
      } else {
        setError("Something went wrong. Please try again.")
      }
    } catch {
      setError("Failed to submit. Please check your connection and try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      {submitted && (
        <div className="mb-6 p-4 bg-green-100 border border-green-300 text-green-700 rounded-lg animate-fade-in">
          Thank you! Your booking request has been received. We'll contact you within 24 hours to confirm your details.
        </div>
      )}

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-300 text-red-700 rounded-lg">
          {error}
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
              placeholder="0241234567"
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

        <button
          type="submit"
          disabled={loading}
          className="w-full px-6 py-4 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-lg font-bold text-lg hover:shadow-xl transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Submitting..." : "Submit Booking Request"}
        </button>

        <p className="text-xs text-muted-foreground text-center">
          Our team will reach out within 24 hours to discuss your options and arrange any payments.
        </p>
      </form>
    </div>
  )
}
