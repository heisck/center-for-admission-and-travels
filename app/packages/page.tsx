import { Suspense } from "react"

import PublicNavbar from "@/components/public-navbar"
import Footer from "@/components/footer-server"

import PackagesPageClient from "@/app/packages/packages-page-client"
import { getPackagesPageContent, getSiteChromeContent } from "@/lib/public-content"

export const revalidate = 300

export default async function PackagesPage() {
  const [packages, chrome] = await Promise.all([getPackagesPageContent(), getSiteChromeContent()])

  return (
    <main className="min-h-screen bg-background">
      <PublicNavbar currentPath="/packages" />
      <Suspense fallback={<div className="py-24" />}>
        <PackagesPageClient packages={packages} />
      </Suspense>
      <Footer contact={chrome.contact} footer={chrome.footer} />
    </main>
  )
}
