"use client"

import dynamic from "next/dynamic"
import { useEffect, useMemo, useState } from "react"

type DomeImage = { src: string; alt?: string }

const DomeGallery = dynamic(() => import("./DomeGallery"), {
  ssr: false,
  loading: () => null,
})

function DomePlaceholder() {
  return <div className="h-full w-full" aria-hidden />
}


function getAdaptiveRadiusRange() {
  if (typeof window === "undefined") {
    return { minRadius: 260, maxRadius: 520, fit: 0.44 }
  }

  const width = window.innerWidth

  if (width < 480) {
    return { minRadius: 180, maxRadius: 300, fit: 0.34 }
  }

  if (width < 768) {
    return { minRadius: 220, maxRadius: 360, fit: 0.38 }
  }

  if (width < 1024) {
    return { minRadius: 260, maxRadius: 440, fit: 0.42 }
  }

  return { minRadius: 320, maxRadius: 560, fit: 0.5 }
}

function getAdaptiveSegments() {
  if (typeof window === "undefined") return 22

  const width = window.innerWidth
  const memory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 4
  const cores = navigator.hardwareConcurrency ?? 4

  let segments = 22

  if (width < 640) {
    segments = 12
  } else if (width < 1024) {
    segments = 16
  } else if (width < 1440) {
    segments = 20
  } else {
    segments = 24
  }

  if (memory <= 4 || cores <= 4) {
    segments = Math.max(10, segments - 4)
  }

  return segments
}

export default function TravelDomeGalleryPanel({ images }: { images: DomeImage[] }) {
  const [shouldAnimate, setShouldAnimate] = useState(false)
  const [segments, setSegments] = useState(22)
  const [radiusConfig, setRadiusConfig] = useState({ minRadius: 260, maxRadius: 520, fit: 0.44 })

  useEffect(() => {
    const syncResponsiveValues = () => {
      setSegments(getAdaptiveSegments())
      setRadiusConfig(getAdaptiveRadiusRange())
    }

    syncResponsiveValues()
    window.addEventListener("resize", syncResponsiveValues)

    const schedule =
      typeof window !== "undefined" && "requestIdleCallback" in window
        ? (window as Window & typeof globalThis & { requestIdleCallback: (cb: IdleRequestCallback, opts?: IdleRequestOptions) => number }).requestIdleCallback
        : null

    if (schedule) {
      const id = schedule(() => setShouldAnimate(true), { timeout: 900 })
      return () => {
        window.removeEventListener("resize", syncResponsiveValues)
        window.cancelIdleCallback?.(id)
      }
    }

    const timer = window.setTimeout(() => setShouldAnimate(true), 250)
    return () => {
      window.removeEventListener("resize", syncResponsiveValues)
      window.clearTimeout(timer)
    }
  }, [])

  const galleryImages = useMemo(() => {
    return images.filter((image) => image.src?.trim())
  }, [images])

  if (galleryImages.length === 0 || !shouldAnimate) {
    return <DomePlaceholder />
  }

  return (
    <DomeGallery
      images={galleryImages}
      segments={segments}
      fit={radiusConfig.fit}
      minRadius={radiusConfig.minRadius}
      maxRadius={radiusConfig.maxRadius}
      maxVerticalRotationDeg={4}
      dragSensitivity={24}
      dragDampening={0.78}
      enlargeTransitionMs={260}
      // Max box for enlarge — actual size is aspect-fitted inside the globe container
      openedImageWidth="100%"
      openedImageHeight="100%"
      autoRotate
      autoRotateSpeed={0.12}
    />
  )
}
