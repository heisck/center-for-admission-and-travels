import type { Metadata } from 'next'
import LegalPageContent from '@/components/legal-page-content'

export const metadata: Metadata = {
  title: 'Terms and Conditions | Center for Admission and Travels',
  description: 'Terms and Conditions for using Center for Admission and Travels (CFAAT) services.',
}

export default function TermsPage() {
  return (
    <LegalPageContent
      slug="terms"
      defaultTitle="Terms and Conditions"
      defaultDescription="Terms for using our services."
    />
  )
}
