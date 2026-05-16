import { unstable_cache } from 'next/cache'
import { prisma } from '@/lib/prisma'

export interface SupportContact {
  email: string
  phone: string
  whatsappNumber: string
}

const EMPTY_SUPPORT_CONTACT: SupportContact = {
  email: '',
  phone: '',
  whatsappNumber: '',
}

async function loadSupportContact(): Promise<SupportContact> {
  try {
    const contact = await prisma.contactInfo.findUnique({
      where: { id: 'contact' },
      select: { email: true, phone: true, whatsappNumber: true },
    })

    if (!contact) return EMPTY_SUPPORT_CONTACT

    return {
      email: contact.email?.trim() || '',
      phone: contact.phone?.trim() || '',
      whatsappNumber: contact.whatsappNumber?.trim() || '',
    }
  } catch (error) {
    console.error('[support-contact] Failed to load support contact:', error)
    return EMPTY_SUPPORT_CONTACT
  }
}

const getCachedSupportContact = unstable_cache(
  loadSupportContact,
  ['support-contact'],
  { revalidate: 300, tags: ['public-content'] }
)

export async function getSupportContact(): Promise<SupportContact> {
  return getCachedSupportContact()
}

export async function getFreshSupportContact(): Promise<SupportContact> {
  return loadSupportContact()
}
