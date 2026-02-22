import Link from "next/link"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"

export default function NotFound() {
  return (
    <>
      <Navbar />
      <main className="min-h-[70vh] flex items-center justify-center px-4">
        <div className="text-center max-w-lg">
          <p className="text-[8rem] font-extrabold leading-none bg-gradient-to-r from-orange-500 to-red-600 bg-clip-text text-transparent select-none">
            404
          </p>
          <h1 className="mt-2 text-3xl font-bold text-foreground sm:text-4xl">
            Page Not Found
          </h1>
          <p className="mt-4 text-muted-foreground">
            Sorry, the page you&apos;re looking for doesn&apos;t exist or has been moved.
            Let&apos;s get you back on track.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/"
              className="px-6 py-3 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-lg hover:shadow-lg transition text-sm font-semibold"
            >
              Back to Home
            </Link>
            <Link
              href="/contact"
              className="px-6 py-3 text-primary border border-primary rounded-lg hover:bg-primary hover:text-white transition text-sm font-semibold"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
