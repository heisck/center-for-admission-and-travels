'use client'

/**
 * Collapsed-by-default SEO copy for packages page.
 * Keeps full content in the DOM for crawlers; users expand if they want more.
 */

import { useState } from 'react'
import Link from 'next/link'
import { ChevronDown } from 'lucide-react'

import { cn } from '@/lib/utils'

type Faq = { question: string; answer: string }

export default function PackagesSeoPanel({ faqs }: { faqs: Faq[] }) {
  const [open, setOpen] = useState(false)

  return (
    <section className="border-t border-border/60 bg-transparent py-12 md:py-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          className="w-full flex items-center justify-between gap-4 rounded-2xl border border-border bg-white/90 px-5 py-5 sm:px-7 sm:py-6 text-left shadow-sm hover:border-orange-200 hover:shadow-md transition"
        >
          <div className="min-w-0">
            <p className="text-base sm:text-lg md:text-xl font-semibold text-foreground">
              About CA Travels packages & FAQs
            </p>
            <p className="text-sm sm:text-base text-muted-foreground mt-1.5">
              Study, work, and travel options from Ghana — tap to expand
            </p>
          </div>
          <ChevronDown
            className={cn(
              'h-6 w-6 sm:h-7 sm:w-7 shrink-0 text-orange-600 transition-transform duration-200',
              open && 'rotate-180'
            )}
          />
        </button>

        <div
          className={cn(
            'overflow-hidden transition-all duration-300 ease-out',
            open ? 'max-h-[2400px] opacity-100 mt-6 sm:mt-8' : 'max-h-0 opacity-0'
          )}
        >
          <div className="space-y-8 sm:space-y-10">
            <div>
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground mb-3 sm:mb-4">
                CA Travels packages for study abroad, work abroad, and travel
              </h2>
              <p className="text-base sm:text-lg text-muted-foreground leading-relaxed max-w-4xl">
                Center for Admission and Travels — known as <strong>CA Travels</strong>,{' '}
                <strong>CA Travels Ghana</strong>, and <strong>CFAAT</strong> — publishes clear
                packages so you can compare destinations, duration, and pricing before you book.
              </p>
            </div>

            <div className="flex flex-wrap gap-3 text-sm sm:text-base">
              <Link
                href="/study-abroad"
                className="px-4 py-2 sm:px-5 sm:py-2.5 rounded-full border border-border bg-white text-foreground font-medium hover:border-orange-300 hover:text-orange-700 transition"
              >
                Study abroad
              </Link>
              <Link
                href="/work-abroad"
                className="px-4 py-2 sm:px-5 sm:py-2.5 rounded-full border border-border bg-white text-foreground font-medium hover:border-orange-300 hover:text-orange-700 transition"
              >
                Work abroad
              </Link>
              <Link
                href="/travel-tours"
                className="px-4 py-2 sm:px-5 sm:py-2.5 rounded-full border border-border bg-white text-foreground font-medium hover:border-orange-300 hover:text-orange-700 transition"
              >
                Travel & tours
              </Link>
            </div>

            <div className="space-y-4">
              <h3 className="text-base sm:text-lg font-semibold text-foreground">FAQs</h3>
              <dl className="space-y-3">
                {faqs.map((faq) => (
                  <details
                    key={faq.question}
                    className="group rounded-xl border border-border bg-white/90 px-5 py-4 sm:px-6 sm:py-5"
                  >
                    <summary className="cursor-pointer list-none font-medium text-base sm:text-lg text-foreground flex items-center justify-between gap-3">
                      {faq.question}
                      <ChevronDown className="h-5 w-5 shrink-0 text-muted-foreground transition group-open:rotate-180" />
                    </summary>
                    <p className="mt-3 text-sm sm:text-base text-muted-foreground leading-relaxed">
                      {faq.answer}
                    </p>
                  </details>
                ))}
              </dl>
            </div>

            <p className="text-base sm:text-lg text-muted-foreground">
              Ready to talk?{' '}
              <Link href="/contact" className="text-primary font-semibold hover:underline">
                Contact us
              </Link>{' '}
              or{' '}
              <Link href="/apply" className="text-primary font-semibold hover:underline">
                start an application
              </Link>
              .
            </p>
          </div>
        </div>

        {/* Always in DOM for SEO when collapsed */}
        {!open ? (
          <div className="sr-only" aria-hidden={false}>
            <h2>CA Travels packages for study abroad, work abroad, and travel</h2>
            <p>
              Center for Admission and Travels — known as CA Travels, CA Travels Ghana, and CFAAT —
              publishes clear packages so you can compare destinations, duration, and pricing before
              you book. Whether you want to study abroad, explore work pathways, or take a guided
              international tour from Ghana, our team supports planning, documentation, and secure
              online payment.
            </p>
            {faqs.map((faq) => (
              <div key={faq.question}>
                <h3>{faq.question}</h3>
                <p>{faq.answer}</p>
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </section>
  )
}
