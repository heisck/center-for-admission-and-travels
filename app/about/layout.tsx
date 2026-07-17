import { createMetadata } from '@/lib/metadata'
import { BreadcrumbStructuredData } from '@/components/structured-data'

export const metadata = createMetadata({
  title: 'About CA Travels (CFAAT) — Center for Admission and Travels Ghana',
  description:
    'Learn about Center for Admission and Travels (CA Travels / CFAAT): our mission, team, and commitment to study abroad, work abroad, and travel support from Ghana.',
  path: '/about',
  keywords: [
    'about CA Travels',
    'CFAAT Ghana',
    'Center for Admission and Travels',
    'travel agency Ghana',
    'study abroad agency Accra',
  ],
})

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <BreadcrumbStructuredData
        items={[
          { name: 'Home', path: '/' },
          { name: 'About', path: '/about' },
        ]}
      />
      {children}
    </>
  )
}
