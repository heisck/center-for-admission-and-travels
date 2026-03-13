"use client"

import { useEffect } from "react"

import { primeClientSiteChrome } from "@/lib/client-site-chrome"
import type { ContactContent, FooterContent } from "@/lib/public-content"

interface ChromeCachePrimerProps {
  contact: ContactContent
  footer: FooterContent
}

export default function ChromeCachePrimer({ contact, footer }: ChromeCachePrimerProps) {
  useEffect(() => {
    primeClientSiteChrome({ contact, footer })
  }, [contact, footer])

  return null
}
