import Link from "next/link"
import { Globe, Briefcase, Plane, GraduationCap } from "lucide-react"

import type { HomeServiceContent } from "@/lib/public-content"

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  GraduationCap,
  Briefcase,
  Plane,
  Globe,
}

interface ServicesGridProps {
  services: HomeServiceContent[]
}

export default function ServicesGrid({ services }: ServicesGridProps) {
  const cards = services.filter((service) => service.title?.trim())
  if (cards.length === 0) return null

  return (
    <section id="services" className="py-12 md:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="text-foreground">Our </span>
            <span className="bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">Services</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Comprehensive solutions for your international journey
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {cards.map((service, idx) => {
            const Icon = iconMap[service.icon] || GraduationCap
            return (
              <Link
                key={service.id || idx}
                href={service.href}
                className="group p-8 rounded-2xl border border-border hover:border-primary bg-white hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer"
              >
                <div className="w-14 h-14 bg-gradient-to-br from-orange-100 to-red-100 rounded-xl flex items-center justify-center mb-6 group-hover:bg-gradient-to-br group-hover:from-orange-500 group-hover:to-red-500 transition">
                  <Icon className="w-7 h-7 text-primary group-hover:text-white transition" />
                </div>
                <h3 className="text-2xl font-bold mb-3 text-foreground">{service.title}</h3>
                <p className="text-muted-foreground leading-relaxed mb-4">{service.description}</p>
                <span className="inline-block text-primary font-semibold text-sm group-hover:translate-x-1 transition-transform">Click to know more →</span>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}
