import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import WhatsAppButton from "@/components/whatsapp-button"
import { AdminProvider } from "@/context/admin-context"
import { PublicContentProvider } from "@/context/public-content-context"
import { UserAuthProviderWrapper } from "@/components/user-auth-provider-wrapper"
import { Toaster } from "@/components/ui/sonner"
import CookieConsent from "@/components/cookie-consent"
import { OrganizationStructuredData, WebSiteStructuredData } from "@/components/structured-data"
import { GoogleAnalytics } from "@/components/google-analytics"
import "./globals.css"

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

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
      <body className={`font-sans antialiased overflow-x-hidden`}>
        <OrganizationStructuredData />
        <WebSiteStructuredData />
        <GoogleAnalytics />
        <PublicContentProvider>
          <AdminProvider>
            <UserAuthProviderWrapper>
              {children}
              <WhatsAppButton />
              <Toaster />
              <CookieConsent />
              {AnalyticsComponent && <AnalyticsComponent />}
            </UserAuthProviderWrapper>
          </AdminProvider>
        </PublicContentProvider>
        </body>
    </html>
  )
}
