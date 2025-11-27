"use client"

import type React from "react"

import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import { useState } from "react"
import { useSearchParams } from "next/navigation"
import { CreditCard, Smartphone } from "lucide-react"

export default function Checkout() {
  const searchParams = useSearchParams()
  const packageId = searchParams.get("id")
  const [paymentMethod, setPaymentMethod] = useState<"card" | "momo" | "email">("card")
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    cardNumber: "",
    expiryDate: "",
    cvv: "",
    momoNetwork: "mtn",
    momoPhone: "",
  })

  const packageName = packageId === "1" ? "Dubai Experience" : "European Tour"
  const packagePrice = packageId === "1" ? 899 : 1299

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    alert("Booking confirmed! You will receive confirmation details via email.")
  }

  return (
    <main className="min-h-screen bg-background">
      <Navbar />

      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold mb-4">
            <span className="bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
              Complete Your Booking
            </span>
          </h1>
          <p className="text-muted-foreground mb-12">Secure payment for {packageName}</p>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Form */}
            <div className="md:col-span-2">
              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Personal Information */}
                <div className="bg-white border border-border rounded-xl p-6">
                  <h3 className="text-xl font-bold mb-6 text-foreground">Personal Information</h3>
                  <div className="space-y-4">
                    <input
                      type="text"
                      name="fullName"
                      placeholder="Full Name"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    <input
                      type="email"
                      name="email"
                      placeholder="Email Address"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    <input
                      type="tel"
                      name="phone"
                      placeholder="Phone Number"
                      value={formData.phone}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>

                {/* Payment Method Selection */}
                <div className="bg-white border border-border rounded-xl p-6">
                  <h3 className="text-xl font-bold mb-6 text-foreground">Payment Method</h3>
                  <div className="space-y-3">
                    <label
                      className="flex items-center p-4 border border-border rounded-lg cursor-pointer hover:bg-slate-50 transition"
                      onClick={() => setPaymentMethod("card")}
                    >
                      <input
                        type="radio"
                        checked={paymentMethod === "card"}
                        readOnly
                        className="w-4 h-4 text-primary"
                      />
                      <CreditCard className="w-5 h-5 text-primary ml-3" />
                      <span className="ml-3 font-semibold text-foreground">Credit/Debit Card</span>
                    </label>

                    <label
                      className="flex items-center p-4 border border-border rounded-lg cursor-pointer hover:bg-slate-50 transition"
                      onClick={() => setPaymentMethod("momo")}
                    >
                      <input
                        type="radio"
                        checked={paymentMethod === "momo"}
                        readOnly
                        className="w-4 h-4 text-primary"
                      />
                      <Smartphone className="w-5 h-5 text-primary ml-3" />
                      <span className="ml-3 font-semibold text-foreground">Mobile Money</span>
                    </label>

                    <label
                      className="flex items-center p-4 border border-border rounded-lg cursor-pointer hover:bg-slate-50 transition"
                      onClick={() => setPaymentMethod("email")}
                    >
                      <input
                        type="radio"
                        checked={paymentMethod === "email"}
                        readOnly
                        className="w-4 h-4 text-primary"
                      />
                      <span className="ml-8 font-semibold text-foreground">Book via Email/WhatsApp</span>
                    </label>
                  </div>
                </div>

                {/* Card Payment */}
                {paymentMethod === "card" && (
                  <div className="bg-white border border-border rounded-xl p-6 space-y-4">
                    <h3 className="text-lg font-bold text-foreground">Card Details</h3>
                    <input
                      type="text"
                      name="cardNumber"
                      placeholder="Card Number"
                      value={formData.cardNumber}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    <div className="grid grid-cols-2 gap-4">
                      <input
                        type="text"
                        name="expiryDate"
                        placeholder="MM/YY"
                        value={formData.expiryDate}
                        onChange={handleInputChange}
                        required
                        className="px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                      <input
                        type="text"
                        name="cvv"
                        placeholder="CVV"
                        value={formData.cvv}
                        onChange={handleInputChange}
                        required
                        className="px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                  </div>
                )}

                {/* Mobile Money Payment */}
                {paymentMethod === "momo" && (
                  <div className="bg-white border border-border rounded-xl p-6 space-y-4">
                    <h3 className="text-lg font-bold text-foreground">Mobile Money Details</h3>
                    <select
                      name="momoNetwork"
                      value={formData.momoNetwork}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="mtn">MTN Mobile Money</option>
                      <option value="vodafone">Vodafone Cash</option>
                      <option value="airteltigo">AirtelTigo Money</option>
                    </select>
                    <input
                      type="tel"
                      name="momoPhone"
                      placeholder="Mobile Money Phone Number"
                      value={formData.momoPhone}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                )}

                {/* Email/WhatsApp Option */}
                {paymentMethod === "email" && (
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                    <p className="text-foreground">
                      We'll send you booking details and payment instructions via email and WhatsApp. No credit card
                      required!
                    </p>
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full px-6 py-4 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-lg font-bold text-lg hover:shadow-xl transition"
                >
                  {paymentMethod === "email" ? "Book Now" : "Proceed to Payment"}
                </button>
              </form>
            </div>

            {/* Order Summary */}
            <div className="bg-slate-50 rounded-xl p-6 h-fit sticky top-24">
              <h3 className="text-xl font-bold mb-6 text-foreground">Order Summary</h3>
              <div className="space-y-4 pb-6 border-b">
                <div className="flex justify-between">
                  <span className="text-foreground">{packageName}</span>
                  <span className="font-bold text-foreground">${packagePrice}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Taxes & Fees</span>
                  <span className="text-muted-foreground">${Math.round(packagePrice * 0.1)}</span>
                </div>
              </div>
              <div className="flex justify-between pt-6 text-2xl font-bold text-primary">
                <span>Total</span>
                <span>${Math.round(packagePrice * 1.1)}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
