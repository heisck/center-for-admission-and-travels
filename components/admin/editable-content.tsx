'use client'

import { ReactNode, useState } from 'react'
import { EditableText } from './editable-text'
import { ImageEditor } from './image-editor'
import { Edit2, X, Check } from 'lucide-react'

/**
 * Unified EditableContent wrapper component
 * Provides consistent UI and behavior for all editable content types
 */

interface EditableTextWrapperProps {
  value: string
  onChange: (value: string) => void
  variant: 'title' | 'subtitle' | 'body' | 'heading'
  className?: string
  placeholder?: string
}

export function EditableTextWrapper({
  value,
  onChange,
  variant,
  className = '',
  placeholder = '',
}: EditableTextWrapperProps) {
  const variantMap = {
    title: '4xl font-bold',
    subtitle: '2xl font-semibold',
    body: 'base font-normal',
    heading: 'xl font-bold',
  }

  return (
    <EditableText
      value={value}
      onChange={onChange}
      variant={variant === 'title' ? 'title' : variant === 'subtitle' ? 'subtitle' : variant === 'heading' ? 'large' : 'body'}
      fontSize={variant === 'title' ? '4xl' : variant === 'subtitle' ? '2xl' : variant === 'heading' ? 'xl' : 'base'}
      className={`${variantMap[variant]} ${className}`}
    />
  )
}

interface EditableTextareaWrapperProps {
  value: string
  onChange: (value: string) => void
  rows?: number
  className?: string
  placeholder?: string
}

export function EditableTextareaWrapper({
  value,
  onChange,
  rows = 4,
  className = '',
  placeholder = '',
}: EditableTextareaWrapperProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState(value)

  const handleSave = () => {
    onChange(editValue)
    setIsEditing(false)
  }

  const handleCancel = () => {
    setIsEditing(false)
  }

  if (isEditing) {
    return (
      <div className="space-y-2">
        <textarea
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Escape') handleCancel()
          }}
          className={`w-full px-3 py-2 border border-primary rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${className}`}
          rows={rows}
          autoFocus
        />
        <div className="flex gap-2">
          <button
            onClick={handleSave}
            className="p-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
            title="Save"
          >
            <Check size={18} />
          </button>
          <button
            onClick={handleCancel}
            className="p-2 bg-slate-200 text-foreground rounded-lg hover:bg-slate-300 transition"
            title="Cancel"
          >
            <X size={18} />
          </button>
        </div>
      </div>
    )
  }

  return (
    <div
      onClick={() => {
        setIsEditing(true)
        setEditValue(value)
      }}
      className={`group relative cursor-pointer p-3 rounded-lg hover:bg-orange-50 transition border border-transparent hover:border-orange-200 ${className}`}
    >
      <p className="whitespace-pre-wrap text-foreground leading-relaxed">{value || 'Click to edit...'}</p>
      <Edit2 size={16} className="absolute right-3 top-3 opacity-0 group-hover:opacity-100 transition text-orange-600" />
    </div>
  )
}

interface EditableImageListWrapperProps {
  images: string[]
  onChange: (images: string[]) => void
  maxImages?: number
  label?: string
  className?: string
}

export function EditableImageListWrapper({
  images,
  onChange,
  maxImages = 6,
  label = 'Images',
  className = '',
}: EditableImageListWrapperProps) {
  return (
    <div className={className}>
      <ImageEditor
        images={images}
        onChange={onChange}
        maxImages={maxImages}
        label={label}
      />
    </div>
  )
}

interface EditableListItemProps {
  value: string
  onChange: (value: string) => void
  onRemove: () => void
}

export function EditableListItem({
  value,
  onChange,
  onRemove,
}: EditableListItemProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState(value)

  const handleSave = () => {
    onChange(editValue)
    setIsEditing(false)
  }

  if (isEditing) {
    return (
      <div className="flex gap-2 items-center py-2 px-3 bg-slate-50 rounded-lg border border-primary">
        <input
          type="text"
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={handleSave}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSave()
            if (e.key === 'Escape') setIsEditing(false)
          }}
          className="flex-1 px-2 py-1 border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-primary"
          autoFocus
        />
        <button
          onClick={handleSave}
          className="p-1.5 bg-green-600 text-white rounded hover:bg-green-700 transition"
          title="Save"
        >
          <Check size={16} />
        </button>
        <button
          onClick={onRemove}
          className="p-1.5 text-red-600 hover:bg-red-100 rounded transition"
          title="Remove"
        >
          <X size={16} />
        </button>
      </div>
    )
  }

  return (
    <div
      onClick={() => {
        setIsEditing(true)
        setEditValue(value)
      }}
      className="group relative flex items-center gap-2 py-2 px-3 rounded-lg hover:bg-orange-50 transition cursor-pointer border border-transparent hover:border-orange-200"
    >
      <div className="flex-1 text-foreground">{value || 'Click to edit...'}</div>
      <button
        onClick={(e) => {
          e.stopPropagation()
          onRemove()
        }}
        className="p-1 opacity-0 group-hover:opacity-100 text-red-600 hover:bg-red-100 rounded transition"
      >
        <X size={14} />
      </button>
      <Edit2 size={14} className="opacity-0 group-hover:opacity-100 text-orange-600 transition" />
    </div>
  )
}

interface EditableListWrapperProps {
  items: string[]
  onChange: (items: string[]) => void
  label?: string
  className?: string
  placeholder?: string
}

export function EditableListWrapper({
  items,
  onChange,
  label = 'Items',
  className = '',
  placeholder = 'Add new item...',
}: EditableListWrapperProps) {
  const [newItem, setNewItem] = useState('')
  const [showAddForm, setShowAddForm] = useState(false)

  const handleAddItem = () => {
    if (newItem.trim()) {
      onChange([...items, newItem.trim()])
      setNewItem('')
      setShowAddForm(false)
    }
  }

  const handleRemoveItem = (index: number) => {
    onChange(items.filter((_, i) => i !== index))
  }

  const handleUpdateItem = (index: number, newValue: string) => {
    const newItems = [...items]
    newItems[index] = newValue
    onChange(newItems)
  }

  return (
    <div className={className}>
      <div className="flex justify-between items-center mb-4">
        <label className="block text-sm font-semibold text-foreground">{label}</label>
      </div>

      {/* List Items */}
      <div className="space-y-2 mb-4">
        {items.map((item, idx) => (
          <EditableListItem
            key={idx}
            value={item}
            onChange={(newValue) => handleUpdateItem(idx, newValue)}
            onRemove={() => handleRemoveItem(idx)}
          />
        ))}
      </div>

      {/* Add Item Form */}
      {showAddForm ? (
        <div className="flex gap-2 py-2 px-3 bg-slate-50 rounded-lg border border-slate-300">
          <input
            type="text"
            value={newItem}
            onChange={(e) => setNewItem(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleAddItem()
              if (e.key === 'Escape') {
                setShowAddForm(false)
                setNewItem('')
              }
            }}
            placeholder={placeholder}
            className="flex-1 px-2 py-1 border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-primary"
            autoFocus
          />
          <button
            onClick={handleAddItem}
            disabled={!newItem.trim()}
            className="p-1.5 bg-primary text-white rounded hover:shadow transition disabled:opacity-50 disabled:cursor-not-allowed"
            title="Add"
          >
            <Check size={16} />
          </button>
          <button
            onClick={() => {
              setShowAddForm(false)
              setNewItem('')
            }}
            className="p-1.5 bg-slate-200 text-foreground rounded hover:bg-slate-300 transition"
            title="Cancel"
          >
            <X size={16} />
          </button>
        </div>
      ) : (
        <button
          onClick={() => setShowAddForm(true)}
          className="text-sm px-4 py-2 bg-primary text-white rounded-lg hover:shadow transition"
        >
          + Add {label.slice(0, -1)}
        </button>
      )}
    </div>
  )
}

/**
 * EditableSection wrapper for grouping editable content
 */
interface EditableSectionProps {
  title: string
  children: ReactNode
  className?: string
}

export function EditableSection({
  title,
  children,
  className = '',
}: EditableSectionProps) {
  return (
    <div className={`bg-white rounded-lg border border-slate-200 p-6 shadow-sm hover:shadow-md transition ${className}`}>
      <h3 className="text-lg font-semibold text-foreground mb-4 pb-3 border-b border-slate-200">
        {title}
      </h3>
      <div className="space-y-4">{children}</div>
    </div>
  )
}
