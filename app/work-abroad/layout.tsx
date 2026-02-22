import { createMetadata } from '@/lib/metadata'

export const metadata = createMetadata({
  title: 'Work Abroad',
  description: 'Work abroad with Center for Admission and Travels. Job placement assistance and relocation support in verified international companies.',
  path: '/work-abroad',
})

export default function WorkAbroadLayout({ children }: { children: React.ReactNode }) {
  return children
}
