'use client'

import { useEffect, useState } from "react"

import FooterContentView, { EMPTY_CONTACT, EMPTY_FOOTER } from "@/components/footer-content"
import { getClientSiteChrome, primeClientSiteChrome } from "@/lib/client-site-chrome"
import type { ContactContent, FooterContent } from "@/lib/public-content"

interface FooterProps {
  contact?: ContactContent
  footer?: FooterContent
}

export default function Footer({ contact, footer }: FooterProps) {
  const [fallbackContact, setFallbackContact] = useState<ContactContent>(contact ?? EMPTY_CONTACT)
  const [fallbackFooter, setFallbackFooter] = useState<FooterContent>(footer ?? EMPTY_FOOTER)

  useEffect(() => {
    if (contact && footer) {
      primeClientSiteChrome({ contact, footer })
      return
    }

    let active = true

    const fetchChrome = async () => {
      const chrome = await getClientSiteChrome()
      if (!active || !chrome) return

      setFallbackContact(chrome.contact)
      setFallbackFooter(chrome.footer)
    }

    fetchChrome()

    return () => {
      active = false
    }
  }, [contact, footer])

  return <FooterContentView contact={contact ?? fallbackContact} footer={footer ?? fallbackFooter} />
}
