import Image from "next/image"

import type { AboutFounderContent } from "@/lib/public-content"

interface FounderSectionProps {
  founder: AboutFounderContent
}

const FALLBACK_FOUNDER: AboutFounderContent = {
  name: "George Owusu Ntim",
  title: "Founder",
  description:
    "George Owusu Ntim is the visionary Director of Center for Admission and Travels. With a strong background in international education, travel coordination, and client advisory services, he leads the company with excellence and integrity. George is committed to helping students, travellers, and professionals access global opportunities through reliable guidance, transparent processes, and personalized support.",
  image: "/images/founder.jpg",
  vision: "Ghana's leading gateway to global opportunities",
  mission: "Trusted, personalized, professional services",
  values: "Integrity, professionalism, transparency, and care",
}

export default function FounderSection({ founder }: FounderSectionProps) {
  const data = {
    ...FALLBACK_FOUNDER,
    ...founder,
  }

  return (
    <section className="py-24 bg-gradient-to-br from-orange-50 to-red-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="relative h-96 md:h-full">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-400 to-red-500 rounded-3xl opacity-20 blur-3xl"></div>
            <div className="relative bg-white rounded-3xl p-3 shadow-2xl overflow-hidden">
              <Image
                src={data.image || FALLBACK_FOUNDER.image}
                alt={`${data.name} - Founder`}
                width={400}
                height={500}
                className="w-full h-96 object-cover rounded-2xl"
              />
            </div>
          </div>

          <div className="space-y-8">
            <div>
              <h2 className="text-4xl md:text-5xl font-bold mb-4">
                <span className="text-foreground">Meet Our </span>
                <span className="bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                  Founder
                </span>
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed mb-3">{data.name}</p>
              <p className="text-base font-semibold text-primary mb-6">{data.title}</p>
              <p className="text-lg text-muted-foreground leading-relaxed mb-6">
                {data.description}
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-start space-x-4">
                <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0"></div>
                <p className="text-foreground">
                  <strong>Vision:</strong> {data.vision}
                </p>
              </div>
              <div className="flex items-start space-x-4">
                <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0"></div>
                <p className="text-foreground">
                  <strong>Mission:</strong> {data.mission}
                </p>
              </div>
              <div className="flex items-start space-x-4">
                <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0"></div>
                <p className="text-foreground">
                  <strong>Values:</strong> {data.values}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
