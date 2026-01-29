'use client'

import { useState, useRef, useEffect } from 'react'
import { Edit2, Check, X } from 'lucide-react'

interface EditableWithFontProps {
  value: string
  onChange: (value: string) => void
  fontSize?: 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl'
  fontWeight?: 'normal' | 'semibold' | 'bold'
  onFontSizeChange?: (size: string) => void
  onFontWeightChange?: (weight: string) => void
  multiline?: boolean
  className?: string
}

const fontSizeMap = {
  sm: 'text-sm',
  base: 'text-base',
  lg: 'text-lg',
  xl: 'text-xl',
  '2xl': 'text-2xl',
  '3xl': 'text-3xl',
  '4xl': 'text-4xl',
  '5xl': 'text-5xl',
  '6xl': 'text-6xl',
}

const fontWeightMap = {
  normal: 'font-normal',
  semibold: 'font-semibold',
  bold: 'font-bold',
}

export function EditableWithFont({
  value,
  onChange,
  fontSize = 'base',
  fontWeight = 'normal',
  onFontSizeChange,
  onFontWeightChange,
  multiline = false,
  className = '',
}: EditableWithFontProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState(value)
  const [localFontSize, setLocalFontSize] = useState(fontSize)
  const [localFontWeight, setLocalFontWeight] = useState(fontWeight)
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null)

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isEditing])

  const handleSave = () => {
    onChange(editValue)
    onFontSizeChange?.(localFontSize)
    onFontWeightChange?.(localFontWeight)
    setIsEditing(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !multiline) {
      handleSave()
    } else if (e.key === 'Escape') {
      setIsEditing(false)
    }
  }

  if (isEditing) {
    return (
      <div className="space-y-3">
        <div className="flex gap-2">
          <select
            value={localFontSize}
            onChange={(e) => setLocalFontSize(e.target.value)}
            className="px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
          >
            <option value="sm">Small</option>
            <option value="base">Base</option>
            <option value="lg">Large</option>
            <option value="xl">Extra Large</option>
            <option value="2xl">2XL</option>
            <option value="3xl">3XL</option>
            <option value="4xl">4XL</option>
            <option value="5xl">5XL</option>
            <option value="6xl">6XL</option>
          </select>

          <select
            value={localFontWeight}
            onChange={(e) => setLocalFontWeight(e.target.value)}
            className="px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
          >
            <option value="normal">Normal</option>
            <option value="semibold">Semibold</option>
            <option value="bold">Bold</option>
          </select>
        </div>

        {multiline ? (
          <textarea
            ref={inputRef as React.RefObject<HTMLTextAreaElement>}
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full px-3 py-2 border border-primary rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            rows={4}
          />
        ) : (
          <input
            ref={inputRef as React.RefObject<HTMLInputElement>}
            type="text"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full px-3 py-2 border border-primary rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          />
        )}

        <div className="flex gap-2">
          <button
            onClick={handleSave}
            className="flex-1 p-2 hover:bg-green-100 rounded-lg transition text-green-600 font-medium"
          >
            <Check size={18} className="mx-auto" />
          </button>
          <button
            onClick={() => setIsEditing(false)}
            className="flex-1 p-2 hover:bg-red-100 rounded-lg transition text-red-600 font-medium"
          >
            <X size={18} className="mx-auto" />
          </button>
        </div>
      </div>
    )
  }

  return (
    <div
      onClick={() => setIsEditing(true)}
      className={`group relative cursor-pointer inline-block ${fontSizeMap[fontSize as keyof typeof fontSizeMap]} ${fontWeightMap[fontWeight as keyof typeof fontWeightMap]} ${className} hover:bg-orange-50 rounded px-2 py-1 transition`}
    >
      {value || 'Click to edit...'}
      <Edit2 size={16} className="absolute right-1 top-1 opacity-0 group-hover:opacity-100 transition text-orange-600" />
    </div>
  )
}
