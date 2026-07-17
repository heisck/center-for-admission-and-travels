'use client'

/**
 * Framer Moveable Thumbnails
 * Source: UI Layouts (ui-layouts.com) / 21st.dev
 *
 * Draggable carousel + animated thumbnail filmstrip.
 * Active slide shows title (country) + description, center-aligned below the image.
 */

import {
  animate,
  motion,
  useMotionTemplate,
  useMotionValue,
  useSpring,
} from 'motion/react'
import React, { useEffect, useRef, useState } from 'react'

export type FramerThumbnailItem = {
  id: string | number
  url: string
  /** Country / destination name */
  title: string
  /** Optional body copy under the title */
  description?: string
}

/** Demo images (used only if no items prop is passed) */
export const defaultFramerMoveableItems: FramerThumbnailItem[] = [
  {
    id: 1,
    url: '/united-kingdom-big-ben-london-university.jpg',
    title: 'United Kingdom',
    description: 'World-class universities and vibrant cities for study and career growth.',
  },
  {
    id: 2,
    url: '/canada-niagara-falls-toronto-city.jpg',
    title: 'Canada',
    description: 'Quality education, welcoming communities, and strong pathways for students.',
  },
  {
    id: 3,
    url: '/statue-of-liberty-nyc.png',
    title: 'United States',
    description: 'Diverse campuses and global opportunities across leading institutions.',
  },
  {
    id: 4,
    url: '/europe-paris-eiffel-tower-landmarks.jpg',
    title: 'Europe',
    description: 'Historic cities, culture, and international programmes across the continent.',
  },
  {
    id: 5,
    url: '/dubai-burj-khalifa-city-skyline.jpg',
    title: 'Dubai / UAE',
    description: 'Modern skyline, business hubs, and popular travel packages from Ghana.',
  },
  {
    id: 6,
    url: '/asia-tropical-beaches-thailand-temples.jpg',
    title: 'Asia',
    description: 'Beaches, culture, and growing education destinations across the region.',
  },
  {
    id: 7,
    url: '/germany.jpg',
    title: 'Germany',
    description: 'Strong academic programmes and engineering excellence in the heart of Europe.',
  },
  {
    id: 8,
    url: '/austrailia.png',
    title: 'Australia',
    description: 'High-quality universities and a dynamic lifestyle for international students.',
  },
  {
    id: 9,
    url: '/netherlands.jpg',
    title: 'Netherlands',
    description: 'English-taught degrees and innovative cities ideal for global learners.',
  },
]

export const items = defaultFramerMoveableItems

const FULL_ASPECT_RATIO = 16 / 9
const COLLAPSED_ASPECT_RATIO = 1 / 3
const MARGIN = 2
const GAP = 2

export type FramerMoveableThumbnailsProps = {
  items?: FramerThumbnailItem[]
  /** Main slide height classes. Default tuned for destination cards. */
  heightClassName?: string
  className?: string
  /** Show title + description under the main image (default true) */
  showCaption?: boolean
}

function FramerMoveableThumbnails({
  items: itemsProp,
  heightClassName = 'h-[280px] sm:h-[360px] md:h-[420px]',
  className = '',
  showCaption = true,
}: FramerMoveableThumbnailsProps) {
  const gallery = itemsProp?.length ? itemsProp : defaultFramerMoveableItems
  const [index, setIndex] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const containerRef = useRef<HTMLDivElement | null>(null)
  const x = useMotionValue(0)

  useEffect(() => {
    setIndex((i) => Math.min(i, Math.max(0, gallery.length - 1)))
  }, [gallery.length])

  useEffect(() => {
    if (!isDragging && containerRef.current) {
      const containerWidth = containerRef.current.offsetWidth || 1
      const targetX = -index * containerWidth
      animate(x, targetX, {
        type: 'spring',
        stiffness: 300,
        damping: 30,
      })
    }
  }, [index, x, isDragging])

  if (gallery.length === 0) return null

  const active = gallery[index] ?? gallery[0]

  return (
    <div className={`w-full ${className}`.trim()}>
      <div className="flex flex-col gap-4">
        {/* Main carousel */}
        <div className="relative overflow-hidden rounded-2xl shadow-lg" ref={containerRef}>
          <motion.div
            className="flex"
            drag="x"
            dragElastic={0.2}
            dragMomentum={false}
            onDragStart={() => setIsDragging(true)}
            onDragEnd={(_e, info) => {
              setIsDragging(false)
              const containerWidth = containerRef.current?.offsetWidth || 1
              const offset = info.offset.x
              const velocity = info.velocity.x

              let newIndex = index
              if (Math.abs(velocity) > 500) {
                newIndex = velocity > 0 ? index - 1 : index + 1
              } else if (Math.abs(offset) > containerWidth * 0.3) {
                newIndex = offset > 0 ? index - 1 : index + 1
              }

              newIndex = Math.max(0, Math.min(gallery.length - 1, newIndex))
              setIndex(newIndex)
            }}
            style={{ x }}
          >
            {gallery.map((item) => (
              <div key={item.id} className={`shrink-0 w-full ${heightClassName}`}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.url || '/placeholder.jpg'}
                  alt={item.title}
                  className="w-full h-full object-cover select-none pointer-events-none"
                  draggable={false}
                />
              </div>
            ))}
          </motion.div>

          <motion.button
            type="button"
            disabled={index === 0}
            aria-label="Previous destination"
            onClick={() => setIndex((i) => Math.max(0, i - 1))}
            className={`absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center shadow-lg transition-transform z-10
              ${
                index === 0
                  ? 'opacity-40 cursor-not-allowed bg-white'
                  : 'bg-white hover:scale-110 hover:opacity-100 opacity-80'
              }`}
          >
            <svg className="w-6 h-6 text-slate-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </motion.button>

          <motion.button
            type="button"
            disabled={index === gallery.length - 1}
            aria-label="Next destination"
            onClick={() => setIndex((i) => Math.min(gallery.length - 1, i + 1))}
            className={`absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center shadow-lg transition-transform z-10
              ${
                index === gallery.length - 1
                  ? 'opacity-40 cursor-not-allowed bg-white'
                  : 'bg-white hover:scale-110 hover:opacity-100 opacity-80'
              }`}
          >
            <svg className="w-6 h-6 text-slate-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </motion.button>
        </div>

        {/* Country name + description — center aligned under the image */}
        {showCaption ? (
          <div className="text-center px-4 sm:px-8 max-w-2xl mx-auto min-h-[5.5rem]">
            <motion.h3
              key={`title-${active.id}`}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
              className="text-2xl sm:text-3xl font-bold text-foreground"
            >
              {active.title}
            </motion.h3>
            {active.description ? (
              <motion.p
                key={`desc-${active.id}`}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.28, delay: 0.05 }}
                className="mt-2 text-sm sm:text-base text-muted-foreground leading-relaxed"
              >
                {active.description}
              </motion.p>
            ) : null}
          </div>
        ) : null}

        <Thumbnails items={gallery} index={index} setIndex={setIndex} />
      </div>
    </div>
  )
}

function Thumbnails({
  items: gallery,
  index,
  setIndex,
}: {
  items: FramerThumbnailItem[]
  index: number
  setIndex: React.Dispatch<React.SetStateAction<number>>
}) {
  const x = index * 100 * (COLLAPSED_ASPECT_RATIO / FULL_ASPECT_RATIO) + MARGIN + index * GAP
  const xSpring = useSpring(x, { bounce: 0 })
  const xPercentage = useMotionTemplate`-${xSpring}%`

  useEffect(() => {
    xSpring.set(x)
  }, [x, xSpring])

  return (
    <div className="flex h-14 sm:h-16 justify-center overflow-hidden mt-1">
      <motion.div
        style={{
          aspectRatio: FULL_ASPECT_RATIO,
          gap: `${GAP}%`,
          x: xPercentage,
        }}
        className="flex min-w-0"
      >
        {gallery.map((item, i) => (
          <motion.button
            type="button"
            key={item.id}
            onClick={() => setIndex(i)}
            initial={false}
            animate={i === index ? 'active' : 'inactive'}
            variants={{
              active: {
                aspectRatio: FULL_ASPECT_RATIO,
                marginLeft: `${MARGIN}%`,
                marginRight: `${MARGIN}%`,
              },
              inactive: {
                aspectRatio: COLLAPSED_ASPECT_RATIO,
                marginLeft: 0,
                marginRight: 0,
              },
            }}
            className="h-full shrink-0 overflow-hidden rounded-md ring-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
            aria-label={`Show ${item.title}`}
            aria-current={i === index ? 'true' : undefined}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={item.url || '/placeholder.jpg'}
              alt={item.title}
              className="h-full w-full object-cover pointer-events-none select-none"
            />
          </motion.button>
        ))}
      </motion.div>
    </div>
  )
}

export default FramerMoveableThumbnails
