'use client'

import { useState, useRef, useEffect } from 'react'
import { Upload, X, Loader2 } from 'lucide-react'
import Image from 'next/image'
import { toast } from 'sonner'

interface SingleImageUploadProps {
  currentImage?: string
  onChange: (imageUrl: string) => void
  onCancel: () => void
  folder?: string // Optional Cloudinary folder
}

export function SingleImageUpload({
  currentImage,
  onChange,
  onCancel,
  folder,
}: SingleImageUploadProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [preview, setPreview] = useState<string | null>(currentImage || null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Reset preview when currentImage changes externally
  useEffect(() => {
    setPreview(currentImage || null)
  }, [currentImage])

  const handleFileSelect = async (files: FileList | null) => {
    if (!files || files.length === 0) return

    const file = files[0]
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file')
      return
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      toast.error('Image size must be less than 10MB')
      return
    }

    setIsUploading(true)
    setUploadError(null)

    // Show preview immediately
    const reader = new FileReader()
    reader.onload = (e) => {
      const result = e.target?.result as string
      setPreview(result)
    }
    reader.readAsDataURL(file)

    try {
      // Upload to Cloudinary via API
      const formData = new FormData()
      formData.append('file', file)
      if (folder) {
        formData.append('folder', folder)
      }

      const response = await fetch('/api/admin/images/upload', {
        method: 'POST',
        body: formData,
      })

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || 'Upload failed')
      }

      // Update with Cloudinary URL. Old asset is cleaned by the content save API
      // only if nothing else still references it (production-safe for shared images).
      setPreview(result.url)
      onChange(result.url)
      toast.success('Image uploaded successfully')
    } catch (error: any) {
      console.error('Upload error:', error)
      setUploadError(error.message || 'Failed to upload image')
      toast.error(error.message || 'Failed to upload image')
      setPreview(currentImage || null) // Revert to previous image
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

  const handleRemove = async () => {
    // Clear content only. Server-side unreferenced cleanup handles Cloudinary
    // so we never delete an asset still used elsewhere.
    setPreview(null)
    onChange('')
    toast.success('Image removed')
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
        {/* Upload Error */}
        {uploadError && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
            {uploadError}
          </div>
        )}

        {/* Preview - Always show if there's a current image or preview */}
        {(preview || currentImage) && (
          <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-slate-100 border border-border">
            {isUploading ? (
              <div className="absolute inset-0 flex items-center justify-center bg-slate-100">
                <div className="text-center">
                  <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Uploading...</p>
                </div>
              </div>
            ) : (
              <>
                <Image
                  src={preview || currentImage || ''}
                  alt="Preview"
                  fill
                  className="object-contain"
                />
                <button
                  onClick={handleRemove}
                  disabled={isUploading}
                  className="absolute top-2 right-2 p-1.5 bg-red-600 text-white rounded-full hover:bg-red-700 transition shadow-lg z-10 disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Remove"
                >
                  <X size={14} />
                </button>
              </>
            )}
          </div>
        )}

        {/* Upload Area - Always visible */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`relative border-2 border-dashed rounded-lg p-6 text-center transition ${
            isUploading
              ? 'border-slate-300 bg-slate-100 cursor-not-allowed opacity-50'
              : isDragging
              ? 'border-primary bg-primary/5 cursor-pointer'
              : 'border-slate-300 bg-slate-50 hover:border-primary hover:bg-primary/5 cursor-pointer'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={(e) => handleFileSelect(e.target.files)}
            disabled={isUploading}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
          />
          <div className="flex flex-col items-center gap-2">
            {isUploading ? (
              <Loader2 size={32} className="text-primary animate-spin" />
            ) : (
              <Upload size={32} className="text-primary" />
            )}
            <div>
              <p className="text-sm font-semibold text-foreground">
                {isUploading
                  ? 'Uploading...'
                  : preview || currentImage
                  ? 'Replace image'
                  : 'Upload image'}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {isUploading
                  ? 'Please wait'
                  : 'Drag & drop or click to browse • JPG, PNG, GIF, WebP • Max 10MB'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

