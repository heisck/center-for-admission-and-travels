import Link from 'next/link'
import { ArrowRight, MapPin, Plane } from 'lucide-react'

import PublicNavbar from '@/components/public-navbar'
import Footer from '@/components/footer-server'
import {
  BreadcrumbStructuredData,
  FaqStructuredData,
  ServiceStructuredData,
} from '@/components/structured-data'
import { createMetadata } from '@/lib/metadata'
import { getSiteChromeContent } from '@/lib/public-content'

export const revalidate = 3600

export const metadata = createMetadata({
  title: 'Travel Abroad from Ghana — Tours & Packages | CA Travels (CFAAT)',
  description:
    'Travel abroad from Ghana with CA Travels. International tour packages to Dubai, Europe, Asia, and more — planned from Accra with local support, clear pricing, and secure online booking.',
  path: '/travel-abroad-ghana',
  keywords: [
    'travel abroad from Ghana',
    'travel abroad Ghana',
    'travel packages Ghana',
    'tours from Ghana',
    'Dubai tour from Ghana',
    'Europe tour Ghana',
    'travel agency Accra',
    'CA Travels tours',
  ],
})

const FAQS = [
  {
    question: 'Where can I travel abroad from Ghana with CA Travels?',
    answer:
      'Popular packages include Dubai, Europe, Asia, and other international destinations. Check the packages page for live itineraries and prices.',
  },
  {
    question: 'Can I book travel packages online from Ghana?',
    answer:
      'Yes. You can browse packages, check out securely via Paystack, or contact our team on WhatsApp for a guided booking.',
  },
  {
    question: 'Do you only serve Accra?',
    answer:
      'No. We serve clients across Ghana and support travellers elsewhere in West Africa who want organised international trips.',
  },
]

export default async function TravelAbroadGhanaPage() {
  const chrome = await getSiteChromeContent()

  return (
    <main className="min-h-screen bg-background">
      <BreadcrumbStructuredData
        items={[
          { name: 'Home', path: '/' },
          { name: 'Ghana', path: '/ghana' },
          { name: 'Travel Abroad from Ghana', path: '/travel-abroad-ghana' },
        ]}
      />
      <ServiceStructuredData
        name="Travel Abroad from Ghana — CA Travels"
        serviceType="Travel agency"
        description="International travel packages and tours for clients booking from Ghana and West Africa."
        path="/travel-abroad-ghana"
      />
      <FaqStructuredData faqs={FAQS} />

      <PublicNavbar currentPath="/travel-tours" />

      <section className="py-16 md:py-24 bg-gradient-to-br from-orange-50 to-red-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="inline-flex items-center gap-2 text-sm font-semibold text-primary mb-4">
            <MapPin className="w-4 h-4" /> Travel packages booked from Ghana
          </p>
          <h1 className="text-4xl sm:text-5xl font-bold mb-6 max-w-4xl">
            <span className="bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
              Travel abroad from Ghana — tours planned with local support
            </span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl leading-relaxed">
            Searching for <strong>travel abroad</strong> options while you are in Ghana?{' '}
            <strong>CA Travels (CFAAT)</strong> offers curated international packages with clear pricing,
            destination guidance, and a Ghana-based team you can reach before and after you book.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/packages?filter=travel"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-orange-600 to-red-600 text-white font-semibold"
            >
              See travel packages <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/travel-tours"
              className="px-6 py-3 rounded-xl border border-border bg-white font-semibold"
            >
              Travel & tours
            </Link>
            <Link href="/contact" className="px-6 py-3 rounded-xl border border-border bg-white font-semibold">
              Talk to us
            </Link>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid md:grid-cols-3 gap-6">
          {[
            {
              title: 'Dubai & UAE',
              body: 'Short breaks and group-friendly itineraries popular with travellers from Ghana.',
            },
            {
              title: 'Europe',
              body: 'Multi-city and landmark-focused packages for first-time and repeat travellers.',
            },
            {
              title: 'Asia & more',
              body: 'Flexible routes — check live packages for current destinations and seasons.',
            },
          ].map((item) => (
            <article key={item.title} className="border border-border rounded-2xl p-6 bg-white">
              <Plane className="w-7 h-7 text-primary mb-3" />
              <h2 className="text-lg font-bold mb-2">{item.title}</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">{item.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="py-16 bg-slate-50 border-y border-border">
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="text-2xl font-bold mb-6">Travel abroad FAQs (Ghana)</h2>
          <dl className="space-y-4">
            {FAQS.map((faq) => (
              <div key={faq.question} className="bg-white border border-border rounded-xl p-5">
                <dt className="font-semibold mb-1">{faq.question}</dt>
                <dd className="text-sm text-muted-foreground leading-relaxed">{faq.answer}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <Footer contact={chrome.contact} footer={chrome.footer} />
    </main>
  )
}
