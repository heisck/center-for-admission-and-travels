import { createMetadata } from '@/lib/metadata'

export const metadata = createMetadata({
  title: 'Global Network',
  description: 'Our partnerships with accredited universities and verified employers worldwide. Connect with global opportunities through CFAAT.',
  path: '/global-network',
})

export default function GlobalNetworkLayout({ children }: { children: React.ReactNode }) {
  return children
}
