import PublicNavbar from "@/components/public-navbar"
import Footer from "@/components/footer-server"

import MyPaymentsClient from "@/app/my-payments/my-payments-client"
import { getSiteChromeContent } from "@/lib/public-content"

export const revalidate = 300

export default async function MyPaymentsPage() {
  const chrome = await getSiteChromeContent()

  return (
    <main className="min-h-screen bg-background">
      <PublicNavbar />
      <MyPaymentsClient supportWhatsAppNumber={chrome.contact.whatsappNumber} />
      <Footer contact={chrome.contact} footer={chrome.footer} />
    </main>
  )
}
