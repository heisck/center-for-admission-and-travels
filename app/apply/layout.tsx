import { createMetadata } from '@/lib/metadata'

export const metadata = createMetadata({
  title: 'Apply Now',
  description: 'Start your application for study abroad, work abroad, or travel. Fill out the form and our team will contact you within 24 hours.',
  path: '/apply',
})

export default function ApplyLayout({ children }: { children: React.ReactNode }) {
  return children
}
