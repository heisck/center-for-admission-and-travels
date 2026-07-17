import { createMetadata } from '@/lib/metadata'
import { BreadcrumbStructuredData, FaqStructuredData, ServiceStructuredData } from '@/components/structured-data'

export const metadata = createMetadata({
  title: 'Work Abroad from Ghana — Pathways & Guidance',
  description:
    'Explore work abroad options with CA Travels (CFAAT). Guidance for international work pathways, documentation, and relocation planning from Ghana.',
  path: '/work-abroad',
  keywords: [
    'work abroad Ghana',
    'work abroad from Ghana',
    'jobs abroad Ghana',
    'CFAAT work abroad',
    'CA Travels work packages',
    'international work visas Ghana',
  ],
})

const FAQS = [
  {
    question: 'Does CA Travels help with work abroad from Ghana?',
    answer:
      'Yes. CFAAT provides guidance on work-abroad pathways, documentation, and planning so you understand requirements before you apply or travel.',
  },
]

export default function WorkAbroadLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <BreadcrumbStructuredData
        items={[
          { name: 'Home', path: '/' },
          { name: 'Work Abroad', path: '/work-abroad' },
        ]}
      />
      <ServiceStructuredData
        name="Work Abroad Services — CA Travels"
        serviceType="Work abroad consulting"
        description="Work-abroad pathway support from Center for Admission and Travels in Ghana."
        path="/work-abroad"
      />
      <FaqStructuredData faqs={FAQS} />
      {children}
    </>
  )
}
