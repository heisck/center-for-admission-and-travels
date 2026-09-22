import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, Clock3 } from 'lucide-react'

import Footer from '@/components/footer-server'
import PublicNavbar from '@/components/public-navbar'
import { formatMoney } from '@/lib/currency'
import { getProfessionalServices, getSiteChromeContent } from '@/lib/public-content'
import { contentToSafeHtml } from '@/lib/safe-html'

export const revalidate = 300

export default async function ProfessionalServicesPage() {
  const [services, chrome] = await Promise.all([
    getProfessionalServices(),
    getSiteChromeContent(),
  ])

  return (
    <main className="min-h-screen bg-background">
      <PublicNavbar currentPath="/global-network" />

      <section className="bg-gradient-to-br from-orange-50 to-red-50 py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid items-center gap-12 md:grid-cols-2 md:gap-16">
            <div className="relative min-h-80 overflow-hidden rounded-2xl md:min-h-96">
              <Image
                src="/images/services/documentation.jpg"
                alt="Travel documentation and professional support"
                fill
                loading="eager"
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent" />
            </div>

            <div>
              <h1 className="text-4xl font-bold leading-tight sm:text-5xl md:text-6xl">
                <span className="bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                  Travel Documentation Services
                </span>
              </h1>
              <p className="mt-6 text-lg leading-relaxed text-muted-foreground sm:text-xl">
                Get clear document requirements, dependable processing support, and turnaround
                options suited to your travel plans.
              </p>
              <p className="mt-6 text-lg leading-relaxed text-muted-foreground sm:text-xl">
                Select a published service plan for transparent pricing and secure checkout, or
                contact our team when your request needs a custom timeline.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white py-16 md:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <h2 className="text-4xl font-bold md:text-5xl">
              <span className="bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                Available Services
              </span>
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-xl text-muted-foreground">
              Choose the documentation service and turnaround time that fits your needs.
            </p>
          </div>
          {services.length === 0 ? (
            <div className="rounded-2xl border border-orange-100 bg-orange-50/50 p-8 text-center sm:p-10">
              <h3 className="text-2xl font-bold text-foreground">Service plans are being prepared</h3>
              <p className="mx-auto mt-3 max-w-2xl text-lg text-muted-foreground">
                Our team is updating the online catalog with current prices, document requirements,
                and turnaround times.
              </p>
            </div>
          ) : (
            <div className="space-y-10">
              {services.map((service) => {
                const safeDescription = contentToSafeHtml(service.descriptionHtml)
                return (
                  <article
                    key={service.id}
                    id={service.slug}
                    className="scroll-mt-28 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_18px_55px_rgba(15,23,42,0.08)]"
                  >
                    <div className="grid lg:grid-cols-[minmax(18rem,0.82fr)_minmax(0,1.18fr)]">
                      <div className="relative min-h-72 bg-slate-100 lg:min-h-full">
                        {service.imageUrl ? (
                          <Image
                            src={service.imageUrl}
                            alt={service.name}
                            fill
                            className="object-cover"
                            sizes="(max-width: 1024px) 100vw, 42vw"
                          />
                        ) : (
                          <Image src="/images/services/documentation.jpg" alt="" fill className="object-cover" sizes="(max-width: 1024px) 100vw, 42vw" />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/65 via-transparent to-transparent" />
                        <div className="absolute inset-x-0 bottom-0 p-6 text-white sm:p-8">
                          <p className="text-xs font-bold uppercase tracking-[0.18em] text-orange-200">
                            Professional service
                          </p>
                          <h2 className="mt-2 text-3xl font-bold">{service.name}</h2>
                          <p className="mt-3 leading-relaxed text-white/85">{service.summary}</p>
                        </div>
                      </div>

                      <div className="p-5 sm:p-8 lg:p-10">
                        {safeDescription ? (
                          <div
                            className="professional-service-content blog-post-content"
                            dangerouslySetInnerHTML={{ __html: safeDescription }}
                          />
                        ) : null}

                        <div className={safeDescription ? 'mt-8 border-t border-border pt-8' : ''}>
                          <div className="mb-5">
                            <h3 className="text-xl font-bold text-foreground">Choose a plan</h3>
                            <p className="mt-1 text-sm text-muted-foreground">
                              Price and turnaround time are set independently for each option.
                            </p>
                          </div>

                          {service.plans.length === 0 ? (
                            <div className="rounded-2xl border border-dashed border-border p-6 text-sm text-muted-foreground">
                              Contact us for a custom quote for this service.
                            </div>
                          ) : (
                            <div className="grid gap-4 xl:grid-cols-2">
                              {service.plans.map((plan) => (
                                <div
                                  key={plan.id}
                                  className="flex flex-col rounded-2xl border border-orange-100 bg-orange-50/45 p-5"
                                >
                                  <div className="flex items-start justify-between gap-4">
                                    <div>
                                      <h4 className="text-lg font-bold text-foreground">
                                        {plan.name}
                                      </h4>
                                      {plan.duration ? (
                                        <p className="mt-1 inline-flex items-center gap-1.5 text-sm text-muted-foreground">
                                          <Clock3 className="h-4 w-4 text-orange-600" />
                                          {plan.duration}
                                        </p>
                                      ) : null}
                                    </div>
                                    <p className="whitespace-nowrap text-lg font-bold text-orange-700">
                                      {formatMoney(plan.price, plan.currency)}
                                    </p>
                                  </div>

                                  {plan.description ? (
                                    <p className="mt-4 text-sm leading-relaxed text-slate-600">
                                      {plan.description}
                                    </p>
                                  ) : null}

                                  <Link
                                    href={`/checkout?servicePlanId=${encodeURIComponent(plan.id)}`}
                                    className="mt-5 inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-orange-600 to-red-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-orange-500/15 transition hover:opacity-95"
                                  >
                                    Select {plan.name}
                                    <ArrowRight className="h-4 w-4" />
                                  </Link>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </article>
                )
              })}
            </div>
          )}
        </div>
      </section>

      <section className="pb-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl bg-gradient-to-r from-orange-500 to-red-600 p-8 text-center text-white sm:p-12">
            <h2 className="text-3xl font-bold sm:text-4xl">Need a custom service or timeline?</h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-white/90">
              Send the details to our team. We can confirm availability, required documents, and
              the appropriate service plan before you pay.
            </p>
            <Link href="/contact" className="mt-8 inline-flex items-center gap-2 rounded-lg bg-white px-8 py-4 font-bold text-primary transition hover:shadow-lg">
              Contact Our Team <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      <Footer contact={chrome.contact} footer={chrome.footer} />
    </main>
  )
}
