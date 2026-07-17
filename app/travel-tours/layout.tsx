import { createMetadata } from '@/lib/metadata'
import { BreadcrumbStructuredData, FaqStructuredData, ServiceStructuredData } from '@/components/structured-data'

export const metadata = createMetadata({
  title: 'Travel & Tours from Ghana — Dubai, Europe, Asia Packages',
  description:
    'Book curated travel packages with CA Travels (CFAAT). International tours from Ghana to Dubai, Europe, Asia, and more — with full planning support.',
  path: '/travel-tours',
  keywords: [
    'travel packages Ghana',
    'tours from Ghana',
    'Dubai tour Ghana',
    'Europe tour from Ghana',
    'CA Travels tours',
    'CFAAT travel',
    'travel abroad packages',
    'travel agency Accra',
  ],
})

const FAQS = [
  {
    question: 'Where can I travel with CA Travels packages?',
    answer:
      'Popular offerings include Dubai, Europe, Asia, and other international destinations. See live packages for current itineraries and prices.',
  },
  {
    question: 'Is CA Travels a travel agency in Ghana?',
    answer:
      'Center for Admission and Travels (CA Travels / CFAAT) provides travel and tour packages alongside education and work-abroad services for clients in Ghana.',
  },
]

export default function TravelToursLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <BreadcrumbStructuredData
        items={[
          { name: 'Home', path: '/' },
          { name: 'Travel & Tours', path: '/travel-tours' },
        ]}
      />
      <ServiceStructuredData
        name="Travel and Tour Packages — CA Travels"
        serviceType="Travel agency services"
        description="International travel packages and tours from Ghana by Center for Admission and Travels."
        path="/travel-tours"
      />
      <FaqStructuredData faqs={FAQS} />
      {children}
    </>
  )
}
