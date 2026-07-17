import type React from "react"
import type { Metadata, Viewport } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"

import CookieConsent from "@/components/cookie-consent"
import SiteWhatsAppButton from "@/components/site-whatsapp-button"
import { Toaster } from "@/components/ui/sonner"
import { OrganizationStructuredData, WebSiteStructuredData } from "@/components/structured-data"
import { GoogleAnalytics } from "@/components/google-analytics"
import { getSiteChromeContent } from "@/lib/public-content"
import {
  DEFAULT_DESC,
  DEFAULT_KEYWORDS,
  SITE_ALT_NAMES,
  SITE_NAME,
  SITE_SHORT_NAME,
} from "@/lib/metadata"
import "./globals.css"

let AnalyticsComponent: React.ComponentType | null = null
if (process.env.VERCEL) {
  AnalyticsComponent = require("@vercel/analytics/next").Analytics
}

const SITE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://catravels.com'

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ea580c' },
    { media: '(prefers-color-scheme: dark)', color: '#9a3412' },
  ],
  width: 'device-width',
  initialScale: 1,
}

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} (CA Travels / ${SITE_SHORT_NAME}) | Study, Work & Travel Abroad from Ghana`,
    template: `%s | CA Travels (${SITE_SHORT_NAME})`,
  },
  description: DEFAULT_DESC,
  keywords: DEFAULT_KEYWORDS,
  applicationName: SITE_NAME,
  authors: [{ name: SITE_NAME, url: SITE_URL }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  category: 'travel',
  icons: {
    icon: [
      { url: '/cfaat-favicon.png', type: 'image/png' },
      { url: '/images/ca-20logo.png', type: 'image/png' },
    ],
    apple: [{ url: '/apple-icon.png' }, { url: '/images/ca-20logo.png' }],
    shortcut: '/cfaat-favicon.png',
  },
  manifest: '/site.webmanifest',
  alternates: {
    canonical: SITE_URL,
    languages: {
      'en-GH': SITE_URL,
      en: SITE_URL,
      'x-default': SITE_URL,
    },
    types: {
      'text/plain': [{ url: '/llms.txt', title: 'llms.txt' }],
    },
  },
  openGraph: {
    title: `${SITE_NAME} — CA Travels Ghana | Study Abroad, Work Abroad & Tours`,
    description: DEFAULT_DESC,
    url: SITE_URL,
    siteName: `${SITE_NAME} | CA Travels`,
    images: [
      {
        url: '/images/ca-20logo.png',
        width: 1200,
        height: 630,
        alt: 'CA Travels (CFAAT) — Center for Admission and Travels Ghana',
      },
    ],
    locale: 'en_GH',
    type: 'website',
    countryName: 'Ghana',
  },
  twitter: {
    card: 'summary_large_image',
    title: `CA Travels (${SITE_SHORT_NAME}) — Study, Work & Travel Abroad from Ghana`,
    description: DEFAULT_DESC,
    images: ['/images/ca-20logo.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },
  other: {
    'geo.region': 'GH',
    'geo.placename': 'Accra',
    'og:locale:alternate': 'en_US',
    'ai:brand_names': SITE_ALT_NAMES.join(', '),
  },
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const chrome = await getSiteChromeContent()

  return (
    <html lang="en-GH" className="overflow-x-clip" suppressHydrationWarning>
      <head>
        <link rel="llms-txt" href="/llms.txt" />
        <link rel="alternate" type="text/plain" href="/llms.txt" title="llms.txt" />
      </head>
      <body
        className={`${GeistSans.variable} ${GeistMono.variable} font-sans antialiased w-full overflow-x-clip`}
        suppressHydrationWarning
      >
        <OrganizationStructuredData contact={chrome.contact} footer={chrome.footer} />
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
