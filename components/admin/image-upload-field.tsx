'use client'

import React, { useState, useRef } from 'react'
import Image from 'next/image'
import { Upload, X, Loader2, RefreshCw } from 'lucide-react'
import { toast } from 'sonner'

interface ImageUploadFieldProps {
  value: string
  onChange: (url: string) => void
  label?: string
  folder?: string
  aspectRatio?: 'video' | 'square' | 'wide'
  className?: string
  helperText?: string
}

export function ImageUploadField({
  value,
  onChange,
  label = 'Image',
  folder = 'center-for-admission-and-travels',
  aspectRatio = 'video',
  className = '',
  helperText = 'Upload an image from your device (JPG, PNG, WebP, max 10MB)',
}: ImageUploadFieldProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (files: FileList | null) => {
    if (!files || files.length === 0) return
    const file = files[0]

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file (JPG, PNG, WebP, GIF)')
      return
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error('Image size must be less than 10MB')
      return
    }

    setIsUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('folder', folder)

      const response = await fetch('/api/admin/images/upload', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      })

      const result = await response.json()
      if (result.success && result.url) {
        onChange(result.url)
        toast.success('Image uploaded successfully')
      } else {
        throw new Error(result.error || 'Upload failed')
      }
    } catch (error: any) {
      console.error('Upload error:', error)
      toast.error(error.message || 'Failed to upload image')
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
    handleFileSelect(e.dataTransfer.files)
  }

  const handleRemove = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    onChange('')
    toast.success('Image removed')
  }

  const aspectClass =
    aspectRatio === 'square'
      ? 'aspect-square max-w-[240px]'
      : aspectRatio === 'wide'
      ? 'aspect-[21/9]'
      : 'aspect-video'

  return (
    <div className={`space-y-1.5 ${className}`}>
      {label && (
        <label className="block text-xs sm:text-sm font-semibold text-foreground">
          {label}
        </label>
      )}

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => handleFileSelect(e.target.files)}
      />

      {value ? (
        /* Image Preview in container with always-visible X remove button */
        <div
          className={`relative w-full ${aspectClass} rounded-xl overflow-hidden border border-border bg-slate-100 shadow-xs group`}
        >
          <Image
            src={value}
            alt={label || 'Uploaded preview'}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 480px"
          />

          {/* Remove Button with X icon */}
          <button
            type="button"
            onClick={handleRemove}
            className="absolute top-2.5 right-2.5 z-20 inline-flex items-center justify-center w-8 h-8 rounded-full bg-red-600 hover:bg-red-700 text-white shadow-md transition active:scale-95"
            title="Remove image"
            aria-label="Remove image"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Replace Button */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="absolute bottom-2.5 right-2.5 z-20 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-black/75 hover:bg-black/90 text-white text-xs font-semibold backdrop-blur-xs transition shadow"
          >
            {isUploading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <RefreshCw className="w-3.5 h-3.5" />
                Replace
              </>
            )}
          </button>
        </div>
      ) : (
        /* Upload Area */
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition flex flex-col items-center justify-center gap-2 ${
            isDragging
              ? 'border-orange-500 bg-orange-50/40'
              : 'border-border bg-slate-50/60 hover:border-orange-500 hover:bg-orange-50/20'
          }`}
        >
          {isUploading ? (
            <Loader2 className="w-8 h-8 text-orange-600 animate-spin" />
          ) : (
            <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600">
              <Upload className="w-5 h-5" />
            </div>
          )}

          <div>
            <p className="text-sm font-semibold text-foreground">
              {isUploading ? 'Uploading image...' : 'Upload image from your device'}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">{helperText}</p>
          </div>
        </div>
      )}
    </div>
  )
}
