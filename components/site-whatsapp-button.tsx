"use client"

import { useEffect, useState } from "react"

import { getClientWhatsAppNumber } from "@/lib/client-site-chrome"
import WhatsAppButton from "@/components/whatsapp-button"

export default function SiteWhatsAppButton() {
  const [whatsappNumber, setWhatsappNumber] = useState<string | null>(null)

  useEffect(() => {
    let active = true

    const fetchChrome = async () => {
      const nextWhatsappNumber = await getClientWhatsAppNumber()
      if (!active || !nextWhatsappNumber) return
      setWhatsappNumber(nextWhatsappNumber)
    }

    fetchChrome()

    return () => {
      active = false
    }
  }, [])

  return <WhatsAppButton whatsappNumber={whatsappNumber} />
}
