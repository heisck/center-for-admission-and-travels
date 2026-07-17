import { createMetadata } from '@/lib/metadata'
import { BreadcrumbStructuredData, FaqStructuredData, ServiceStructuredData } from '@/components/structured-data'

export const metadata = createMetadata({
  title: 'Study Abroad from Ghana — University Admissions & Visa Support',
  description:
    'Study abroad with CA Travels (CFAAT). University admission guidance, document support, and study pathways from Ghana to the UK, Canada, Europe, USA, and more.',
  path: '/study-abroad',
  keywords: [
    'study abroad Ghana',
    'study abroad from Ghana',
    'university admission Ghana',
    'study in UK from Ghana',
    'study in Canada from Ghana',
    'CFAAT study abroad',
    'CA Travels education',
  ],
})

const FAQS = [
  {
    question: 'How can CFAAT help me study abroad from Ghana?',
    answer:
      'We guide program selection, admission documentation, and next steps for international universities, with support tailored to applicants based in Ghana.',
  },
  {
    question: 'Which countries can I study in with CA Travels?',
    answer:
      'Popular pathways include the UK, Canada, Europe, the USA, and other destinations depending on your profile and current package offerings.',
  },
]

export default function StudyAbroadLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <BreadcrumbStructuredData
        items={[
          { name: 'Home', path: '/' },
          { name: 'Study Abroad', path: '/study-abroad' },
        ]}
      />
      <ServiceStructuredData
        name="Study Abroad Services — CA Travels"
        serviceType="Study abroad counseling"
        description="Admission and study-abroad support from Center for Admission and Travels (CFAAT) in Ghana."
        path="/study-abroad"
      />
      <FaqStructuredData faqs={FAQS} />
      {children}
    </>
  )
}
