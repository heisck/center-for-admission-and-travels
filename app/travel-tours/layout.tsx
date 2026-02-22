import { createMetadata } from '@/lib/metadata'

export const metadata = createMetadata({
  title: 'Travel & Tours',
  description: 'Curated travel packages to Dubai, Europe, Asia, and more. Full support and affordable tours from Center for Admission and Travels.',
  path: '/travel-tours',
})

export default function TravelToursLayout({ children }: { children: React.ReactNode }) {
  return children
}
