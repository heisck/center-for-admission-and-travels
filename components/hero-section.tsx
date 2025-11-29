"use client"

import Link from "next/link"
//import Image from "next/image"
import Masonry from './Masonry'
import './hero-section.css'
// import Stack from './Stack'



const images = [
  { id: 1, img: "/images/thisshouldbeintegrated5.jpg" },
  { id: 2, img: "/images/integrate.jpg" },
  { id: 3, img: "/images/integrate1.jpg" }
];

const items = [
    {
      id: "1",
      img: "/images/thisshouldbeintegrated5.jpg",
      url: "https://example.com/one",
      height: 400,
    },
    {
      id: "2",
      img: "/images/integrate2.jpg",
      url: "https://example.com/two",
      height: 350,
    },
    {
      id: "3",
      img: "/images/integrate.jpg",
      url: "https://example.com/three",
      height: 400,
    },
    {
      id: "4",
      img: "/images/integrate1.jpg",
      url: "https://example.com/four",
      height: 600,
    },
    {
      id: "5",
      img: "/images/integrate3.jpg",
      url: "https://example.com/five",
      height: 300,
    },
    // {
    //   id: "6",
    //   img: "/images/integrated2.jpg",
    //   url: "https://example.com/six",
    //   height: 600,
    // },

];
export default function HeroSection() {

  return (
    <section className="relative overflow-hidden pt-12 md:pt-22 lg:py-32 md:pb-22">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-orange-50 via-white to-red-50 -z-30"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div
            className="hero-content relative md:space-y-8 space-y-4 animate-fade-in min-h-[420px] md:min-h-0"
          >
            {/* Small screens: Background overlay for text readability */}
            <div className="md:hidden absolute inset-0 pointer-events-none bg-black/20" style={{ zIndex: 1 }} />

            <div className="relative z-20">
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold leading-tight mb-4">
                <span className="bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                  Looking To Travel
                </span>
                <br />
                <span className="text-foreground">& Enrich Your Future</span>
              </h1>
              <p className="text-lg text-muted-foreground mt-6 leading-relaxed">
                Welcome to Center for Admission and Travels, where your dreams of studying, working, and traveling
                abroad become reality. We guide you with honesty, professionalism, and care every step of the way.
              </p>
            </div>

            <div className="relative z-20 flex gap-4 flex-wrap">
              <a
                href="#services"
                className="px-8 py-3 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-lg font-semibold hover:shadow-xl transition transform hover:scale-105"
              >
                View Our Services
              </a>
              <Link
                href="/contact"
                className="px-8 py-3 border-2 border-primary text-primary rounded-lg font-semibold hover:bg-primary hover:text-white transition"
              >
                Contact Us
              </Link>
            </div>

            {/* Stats */}
            <div className="relative z-20 grid grid-cols-3 md:gap-6 pt-8">
              <div>
                <div className="text-3xl font-bold text-primary">50+</div>
                <p className="text-sm text-muted-foreground">Success Stories</p>
              </div>
              <div>
                <div className="text-3xl font-bold text-primary">15+</div>
                <p className="text-sm text-muted-foreground">Destinations</p>
              </div>
              <div>
                <div className="text-3xl font-bold text-primary">100%</div>
                <p className="text-sm text-muted-foreground">Satisfaction</p>
              </div>
            </div>
          </div>

          {/* Right Image - Only on desktop with Masonry */}
          <div className="hidden md:flex relative h-full">
            <div className="relative w-full h-96 rounded-2xl ">
              <Masonry
                items={items}
                ease="power3.out"
                duration={0.6}
                stagger={0.05}
                animateFrom="bottom"
                scaleOnHover={true}
                hoverScale={0.95}
                blurToFocus={true}
                colorShiftOnHover={true}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
