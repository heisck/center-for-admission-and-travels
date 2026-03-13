"use client"

import dynamic from "next/dynamic"
import Image from "next/image"
import { useEffect, useMemo, useState } from "react"

type MasonryItem = {
  id: string
  img: string
  url: string
  height: number
}

const Masonry = dynamic(() => import("@/components/Masonry"), {
  ssr: false,
  loading: () => null,
})

function MasonryFallback({ items }: { items: MasonryItem[] }) {
  const previewItems = items.slice(0, 5)

  return (
    <div className="grid h-full grid-cols-3 gap-3 rounded-2xl overflow-hidden">
      {previewItems.map((item, index) => (
        <div
          key={item.id}
          className={`relative overflow-hidden rounded-2xl bg-slate-200 ${
            index === 0 ? "row-span-2" : ""
          } ${index === 3 ? "col-span-2" : ""}`}
        >
          <Image
            src={item.img}
            alt=""
            fill
            sizes="(max-width: 768px) 33vw, 20vw"
            className="object-cover"
            priority={index < 2}
          />
        </div>
      ))}
    </div>
  )
}

export default function HeroMasonryPanel({ items }: { items: MasonryItem[] }) {
  const [shouldAnimate, setShouldAnimate] = useState(false)

  useEffect(() => {
    const schedule =
      typeof window !== "undefined" && "requestIdleCallback" in window
        ? (window as Window & typeof globalThis & { requestIdleCallback: (cb: IdleRequestCallback, opts?: IdleRequestOptions) => number }).requestIdleCallback
        : null

    if (schedule) {
      const id = schedule(() => setShouldAnimate(true), { timeout: 900 })
      return () => window.cancelIdleCallback?.(id)
    }

    const timer = window.setTimeout(() => setShouldAnimate(true), 250)
    return () => window.clearTimeout(timer)
  }, [])

  const prefersReducedHover = useMemo(() => {
    if (typeof window === "undefined") return false
    return window.matchMedia("(pointer: coarse)").matches
  }, [])

  if (!shouldAnimate) {
    return <MasonryFallback items={items} />
  }

  return (
    <Masonry
      items={items}
      ease="power3.out"
      duration={0.6}
      stagger={0.05}
      animateFrom="bottom"
      scaleOnHover={!prefersReducedHover}
      hoverScale={0.96}
      blurToFocus
      colorShiftOnHover={!prefersReducedHover}
    />
  )
}
