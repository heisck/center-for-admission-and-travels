import Link from "next/link"
import { ArrowRight } from "lucide-react"

export default function PackagesPreview() {
  const packages = [
    {
      name: "Dubai Experience",
      duration: "6 Days",
      price: "From $899",
      highlights: ["Burj Khalifa", "Desert Safari", "Dubai Mall"],
    },
    {
      name: "European Tour",
      duration: "7 Days",
      price: "From $1,299",
      highlights: ["Paris", "Amsterdam", "Rome"],
    },
    {
      name: "Asia Explorer",
      duration: "5 Days",
      price: "From $799",
      highlights: ["Thailand", "Singapore", "Malaysia"],
    },
  ]

  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-end mb-16">
          <div>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="text-foreground">Featured </span>
              <span className="bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                Packages
              </span>
            </h2>
            <p className="text-muted-foreground">Discover our most popular travel and study packages</p>
          </div>
          <Link
            href="/packages"
            className="text-primary hover:text-primary-foreground flex items-center gap-2 font-semibold"
          >
            View All <ArrowRight size={20} />
          </Link>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {packages.map((pkg, idx) => (
            <div
              key={idx}
              className="group bg-white border border-border rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2"
            >
              <div className="h-48 bg-gradient-to-br from-orange-400 to-red-500 relative overflow-hidden">
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition"></div>
              </div>
              <div className="p-8">
                <h3 className="text-2xl font-bold mb-2">{pkg.name}</h3>
                <p className="text-primary font-semibold mb-4">{pkg.duration}</p>
                <div className="space-y-3 mb-6">
                  {pkg.highlights.map((highlight, i) => (
                    <div key={i} className="flex items-center space-x-2 text-sm text-foreground">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                      <span>{highlight}</span>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between items-center pt-6 border-t border-border">
                  <span className="text-2xl font-bold text-primary">{pkg.price}</span>
                  <Link
                    href="/packages"
                    className="px-4 py-2 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-lg text-sm font-semibold hover:shadow-lg transition"
                  >
                    Explore
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
