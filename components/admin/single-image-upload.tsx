'use client'

import { useState, useRef, useEffect } from 'react'
import { Upload, X, Check } from 'lucide-react'
import Image from 'next/image'

interface SingleImageUploadProps {
  currentImage?: string
  onChange: (imageUrl: string) => void
  onCancel: () => void
}

export function SingleImageUpload({
  currentImage,
  onChange,
  onCancel,
}: SingleImageUploadProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [preview, setPreview] = useState<string | null>(currentImage || null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Reset preview when currentImage changes externally
  useEffect(() => {
    setPreview(currentImage || null)
  }, [currentImage])

  const handleFileSelect = (files: FileList | null) => {
    if (!files || files.length === 0) return

    const file = files[0]
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file')
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      const result = e.target?.result as string
      setPreview(result)
      // Auto-save when file is selected
      onChange(result)
    }
    reader.readAsDataURL(file)
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

  const handleSave = () => {
    if (preview) {
      onChange(preview)
    } else {
      // If no preview, clear the image
      onChange('')
    }
  }

  const handleRemove = () => {
    setPreview(null)
    onChange('') // Clear the image immediately
  }

  return (
    <div className="absolute inset-0 bg-white rounded-lg border border-slate-200 shadow-lg w-full h-full flex flex-col overflow-hidden z-50">
      {/* Sticky Header */}
      <div className="flex justify-between items-center p-4 border-b border-slate-200 flex-shrink-0">
        <h3 className="text-sm font-semibold text-foreground">Replace Image</h3>
        <div className="flex gap-2">
          <button
            onClick={onCancel}
            className="p-2 bg-slate-200 text-foreground rounded-lg hover:bg-slate-300 transition"
            title="Cancel"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Preview - Always show if there's a current image or preview */}
        {(preview || currentImage) && (
          <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-slate-100 border border-border">
            <Image
              src={preview || currentImage || ''}
              alt="Preview"
              fill
              className="object-contain"
            />
            <button
              onClick={handleRemove}
              className="absolute top-2 right-2 p-1.5 bg-red-600 text-white rounded-full hover:bg-red-700 transition shadow-lg z-10"
              title="Remove"
            >
              <X size={14} />
            </button>
          </div>
        )}

        {/* Upload Area - Always visible */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`relative border-2 border-dashed rounded-lg p-6 text-center transition cursor-pointer ${
            isDragging
              ? 'border-primary bg-primary/5'
              : 'border-slate-300 bg-slate-50 hover:border-primary hover:bg-primary/5'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={(e) => handleFileSelect(e.target.files)}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          <div className="flex flex-col items-center gap-2">
            <Upload size={32} className="text-primary" />
            <div>
              <p className="text-sm font-semibold text-foreground">
                {preview || currentImage ? 'Replace image' : 'Upload image'}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Drag & drop or click to browse • JPG, PNG, GIF, WebP
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

