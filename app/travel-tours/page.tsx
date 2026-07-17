import Link from "next/link"

import PublicNavbar from "@/components/public-navbar"
import Footer from "@/components/footer-server"

import TravelDomeGalleryPanel from "./travel-dome-gallery-panel"
import TravelToursFeaturedPackages from "@/components/travel-tours-featured-packages"
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
            {/* Cropped top/bottom like original dome stage */}
            <div className="relative h-80 rounded-2xl overflow-hidden">
              <div style={{ width: '100%', height: '100%' }}>
                <TravelDomeGalleryPanel
                  images={
                    travelTours.galleryImages.length > 0
                      ? travelTours.galleryImages.map((img) => ({ src: img, alt: '' }))
                      : []
                  }
                />
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

          <TravelToursFeaturedPackages packages={travelTours.featured} />
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
