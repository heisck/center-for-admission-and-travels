import { createMetadata } from '@/lib/metadata'

export const metadata = createMetadata({
  title: 'Study Abroad',
  description: 'Study abroad with CFAAT. University admission guidance, visa processing, and support for top institutions worldwide. Start your international education journey.',
  path: '/study-abroad',
})

export default function StudyAbroadLayout({ children }: { children: React.ReactNode }) {
  return children
}
