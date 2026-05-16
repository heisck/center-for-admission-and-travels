import Image from "next/image"

import type { AboutFounderContent } from "@/lib/public-content"

interface FounderSectionProps {
  founder: AboutFounderContent
}

export default function FounderSection({ founder }: FounderSectionProps) {
  const hasFounderContent = Boolean(
    founder.name?.trim() ||
      founder.title?.trim() ||
      founder.description?.trim() ||
      founder.image?.trim() ||
      founder.vision?.trim() ||
      founder.mission?.trim() ||
      founder.values?.trim()
  )

  if (!hasFounderContent) return null

  return (
    <section className="py-24 bg-gradient-to-br from-orange-50 to-red-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="relative h-96 md:h-full">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-400 to-red-500 rounded-3xl opacity-20 blur-3xl"></div>
            {founder.image ? (
              <div className="relative bg-white rounded-3xl p-3 shadow-2xl overflow-hidden">
                <Image
                  src={founder.image}
                  alt={founder.name || "Founder"}
                  width={400}
                  height={500}
                  className="w-full h-96 object-cover rounded-2xl"
                />
              </div>
            ) : null}
          </div>

          <div className="space-y-8">
            <div>
              <h2 className="text-4xl md:text-5xl font-bold mb-4">
                <span className="text-foreground">Meet Our </span>
                <span className="bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                  Founder
                </span>
              </h2>
              {founder.name ? <p className="text-lg text-muted-foreground leading-relaxed mb-3">{founder.name}</p> : null}
              {founder.title ? <p className="text-base font-semibold text-primary mb-6">{founder.title}</p> : null}
              {founder.description ? (
                <p className="text-lg text-muted-foreground leading-relaxed mb-6">
                  {founder.description}
                </p>
              ) : null}
            </div>

            <div className="space-y-4">
              {founder.vision ? (
                <div className="flex items-start space-x-4">
                  <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0"></div>
                  <p className="text-foreground">
                    <strong>Vision:</strong> {founder.vision}
                  </p>
                </div>
              ) : null}
              {founder.mission ? (
                <div className="flex items-start space-x-4">
                  <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0"></div>
                  <p className="text-foreground">
                    <strong>Mission:</strong> {founder.mission}
                  </p>
                </div>
              ) : null}
              {founder.values ? (
                <div className="flex items-start space-x-4">
                  <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0"></div>
                  <p className="text-foreground">
                    <strong>Values:</strong> {founder.values}
                  </p>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
