'use client'

import { useState, useRef } from 'react'
import { Trash2, Plus, Upload, ImageIcon } from 'lucide-react'
import Image from 'next/image'

interface ImageEditorProps {
  images: string[]
  onChange: (images: string[]) => void
  maxImages?: number
  label?: string
}

export function ImageEditor({
  images,
  onChange,
  maxImages = 6,
  label = 'Images',
}: ImageEditorProps) {
  const [newImageUrl, setNewImageUrl] = useState('')
  const [showAddForm, setShowAddForm] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleAddImage = () => {
    if (newImageUrl.trim() && images.length < maxImages) {
      onChange([...images, newImageUrl])
      setNewImageUrl('')
      setShowAddForm(false)
    }
  }

  const handleFileSelect = (files: FileList | null) => {
    if (!files) return

    Array.from(files).forEach((file) => {
      if (images.length >= maxImages) return
      if (!file.type.startsWith('image/')) return

      const reader = new FileReader()
      reader.onload = (e) => {
        const result = e.target?.result as string
        onChange([...images, result])
      }
      reader.readAsDataURL(file)
    })

    setNewImageUrl('')
    setShowAddForm(false)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
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

  const handleRemoveImage = (index: number) => {
    onChange(images.filter((_, i) => i !== index))
  }

  const handleImageUrlChange = (index: number, newUrl: string) => {
    const newImages = [...images]
    newImages[index] = newUrl
    onChange(newImages)
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <label className="block text-sm font-semibold text-foreground">{label}</label>
        {images.length < maxImages && (
          <button
            onClick={() => setShowAddForm(true)}
            className="text-sm px-3 py-1 bg-primary text-white rounded-lg hover:shadow transition flex items-center gap-1"
          >
            <Plus size={14} /> Add Image
          </button>
        )}
      </div>

      {/* Image Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 sm:gap-3 md:gap-4 mb-4">
          {images.map((image, idx) => (
            <div key={idx} className="relative group">
              <div className="relative w-full aspect-square rounded-lg overflow-hidden bg-slate-100 border border-border">
                {image ? (
                  <Image
                    src={image}
                    alt={`Image ${idx + 1}`}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                    <ImageIcon size={32} />
                  </div>
                )}
              </div>

              {/* Image URL Input */}
              <div className="mt-2 space-y-2">
                <input
                  type="text"
                  value={image}
                  onChange={(e) => handleImageUrlChange(idx, e.target.value)}
                  placeholder="Image URL"
                  className="w-full px-2 py-1 border border-border rounded text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                />
                <button
                  onClick={() => handleRemoveImage(idx)}
                  className="w-full p-2 hover:bg-red-50 rounded transition text-red-600 text-sm font-medium flex items-center justify-center gap-1"
                >
                  <Trash2 size={14} /> Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Image Form */}
      {showAddForm && (
        <div className="bg-slate-50 border border-border rounded-lg p-4 space-y-4">
          {/* File Upload Area */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`relative border-2 border-dashed rounded-lg p-6 text-center transition cursor-pointer ${
              isDragging
                ? 'border-primary bg-primary/5'
                : 'border-border bg-white hover:border-primary hover:bg-primary/5'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*"
              onChange={(e) => handleFileSelect(e.target.files)}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <div className="flex flex-col items-center gap-2">
              <Upload size={32} className="text-primary" />
              <div>
                <p className="text-sm font-semibold text-foreground">
                  Drag & drop images here or click to browse
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Supported: JPG, PNG, GIF, WebP
                </p>
              </div>
            </div>
          </div>

          {/* URL Fallback */}
          <div className="border-t border-border pt-4">
            <label className="block text-sm font-semibold text-foreground mb-2">Or paste image URL</label>
            <input
              type="text"
              value={newImageUrl}
              onChange={(e) => setNewImageUrl(e.target.value)}
              placeholder="https://example.com/image.jpg"
              className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {newImageUrl && (
            <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-slate-200 border border-border">
              <Image
                src={newImageUrl}
                alt="Preview"
                fill
                className="object-cover"
                onError={() => {
                  // Handle broken image
                }}
              />
            </div>
          )}

          <div className="flex gap-2">
            <button
              onClick={handleAddImage}
              disabled={!newImageUrl.trim()}
              className="flex-1 px-4 py-2 bg-primary text-white rounded-lg font-medium hover:shadow transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <Upload size={16} /> Add URL Image
            </button>
            <button
              onClick={() => {
                setShowAddForm(false)
                setNewImageUrl('')
                if (fileInputRef.current) {
                  fileInputRef.current.value = ''
                }
              }}
              className="flex-1 px-4 py-2 bg-slate-200 text-foreground rounded-lg font-medium hover:bg-slate-300 transition"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {images.length === 0 && !showAddForm && (
        <div className="text-center py-8 bg-slate-50 rounded-lg border border-dashed border-border">
          <ImageIcon size={32} className="mx-auto mb-2 text-muted-foreground" />
          <p className="text-muted-foreground text-sm">No images yet. Add one to get started.</p>
        </div>
      )}
    </div>
  )
}
