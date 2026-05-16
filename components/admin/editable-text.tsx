'use client'

import { useState, useRef, useEffect } from 'react'
import { Edit2, Check, X } from 'lucide-react'

interface EditableTextProps {
  value: string
  onChange: (value: string) => void
  isEditing?: boolean
  onEditStart?: () => void
  onEditEnd?: () => void
  multiline?: boolean
  className?: string
  inputClassName?: string
  fontSize?: 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl'
  variant?: 'title' | 'subtitle' | 'body' | 'large'
  placeholder?: string
}

export function EditableText({
  value,
  onChange,
  isEditing: controlledIsEditing,
  onEditStart,
  onEditEnd,
  multiline = false,
  className = '',
  inputClassName = '',
  fontSize = 'base',
  variant = 'body',
  placeholder = 'Click to edit...',
}: EditableTextProps) {
  const [internalIsEditing, setInternalIsEditing] = useState(false)
  const [editValue, setEditValue] = useState(value)
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null)
  const isEditing = controlledIsEditing !== undefined ? controlledIsEditing : internalIsEditing

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

  const variantClasses = {
    title: 'font-bold',
    subtitle: 'font-semibold',
    body: 'font-normal',
    large: 'font-bold text-lg',
  }

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus()
      if (inputRef.current instanceof HTMLTextAreaElement) {
        inputRef.current.select()
      } else {
        inputRef.current.select()
      }
    }
  }, [isEditing])

  const handleStart = () => {
    setInternalIsEditing(true)
    setEditValue(value)
    onEditStart?.()
  }

  const handleSave = () => {
    onChange(editValue)
    setInternalIsEditing(false)
    onEditEnd?.()
  }

  const handleCancel = () => {
    setInternalIsEditing(false)
    onEditEnd?.()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !multiline) {
      handleSave()
    } else if (e.key === 'Escape') {
      handleCancel()
    }
  }

  if (isEditing) {
    return (
      <div className="flex gap-2 items-center">
        {multiline ? (
          <textarea
            ref={inputRef as React.RefObject<HTMLTextAreaElement>}
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={handleSave}
            onKeyDown={handleKeyDown}
            className={`flex-1 px-3 py-2 border border-primary rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${inputClassName}`}
            placeholder={placeholder}
            rows={4}
          />
        ) : (
          <input
            ref={inputRef as React.RefObject<HTMLInputElement>}
            type="text"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={handleSave}
            onKeyDown={handleKeyDown}
            className={`flex-1 px-3 py-2 border border-primary rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${inputClassName}`}
            placeholder={placeholder}
          />
        )}
        <button
          onClick={handleSave}
          className="p-2 hover:bg-green-100 rounded-lg transition text-green-600"
          title="Save"
        >
          <Check size={18} />
        </button>
        <button
          onClick={handleCancel}
          className="p-2 hover:bg-red-100 rounded-lg transition text-red-600"
          title="Cancel"
        >
          <X size={18} />
        </button>
      </div>
    )
  }

  return (
    <div
      onClick={handleStart}
      className={`group relative cursor-pointer inline-block ${fontSizeMap[fontSize]} ${variantClasses[variant]} ${className} hover:bg-orange-50 rounded px-2 py-1 transition`}
    >
      {value || placeholder}
      <Edit2 size={16} className="absolute right-1 top-1 opacity-0 group-hover:opacity-100 transition text-orange-600" />
    </div>
  )
}
