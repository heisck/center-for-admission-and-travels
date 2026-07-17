import { Suspense } from 'react'

import PublicNavbar from '@/components/public-navbar'
import Footer from '@/components/footer-server'
import PackagesPageClient from '@/app/packages/packages-page-client'
import PackagesSeoPanel from '@/components/packages-seo-panel'
import {
  BreadcrumbStructuredData,
  FaqStructuredData,
  PackagesItemListStructuredData,
} from '@/components/structured-data'
import { getPackagesPageContent, getSiteChromeContent } from '@/lib/public-content'

export const revalidate = 300

const PACKAGES_FAQS = [
  {
    question: 'What is CA Travels (CFAAT)?',
    answer:
      'Center for Admission and Travels (CA Travels / CFAAT) is a Ghana-based consultancy for study abroad, work abroad, and international travel packages, with admission guidance, visa support, and tour planning.',
  },
  {
    question: 'Can I book travel packages from Ghana with CA Travels?',
    answer:
      'Yes. Our packages page lists study, work, and travel options. You can book online via secure Paystack checkout or contact our team for custom travel abroad planning.',
  },
  {
    question: 'Do you help with study abroad and work abroad from Ghana?',
    answer:
      'Yes. CFAAT supports university admission pathways, documentation, and work-abroad guidance alongside leisure and tour packages to destinations such as Dubai, Europe, Asia, the UK, and Canada.',
  },
  {
    question: 'Do you support people travelling to Ghana or from Ghana?',
    answer:
      'We primarily serve clients in Ghana planning international study, work, and travel. Contact us for current itineraries, pricing, and destination support.',
  },
]

export default async function PackagesPage() {
  const [packages, chrome] = await Promise.all([getPackagesPageContent(), getSiteChromeContent()])

  return (
    <main className="min-h-screen bg-transparent">
      <BreadcrumbStructuredData
        items={[
          { name: 'Home', path: '/' },
          { name: 'Packages', path: '/packages' },
        ]}
      />
      <PackagesItemListStructuredData packages={packages} />
      {/* JSON-LD always present for search engines */}
      <FaqStructuredData faqs={PACKAGES_FAQS} />

      <PublicNavbar currentPath="/packages" />
      <Suspense fallback={<div className="py-24" aria-hidden />}>
        <PackagesPageClient packages={packages} />
      </Suspense>

      <PackagesSeoPanel faqs={PACKAGES_FAQS} />

      <Footer contact={chrome.contact} footer={chrome.footer} />
    </main>
  )
}
