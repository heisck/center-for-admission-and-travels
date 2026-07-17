import { createMetadata } from '@/lib/metadata'
import { BreadcrumbStructuredData } from '@/components/structured-data'

export const metadata = createMetadata({
  title: 'Contact CA Travels Ghana (CFAAT)',
  description:
    'Contact Center for Admission and Travels (CA Travels / CFAAT) for study abroad, work abroad, and travel package inquiries in Ghana. Call, WhatsApp, or send a message.',
  path: '/contact',
  keywords: [
    'contact CA Travels',
    'CFAAT contact',
    'travel agency Accra contact',
    'study abroad Ghana contact',
  ],
})

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <BreadcrumbStructuredData
        items={[
          { name: 'Home', path: '/' },
          { name: 'Contact', path: '/contact' },
        ]}
      />
      {children}
    </>
  )
}
