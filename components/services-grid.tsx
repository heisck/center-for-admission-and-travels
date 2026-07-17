import type { HomeServiceContent } from '@/lib/public-content'
import { RollingTextList, type RollingListItem } from '@/components/ui/rolling-list'

interface ServicesGridProps {
  services: HomeServiceContent[]
}

/**
 * Canonical slot media keyed by public route.
 * URLs come from DB `route` → `service.href` (see buildServiceHref).
 * Titles are free for admins to rename without changing links or images.
 */
const ROUTE_MEDIA: Record<string, { src: string; isDocLayout: boolean }> = {
  '/study-abroad': {
    src: '/images/services/study-abroad.jpg',
    isDocLayout: false,
  },
  '/work-abroad': {
    src: '/images/services/work-abroad.jpg',
    isDocLayout: false,
  },
  '/travel-tours': {
    src: '/images/services/travel-tours.jpg',
    isDocLayout: false,
  },
  '/global-network': {
    src: '/images/services/documentation.jpg',
    isDocLayout: true,
  },
}

/** Position fallbacks when href is missing or unknown (first 4 home slots). */
const INDEX_MEDIA = [
  { src: '/images/services/study-abroad.jpg', href: '/study-abroad', isDocLayout: false },
  { src: '/images/services/work-abroad.jpg', href: '/work-abroad', isDocLayout: false },
  { src: '/images/services/travel-tours.jpg', href: '/travel-tours', isDocLayout: false },
  { src: '/images/services/documentation.jpg', href: '/global-network', isDocLayout: true },
]

const FALLBACK_SRC = '/images/services/study-abroad.jpg'

function safeHref(href?: string | null, index = 0): string {
  const raw = (href || '').trim()
  if (raw.startsWith('/') && raw.length > 1 && !raw.includes('://')) {
    return raw
  }
  return INDEX_MEDIA[index]?.href || '/'
}

function resolveMedia(service: HomeServiceContent, index: number) {
  const slot = INDEX_MEDIA[index] || INDEX_MEDIA[INDEX_MEDIA.length - 1]
  const href = safeHref(service.href, index)
  const byRoute = ROUTE_MEDIA[href]
  // Prefer CMS service-page hero only when it looks like a real remote/admin asset.
  // Empty/broken/legacy junk never overrides static brand fallbacks in production.
  const rawCms = typeof service.image === 'string' ? service.image.trim() : ''
  const cmsImage =
    rawCms &&
    (rawCms.includes('cloudinary.com') ||
      rawCms.startsWith('https://') ||
      rawCms.startsWith('http://') ||
      rawCms.startsWith('/images/'))
      ? rawCms
      : ''

  return {
    src: cmsImage || byRoute?.src || slot.src || FALLBACK_SRC,
    href,
    // Doc stack layout: stable by route, soft match if admin kept "document" in title
    isDocLayout:
      byRoute?.isDocLayout === true ||
      slot.isDocLayout === true ||
      /document|visa|paperwork|passport/i.test(service.title || ''),
  }
}

/**
 * Split only documentation-style multi-word titles so the rolling row stays balanced:
 * - prefix (small) → first word
 * - main (large) → middle words
 * - suffix (small) → last word
 * Single-word renames just use the full title (no crash / empty faces).
 */
export function splitDocumentationTitle(title: string): {
  prefix: string
  main: string
  suffix: string
} | null {
  const cleaned = (title || '').replace(/\s+/g, ' ').trim()
  if (!cleaned) return null

  const words = cleaned.split(' ').filter(Boolean)
  if (words.length === 1) {
    return { prefix: '', main: words[0], suffix: '' }
  }
  if (words.length === 2) {
    return { prefix: '', main: words[0], suffix: words[1] }
  }

  return {
    prefix: words[0],
    main: words.slice(1, -1).join(' ') || words[0],
    suffix: words[words.length - 1],
  }
}

/** Prefer unique images per row; never leave duplicates if avoidable. */
function assignUniqueImages(
  items: Array<{ mediaSrc: string; index: number }>
): string[] {
  const used = new Set<string>()
  const pool = INDEX_MEDIA.map((m) => m.src)
  return items.map(({ mediaSrc, index }) => {
    if (mediaSrc && !used.has(mediaSrc)) {
      used.add(mediaSrc)
      return mediaSrc
    }
    const free = pool.find((src) => !used.has(src)) || INDEX_MEDIA[index % 4]?.src || FALLBACK_SRC
    used.add(free)
    return free
  })
}

function displayTitle(title?: string | null): string {
  const t = (title || '').replace(/\s+/g, ' ').trim()
  return t || 'Service'
}

export default function ServicesGrid({ services }: ServicesGridProps) {
  // Keep slots even if title is temporarily empty so admin renames don't drop the row/URL.
  const cards = (services || []).filter((s) => s && (s.id || s.title || s.href))
  if (cards.length === 0) return null

  const resolved = cards.map((service, idx) => {
    const media = resolveMedia(service, idx)
    const title = displayTitle(service.title)
    const docParts = media.isDocLayout ? splitDocumentationTitle(title) : null
    return {
      service,
      idx,
      media,
      docParts,
      title,
      mediaSrc: media.src,
    }
  })

  const uniqueSrcs = assignUniqueImages(
    resolved.map((r) => ({ mediaSrc: r.mediaSrc, index: r.idx }))
  )

  const items: RollingListItem[] = resolved.map((r, i) => {
    const alt =
      (r.service.description || '').replace(/\s+/g, ' ').trim() || r.title

    if (r.docParts) {
      return {
        id: r.service.id || `service-${r.idx}`,
        title: r.docParts.main || r.title,
        prefix: r.docParts.prefix || undefined,
        suffix: r.docParts.suffix || undefined,
        src: uniqueSrcs[i] || FALLBACK_SRC,
        alt,
        href: r.media.href,
        color: 'orange' as const,
      }
    }

    return {
      id: r.service.id || `service-${r.idx}`,
      title: r.title,
      prefix: undefined,
      suffix: undefined,
      src: uniqueSrcs[i] || FALLBACK_SRC,
      alt,
      href: r.media.href,
      color: 'orange' as const,
    }
  })

  return (
    <section id="services" className="py-12 md:py-24 bg-transparent">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10 md:mb-14">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="text-foreground">Our </span>
            <span className="bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
              Services
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Comprehensive solutions for your international journey
          </p>
        </div>

        <RollingTextList items={items} heading="" className="max-w-4xl py-0" />

        <p className="mt-10 text-center text-sm text-muted-foreground">
          Hover a service, then click to learn more.
        </p>
      </div>
    </section>
  )
}
