import { unstable_cache } from 'next/cache'
import { prisma } from '@/lib/prisma'

export interface SupportContact {
  email: string
  phone: string
  whatsappNumber: string
}

const DEFAULT_SUPPORT_CONTACT: SupportContact = {
  email: 'info@centerforadmissionandtravels.com',
  phone: '+233 248 422 663',
  whatsappNumber: '+233248422663',
}

const getCachedSupportContact = unstable_cache(
  async (): Promise<SupportContact> => {
    const contact = await prisma.contactInfo.findUnique({
      where: { id: 'contact' },
      select: { email: true, phone: true, whatsappNumber: true },
    })

    if (!contact) return DEFAULT_SUPPORT_CONTACT

    return {
      email: contact.email?.trim() || DEFAULT_SUPPORT_CONTACT.email,
      phone: contact.phone?.trim() || DEFAULT_SUPPORT_CONTACT.phone,
      whatsappNumber: contact.whatsappNumber?.trim() || DEFAULT_SUPPORT_CONTACT.whatsappNumber,
    }
  },
  ['support-contact'],
  { revalidate: 300, tags: ['public-content'] }
)

export async function getSupportContact(): Promise<SupportContact> {
  return getCachedSupportContact()
}

