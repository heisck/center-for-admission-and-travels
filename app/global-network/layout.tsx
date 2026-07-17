import { createMetadata } from '@/lib/metadata'
import { BreadcrumbStructuredData } from '@/components/structured-data'

export const metadata = createMetadata({
  title: 'Global Network — Partners & Destinations | CA Travels',
  description:
    'Discover CFAAT’s global network of universities, employers, and travel partners. Center for Admission and Travels connects Ghana to opportunities worldwide.',
  path: '/global-network',
})

export default function GlobalNetworkLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <BreadcrumbStructuredData
        items={[
          { name: 'Home', path: '/' },
          { name: 'Global Network', path: '/global-network' },
        ]}
      />
      {children}
    </>
  )
}
