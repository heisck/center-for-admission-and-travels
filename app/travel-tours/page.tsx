import PublicNavbar from "@/components/public-navbar"
import Footer from "@/components/footer-server"
import Link from "next/link"
import Image from "next/image"
import { MapPin, Clock, DollarSign, CheckCircle, ChevronDown } from "lucide-react"

import TravelDomeGalleryPanel from "./travel-dome-gallery-panel"
import { getSiteChromeContent, getTravelToursPageContent } from "@/lib/public-content"

export const revalidate = 300

export default async function TravelTours() {
  const [travelTours, chrome] = await Promise.all([getTravelToursPageContent(), getSiteChromeContent()])

  return (
    <main className="min-h-screen bg-background">
      <PublicNavbar currentPath="/travel-tours" />

      <section className="py-16 md:py-24 bg-gradient-to-br from-orange-50 to-red-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center mb-12">
            <div className="relative h-80 rounded-2xl overflow-hidden">
              <div style={{ width: '100%', height: '100%' }}>
                <TravelDomeGalleryPanel images={travelTours.galleryImages.length > 0 ? travelTours.galleryImages.map((img) => ({ src: img, alt: '' })) : []} />
              </div>
            </div>

            <div>
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-4">
                <span className="bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                  {travelTours.hero.title || "Travel & Tours"}
                </span>
              </h1>
              {travelTours.hero.description ? (
                <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
                  {travelTours.hero.description}
                </p>
              ) : null}
              {travelTours.hero.paragraph ? (
                <p className="text-lg text-muted-foreground leading-relaxed">
                  {travelTours.hero.paragraph}
                </p>
              ) : null}
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                Featured Packages
              </span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Choose from our curated destinations and create your perfect travel experience
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {travelTours.featured.map((pkg) => (
              <div
                key={pkg.id}
                className="group bg-white border border-border rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2"
              >
                <div className="h-64 relative overflow-hidden bg-slate-100">
                  {pkg.image ? (
                    <Image
                      src={pkg.image}
                      alt={pkg.name}
                      fill
                      sizes="(max-width: 768px) 100vw, 50vw"
                      className="object-cover object-center group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : null}
                  <div className="absolute inset-0 bg-black/10 group-hover:bg-black/5 transition"></div>
                </div>

                <div className="p-8">
                  <div className="flex items-center gap-2 mb-3">
                    <MapPin className="w-4 h-4 text-primary" />
                    <span className="text-sm font-semibold text-primary uppercase">{pkg.name.split(' ')[0]}</span>
                  </div>

                  <h3 className="text-2xl font-bold mb-3 text-foreground">{pkg.name}</h3>
                  <p className="text-muted-foreground text-sm mb-6">{pkg.description}</p>

                  <div className="space-y-3 mb-6">
                    <div className="flex items-center gap-2 text-foreground">
                      <Clock className="w-4 h-4 text-primary" />
                      <span className="text-sm">{pkg.duration}</span>
                    </div>
                    <div className="flex items-center gap-2 text-foreground">
                      <DollarSign className="w-4 h-4 text-primary" />
                      <span className="text-sm">
                        From {(pkg as any).currency || 'GHS'} {Number(pkg.price).toLocaleString()} per person
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2 mb-6">
                    {pkg.highlights?.slice(0, 3).map((highlight, index) => (
                      <div key={index} className="flex items-start space-x-2 text-sm">
                        <CheckCircle className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                        <span className="text-foreground">{highlight}</span>
                      </div>
                    ))}
                  </div>

                  <details className="mt-6 mb-6 border-t border-border pt-4 group/details">
                    <summary className="list-none w-full mb-3 px-4 py-2 border border-primary text-primary rounded-lg text-sm font-semibold hover:bg-primary hover:text-white transition inline-flex items-center justify-center gap-2 cursor-pointer">
                      <span>View Details</span>
                      <ChevronDown className="w-4 h-4 transition-transform group-open/details:rotate-180" />
                    </summary>
                    <div className="pt-2 animate-fade-in">
                      <h4 className="font-bold text-foreground mb-3">All Highlights</h4>
                      <div className="space-y-2">
                        {pkg.highlights?.map((highlight, index) => (
                          <div key={index} className="flex items-start space-x-2 text-sm">
                            <CheckCircle className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                            <span className="text-foreground">{highlight}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </details>

                  <Link
                    href={`/checkout?id=${pkg.id}`}
                    className="w-full inline-block px-4 py-3 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-lg text-center font-semibold hover:shadow-lg transition"
                  >
                    Book Package
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center mb-12">
            <span className="bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
              Why Choose CFAAT for Your Travel?
            </span>
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            {travelTours.benefits.map((benefit) => (
              <div key={benefit.id} className="bg-white p-6 rounded-xl shadow-sm hover:shadow-lg transition">
                <h3 className="text-lg font-bold text-primary mb-3">{benefit.title}</h3>
                <p className="text-muted-foreground">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-orange-500 to-red-600 rounded-2xl p-12 text-center text-white">
            <h2 className="text-4xl font-bold mb-4">Ready to Explore the World?</h2>
            <p className="text-lg mb-8 max-w-2xl mx-auto">
              Don't see your dream destination? Contact our travel specialists to create a custom package just for you.
            </p>
            <Link
              href="/contact"
              className="inline-block px-8 py-4 bg-white text-primary rounded-lg font-bold hover:shadow-lg transition"
            >
              Create Custom Package
            </Link>
          </div>
        </div>
      </section>

      <Footer contact={chrome.contact} footer={chrome.footer} />
    </main>
  )
}
