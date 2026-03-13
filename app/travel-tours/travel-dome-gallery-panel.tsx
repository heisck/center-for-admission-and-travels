"use client"

import dynamic from "next/dynamic"
import Image from "next/image"
import { useEffect, useMemo, useState } from "react"

type DomeImage = { src: string; alt?: string }

const DEFAULT_TRAVEL_IMAGES: DomeImage[] = [
  { src: "/dubai-burj-khalifa-city-skyline.jpg", alt: "Dubai skyline" },
  { src: "/europe-paris-eiffel-tower-landmarks.jpg", alt: "European landmarks" },
  { src: "/asia-tropical-beaches-thailand-temples.jpg", alt: "Asian travel destination" },
]

const DomeGallery = dynamic(() => import("./DomeGallery"), {
  ssr: false,
  loading: () => null,
})

function TravelDomeFallback({ images }: { images: DomeImage[] }) {
  const previewImages = images.slice(0, 4)

  return (
    <div className="grid h-full grid-cols-2 gap-3 rounded-2xl overflow-hidden">
      {previewImages.map((image, index) => (
        <div
          key={`${image.src}-${index}`}
          className={`relative overflow-hidden rounded-2xl bg-slate-200 ${
            index === 0 ? "row-span-2" : ""
          }`}
        >
          <Image
            src={image.src}
            alt={image.alt || ""}
            fill
            sizes="(max-width: 768px) 50vw, 25vw"
            className="object-cover"
            priority={index < 2}
          />
        </div>
      ))}
    </div>
  )
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

  useEffect(() => {
    setSegments(getAdaptiveSegments())

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

  const galleryImages = useMemo(() => {
    const validImages = images.filter((image) => image.src?.trim())
    return validImages.length > 0 ? validImages : DEFAULT_TRAVEL_IMAGES
  }, [images])

  if (!shouldAnimate) {
    return <TravelDomeFallback images={galleryImages} />
  }

  return (
    <DomeGallery
      images={galleryImages}
      segments={segments}
      maxVerticalRotationDeg={4}
      dragSensitivity={24}
      dragDampening={0.78}
      enlargeTransitionMs={260}
    />
  )
}
