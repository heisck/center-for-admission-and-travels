import Image from "next/image"

export default function TestimonialsSection() {
  const teamMembers = [
    {
      name: "George Owusu Ntim",
      role: "Founder & CEO",
      image: "/images/founder.jpg",
    },
    {
      name: "Esther Adjei Konamah",
      role: "Operations Manager",
      image: "/images/team3.jpg",
    },
    {
      name: "Drake Nana Adjei Afram",
      role: "Travel Consultant",
      image: "/images/thisshouldbeintegrated1.jpg",
    },
    {
      name: "Sadat Abdul Wahab",
      role: "Admissions Specialist",
      image: "/images/team1.jpg",
    },
  ]

  return (
    <section className="py-24 bg-gradient-to-br from-slate-900 to-slate-800 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">Our Team</span>
          </h2>
          <p className="text-lg text-slate-300">Meet the dedicated professionals at Center for Admission and Travels</p>
        </div>

        {/* Team Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {teamMembers.map((member, idx) => (
            <div key={idx} className="group">
              <div className="relative overflow-hidden rounded-2xl mb-4 h-64">
                <Image
                  src={member.image || "/placeholder.svg"}
                  alt={member.name}
                  width={300}
                  height={400}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
              <h3 className="text-xl font-bold text-white">{member.name}</h3>
              <p className="text-orange-400">{member.role}</p>
            </div>
          ))}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-8 mt-16">
          <div className="bg-white/10 rounded-xl p-6 text-center">
            <div className="text-3xl font-bold text-orange-400">4</div>
            <p className="text-sm text-slate-300 mt-2">Expert Team Members</p>
          </div>
          <div className="bg-white/10 rounded-xl p-6 text-center">
            <div className="text-3xl font-bold text-orange-400">10+</div>
            <p className="text-sm text-slate-300 mt-2">Years Experience</p>
          </div>
          <div className="bg-white/10 rounded-xl p-6 text-center">
            <div className="text-3xl font-bold text-orange-400">100%</div>
            <p className="text-sm text-slate-300 mt-2">Client Dedication</p>
          </div>
        </div>
      </div>
    </section>
  )
}
