import type { Metadata } from 'next'
import LegalPageContent from '@/components/legal-page-content'

export const metadata: Metadata = {
  title: 'Refund Policy | Center for Admission and Travels',
  description: 'Refund Policy for Center for Admission and Travels (CFAAT) — cancellation terms, refund timelines, and conditions.',
}

export default function RefundPolicyPage() {
  return (
    <LegalPageContent
      slug="refund-policy"
      defaultTitle="Refund Policy"
      defaultDescription="Cancellation terms and refund conditions."
    />
  )
}
