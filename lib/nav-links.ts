import 'server-only'

import { prisma } from '@/lib/prisma'
import { NAV_LINKS, type SiteNavLink } from '@/components/site-navigation'

// First-N home service cards map by position to the four canonical service
// routes. Used when admin has renamed a card before the `route` column existed,
// so its explicit route is still null.
const POSITION_FALLBACK_ROUTES = [
  '/study-abroad',
  '/work-abroad',
  '/travel-tours',
  '/global-network',
]

export async function getNavLinks(): Promise<SiteNavLink[]> {
  try {
    const services = (await prisma.homeService.findMany({
      where: { homePageId: 'home' },
      orderBy: { order: 'asc' },
    })) as Array<{ route: string | null; title: string }>
    const overrides = new Map<string, string>()
    for (let i = 0; i < services.length; i++) {
      const svc = services[i]
      if (!svc.title) continue
      const route = svc.route ?? POSITION_FALLBACK_ROUTES[i] ?? null
      if (route) overrides.set(route, svc.title)
    }
    if (overrides.size === 0) return NAV_LINKS

    // Show full service titles in the nav (no ellipsis / hard truncate).
    // Desktop has enough width; mobile menu can wrap/scroll as needed.
    return NAV_LINKS.map((link) => {
      const override = overrides.get(link.href)?.trim()
      if (!override) return link
      return {
        ...link,
        label: override,
        mobileLabel: override,
      }
    })
  } catch {
    return NAV_LINKS
  }
}
