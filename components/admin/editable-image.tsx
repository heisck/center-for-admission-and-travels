'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Edit2, Trash2, Upload } from 'lucide-react'
import { SingleImageUpload } from './single-image-upload'

interface EditableImageProps {
  src: string
  alt: string
  onChange: (newSrc: string) => void
  onDelete?: () => void
  fill?: boolean
  className?: string
  width?: number
  height?: number
  objectFit?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down'
  objectPosition?: string
}

export function EditableImage({
  src,
  alt,
  onChange,
  onDelete,
  fill = false,
  className = '',
  width,
  height,
  objectFit = 'cover',
  objectPosition = 'center',
}: EditableImageProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [isHovered, setIsHovered] = useState(false)

  if (isEditing) {
    return (
      <div className="absolute inset-0 w-full h-full z-50">
        <SingleImageUpload
          currentImage={src}
          onChange={(newSrc) => {
            onChange(newSrc)
            setIsEditing(false)
          }}
          onCancel={() => setIsEditing(false)}
        />
      </div>
    )
  }

  const imageClassName = `object-${objectFit} ${objectPosition ? `object-${objectPosition}` : ''}`

  return (
    <div
      className={`relative group ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={fill ? { width: '100%', height: '100%' } : undefined}
    >
      {src ? (
        fill ? (
          <Image
            src={src}
            alt={alt}
            fill
            className={imageClassName}
          />
        ) : (
          <Image
            src={src}
            alt={alt}
            width={width || 400}
            height={height || 300}
            className={imageClassName}
          />
        )
      ) : (
        <div className="w-full h-full bg-slate-200 border-2 border-dashed border-slate-300 flex items-center justify-center rounded-lg">
          <div className="text-center text-slate-500">
            <Upload size={32} className="mx-auto mb-2" />
            <p className="text-sm">Click to add image</p>
          </div>
        </div>
      )}

      {/* Edit Controls Overlay */}
      {(isHovered || !src) && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => setIsEditing(true)}
            className="p-2 bg-white rounded-lg hover:bg-slate-100 transition shadow-lg"
            title="Edit image"
          >
            <Edit2 size={20} className="text-primary" />
          </button>
          {onDelete && (
            <button
              onClick={onDelete}
              className="p-2 bg-white rounded-lg hover:bg-red-50 transition shadow-lg"
              title="Delete image"
            >
              <Trash2 size={20} className="text-red-600" />
            </button>
          )}
        </div>
      )}

      {/* Click to edit if no image */}
      {!src && (
        <button
          onClick={() => setIsEditing(true)}
          className="absolute inset-0 w-full h-full"
        />
      )}
    </div>
  )
}

