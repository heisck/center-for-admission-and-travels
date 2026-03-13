"use client"

import { useEffect, useState } from "react"

import WhatsAppButton from "@/components/whatsapp-button"

const FALLBACK_WHATSAPP_NUMBER = "+233248422663"

export default function SiteWhatsAppButton() {
  const [whatsappNumber, setWhatsappNumber] = useState(FALLBACK_WHATSAPP_NUMBER)

  useEffect(() => {
    let active = true

    const fetchChrome = async () => {
      try {
        const response = await fetch("/api/site-chrome", { cache: "force-cache" })
        const result = await response.json()
        const nextWhatsappNumber = result?.success ? result.data?.contact?.whatsappNumber?.trim() : ""

        if (!active || !nextWhatsappNumber) return
        setWhatsappNumber(nextWhatsappNumber)
      } catch {
        // Keep the last known number if shared chrome cannot be fetched.
      }
    }

    fetchChrome()

    return () => {
      active = false
    }
  }, [])

  return <WhatsAppButton whatsappNumber={whatsappNumber} />
}
