export interface SocialLinkInput {
  id?: string
  platform?: string
  url: string
}

const PLATFORM_RULES: Array<{ platform: string; hosts: string[] }> = [
  { platform: 'Facebook', hosts: ['facebook.com', 'fb.com'] },
  { platform: 'Instagram', hosts: ['instagram.com'] },
  { platform: 'LinkedIn', hosts: ['linkedin.com'] },
  { platform: 'YouTube', hosts: ['youtube.com', 'youtu.be'] },
  { platform: 'X', hosts: ['x.com', 'twitter.com'] },
  { platform: 'TikTok', hosts: ['tiktok.com'] },
  { platform: 'WhatsApp', hosts: ['wa.me', 'whatsapp.com'] },
  { platform: 'Telegram', hosts: ['t.me', 'telegram.me', 'telegram.org'] },
]

export function normalizeSocialUrl(rawUrl: string): string {
  const value = rawUrl.trim()
  if (!value) return ''
  if (/^https?:\/\//i.test(value)) return value
  return `https://${value}`
}

export function detectSocialPlatform(url: string): string {
  const normalized = normalizeSocialUrl(url)
  if (!normalized) return 'Website'

  try {
    const hostname = new URL(normalized).hostname.replace(/^www\./i, '').toLowerCase()
    const rule = PLATFORM_RULES.find((entry) =>
      entry.hosts.some((host) => hostname === host || hostname.endsWith(`.${host}`))
    )
    return rule?.platform || 'Website'
  } catch {
    return 'Website'
  }
}

export function normalizeSocialLink(link: SocialLinkInput): { id?: string; platform: string; url: string } {
  const url = normalizeSocialUrl(link.url)
  return {
    ...(link.id ? { id: link.id } : {}),
    platform: detectSocialPlatform(url),
    url,
  }
}

