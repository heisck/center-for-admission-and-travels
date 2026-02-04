"use client"

import Link from "next/link"
import { useUserAuth } from "@/context/user-auth-context"

export default function CTASection() {
  const { user, isLoading } = useUserAuth()
  const isLoggedIn = !!user

  return (
    <section className="py-20 bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-4xl md:text-5xl font-bold mb-6">
          Ready to{" "}
          <span className="bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
            Start Your Journey?
          </span>
        </h2>
        <p className="text-xl text-muted-foreground mb-10 leading-relaxed">
          Let Center for Admission and Travels guide you to your global opportunity. Contact us today for a free
          consultation.
        </p>
        <div className="flex gap-4 justify-center flex-wrap">
          {isLoading ? (
            <div className="px-8 py-3 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-lg font-semibold opacity-60">
              Loading...
            </div>
          ) : (
            <Link
              href={isLoggedIn ? "/contact" : "/signin"}
              className="px-8 py-3 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-lg font-semibold hover:shadow-xl transition transform hover:scale-105"
            >
              {isLoggedIn ? "Contact Us Today" : "Get Started Today"}
            </Link>
          )}
          <a
            href="#services"
            className="px-8 py-3 border-2 border-primary text-primary rounded-lg font-semibold hover:bg-primary hover:text-white transition"
          >
            Explore Services
          </a>
        </div>
      </div>
    </section>
  )
}
