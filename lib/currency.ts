/**
 * Package / Paystack currency helpers.
 *
 * Paystack expects amounts in the subunit of the currency (e.g. pesewas, cents).
 * For GHS, USD, EUR, and GBP the subunit multiplier is 100.
 *
 * Note: Whether Paystack accepts a given currency depends on the merchant account
 * (GHS local accounts typically accept GHS; USD often requires enabling international /
 * multi-currency on the Paystack dashboard). EUR/GBP are included for admin pricing
 * and will be sent to Paystack as-is — Paystack will reject unsupported currencies.
 */

export const SUPPORTED_CURRENCIES = ['GHS', 'USD', 'EUR', 'GBP'] as const

export type SupportedCurrency = (typeof SUPPORTED_CURRENCIES)[number]

export const DEFAULT_CURRENCY: SupportedCurrency = 'GHS'

export const CURRENCY_META: Record<
  SupportedCurrency,
  { code: SupportedCurrency; label: string; symbol: string; name: string }
> = {
  GHS: { code: 'GHS', label: 'GHS (Cedis)', symbol: 'GHS', name: 'Ghanaian Cedi' },
  USD: { code: 'USD', label: 'USD (Dollars)', symbol: 'USD', name: 'US Dollar' },
  EUR: { code: 'EUR', label: 'EUR (Euros)', symbol: 'EUR', name: 'Euro' },
  GBP: { code: 'GBP', label: 'GBP (Pounds)', symbol: 'GBP', name: 'British Pound' },
}

export function isSupportedCurrency(value: unknown): value is SupportedCurrency {
  return typeof value === 'string' && (SUPPORTED_CURRENCIES as readonly string[]).includes(value.toUpperCase())
}

export function normalizeCurrency(value: unknown, fallback: SupportedCurrency = DEFAULT_CURRENCY): SupportedCurrency {
  if (typeof value !== 'string') return fallback
  const upper = value.trim().toUpperCase()
  return isSupportedCurrency(upper) ? upper : fallback
}

/** Convert major-unit amount to Paystack minor units (always ×100 for our currencies). */
export function toMinorUnits(amount: number, currency: SupportedCurrency = DEFAULT_CURRENCY): number {
  void currency // reserved for future zero-decimal currencies
  if (!Number.isFinite(amount)) return 0
  return Math.round(amount * 100)
}

export function fromMinorUnits(amountMinor: number): number {
  if (!Number.isFinite(amountMinor)) return 0
  return amountMinor / 100
}

/**
 * Format a package price for display, e.g. "USD 1,250" or "GHS 5,000".
 * Uses a stable "CODE amount" pattern so it works consistently SSR/client.
 */
export function formatMoney(
  amount: number,
  currency: string | null | undefined = DEFAULT_CURRENCY,
  options?: { contactFallback?: string }
): string {
  const code = normalizeCurrency(currency)
  const contactFallback = options?.contactFallback ?? 'Contact Us'

  if (!Number.isFinite(amount) || amount <= 0) {
    return contactFallback
  }

  return `${code} ${amount.toLocaleString()}`
}

/** Short symbol-style label used in compact UI (same as code for clarity with Paystack). */
export function currencySymbol(currency: string | null | undefined): string {
  return normalizeCurrency(currency)
}

/** Mobile money on Paystack is effectively local (GHS for Ghana businesses). */
export function supportsMobileMoney(currency: string | null | undefined): boolean {
  return normalizeCurrency(currency) === 'GHS'
}
