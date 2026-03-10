/**
 * Shared contact helpers so links are normalized consistently across the app.
 */

export function normalizeWhatsAppNumber(number?: string | null): string {
  return (number || '').replace(/\D/g, '')
}

export function normalizePhoneForTel(phone?: string | null): string {
  const value = (phone || '').trim()
  if (!value) return ''

  if (value.startsWith('+')) {
    return `+${value.slice(1).replace(/\D/g, '')}`
  }

  return value.replace(/\D/g, '')
}

export function buildWhatsAppUrl(number?: string | null, message?: string): string | null {
  const normalized = normalizeWhatsAppNumber(number)
  if (!normalized) return null

  if (message?.trim()) {
    return `https://wa.me/${normalized}?text=${encodeURIComponent(message)}`
  }

  return `https://wa.me/${normalized}`
}

