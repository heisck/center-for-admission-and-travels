'use client'

import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'

export interface ImageFocalPoint {
  x: number
  y: number
}

interface ImageFocalPointEditorProps {
  image: string
  value?: ImageFocalPoint
  onChange: (value: ImageFocalPoint) => void
  label?: string
  aspectClassName?: string
}

function clamp(value: number) {
  return Math.min(100, Math.max(0, value))
}

function normalizePoint(value?: ImageFocalPoint): ImageFocalPoint {
  return {
    x: clamp(Number.isFinite(value?.x) ? Number(value?.x) : 50),
    y: clamp(Number.isFinite(value?.y) ? Number(value?.y) : 50),
  }
}

export function ImageFocalPointEditor({
  image,
  value,
  onChange,
  label = 'Crop preview',
  aspectClassName = 'aspect-[16/9]',
}: ImageFocalPointEditorProps) {
  const [draft, setDraft] = useState<ImageFocalPoint>(() => normalizePoint(value))
  const frameRef = useRef<HTMLDivElement | null>(null)
  const draggingRef = useRef(false)

  useEffect(() => {
    setDraft(normalizePoint(value))
  }, [value])

  const updateFromPointer = (clientX: number, clientY: number, commit = false) => {
    const rect = frameRef.current?.getBoundingClientRect()
    if (!rect) return

    const next = {
      x: clamp(((clientX - rect.left) / rect.width) * 100),
      y: clamp(((clientY - rect.top) / rect.height) * 100),
    }

    setDraft(next)
    if (commit) onChange(next)
  }

  if (!image) return null

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm font-semibold text-foreground">{label}</span>
        <span className="text-xs tabular-nums text-muted-foreground">
          {Math.round(draft.x)}% {Math.round(draft.y)}%
        </span>
      </div>

      <div
        ref={frameRef}
        role="button"
        tabIndex={0}
        aria-label={label}
        onPointerDown={(event) => {
          draggingRef.current = true
          event.currentTarget.setPointerCapture(event.pointerId)
          updateFromPointer(event.clientX, event.clientY)
        }}
        onPointerMove={(event) => {
          if (!draggingRef.current) return
          updateFromPointer(event.clientX, event.clientY)
        }}
        onPointerUp={(event) => {
          draggingRef.current = false
          updateFromPointer(event.clientX, event.clientY, true)
        }}
        onPointerCancel={() => {
          draggingRef.current = false
          onChange(draft)
        }}
        onKeyDown={(event) => {
          const step = event.shiftKey ? 10 : 2
          let next = draft
          if (event.key === 'ArrowLeft') next = { ...draft, x: clamp(draft.x - step) }
          if (event.key === 'ArrowRight') next = { ...draft, x: clamp(draft.x + step) }
          if (event.key === 'ArrowUp') next = { ...draft, y: clamp(draft.y - step) }
          if (event.key === 'ArrowDown') next = { ...draft, y: clamp(draft.y + step) }
          if (next === draft) return
          event.preventDefault()
          setDraft(next)
          onChange(next)
        }}
        className={`relative w-full cursor-crosshair select-none overflow-hidden rounded-lg border border-border bg-slate-100 ${aspectClassName}`}
      >
        <Image
          src={image}
          alt=""
          fill
          sizes="(max-width: 768px) 100vw, 560px"
          className="pointer-events-none object-cover"
          style={{ objectPosition: `${draft.x}% ${draft.y}%` }}
        />
        <div className="pointer-events-none absolute inset-0 bg-black/10" />
        <div
          className="pointer-events-none absolute h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-primary shadow-lg"
          style={{ left: `${draft.x}%`, top: `${draft.y}%` }}
        />
      </div>
    </div>
  )
}
