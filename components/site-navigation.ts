export interface SiteNavLink {
  href: string
  label: string
  mobileLabel: string
}

export const NAV_LINKS: SiteNavLink[] = [
  { href: '/', label: 'Home', mobileLabel: 'Home' },
  { href: '/about', label: 'About', mobileLabel: 'About' },
  { href: '/packages', label: 'Packages', mobileLabel: 'Packages' },
  { href: '/study-abroad', label: 'Study', mobileLabel: 'Study Abroad' },
  { href: '/work-abroad', label: 'Work', mobileLabel: 'Work Abroad' },
  { href: '/travel-tours', label: 'Travel', mobileLabel: 'Travel & Tours' },
  { href: '/global-network', label: 'Network', mobileLabel: 'Global Network' },
  { href: '/blog', label: 'Blog', mobileLabel: 'Blog' },
  { href: '/newsletter', label: 'Newsletter', mobileLabel: 'Newsletter' },
  { href: '/contact', label: 'Contact', mobileLabel: 'Contact' },
]
