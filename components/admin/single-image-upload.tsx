'use client'

import { useState, useRef } from 'react'
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
    }
  }

  const handleRemove = () => {
    setPreview(null)
    onChange('')
  }

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-lg max-w-md w-full">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-sm font-semibold text-foreground">Replace Image</h3>
        <div className="flex gap-2">
          {preview && (
            <button
              onClick={handleSave}
              className="p-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
              title="Save"
            >
              <Check size={18} />
            </button>
          )}
          <button
            onClick={onCancel}
            className="p-2 bg-slate-200 text-foreground rounded-lg hover:bg-slate-300 transition"
            title="Cancel"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Preview */}
      {preview && (
        <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-slate-100 border border-border mb-4">
          <Image
            src={preview}
            alt="Preview"
            fill
            className="object-contain"
          />
          <button
            onClick={handleRemove}
            className="absolute top-2 right-2 p-1.5 bg-red-600 text-white rounded-full hover:bg-red-700 transition shadow-lg"
            title="Remove"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* Upload Area */}
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
              Drag & drop image here or click to browse
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Supported: JPG, PNG, GIF, WebP
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

