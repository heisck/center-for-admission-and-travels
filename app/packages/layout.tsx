import { createMetadata } from '@/lib/metadata'

export const metadata = createMetadata({
  title: 'Study, Work & Travel Packages from Ghana',
  description:
    'Browse CA Travels (CFAAT) packages for study abroad, work abroad, and international tours. Affordable travel packages from Ghana to Dubai, Europe, Asia, UK, Canada, and more — with visa and booking support.',
  path: '/packages',
  keywords: [
    'CA Travels packages',
    'travel packages Ghana',
    'study abroad packages Ghana',
    'work abroad packages',
    'Dubai tour from Ghana',
    'Europe travel package Ghana',
    'CFAAT packages',
    'travel abroad packages',
    'international tours Ghana',
  ],
})

export default function PackagesLayout({ children }: { children: React.ReactNode }) {
  return children
}
