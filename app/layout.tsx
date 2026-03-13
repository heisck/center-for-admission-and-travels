import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"

import CookieConsent from "@/components/cookie-consent"
import SiteWhatsAppButton from "@/components/site-whatsapp-button"
import { Toaster } from "@/components/ui/sonner"
import { OrganizationStructuredData, WebSiteStructuredData } from "@/components/structured-data"
import { GoogleAnalytics } from "@/components/google-analytics"
import "./globals.css"

let AnalyticsComponent: React.ComponentType | null = null
if (process.env.VERCEL) {
  AnalyticsComponent = require("@vercel/analytics/next").Analytics
}

const SITE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://catravels.com'

export const metadata: Metadata = {
  title: "Center for Admission and Travels - CFAAT",
  description:
    "Your gateway to global education, travel, and work opportunities. Center for Admission and Travels (CFAAT) - Unlock the world, enrich your future.",
  generator: "v0.app",
  icons: {
    icon: "/images/ca-20logo.png",
    apple: "/images/ca-20logo.png",
  },
  metadataBase: new URL(SITE_URL),
  openGraph: {
    title: "Center for Admission and Travels - CFAAT",
    description: "Your gateway to global education, travel, and work opportunities. Study abroad, work abroad, and travel the world with CFAAT.",
    url: SITE_URL,
    siteName: "Center for Admission and Travels",
    images: [{ url: "/images/ca-20logo.png", width: 512, height: 512, alt: "CFAAT Logo" }],
    locale: "en_GH",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Center for Admission and Travels - CFAAT",
    description: "Your gateway to global education, travel, and work opportunities.",
    images: ["/images/ca-20logo.png"],
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${GeistSans.variable} ${GeistMono.variable} font-sans antialiased overflow-x-hidden`}>
        <OrganizationStructuredData />
        <WebSiteStructuredData />
        <GoogleAnalytics />
        {children}
        <SiteWhatsAppButton />
        <Toaster />
        <CookieConsent />
        {AnalyticsComponent ? <AnalyticsComponent /> : null}
      </body>
    </html>
  )
}
