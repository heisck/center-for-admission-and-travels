import Link from 'next/link'
import { MapPin, GraduationCap, Briefcase, Plane, Phone, ArrowRight } from 'lucide-react'

import PublicNavbar from '@/components/public-navbar'
import Footer from '@/components/footer-server'
import {
  BreadcrumbStructuredData,
  FaqStructuredData,
  ServiceStructuredData,
} from '@/components/structured-data'
import { createMetadata } from '@/lib/metadata'
import { getSiteChromeContent } from '@/lib/public-content'
import { WEST_AFRICA_SERVICE_AREAS } from '@/lib/seo-local'

export const revalidate = 3600

export const metadata = createMetadata({
  title: 'Travel Agency in Ghana (Accra) — Study Abroad, Work Abroad & Tours | CA Travels',
  description:
    'Looking for a travel or study-abroad agency in Ghana? CA Travels (CFAAT) in Accra helps people across Ghana and West Africa with study abroad, work abroad, visa guidance, and international travel packages.',
  path: '/ghana',
  keywords: [
    'travel agency Ghana',
    'travel agency Accra',
    'study abroad Ghana',
    'travel abroad Ghana',
    'work abroad Ghana',
    'CA Travels Accra',
    'CFAAT Ghana',
    'visa assistance Accra',
    'West Africa travel agency',
  ],
})

const FAQS = [
  {
    question: 'Is CA Travels a real travel agency in Ghana?',
    answer:
      'Yes. Center for Admission and Travels (CA Travels / CFAAT) is based in Ghana and supports clients with study abroad, work abroad, and international travel packages, including planning and documentation guidance.',
  },
  {
    question: 'Do you serve people outside Accra?',
    answer:
      'Yes. We support clients nationwide across Ghana and work with clients elsewhere in West Africa who want study, work, or travel pathways abroad.',
  },
  {
    question: 'What should I search for to find you?',
    answer:
      'People find us as CA Travels, CA Travels Ghana, CFAAT, or Center for Admission and Travels — for study abroad from Ghana, travel packages from Ghana, and work-abroad guidance.',
  },
]

export default async function GhanaLandingPage() {
  const chrome = await getSiteChromeContent()
  const phone = chrome.contact.phone
  const addressParts = [
    chrome.contact.address.street,
    chrome.contact.address.city || 'Accra',
    chrome.contact.address.region,
    chrome.contact.address.country || 'Ghana',
  ].filter(Boolean)

  return (
    <main className="min-h-screen bg-background">
      <BreadcrumbStructuredData
        items={[
          { name: 'Home', path: '/' },
          { name: 'Ghana', path: '/ghana' },
        ]}
      />
      <ServiceStructuredData
        name="Travel & education consultancy in Ghana — CA Travels"
        serviceType="Travel agency and education consulting"
        description="Study abroad, work abroad, and travel packages for clients in Accra, Ghana, and West Africa."
        path="/ghana"
      />
      <FaqStructuredData faqs={FAQS} />

      <PublicNavbar currentPath="/ghana" />

      <section className="py-16 md:py-24 bg-gradient-to-br from-orange-50 to-red-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="inline-flex items-center gap-2 text-sm font-semibold text-primary mb-4">
            <MapPin className="w-4 h-4" />
            Accra, Ghana · Serving West Africa
          </p>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6 max-w-4xl">
            <span className="bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
              Your study abroad, work abroad & travel partner in Ghana
            </span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl leading-relaxed">
            <strong>CA Travels</strong> — officially <strong>Center for Admission and Travels (CFAAT)</strong> —
            helps people in Ghana and across West Africa plan international education, work pathways, and
            travel packages with clear guidance and secure booking.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/packages"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-orange-600 to-red-600 text-white font-semibold"
            >
              Browse packages <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-border bg-white font-semibold"
            >
              Contact Accra team
            </Link>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-foreground mb-8">Services people in Ghana search for</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <article className="border border-border rounded-2xl p-6 bg-white">
              <GraduationCap className="w-8 h-8 text-primary mb-3" />
              <h3 className="text-xl font-bold mb-2">Study abroad from Ghana</h3>
              <p className="text-muted-foreground text-sm mb-4 leading-relaxed">
                University pathways, admission support, and preparation for destinations like the UK,
                Canada, Europe, and the USA — designed for applicants based in Ghana.
              </p>
              <Link href="/study-abroad-ghana" className="text-primary font-semibold text-sm hover:underline">
                Study abroad Ghana →
              </Link>
            </article>
            <article className="border border-border rounded-2xl p-6 bg-white">
              <Plane className="w-8 h-8 text-primary mb-3" />
              <h3 className="text-xl font-bold mb-2">Travel abroad from Ghana</h3>
              <p className="text-muted-foreground text-sm mb-4 leading-relaxed">
                Curated international tours and travel packages — Dubai, Europe, Asia, and more — with
                local support before you fly.
              </p>
              <Link href="/travel-abroad-ghana" className="text-primary font-semibold text-sm hover:underline">
                Travel packages Ghana →
              </Link>
            </article>
            <article className="border border-border rounded-2xl p-6 bg-white">
              <Briefcase className="w-8 h-8 text-primary mb-3" />
              <h3 className="text-xl font-bold mb-2">Work abroad from Ghana</h3>
              <p className="text-muted-foreground text-sm mb-4 leading-relaxed">
                Guidance on work-abroad options and documentation so you understand requirements before
                you commit.
              </p>
              <Link href="/work-abroad" className="text-primary font-semibold text-sm hover:underline">
                Work abroad →
              </Link>
            </article>
          </div>
        </div>
      </section>

      <section className="py-16 bg-slate-50 border-y border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid md:grid-cols-2 gap-10">
          <div>
            <h2 className="text-2xl font-bold mb-4">Business details (NAP)</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Consistent name, address, and phone help Google connect this website to our Ghana business.
            </p>
            <dl className="space-y-3 text-sm">
              <div>
                <dt className="font-semibold text-foreground">Name</dt>
                <dd className="text-muted-foreground">Center for Admission and Travels (CA Travels / CFAAT)</dd>
              </div>
              <div>
                <dt className="font-semibold text-foreground">Address</dt>
                <dd className="text-muted-foreground">{addressParts.join(', ')}</dd>
              </div>
              {phone ? (
                <div>
                  <dt className="font-semibold text-foreground">Phone</dt>
                  <dd className="text-muted-foreground">
                    <a href={`tel:${phone.replace(/\s/g, '')}`} className="inline-flex items-center gap-1 text-primary">
                      <Phone className="w-3.5 h-3.5" /> {phone}
                    </a>
                  </dd>
                </div>
              ) : null}
              {chrome.contact.email ? (
                <div>
                  <dt className="font-semibold text-foreground">Email</dt>
                  <dd className="text-muted-foreground">{chrome.contact.email}</dd>
                </div>
              ) : null}
            </dl>
          </div>
          <div>
            <h2 className="text-2xl font-bold mb-4">Service area: Ghana & West Africa</h2>
            <p className="text-muted-foreground text-sm mb-4 leading-relaxed">
              Our primary market is <strong>Ghana</strong> (Accra and nationwide). We also support clients
              across West Africa who need study, work, or travel pathways abroad.
            </p>
            <ul className="flex flex-wrap gap-2">
              {WEST_AFRICA_SERVICE_AREAS.map((c) => (
                <li
                  key={c.code}
                  className="px-3 py-1 rounded-full bg-white border border-border text-xs font-medium text-foreground"
                >
                  {c.name}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold mb-6">Frequently asked questions</h2>
          <dl className="space-y-4">
            {FAQS.map((faq) => (
              <div key={faq.question} className="border border-border rounded-xl p-5 bg-white">
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
