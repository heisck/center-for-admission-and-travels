import Link from 'next/link'
import { ArrowRight, CheckCircle2 } from 'lucide-react'

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
  title: 'Study Abroad from Ghana — Admissions & Visa Support | CA Travels (CFAAT)',
  description:
    'Study abroad from Ghana with CA Travels (CFAAT). University admission guidance, documentation support, and pathways to the UK, Canada, Europe, USA, and more — for students in Accra and nationwide.',
  path: '/study-abroad-ghana',
  keywords: [
    'study abroad from Ghana',
    'study abroad Ghana',
    'study abroad Accra',
    'university admission Ghana',
    'study in UK from Ghana',
    'study in Canada from Ghana',
    'CFAAT study abroad',
    'CA Travels education',
  ],
})

const FAQS = [
  {
    question: 'How do I study abroad from Ghana with CA Travels?',
    answer:
      'Start with a consultation or apply online. We review your goals, recommend suitable programmes, and guide admission documents and next steps for international universities.',
  },
  {
    question: 'Which countries can Ghanaian students target?',
    answer:
      'Popular destinations include the United Kingdom, Canada, Europe, the United States, and other regions depending on your profile and current intake options.',
  },
  {
    question: 'Is CFAAT the same as CA Travels?',
    answer:
      'Yes. CFAAT is Center for Admission and Travels — often searched as CA Travels or CA Travels Ghana.',
  },
]

const STEPS = [
  'Share your academic goals and preferred countries',
  'Get programme and admission pathway recommendations',
  'Prepare documents with our guidance',
  'Submit applications and track next steps',
  'Prepare for travel and settling abroad',
]

export default async function StudyAbroadGhanaPage() {
  const chrome = await getSiteChromeContent()

  return (
    <main className="min-h-screen bg-background">
      <BreadcrumbStructuredData
        items={[
          { name: 'Home', path: '/' },
          { name: 'Ghana', path: '/ghana' },
          { name: 'Study Abroad from Ghana', path: '/study-abroad-ghana' },
        ]}
      />
      <ServiceStructuredData
        name="Study Abroad from Ghana — CA Travels"
        serviceType="Study abroad counseling"
        description="University admission and study-abroad support for students in Ghana and West Africa."
        path="/study-abroad-ghana"
      />
      <FaqStructuredData faqs={FAQS} />

      <PublicNavbar currentPath="/study-abroad" />

      <section className="py-16 md:py-24 bg-gradient-to-br from-orange-50 to-red-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
          <h1 className="text-4xl sm:text-5xl font-bold mb-6">
            <span className="bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
              Study abroad from Ghana with CA Travels
            </span>
          </h1>
          <p className="text-xl text-muted-foreground leading-relaxed">
            If you are searching for <strong>study abroad</strong> options while you are in{' '}
            <strong>Ghana</strong> or elsewhere in <strong>West Africa</strong>, Center for Admission and
            Travels (CFAAT) provides practical admission guidance — not empty promises.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/apply"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-orange-600 to-red-600 text-white font-semibold"
            >
              Start application <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="/study-abroad" className="px-6 py-3 rounded-xl border border-border bg-white font-semibold">
              Full study-abroad page
            </Link>
            <Link href="/packages?filter=study" className="px-6 py-3 rounded-xl border border-border bg-white font-semibold">
              Study packages
            </Link>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid md:grid-cols-2 gap-12">
          <div>
            <h2 className="text-2xl font-bold mb-4">Built for students in Accra and across Ghana</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Local context matters: documentation, timelines, budgets, and destination rules look different
              when you are applying from Ghana. Our team works with applicants who need a clear path from
              first enquiry to departure.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Explore destinations, compare packages, or talk to a consultant about the UK, Canada, Europe,
              the USA, and other study locations.
            </p>
          </div>
          <div className="bg-slate-50 border border-border rounded-2xl p-6">
            <h3 className="font-bold mb-4">How it works</h3>
            <ol className="space-y-3">
              {STEPS.map((step, i) => (
                <li key={step} className="flex gap-3 text-sm text-foreground">
                  <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />
                  <span>
                    <strong className="text-primary">Step {i + 1}.</strong> {step}
                  </span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      <section className="py-16 bg-slate-50 border-y border-border">
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="text-2xl font-bold mb-6">Study abroad FAQs (Ghana)</h2>
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
