"use client"

import dynamic from "next/dynamic"
import { useEffect, useMemo, useRef, useState } from "react"

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

function MasonryPlaceholder() {
  return <div className="h-full w-full" aria-hidden />
}

export default function HeroMasonryPanel({ items }: { items: MasonryItem[] }) {
  const [shouldAnimate, setShouldAnimate] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  const panelRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const element = panelRef.current
    if (!element) {
      setIsVisible(true)
      return
    }

    if (typeof window === "undefined" || !("IntersectionObserver" in window)) {
      setIsVisible(true)
      return
    }

    const observer = new window.IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setIsVisible(true)
          observer.disconnect()
        }
      },
      { rootMargin: "200px" }
    )

    observer.observe(element)

    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!isVisible || shouldAnimate) return

    let timeoutId: number | null = null
    let rafId: number | null = null

    rafId = window.requestAnimationFrame(() => {
      timeoutId = window.setTimeout(() => setShouldAnimate(true), 120)
    })

    return () => {
      if (rafId !== null) {
        window.cancelAnimationFrame(rafId)
      }
      if (timeoutId !== null) {
        window.clearTimeout(timeoutId)
      }
    }
  }, [isVisible, shouldAnimate])

  const prefersReducedHover = useMemo(() => {
    if (typeof window === "undefined") return false
    return window.matchMedia("(pointer: coarse)").matches
  }, [])

  if (!shouldAnimate) {
    return (
      <div ref={panelRef} className="h-full w-full">
        <MasonryPlaceholder />
      </div>
    )
  }

  return (
    <div ref={panelRef} className="h-full w-full">
      <Masonry
        items={items}
        ease="power3.out"
        duration={0.6}
        stagger={0.05}
        animateFrom="bottom"
        scaleOnHover={!prefersReducedHover}
        hoverScale={0.96}
        colorShiftOnHover={!prefersReducedHover}
      />
    </div>
  )
}
