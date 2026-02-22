import { createMetadata } from '@/lib/metadata'

export const metadata = createMetadata({
  title: 'About Us',
  description: 'Learn about Center for Admission and Travels (CFAAT). Our mission, vision, team, and commitment to guiding you through study abroad, work abroad, and travel opportunities.',
  path: '/about',
})

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return children
}
