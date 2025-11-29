import Image from "next/image"

export default function FounderSection() {
  return (
    <section className="py-24 bg-gradient-to-br from-orange-50 to-red-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Image */}
          <div className="relative h-96 md:h-full">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-400 to-red-500 rounded-3xl opacity-20 blur-3xl"></div>
            <div className="relative bg-white rounded-3xl p-3 shadow-2xl overflow-hidden">
              <Image
                src="/images/founder.jpg"
                alt="George Owusu Ntim - Founder"
                width={400}
                height={500}
                className="w-full h-96 object-cover rounded-2xl"
              />
            </div>
          </div>

          {/* Content */}
          <div className="space-y-8">
            <div>
              <h2 className="text-4xl md:text-5xl font-bold mb-4">
                <span className="text-foreground">Meet Our </span>
                <span className="bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                  Founder
                </span>
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed mb-6">
                George Owusu Ntim is the visionary Director of Center for Admission and Travels. With a strong background in international education, travel coordination, and client advisory services, he leads the company with excellence and integrity. George is committed to helping students, travellers, and professionals access global opportunities through reliable guidance, transparent processes, and personalized support.
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-start space-x-4">
                <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0"></div>
                <p className="text-foreground">
                  <strong>Vision:</strong> Ghana's leading gateway to global opportunities
                </p>
              </div>
              <div className="flex items-start space-x-4">
                <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0"></div>
                <p className="text-foreground">
                  <strong>Mission:</strong> Trusted, personalized, professional services
                </p>
              </div>
              <div className="flex items-start space-x-4">
                <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0"></div>
                <p className="text-foreground">
                  <strong>Values:</strong> Integrity, professionalism, transparency, and care
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
