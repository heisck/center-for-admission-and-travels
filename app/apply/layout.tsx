import { createMetadata } from '@/lib/metadata'
import { BreadcrumbStructuredData } from '@/components/structured-data'

export const metadata = createMetadata({
  title: 'Apply with CA Travels — Study, Work & Travel',
  description:
    'Start your application with CA Travels (CFAAT) for study abroad, work abroad, or travel packages. Our Ghana team responds quickly to help you take the next step.',
  path: '/apply',
})

export default function ApplyLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <BreadcrumbStructuredData
        items={[
          { name: 'Home', path: '/' },
          { name: 'Apply', path: '/apply' },
        ]}
      />
      {children}
    </>
  )
}
