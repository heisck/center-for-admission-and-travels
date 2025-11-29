"use client"

import { Suspense } from "react"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import ApplyFormContent from "./apply-form-content"

export default function ApplyPage() {
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

            <Suspense fallback={<div className="h-96 bg-white rounded-2xl shadow-xl animate-pulse" />}>
              <ApplyFormContent />
            </Suspense>

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
