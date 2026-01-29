'use client'

import { useAdmin } from '@/context/admin-context'
import Image from 'next/image'
import { Globe, Briefcase, Plane, GraduationCap } from 'lucide-react'

const iconMap: Record<string, React.ReactNode> = {
  GraduationCap: <GraduationCap size={28} />,
  Briefcase: <Briefcase size={28} />,
  Plane: <Plane size={28} />,
  Globe: <Globe size={28} />,
}

export default function LivePreview() {
  const { content } = useAdmin()
  const hero = content.home.hero
  const services = content.home.services

  return (
    <div className="space-y-12">
      {/* Hero Preview */}
      <section className="relative py-16 md:py-24 bg-gradient-to-br from-orange-50 via-white to-red-50 rounded-xl overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Content */}
            <div className="space-y-6">
              <div>
                <h1 className="text-5xl md:text-6xl font-bold leading-tight mb-4">
                  <span className="bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                    {hero.title}
                  </span>
                  <br />
                  <span className="text-foreground">{hero.subtitle}</span>
                </h1>
              </div>
              <p className="text-lg text-muted-foreground leading-relaxed">
                {hero.description}
              </p>
              <div className="flex gap-4 flex-wrap pt-4">
                <button className="px-8 py-3 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-lg font-semibold hover:shadow-xl transition">
                  {hero.cta1Text}
                </button>
                <button className="px-8 py-3 border-2 border-primary text-primary rounded-lg font-semibold hover:bg-primary hover:text-white transition">
                  {hero.cta2Text}
                </button>
              </div>
              <div className="grid grid-cols-3 gap-6 pt-8">
                {hero.stats.map((stat, idx) => (
                  <div key={idx}>
                    <div className="text-3xl font-bold text-primary">{stat.value}</div>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Image Gallery Preview */}
            <div className="relative h-96 rounded-2xl overflow-hidden shadow-xl">
              {hero.images[0] ? (
                <Image
                  src={hero.images[0]}
                  alt="Hero"
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full bg-slate-200 flex items-center justify-center text-muted-foreground">
                  No image
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Services Preview */}
      <section className="py-12 md:py-24 bg-white rounded-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="text-foreground">Our </span>
              <span className="bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                Services
              </span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Comprehensive solutions for your international journey
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {services.map((service) => (
              <div
                key={service.id}
                className="p-8 rounded-2xl border border-border bg-white hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2"
              >
                <div className="w-14 h-14 bg-gradient-to-br from-orange-100 to-red-100 rounded-xl flex items-center justify-center mb-6 text-primary">
                  {iconMap[service.icon] || iconMap.Globe}
                </div>
                <h3 className="text-2xl font-bold mb-3 text-foreground">{service.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{service.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
