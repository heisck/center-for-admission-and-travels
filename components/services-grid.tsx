import { Globe, Briefcase, Plane, GraduationCap } from "lucide-react"

export default function ServicesGrid() {
  const services = [
    {
      icon: GraduationCap,
      title: "Study Abroad",
      description: "Admission guidance, university selection, and visa processing for top institutions worldwide",
    },
    {
      icon: Briefcase,
      title: "Work Abroad",
      description: "Job placement assistance and relocation support in verified international companies",
    },
    {
      icon: Plane,
      title: "Travel & Tours",
      description: "Curated travel packages to Dubai, Europe, Asia, and more with full support",
    },
    {
      icon: Globe,
      title: "Global Network",
      description: "Partnerships with accredited universities and verified employers worldwide",
    },
  ]

  return (
    <section className="py-24 bg-white">
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
          {services.map((service, idx) => {
            const Icon = service.icon
            return (
              <div
                key={idx}
                className="group p-8 rounded-2xl border border-border hover:border-primary bg-white hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2"
              >
                <div className="w-14 h-14 bg-gradient-to-br from-orange-100 to-red-100 rounded-xl flex items-center justify-center mb-6 group-hover:bg-gradient-to-br group-hover:from-orange-500 group-hover:to-red-500 transition">
                  <Icon className="w-7 h-7 text-primary group-hover:text-white transition" />
                </div>
                <h3 className="text-2xl font-bold mb-3 text-foreground">{service.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{service.description}</p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
