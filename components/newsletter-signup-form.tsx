'use client'

import { useState } from "react"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"

export default function NewsletterSignupForm() {
  const [newsletterEmail, setNewsletterEmail] = useState("")
  const [newsletterLoading, setNewsletterLoading] = useState(false)

  const handleNewsletterSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!newsletterEmail.trim()) return

    setNewsletterLoading(true)
    try {
      const response = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: newsletterEmail }),
      })
      const data = await response.json()

      if (data.success) {
        toast.success(data.message)
        setNewsletterEmail("")
      } else {
        toast.error(data.error || "Subscription failed")
      }
    } catch {
      toast.error("Something went wrong. Please try again.")
    } finally {
      setNewsletterLoading(false)
    }
  }

  return (
    <form onSubmit={handleNewsletterSubmit} className="space-y-2">
      <label htmlFor="newsletter-email" className="text-sm font-semibold block">Stay updated</label>
      <div className="flex w-full max-w-full flex-col gap-2 sm:flex-row">
        <input
          id="newsletter-email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="Your email"
          value={newsletterEmail}
          onChange={(event) => setNewsletterEmail(event.target.value)}
          disabled={newsletterLoading}
          className="w-full min-w-0 px-3 py-2 rounded-lg bg-slate-800 border border-slate-600 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-primary text-sm sm:flex-1"
        />
        <button
          type="submit"
          disabled={newsletterLoading}
          className="flex w-full shrink-0 items-center justify-center gap-2 whitespace-nowrap px-4 py-2 bg-primary text-white rounded-lg font-semibold text-sm hover:bg-primary/90 transition disabled:opacity-50 sm:w-auto"
        >
          {newsletterLoading ? <Loader2 size={16} className="animate-spin" /> : "Subscribe"}
        </button>
      </div>
    </form>
  )
}
