import type { Metadata } from 'next'
import LegalPageContent from '@/components/legal-page-content'

export const metadata: Metadata = {
  title: 'Privacy Policy | Center for Admission and Travels',
  description: 'Privacy Policy for Center for Admission and Travels (CFAAT) — how we collect, use, and protect your data.',
}

export default function PrivacyPage() {
  return (
    <LegalPageContent
      slug="privacy"
      defaultTitle="Privacy Policy"
      defaultDescription="How we collect, use, and protect your data."
    />
  )
}
