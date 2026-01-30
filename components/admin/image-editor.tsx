'use client'

import { useState, useRef } from 'react'
import { Trash2, Plus, Upload, ImageIcon, X, Check } from 'lucide-react'
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
  const [showAddForm, setShowAddForm] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)


  const handleFileSelect = (files: FileList | null) => {
    if (!files) return

    const filesArray = Array.from(files)
    const imageFiles = filesArray.filter(file => file.type.startsWith('image/'))
    const remainingSlots = maxImages - images.length
    const filesToProcess = imageFiles.slice(0, remainingSlots)

    if (filesToProcess.length === 0) {
      if (filesArray.length > 0) {
        alert('Please select image files only')
      }
      return
    }

    const newImages: string[] = []
    let loadedCount = 0

    filesToProcess.forEach((file) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        const result = e.target?.result as string
        newImages.push(result)
        loadedCount++
        
        if (loadedCount === filesToProcess.length) {
          onChange([...images, ...newImages])
          setShowAddForm(false)
          if (fileInputRef.current) {
            fileInputRef.current.value = ''
          }
        }
      }
      reader.readAsDataURL(file)
    })
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


  return (
    <div className="relative max-h-[80vh] overflow-y-auto">
      <div className="sticky top-0 bg-white z-10 pb-4 border-b border-slate-200 mb-4">
        <div className="flex justify-between items-center">
          <label className="block text-sm font-semibold text-foreground">{label}</label>
          {images.length < maxImages && !showAddForm && (
            <button
              onClick={() => setShowAddForm(true)}
              className="text-sm px-3 py-1 bg-primary text-white rounded-lg hover:shadow transition flex items-center gap-1"
            >
              <Plus size={14} /> Add Image
            </button>
          )}
        </div>
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

              {/* Remove Button */}
              <button
                onClick={() => handleRemoveImage(idx)}
                className="absolute top-2 right-2 p-1.5 bg-red-600 text-white rounded-full hover:bg-red-700 transition shadow-lg opacity-0 group-hover:opacity-100"
                title="Remove"
              >
                <X size={14} />
              </button>
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

          {/* Action Buttons - Sticky at bottom */}
          <div className="sticky bottom-0 bg-white pt-4 border-t border-slate-200 flex gap-2">
            <button
              onClick={() => {
                setShowAddForm(false)
                if (fileInputRef.current) {
                  fileInputRef.current.value = ''
                }
              }}
              className="flex-1 px-4 py-2 bg-slate-200 text-foreground rounded-lg font-medium hover:bg-slate-300 transition flex items-center justify-center gap-2"
            >
              <X size={18} /> Cancel
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
