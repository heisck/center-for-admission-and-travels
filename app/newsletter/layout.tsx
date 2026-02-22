import { createMetadata } from '@/lib/metadata'

export const metadata = createMetadata({
  title: 'Newsletter',
  description: 'Subscribe to Center for Admission and Travels newsletter for tips on study abroad, work opportunities, and travel updates.',
  path: '/newsletter',
})

export default function NewsletterLayout({ children }: { children: React.ReactNode }) {
  return children
}
