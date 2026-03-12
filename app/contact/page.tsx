import Navbar from "@/components/navbar"
import Footer from "@/components/footer"

import ContactPageClient from "@/app/contact/contact-page-client"
import { getSiteChromeContent } from "@/lib/public-content"

export const revalidate = 300

export default async function Contact() {
  const chrome = await getSiteChromeContent()

  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <ContactPageClient contact={chrome.contact} />
      <Footer contact={chrome.contact} footer={chrome.footer} />
    </main>
  )
}
