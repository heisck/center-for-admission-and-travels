import { createMetadata } from '@/lib/metadata'
import { BreadcrumbStructuredData } from '@/components/structured-data'

export const metadata = createMetadata({
  title: 'Travel & Study Abroad Blog — Guides from CA Travels',
  description:
    'Practical guides from CA Travels (CFAAT) on study abroad, visas, work abroad, and international travel from Ghana.',
  path: '/blog',
  keywords: [
    'study abroad blog Ghana',
    'travel tips Ghana',
    'visa guide Ghana',
    'CA Travels blog',
    'CFAAT articles',
  ],
})

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <BreadcrumbStructuredData
        items={[
          { name: 'Home', path: '/' },
          { name: 'Blog', path: '/blog' },
        ]}
      />
      {children}
    </>
  )
}
