import { createMetadata } from '@/lib/metadata'

export const metadata = createMetadata({
  title: 'Blog & News',
  description: 'Tips, updates, and stories about study abroad, work opportunities, and travel from Center for Admission and Travels.',
  path: '/blog',
})

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return children
}
