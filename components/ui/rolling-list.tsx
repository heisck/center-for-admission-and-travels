'use client'

/**
 * Rolling Text List
 * Source: 21st.dev — Rolling List
 * Extended: prefix (top-right) + main rolling title + suffix (bottom-right)
 */

import Link from 'next/link'
import { cn } from '@/lib/utils'

export type RollingListItem = {
  id: string | number
  /** Main rolling title (black) — e.g. "Documentation", "Abroad" */
  title: string
  /** Small orange label, top-right — e.g. "Travel", "Study" */
  prefix?: string
  /** Small orange label, bottom-right — e.g. "Services" */
  suffix?: string
  /** Optional legacy short label (ignored if prefix is set) */
  category?: string
  src: string
  alt?: string
  href?: string
  color?: 'blue' | 'orange' | 'red' | 'green' | 'neutral'
}

const colorClass: Record<NonNullable<RollingListItem['color']>, string> = {
  blue: 'text-blue-500',
  orange: 'text-orange-600',
  red: 'text-red-600',
  green: 'text-green-500',
  neutral: 'text-neutral-500',
}

const DEFAULT_ITEMS: RollingListItem[] = [
  {
    id: 1,
    title: 'Discover',
    category: 'Research',
    src: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&auto=format&fit=crop&q=60',
    alt: 'Team discovering insights',
    color: 'blue',
  },
  {
    id: 2,
    title: 'Design',
    category: 'Experience',
    src: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=400&auto=format&fit=crop&q=60',
    alt: 'Design collaboration',
    color: 'blue',
  },
  {
    id: 3,
    title: 'Develop',
    category: 'Engineering',
    src: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&auto=format&fit=crop&q=60',
    alt: 'Developers coding',
    color: 'blue',
  },
  {
    id: 4,
    title: 'Deploy',
    category: 'Launch',
    src: 'https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?w=400&auto=format&fit=crop&q=60',
    alt: 'Product launch',
    color: 'blue',
  },
]

function TitleBlock({
  prefix,
  title,
  suffix,
  variant,
  accentClass,
}: {
  prefix?: string
  title: string
  suffix?: string
  variant: 'idle' | 'hover'
  accentClass: string
}) {
  const isHover = variant === 'hover'
  const labelClass = cn(
    'block max-w-full text-left text-[10px] sm:text-xs font-bold uppercase tracking-widest leading-none truncate',
    isHover ? accentClass : 'text-neutral-900 dark:text-white'
  )
  const titleClass = cn(
    'block max-w-full text-left text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black uppercase tracking-tighter leading-none break-words line-clamp-2',
    isHover ? cn(accentClass, 'italic') : 'text-neutral-900 dark:text-white'
  )

  return (
    <div className="flex h-full min-w-0 flex-col justify-center gap-1.5 sm:gap-2">
      {prefix ? <span className={labelClass}>{prefix}</span> : null}
      <span className={titleClass}>{title}</span>
      {suffix ? <span className={labelClass}>{suffix}</span> : null}
    </div>
  )
}

function safeItemTitle(title?: string | null): string {
  const t = (title || '').replace(/\s+/g, ' ').trim()
  return t || 'Service'
}

function safeItemSrc(src?: string | null): string {
  const s = (src || '').trim()
  if (!s) return '/images/services/study-abroad.jpg'
  // Block javascript: etc. Keep relative paths and https images.
  if (s.startsWith('/') || s.startsWith('https://') || s.startsWith('http://')) return s
  return '/images/services/study-abroad.jpg'
}

function safeItemHref(href?: string | null): string | undefined {
  const h = (href || '').trim()
  if (!h) return undefined
  // Only internal paths — never broken external/malformed admin values
  if (h.startsWith('/') && !h.startsWith('//') && !h.includes('://')) return h
  return undefined
}

export function RollingTextItem({ item }: { item: RollingListItem }) {
  const hoverColor = colorClass[item.color || 'orange']
  const title = safeItemTitle(item.title)
  const prefix = item.prefix?.trim() || undefined
  const suffix = item.suffix?.trim() || undefined
  const category = item.category?.trim() || undefined
  const src = safeItemSrc(item.src)
  const href = safeItemHref(item.href)
  const hasStack = Boolean(prefix || suffix)

  // One shared panel height so idle + hover faces align and spacing stays even
  const panelHeight = hasStack
    ? 'h-[5.75rem] sm:h-[6.5rem] md:h-[7.25rem]'
    : 'h-[60px] md:h-20'

  const content = (
    <>
      {/* Optional legacy category (right) when no prefix/suffix stack */}
      {!hasStack && category ? (
        <span className="absolute top-1/2 right-0 z-10 max-w-[42%] -translate-y-1/2 text-right text-[10px] sm:text-xs font-bold uppercase tracking-widest text-neutral-400 transition-opacity duration-300 group-hover:opacity-0 hidden sm:block line-clamp-2">
          {category}
        </span>
      ) : null}

      {/* Entire left stack rolls together: prefix + title + suffix */}
      <div
        className={cn(
          'relative min-w-0 overflow-hidden',
          panelHeight,
          !hasStack && 'pr-16 sm:pr-24'
        )}
      >
        <div className="transition-transform duration-500 ease-[cubic-bezier(0.76,0,0.24,1)] group-hover:-translate-y-1/2">
          <div className={cn(panelHeight)}>
            <TitleBlock
              prefix={prefix}
              title={title}
              suffix={suffix}
              variant="idle"
              accentClass={hoverColor}
            />
          </div>
          <div className={cn(panelHeight)}>
            <TitleBlock
              prefix={prefix}
              title={title}
              suffix={suffix}
              variant="hover"
              accentClass={hoverColor}
            />
          </div>
        </div>
      </div>

      {/* Hover image preview */}
      <div
        className={cn(
          'pointer-events-none absolute top-1/2 right-0 sm:right-2 z-20 h-28 w-40 sm:h-32 sm:w-48 -translate-y-1/2 overflow-hidden rounded-lg shadow-2xl',
          'transition-all duration-500 ease-out',
          'translate-x-4 scale-95 rotate-3 opacity-0',
          'group-hover:translate-x-0 group-hover:scale-100 group-hover:rotate-0 group-hover:opacity-100'
        )}
      >
        <div className="relative h-full w-full bg-orange-50">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={src}
            alt={item.alt || title}
            className="absolute inset-0 h-full w-full object-cover transition-all duration-500 ease-out"
          />
          <div className="absolute inset-0 bg-orange-600/10 mix-blend-overlay" />
        </div>
      </div>
    </>
  )

  const className =
    'group relative w-full min-w-0 cursor-pointer border-b border-neutral-200 py-5 sm:py-6 dark:border-neutral-800 block'

  if (href) {
    return (
      <Link href={href} className={className}>
        {content}
      </Link>
    )
  }

  return <div className={className}>{content}</div>
}

export type RollingTextListProps = {
  items?: RollingListItem[]
  heading?: string
  className?: string
}

export function RollingTextList({
  items = DEFAULT_ITEMS,
  heading = 'Process',
  className,
}: RollingTextListProps) {
  const list = (items?.length ? items : DEFAULT_ITEMS).filter(Boolean).map((item, index) => ({
    ...item,
    id: item.id ?? `rolling-${index}`,
    title: safeItemTitle(item.title),
    src: safeItemSrc(item.src),
    href: safeItemHref(item.href),
  }))

  return (
    <div
      className={cn(
        'mx-auto flex w-full max-w-3xl flex-col items-center justify-center px-4 py-4',
        className
      )}
    >
      {heading ? (
        <h3 className="mb-8 text-sm font-bold uppercase tracking-widest text-neutral-500">
          {heading}
        </h3>
      ) : null}
      <div className="flex w-full min-w-0 flex-col">
        {list.map((item) => (
          <RollingTextItem key={item.id} item={item} />
        ))}
      </div>
    </div>
  )
}

export default RollingTextList
