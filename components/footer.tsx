'use client'

import { useEffect, useState } from "react"

import FooterContentView, { EMPTY_CONTACT, EMPTY_FOOTER } from "@/components/footer-content"
import type { ContactContent, FooterContent } from "@/lib/public-content"

interface FooterProps {
  contact?: ContactContent
  footer?: FooterContent
}

export default function Footer({ contact, footer }: FooterProps) {
  const [fallbackContact, setFallbackContact] = useState<ContactContent>(contact ?? EMPTY_CONTACT)
  const [fallbackFooter, setFallbackFooter] = useState<FooterContent>(footer ?? EMPTY_FOOTER)

  useEffect(() => {
    if (contact && footer) return

    let active = true

    const fetchChrome = async () => {
      try {
        const response = await fetch("/api/site-chrome", { cache: "force-cache" })
        const result = await response.json()
        if (!active || !result.success) return

        setFallbackContact(result.data.contact)
        setFallbackFooter(result.data.footer)
      } catch {
        // Best-effort fallback for client-only pages that do not pass shared chrome props.
      }
    }

    fetchChrome()

    return () => {
      active = false
    }
  }, [contact, footer])

  return <FooterContentView contact={contact ?? fallbackContact} footer={footer ?? fallbackFooter} />
}
