import { createMetadata } from '@/lib/metadata'
import { BreadcrumbStructuredData } from '@/components/structured-data'

export const metadata = createMetadata({
  title: 'Documentation & Professional Services | CA Travels',
  description:
    'Book passport, certificate, registration, documentation, and other professional support services with clear plans, pricing, and turnaround times.',
  path: '/global-network',
})

export default function GlobalNetworkLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <BreadcrumbStructuredData
        items={[
          { name: 'Home', path: '/' },
          { name: 'Professional Services', path: '/global-network' },
        ]}
      />
      {children}
    </>
  )
}
