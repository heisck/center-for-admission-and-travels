import { createMetadata } from '@/lib/metadata'

export const metadata = createMetadata({
  title: 'Contact Us',
  description: 'Get in touch with Center for Admission and Travels. Contact us for study abroad, work abroad, and travel inquiries. We\'re here to help you start your global journey.',
  path: '/contact',
})

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children
}
