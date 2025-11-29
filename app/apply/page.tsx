"use client"

import { useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import SharedBookingForm from "@/components/shared-booking-form"

export default function ApplyPage() {
  const searchParams = useSearchParams()
  const serviceParam = searchParams.get("service")
  const [selectedService, setSelectedService] = useState<string>(serviceParam || "")
  const [isHydrated, setIsHydrated] = useState(false)

  useEffect(() => {
    setIsHydrated(true)
  }, [])

  if (!isHydrated) return null

  return (
    <main className="min-h-screen bg-background flex flex-col">
      <Navbar />

      <div className="flex-grow">
        <section className="py-12 md:py-20 bg-gradient-to-br from-orange-50 to-red-50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                <span className="bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                  Start Your Journey
                </span>
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Fill out the form below to begin your application. Our team will review your details and contact you within 24 hours.
              </p>
            </div>

            {/* Form Section */}
            <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
              <h2 className="text-2xl font-bold text-foreground mb-2">
                Application Form
              </h2>
              <p className="text-muted-foreground mb-8">
                Select your service below and fill in your details. You can change your service selection at any time using the dropdown.
              </p>
              <SharedBookingForm serviceType={selectedService || undefined} onServiceChange={setSelectedService} />
            </div>

            {/* Info Cards */}
            <div className="grid md:grid-cols-2 gap-6 mt-12">
              <div className="bg-white rounded-xl p-6 border border-border shadow-sm">
                <h3 className="font-bold text-foreground mb-3 flex items-center gap-2">
                  <span className="text-2xl">💬</span> Need Help?
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Our advisors are available to answer your questions and guide you through the application process.
                </p>
                <a href="mailto:info@centerforadmissionandtravels.com" className="text-primary font-semibold hover:underline text-sm">
                  Contact Support →
                </a>
              </div>

              <div className="bg-white rounded-xl p-6 border border-border shadow-sm">
                <h3 className="font-bold text-foreground mb-3 flex items-center gap-2">
                  <span className="text-2xl">❓</span> Have Questions?
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Check our contact page for frequently asked questions and additional resources.
                </p>
                <a href="/contact" className="text-primary font-semibold hover:underline text-sm">
                  Visit Contact Page →
                </a>
              </div>
            </div>
          </div>
        </section>
      </div>

      <Footer />
    </main>
  )
}
