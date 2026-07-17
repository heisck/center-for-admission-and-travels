export interface SocialLinkInput {
  id?: string
  platform?: string
  url: string
}

/** Canonical platform keys used for icon lookup (lowercase). */
export type SocialPlatformKey =
  | 'facebook'
  | 'instagram'
  | 'linkedin'
  | 'youtube'
  | 'x'
  | 'twitter'
  | 'tiktok'
  | 'whatsapp'
  | 'telegram'
  | 'website'

const PLATFORM_RULES: Array<{ key: SocialPlatformKey; label: string; hosts: string[] }> = [
  { key: 'facebook', label: 'Facebook', hosts: ['facebook.com', 'fb.com', 'fb.me', 'm.facebook.com'] },
  { key: 'instagram', label: 'Instagram', hosts: ['instagram.com'] },
  { key: 'linkedin', label: 'LinkedIn', hosts: ['linkedin.com'] },
  { key: 'youtube', label: 'YouTube', hosts: ['youtube.com', 'youtu.be'] },
  { key: 'x', label: 'X', hosts: ['x.com', 'twitter.com'] },
  { key: 'tiktok', label: 'TikTok', hosts: ['tiktok.com'] },
  { key: 'whatsapp', label: 'WhatsApp', hosts: ['wa.me', 'whatsapp.com', 'api.whatsapp.com'] },
  { key: 'telegram', label: 'Telegram', hosts: ['t.me', 'telegram.me', 'telegram.org'] },
]

/** Map admin-entered platform labels / aliases → icon keys */
const PLATFORM_ALIASES: Record<string, SocialPlatformKey> = {
  facebook: 'facebook',
  fb: 'facebook',
  'face book': 'facebook',
  'facebook page': 'facebook',
  meta: 'facebook',
  instagram: 'instagram',
  ig: 'instagram',
  insta: 'instagram',
  linkedin: 'linkedin',
  linked: 'linkedin',
  'linked in': 'linkedin',
  youtube: 'youtube',
  yt: 'youtube',
  youtu: 'youtube',
  x: 'x',
  twitter: 'twitter',
  tweet: 'twitter',
  tiktok: 'tiktok',
  tt: 'tiktok',
  whatsapp: 'whatsapp',
  wa: 'whatsapp',
  telegram: 'telegram',
  tg: 'telegram',
  website: 'website',
  web: 'website',
  site: 'website',
  other: 'website',
}

export function normalizeSocialUrl(rawUrl: string): string {
  let value = String(rawUrl || '').trim()
  if (!value) return ''

  // Fix common admin mistakes: "https://https://facebook.com/..." or "http://https://..."
  value = value.replace(/^(https?:\/\/)+/i, (match) => {
    // Keep a single scheme (prefer https if any https appeared)
    return /https/i.test(match) ? 'https://' : 'http://'
  })

  if (/^https?:\/\//i.test(value)) return value
  // bare "facebook.com/page" or "www.facebook.com/..."
  return `https://${value.replace(/^\/\//, '')}`
}

function hostnameFromUrl(url: string): string | null {
  try {
    return new URL(url).hostname.replace(/^www\./i, '').toLowerCase()
  } catch {
    return null
  }
}

export function detectSocialPlatformKey(url: string): SocialPlatformKey {
  const normalized = normalizeSocialUrl(url)
  if (!normalized) return 'website'

  const hostname = hostnameFromUrl(normalized)
  if (!hostname) {
    // Fallback: string contains platform name
    const lower = normalized.toLowerCase()
    if (lower.includes('facebook') || lower.includes('fb.com') || lower.includes('fb.me')) return 'facebook'
    if (lower.includes('instagram')) return 'instagram'
    if (lower.includes('linkedin')) return 'linkedin'
    if (lower.includes('youtube') || lower.includes('youtu.be')) return 'youtube'
    if (lower.includes('twitter') || /(^|\/\/)(www\.)?x\.com\b/.test(lower)) return 'x'
    if (lower.includes('tiktok')) return 'tiktok'
    if (lower.includes('whatsapp') || lower.includes('wa.me')) return 'whatsapp'
    if (lower.includes('telegram') || lower.includes('t.me')) return 'telegram'
    return 'website'
  }

  const rule = PLATFORM_RULES.find((entry) =>
    entry.hosts.some((host) => hostname === host || hostname.endsWith(`.${host}`))
  )
  return rule?.key || 'website'
}

/** Human-readable label (Facebook, Instagram, …) */
export function detectSocialPlatform(url: string): string {
  const key = detectSocialPlatformKey(url)
  const rule = PLATFORM_RULES.find((r) => r.key === key)
  if (rule) return rule.label
  if (key === 'twitter') return 'X'
  return 'Website'
}

/**
 * Resolve icon/platform key from stored platform label AND/OR URL.
 * Prefer a known stored platform (admin may label "Facebook") even if URL is odd;
 * otherwise detect from URL.
 */
export function resolveSocialPlatformKey(
  platform?: string | null,
  url?: string | null
): SocialPlatformKey {
  const raw = String(platform || '')
    .trim()
    .toLowerCase()
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')

  if (raw && PLATFORM_ALIASES[raw]) {
    return PLATFORM_ALIASES[raw]
  }

  // Partial match: "facebook page", "our facebook", etc.
  if (raw) {
    for (const [alias, key] of Object.entries(PLATFORM_ALIASES)) {
      if (alias.length >= 2 && (raw.includes(alias) || alias.includes(raw))) {
        if (key !== 'website') return key
      }
    }
  }

  if (url) {
    return detectSocialPlatformKey(url)
  }

  return 'website'
}

export function socialPlatformLabel(key: SocialPlatformKey): string {
  if (key === 'twitter' || key === 'x') return 'X'
  const rule = PLATFORM_RULES.find((r) => r.key === key)
  return rule?.label || 'Website'
}

export function normalizeSocialLink(link: SocialLinkInput): {
  id?: string
  platform: string
  url: string
} {
  const url = normalizeSocialUrl(link.url)
  const key = resolveSocialPlatformKey(link.platform, url)
  return {
    ...(link.id ? { id: link.id } : {}),
    platform: socialPlatformLabel(key),
    url,
  }
}
