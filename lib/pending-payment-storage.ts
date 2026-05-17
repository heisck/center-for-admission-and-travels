export interface PendingPaymentRecord {
  checkoutId: string
  packageId: string
  reference: string
  authorizationUrl: string
  amount: number
  currency: string
  createdAt: number
}

const STORAGE_PREFIX = 'cat_pending_payment:'
const MAX_PENDING_AGE_MS = 1000 * 60 * 60 * 24

function canUseStorage() {
  return typeof window !== 'undefined' && Boolean(window.localStorage)
}

export function getPendingPaymentKey(userId: string, packageId: string) {
  return `${STORAGE_PREFIX}${userId}:${packageId}`
}

function isFresh(payment: PendingPaymentRecord) {
  return Date.now() - Number(payment.createdAt || 0) <= MAX_PENDING_AGE_MS
}

export function readPendingPayment(userId: string, packageId: string): PendingPaymentRecord | null {
  if (!canUseStorage()) return null

  const key = getPendingPaymentKey(userId, packageId)
  const raw = window.localStorage.getItem(key)
  if (!raw) return null

  try {
    const parsed = JSON.parse(raw) as PendingPaymentRecord
    if (!parsed.reference || !parsed.authorizationUrl || !parsed.checkoutId || !isFresh(parsed)) {
      window.localStorage.removeItem(key)
      return null
    }
    return parsed
  } catch {
    window.localStorage.removeItem(key)
    return null
  }
}

export function savePendingPayment(userId: string, payment: PendingPaymentRecord) {
  if (!canUseStorage()) return
  window.localStorage.setItem(getPendingPaymentKey(userId, payment.packageId), JSON.stringify(payment))
}

export function clearPendingPayment(userId: string, packageId: string) {
  if (!canUseStorage()) return
  window.localStorage.removeItem(getPendingPaymentKey(userId, packageId))
}

export function readLatestPendingPayment(): PendingPaymentRecord | null {
  if (!canUseStorage()) return null

  let latest: PendingPaymentRecord | null = null

  for (let index = 0; index < window.localStorage.length; index += 1) {
    const key = window.localStorage.key(index)
    if (!key?.startsWith(STORAGE_PREFIX)) continue

    const raw = window.localStorage.getItem(key)
    if (!raw) continue

    try {
      const parsed = JSON.parse(raw) as PendingPaymentRecord
      if (!parsed.reference || !parsed.authorizationUrl || !parsed.checkoutId || !isFresh(parsed)) {
        window.localStorage.removeItem(key)
        index -= 1
        continue
      }
      if (!latest || Number(parsed.createdAt || 0) > Number(latest.createdAt || 0)) {
        latest = parsed
      }
    } catch {
      window.localStorage.removeItem(key)
      index -= 1
    }
  }

  return latest
}

export function clearPendingPaymentByReference(reference: string) {
  if (!canUseStorage() || !reference) return

  for (let index = 0; index < window.localStorage.length; index += 1) {
    const key = window.localStorage.key(index)
    if (!key?.startsWith(STORAGE_PREFIX)) continue

    const raw = window.localStorage.getItem(key)
    if (!raw) continue

    try {
      const parsed = JSON.parse(raw) as PendingPaymentRecord
      if (parsed.reference === reference) {
        window.localStorage.removeItem(key)
        index -= 1
      }
    } catch {
      window.localStorage.removeItem(key)
      index -= 1
    }
  }
}
