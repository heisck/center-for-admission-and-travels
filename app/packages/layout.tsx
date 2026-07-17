import { createMetadata } from '@/lib/metadata'

export const metadata = createMetadata({
  title: 'Travel Packages',
  description:
    'Explore our curated travel packages to Dubai, Europe, Asia, and more. Affordable tours with full support from Center for Admission and Travels.',
  path: '/packages',
})

export default function PackagesLayout({ children }: { children: React.ReactNode }) {
  return children
}
