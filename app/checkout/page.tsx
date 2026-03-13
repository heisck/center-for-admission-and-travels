import { Suspense } from "react"
import { Loader2 } from "lucide-react"

import PublicNavbar from "@/components/public-navbar"
import Footer from "@/components/footer-server"
import CheckoutClient from "@/app/checkout/checkout-client"
import { getSiteChromeContent } from "@/lib/public-content"

export const revalidate = 300

export default async function CheckoutPage() {
  const chrome = await getSiteChromeContent()

  return (
    <main className="min-h-screen bg-background">
      <PublicNavbar />
      <Suspense
        fallback={
          <div className="flex items-center justify-center py-32">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        }
      >
        <CheckoutClient supportWhatsAppNumber={chrome.contact.whatsappNumber} />
      </Suspense>
      <Footer contact={chrome.contact} footer={chrome.footer} />
    </main>
  )
}
