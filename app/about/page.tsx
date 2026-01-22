"use client"

import './page.css'
import { useScrollToTop } from "@/hooks/use-scroll-to-top"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import Image from "next/image"
import { CheckCircle } from "lucide-react"
import FounderSection from "@/components/founder-section"
import { Description } from '@radix-ui/react-toast'

export default function About() {
  useScrollToTop()

  return (
    <main className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="relative py-16 md:py-24 bg-gradient-to-br from-orange-50 to-red-50 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Image - Top Left */}
            <div className="relative h-80 rounded-2xl overflow-hidden shadow-xl order-2 md:order-1">
              <Image
                src="/images/thisshouldbeintegrated4.jpg"
                alt="Team at conference"
                fill
                className="object-cover object-top"
              />
            </div>

            {/* Content */}
            <div className="order-1 md:order-2">
              <h1 className="text-5xl md:text-6xl font-bold mb-4">
                <span className="bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                  About Center for Admission and Travels
                </span>
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl">
                Your trusted partner in global opportunities. We believe every journey is unique, and our team is
                dedicated to guiding you with honesty, professionalism, and care from start to finish.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12">
            <div>
              <h2 className="text-3xl font-bold mb-6 text-primary">Our Mission</h2>
              <p className="text-lg text-muted-foreground leading-relaxed mb-6">
                To provide trusted, personalized, and professional services in international education, travel, and job
                placements. We are dedicated to guiding students to study abroad, facilitating smooth and affordable
                travel, and providing pathways for work opportunities.
              </p>
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                  <span className="text-foreground">Honest and transparent guidance</span>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                  <span className="text-foreground">Professional expertise and care</span>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                  <span className="text-foreground">Personalized attention for every client</span>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-3xl font-bold mb-6 text-primary">Our Vision</h2>
              <p className="text-lg text-muted-foreground leading-relaxed mb-6">
                To be Ghana's leading gateway to global education, travel, and work opportunities; empowering
                individuals to explore the world, gain international experience, and unlock their full potential.
              </p>
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                  <span className="text-foreground">Global network of partners</span>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                  <span className="text-foreground">Technology-driven solutions</span>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                  <span className="text-foreground">Inspiring international success</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center mb-12">
            <span className="bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
              Core Values
            </span>
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { title: "Integrity", desc: "Honesty and ethical practices in all dealings" },
              { title: "Professionalism", desc: "Expert service with dedication and expertise" },
              { title: "Customer First", desc: "Your needs drive everything we do" },
              { title: "Transparency", desc: "Clear communication without hidden costs" },
              { title: "Respect", desc: "Value every individual and their journey" },
              { title: "Confidentiality", desc: "Your information is safe with us" },
            ].map((value, idx) => (
              <div key={idx} className="bg-white p-8 rounded-xl shadow-sm hover:shadow-lg transition">
                <h3 className="text-xl font-bold text-primary mb-3">{value.title}</h3>
                <p className="text-muted-foreground">{value.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <FounderSection />
      {/* Team */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center mb-4">
            <span className="bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
              Meet Our Team
            </span>
          </h2>
          <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
            Dedicated professionals committed to your success
          </p>

          <div className="grid md:grid-cols-4 gap-8 team-grid">
            {[
              { 
                name: "George Owusu Ntim", role: "Founder, Managing Director & Chief Travel Consultant", image: "/images/USETHIS IMAGE FOR THE TEAM MEMBER TO REPLACE THE ONE OF THE FOUNDER.jpg",

              },
              { 
                name: "Sadat Abdul Wahab", role: "Travel Consultant", image: "/images/team2.jpg", description: "Sadat Abdul Wahab is a dedicated Travel Consultant with in-depth knowledge of visa procedures, ticketing, and travel planning. He works closely with clients to create tailored travel solutions that fit their goals and budgets. Sadat’s expertise and customer-focused approach help ensure stress-free journeys from Ghana to destinations around the world."
              },
              {
                name: "Drake Nana Adjei Afram",
                role: "Accountant",
                image: "/images/team1.jpg",
                description: "Drake Nana Adjei Afram oversees all financial operations at Center for Admission and Travels. As the company’s Accountant, he is responsible for budgeting, invoicing, reconciliation, and maintaining accurate financial records. With strong analytical skills and a commitment to transparency, Drake supports the financial stability and growth of the organisation."
              },
              { 
                name: "Esther Adjei Konamah", role: "Administrative & Front Desk Officer", image: "/images/team3.jpg" 
              ,description: "Esther Adjei Konamah ensures the smooth daily operation of our office. As the Administrative and Front Desk Officer, she warmly welcomes clients, manages enquiries, organizes appointments, and maintains efficient office systems. Esther’s professionalism, communication skills, and friendly service make her an essential part of our client experience."
              },
            ].map((member, idx) => (
              <div key={idx} className="group">
                <div className="relative h-64 mb-4 rounded-xl overflow-hidden shadow-lg">
                  <Image
                    src={member.image || "/placeholder.svg"}
                    alt={member.name}
                    width={300}
                    height={400}
                    className="min-w-3xs md:min-w-1/3 w-full h-full object-cover object-top group-hover:scale-110 transition duration-300"
                  />
                </div>
                <h3 className="text-lg font-bold text-foreground">{member.name}</h3>
                <p className="text-primary font-semibold">{member.role}</p>
                {member.description && (
                  <div className="text-sm text-muted-foreground leading-relaxed mt-2">
                    <details>
                      <summary className="cursor-pointer">More Info</summary>
                      <div className="mt-2">{member.description}</div>
                    </details>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
