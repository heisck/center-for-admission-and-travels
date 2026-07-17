import { Suspense } from "react"
import Link from "next/link"

import PublicNavbar from "@/components/public-navbar"
import Footer from "@/components/footer-server"
import PackagesPageClient from "@/app/packages/packages-page-client"
import {
  BreadcrumbStructuredData,
  FaqStructuredData,
  PackagesItemListStructuredData,
} from "@/components/structured-data"
import { getPackagesPageContent, getSiteChromeContent } from "@/lib/public-content"

export const revalidate = 300

const PACKAGES_FAQS = [
  {
    question: "What is CA Travels (CFAAT)?",
    answer:
      "Center for Admission and Travels (CA Travels / CFAAT) is a Ghana-based consultancy for study abroad, work abroad, and international travel packages, with admission guidance, visa support, and tour planning.",
  },
  {
    question: "Can I book travel packages from Ghana with CA Travels?",
    answer:
      "Yes. Our packages page lists study, work, and travel options. You can book online via secure Paystack checkout or contact our team for custom travel abroad planning.",
  },
  {
    question: "Do you help with study abroad and work abroad from Ghana?",
    answer:
      "Yes. CFAAT supports university admission pathways, documentation, and work-abroad guidance alongside leisure and tour packages to destinations such as Dubai, Europe, Asia, the UK, and Canada.",
  },
  {
    question: "Do you support people travelling to Ghana or from Ghana?",
    answer:
      "We primarily serve clients in Ghana planning international study, work, and travel. Contact us for current itineraries, pricing, and destination support.",
  },
]

export default async function PackagesPage() {
  const [packages, chrome] = await Promise.all([getPackagesPageContent(), getSiteChromeContent()])

  return (
    <main className="min-h-screen bg-background">
      <BreadcrumbStructuredData
        items={[
          { name: "Home", path: "/" },
          { name: "Packages", path: "/packages" },
        ]}
      />
      <PackagesItemListStructuredData packages={packages} />
      <FaqStructuredData faqs={PACKAGES_FAQS} />

      <PublicNavbar currentPath="/packages" />
      <Suspense fallback={<div className="py-24" aria-hidden />}>
        <PackagesPageClient packages={packages} />
      </Suspense>

      {/* Server-rendered SEO copy for crawlers & AI (visible, useful, not stuffed) */}
      <section className="border-t border-border bg-slate-50 py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="max-w-3xl">
            <h2 className="text-2xl font-bold text-foreground mb-3">
              CA Travels packages for study abroad, work abroad, and travel
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              Center for Admission and Travels — known as <strong>CA Travels</strong>,{" "}
              <strong>CA Travels Ghana</strong>, and <strong>CFAAT</strong> — publishes clear
              packages so you can compare destinations, duration, and pricing before you book.
              Whether you want to study abroad, explore work pathways, or take a guided international
              tour from Ghana, our team supports planning, documentation, and secure online payment.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <article className="bg-white border border-border rounded-xl p-6">
              <h3 className="font-semibold text-foreground mb-2">Study abroad from Ghana</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Admission-focused packages and counselling for international universities, with
                guidance on requirements and next steps.{" "}
                <Link href="/study-abroad" className="text-primary font-medium hover:underline">
                  Learn about study abroad
                </Link>
                .
              </p>
            </article>
            <article className="bg-white border border-border rounded-xl p-6">
              <h3 className="font-semibold text-foreground mb-2">Work abroad pathways</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Explore work and mobility options with structured support.{" "}
                <Link href="/work-abroad" className="text-primary font-medium hover:underline">
                  View work abroad
                </Link>
                .
              </p>
            </article>
            <article className="bg-white border border-border rounded-xl p-6">
              <h3 className="font-semibold text-foreground mb-2">Travel & tours</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Curated tours and leisure travel packages — popular routes include Dubai, Europe, and
                Asia.{" "}
                <Link href="/travel-tours" className="text-primary font-medium hover:underline">
                  Browse travel tours
                </Link>
                .
              </p>
            </article>
          </div>

          <div className="max-w-3xl space-y-4">
            <h2 className="text-xl font-bold text-foreground">Frequently asked questions</h2>
            <dl className="space-y-4">
              {PACKAGES_FAQS.map((faq) => (
                <div key={faq.question} className="bg-white border border-border rounded-xl p-5">
                  <dt className="font-semibold text-foreground mb-1">{faq.question}</dt>
                  <dd className="text-sm text-muted-foreground leading-relaxed">{faq.answer}</dd>
                </div>
              ))}
            </dl>
            <p className="text-sm text-muted-foreground">
              Ready to talk to a consultant?{" "}
              <Link href="/contact" className="text-primary font-medium hover:underline">
                Contact CA Travels
              </Link>{" "}
              or{" "}
              <Link href="/apply" className="text-primary font-medium hover:underline">
                start an application
              </Link>
              .
            </p>
          </div>
        </div>
      </section>

      <Footer contact={chrome.contact} footer={chrome.footer} />
    </main>
  )
}
