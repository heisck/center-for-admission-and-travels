'use client'

import { useState, useRef } from 'react'
import Image from 'next/image'
import { Upload, X, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

interface BlogImageUploadProps {
  value: string
  onChange: (url: string) => void
  folder?: string
  alt?: string
}

export function BlogImageUpload({
  value,
  onChange,
  folder = 'blog',
  alt = 'Uploaded image',
}: BlogImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (files: FileList | null) => {
    if (!files?.length) return
    const file = files[0]
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file (JPG, PNG, GIF, WebP)')
      return
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error('Image must be under 10MB')
      return
    }

    setIsUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('folder', folder)

      const res = await fetch('/api/admin/images/upload', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      })
      const data = await res.json()
      if (data.success) {
        onChange(data.url)
        toast.success('Image uploaded')
      } else {
        toast.error(data.error || 'Upload failed')
      }
    } catch {
      toast.error('Upload failed')
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const handleRemove = () => {
    onChange('')
  }

  return (
    <div className="space-y-2">
      {value ? (
        <div className="relative aspect-video max-w-md rounded-lg overflow-hidden border border-border bg-slate-100">
          <Image
            src={value}
            alt={alt}
            fill
            className="object-contain"
          />
          <button
            type="button"
            onClick={handleRemove}
            disabled={isUploading}
            className="absolute top-2.5 right-2.5 z-10 inline-flex items-center justify-center w-8 h-8 rounded-full bg-red-600 hover:bg-red-700 text-white shadow-md transition active:scale-95 disabled:opacity-50"
            title="Remove image"
            aria-label="Remove image"
          >
            <X size={16} />
          </button>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="absolute bottom-2.5 right-2.5 z-10 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-black/75 hover:bg-black/90 text-white text-xs font-semibold backdrop-blur-xs transition shadow disabled:opacity-50"
          >
            {isUploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Replace'}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => handleFileSelect(e.target.files)}
          />
        </div>
      ) : (
        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
          onDragLeave={(e) => { e.preventDefault(); setIsDragging(false) }}
          onDrop={(e) => {
            e.preventDefault()
            setIsDragging(false)
            handleFileSelect(e.dataTransfer.files)
          }}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition ${
            isUploading ? 'border-slate-300 bg-slate-50 opacity-60' : isDragging ? 'border-primary bg-primary/5' : 'border-slate-300 hover:border-primary hover:bg-primary/5'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => handleFileSelect(e.target.files)}
          />
          {isUploading ? (
            <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto mb-2" />
          ) : (
            <Upload className="w-12 h-12 text-primary mx-auto mb-2" />
          )}
          <p className="text-sm font-medium text-foreground">
            {isUploading ? 'Uploading...' : 'Click or drag image here'}
          </p>
          <p className="text-xs text-muted-foreground mt-1">JPG, PNG, GIF, WebP • Max 10MB</p>
        </div>
      )}
    </div>
  )
}
