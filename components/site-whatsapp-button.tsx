"use client"

import { useEffect, useState } from "react"

import { getClientWhatsAppNumber } from "@/lib/client-site-chrome"
import WhatsAppButton from "@/components/whatsapp-button"

const FALLBACK_WHATSAPP_NUMBER = "+233248422663"

export default function SiteWhatsAppButton() {
  const [whatsappNumber, setWhatsappNumber] = useState(FALLBACK_WHATSAPP_NUMBER)

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
