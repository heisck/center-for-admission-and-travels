'use client'

import { useState } from 'react'
import { Plus, Edit2, X, Check } from 'lucide-react'
import { ImageEditor } from './image-editor'
import Masonry from '../Masonry'

interface EditableMasonryProps {
  images: string[]
  onChange: (images: string[]) => void
  className?: string
}

export function EditableMasonry({ images, onChange, className = '' }: EditableMasonryProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editingIndex, setEditingIndex] = useState<number | null>(null)

  const items = images.map((img, idx) => ({
    id: idx.toString(),
    img,
    url: '#',
    height: 300 + (idx % 3) * 100, // Vary heights
  }))

  const handleImageUpdate = (index: number, newUrl: string) => {
    const newImages = [...images]
    newImages[index] = newUrl
    onChange(newImages)
    setEditingIndex(null)
  }

  const handleImageDelete = (index: number) => {
    onChange(images.filter((_, i) => i !== index))
  }

  const handleAddImage = (newUrl: string) => {
    onChange([...images, newUrl])
  }

  if (isEditing) {
    return (
      <div className="space-y-4 bg-white rounded-lg border border-slate-200 p-4 shadow-lg">
        <div className="flex justify-between items-center">
          <h3 className="font-semibold text-foreground">Edit Gallery Images</h3>
          <button
            onClick={() => setIsEditing(false)}
            className="p-2 bg-primary text-white rounded-lg hover:shadow transition"
            title="Done"
          >
            <Check size={18} />
          </button>
        </div>
        <ImageEditor
          images={images}
          onChange={onChange}
          maxImages={10}
          label="Gallery Images"
        />
      </div>
    )
  }

  return (
    <div className={`relative group ${className}`}>
      <Masonry
        items={items}
        ease="power3.out"
        duration={0.6}
        stagger={0.05}
        animateFrom="bottom"
        scaleOnHover={true}
        hoverScale={0.95}
        blurToFocus={true}
        colorShiftOnHover={true}
      />
      
      {/* Edit Overlay */}
      <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={() => setIsEditing(true)}
          className="p-3 bg-white rounded-lg shadow-lg hover:bg-slate-100 transition flex items-center gap-2"
          title="Edit gallery images"
        >
          <Edit2 size={18} className="text-primary" />
          <span className="text-sm font-medium">Edit Images</span>
        </button>
      </div>

      {/* Add Image Button */}
      {images.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-100 border-2 border-dashed border-slate-300 rounded-2xl">
          <button
            onClick={() => setIsEditing(true)}
            className="p-6 bg-white rounded-lg shadow-lg hover:bg-slate-50 transition flex flex-col items-center gap-2"
          >
            <Plus size={32} className="text-primary" />
            <span className="text-sm font-medium text-foreground">Add Gallery Images</span>
          </button>
        </div>
      )}
    </div>
  )
}

