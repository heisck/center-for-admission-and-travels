import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Center for Admission and Travels - CFAAT",
  description:
    "Your gateway to global education, travel, and work opportunities. Center for Admission and Travels (CFAAT) - Unlock the world, enrich your future.",
  generator: "v0.app",
  icons: {
    icon: "/images/ca-20logo.png",
    apple: "/images/ca-20logo.png",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans antialiased`}>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
