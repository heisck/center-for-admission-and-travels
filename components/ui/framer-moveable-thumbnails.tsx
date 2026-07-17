'use client'

/**
 * Framer Moveable Thumbnails
 * Source: UI Layouts (ui-layouts.com) / 21st.dev
 * https://ui-layouts.com/components/framer-carousel
 * https://21st.dev/@uilayout.contact/components/framer-moveable-thumbnails
 *
 * A draggable image carousel with an animated filmstrip of thumbnails
 * where the active thumbnail expands to a wide aspect ratio.
 *
 * Dependency: `motion` (already in this project)
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
  title: string
}

/** Demo images from the original UI Layouts component */
export const defaultFramerMoveableItems: FramerThumbnailItem[] = [
  {
    id: 1,
    url: 'https://images.unsplash.com/photo-1761882835101-02ab45ac0726?ixlib=rb-4.1.0&auto=format&fit=crop&q=80&w=690',
    title: 'MAXX PHAM',
  },
  {
    id: 2,
    url: 'https://images.unsplash.com/photo-1661980494567-40a5e01b699b?ixlib=rb-4.1.0&auto=format&fit=crop&q=80&w=685',
    title: 'BOXIEN BAY',
  },
  {
    id: 3,
    url: 'https://images.unsplash.com/photo-1761882725885-d3d8bd2032d1?ixlib=rb-4.1.0&auto=format&fit=crop&q=80&w=687',
    title: 'AUSIZE MAM',
  },
  {
    id: 4,
    url: 'https://images.unsplash.com/photo-1761775915848-467e41c1c4db?ixlib=rb-4.1.0&auto=format&fit=crop&q=80&w=689',
    title: 'RECLKTIKA',
  },
  {
    id: 5,
    url: 'https://images.unsplash.com/photo-1761078980679-e89e25fe279b?ixlib=rb-4.1.0&auto=format&fit=crop&q=80&w=687',
    title: 'SONYPOO',
  },
  {
    id: 6,
    url: 'https://images.unsplash.com/photo-1760389005000-bf02bf24f463?ixlib=rb-4.1.0&auto=format&fit=crop&q=80&w=1123',
    title: 'DONM FLY',
  },
  {
    id: 7,
    url: 'https://images.unsplash.com/photo-1761165307495-56bd564d322f?ixlib=rb-4.1.0&auto=format&fit=crop&q=80&w=663',
    title: 'Snowy Mountain Highway',
  },
  {
    id: 8,
    url: 'https://images.unsplash.com/photo-1756299792672-157811bf1005?ixlib=rb-4.1.0&auto=format&fit=crop&q=80&w=1074',
    title: 'FOGGY FOLS',
  },
  {
    id: 9,
    url: 'https://images.unsplash.com/photo-1572851899646-a1f69c664e1e?ixlib=rb-4.1.0&auto=format&fit=crop&q=80&w=1170',
    title: 'DIM DARKO',
  },
  {
    id: 10,
    url: 'https://images.unsplash.com/photo-1759247178379-0e8eba83a4a6?ixlib=rb-4.1.0&auto=format&fit=crop&q=80&w=687',
    title: 'BEALIVE',
  },
  {
    id: 11,
    url: 'https://images.unsplash.com/photo-1754968230523-052635c98f99?ixlib=rb-4.1.0&auto=format&fit=crop&q=80&w=736',
    title: 'DOMEDOM ROME',
  },
  {
    id: 12,
    url: 'https://images.unsplash.com/photo-1643037508102-46fb319979c5?ixlib=rb-4.1.0&auto=format&fit=crop&q=80&w=764',
    title: 'IKEIMON POVE',
  },
]

// Back-compat with upstream export name
export const items = defaultFramerMoveableItems

const FULL_ASPECT_RATIO = 16 / 9
const COLLAPSED_ASPECT_RATIO = 1 / 3
const MARGIN = 2
const GAP = 2

export type FramerMoveableThumbnailsProps = {
  /** Gallery items. Defaults to demo Unsplash images from UI Layouts. */
  items?: FramerThumbnailItem[]
  /** Main slide height (Tailwind-friendly or raw CSS). Default: 400px */
  heightClassName?: string
  className?: string
}

function FramerMoveableThumbnails({
  items: itemsProp,
  heightClassName = 'h-[400px]',
  className = '',
}: FramerMoveableThumbnailsProps) {
  const gallery = itemsProp?.length ? itemsProp : defaultFramerMoveableItems
  const [index, setIndex] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const containerRef = useRef<HTMLDivElement | null>(null)
  const x = useMotionValue(0)

  // Keep index in range if items change
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

  return (
    <div className={`w-full lg:p-10 sm:p-4 p-2 ${className}`.trim()}>
      <div className="flex flex-col gap-3">
        <div className="relative overflow-hidden rounded-lg" ref={containerRef}>
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
                  src={item.url}
                  alt={item.title}
                  className="w-full h-full object-cover rounded-lg select-none pointer-events-none"
                  draggable={false}
                />
              </div>
            ))}
          </motion.div>

          <motion.button
            type="button"
            disabled={index === 0}
            aria-label="Previous image"
            onClick={() => setIndex((i) => Math.max(0, i - 1))}
            className={`absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center shadow-lg transition-transform z-10
              ${
                index === 0
                  ? 'opacity-40 cursor-not-allowed bg-white'
                  : 'bg-white hover:scale-110 hover:opacity-100 opacity-70'
              }`}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </motion.button>

          <motion.button
            type="button"
            disabled={index === gallery.length - 1}
            aria-label="Next image"
            onClick={() => setIndex((i) => Math.min(gallery.length - 1, i + 1))}
            className={`absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center shadow-lg transition-transform z-10
              ${
                index === gallery.length - 1
                  ? 'opacity-40 cursor-not-allowed bg-white'
                  : 'bg-white hover:scale-110 hover:opacity-100 opacity-70'
              }`}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </motion.button>
        </div>

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
    <div className="flex h-16 justify-center overflow-hidden">
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
            className="h-full shrink-0"
            aria-label={`Show ${item.title}`}
            aria-current={i === index ? 'true' : undefined}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={item.url}
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
