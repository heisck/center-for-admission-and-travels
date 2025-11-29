"use client"

import { useSearchParams } from "next/navigation"
import { useState } from "react"
import SharedBookingForm from "@/components/shared-booking-form"

export default function ApplyFormContent() {
  const searchParams = useSearchParams()
  const serviceParam = searchParams.get("service")
  const [selectedService, setSelectedService] = useState<string>(serviceParam || "")

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
      <h2 className="text-2xl font-bold text-foreground mb-2">
        Application Form
      </h2>
      <p className="text-muted-foreground mb-8">
        Select your service below and fill in your details. You can change your service selection at any time using the dropdown.
      </p>
      <SharedBookingForm serviceType={selectedService || undefined} onServiceChange={setSelectedService} />
    </div>
  )
}
