'use client'

import React, { useState, useEffect } from 'react'
import { AdminOverlay } from '@/components/admin/admin-overlay'
import { RichTextEditor } from '@/components/admin/rich-text-editor'
import { ImageUploadField } from '@/components/admin/image-upload-field'
import { Check, Trash2, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import type { BlogPostSummary } from '@/lib/public-content'

interface BlogPostEditOverlayProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  post: BlogPostSummary | null
  isNew?: boolean
  onSaved: (savedPost: any) => void
  onDeleted?: (postId: string) => void
}

export function BlogPostEditOverlay({
  open,
  onOpenChange,
  post,
  isNew = false,
  onSaved,
  onDeleted,
}: BlogPostEditOverlayProps) {
  const [title, setTitle] = useState('')
  const [excerpt, setExcerpt] = useState('')
  const [content, setContent] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [packageId, setPackageId] = useState('')
  const [published, setPublished] = useState(true)
  const [packages, setPackages] = useState<Array<{ id: string; name: string }>>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoadingDetails, setIsLoadingDetails] = useState(false)

  // Load packages for dropdown
  useEffect(() => {
    async function loadPackages() {
      try {
        const res = await fetch('/api/admin/content/packages')
        const data = await res.json()
        if (data.success && Array.isArray(data.data)) {
          setPackages(data.data.map((p: any) => ({ id: p.id, name: p.name })))
        }
      } catch {
        // Silent catch
      }
    }
    loadPackages()
  }, [])

  // Populate form
  useEffect(() => {
    if (post && !isNew) {
      setTitle(post.title || '')
      setExcerpt(post.excerpt || '')
      setImageUrl(post.imageUrl || '')
      const anyPost = post as any
      setPublished(anyPost.published !== undefined ? anyPost.published : Boolean(post.publishedAt))

      // Fetch full content if not present
      if ((post as any).content !== undefined) {
        setContent((post as any).content || '')
      } else {
        setIsLoadingDetails(true)
        fetch('/api/admin/blog', { credentials: 'include' })
          .then((r) => r.json())
          .then((data) => {
            if (data.success && Array.isArray(data.data)) {
              const full = data.data.find((p: any) => p.id === post.id)
              if (full) {
                setContent(full.content || '')
                if (full.packageId) setPackageId(full.packageId)
                if (full.published !== undefined) setPublished(full.published)
              }
            }
          })
          .catch(() => {})
          .finally(() => setIsLoadingDetails(false))
      }
    } else {
      setTitle('')
      setExcerpt('')
      setContent('')
      setImageUrl('')
      setPackageId('')
      setPublished(true)
    }
  }, [post, isNew])

  if (!post && !isNew) return null

  const handleDone = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) {
      toast.error('Title is required')
      return
    }

    setIsSubmitting(true)
    try {
      const payload = {
        title: title.trim(),
        excerpt: excerpt.trim(),
        content: content.trim(),
        imageUrl: imageUrl.trim() || undefined,
        packageId: packageId || undefined,
        published,
      }

      if (isNew) {
        const res = await fetch('/api/admin/blog', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(payload),
        })
        const data = await res.json()
        if (data.success) {
          toast.success('Blog post created')
          onSaved(data.data)
          onOpenChange(false)
        } else {
          toast.error(data.error || 'Failed to create post')
        }
      } else if (post?.id) {
        const res = await fetch(`/api/admin/blog/${post.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(payload),
        })
        const data = await res.json()
        if (data.success) {
          toast.success('Blog post updated')
          onSaved(data.data)
          onOpenChange(false)
        } else {
          toast.error(data.error || 'Failed to update post')
        }
      }
    } catch {
      toast.error('An error occurred while saving')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!post?.id || !onDeleted) return
    if (!confirm(`Are you sure you want to delete "${post.title}"? This cannot be undone.`)) return

    try {
      const res = await fetch(`/api/admin/blog/${post.id}`, {
        method: 'DELETE',
        credentials: 'include',
      })
      const data = await res.json()
      if (data.success) {
        toast.success('Blog post deleted')
        onDeleted(post.id)
        onOpenChange(false)
      } else {
        toast.error(data.error || 'Failed to delete post')
      }
    } catch {
      toast.error('Failed to delete post')
    }
  }

  return (
    <AdminOverlay
      open={open}
      onOpenChange={onOpenChange}
      title={isNew ? 'Create Blog Post' : `Edit Blog Post: ${post?.title || 'Post'}`}
      description="Write content with rich text formatting (bold, italics, lists, links) and upload images from your device."
    >
      <form onSubmit={handleDone} className="space-y-5">
        <div>
          <label className="block text-xs sm:text-sm font-semibold text-foreground mb-1.5">
            Post Title *
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/30 font-medium"
            placeholder="e.g. Dubai Travel Guide: What to Expect"
          />
        </div>

        <div>
          <label className="block text-xs sm:text-sm font-semibold text-foreground mb-1.5">
            Excerpt <span className="text-muted-foreground font-normal">(short summary)</span>
          </label>
          <textarea
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            rows={2}
            className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/30"
            placeholder="Brief summary shown in listings and cards..."
          />
        </div>

        <div>
          <label className="block text-xs sm:text-sm font-semibold text-foreground mb-1.5">
            Content & Text Formatting
          </label>
          {isLoadingDetails ? (
            <div className="p-8 text-center border border-border rounded-xl">
              <Loader2 className="w-6 h-6 animate-spin text-orange-600 mx-auto mb-2" />
              <p className="text-xs text-muted-foreground">Loading content...</p>
            </div>
          ) : (
            <RichTextEditor
              value={content}
              onChange={setContent}
              placeholder="Write post content here. Use the toolbar for bold, italic, headings, lists, and links..."
              ariaLabel="Blog post content"
            />
          )}
          <p className="mt-1.5 text-xs text-muted-foreground">
            Use Bold and Italic buttons to format text. Changes render styled on both the editor and the public blog post.
          </p>
        </div>

        <ImageUploadField
          value={imageUrl}
          onChange={setImageUrl}
          label="Featured Image"
          folder="blog"
          helperText="Upload a featured image from your device with instant preview"
        />

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs sm:text-sm font-semibold text-foreground mb-1.5">
              Link to Package <span className="text-muted-foreground font-normal">(optional)</span>
            </label>
            <select
              value={packageId}
              onChange={(e) => setPackageId(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/30"
            >
              <option value="">No linked package</option>
              {packages.map((pkg) => (
                <option key={pkg.id} value={pkg.id}>
                  {pkg.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center pt-6">
            <label className="inline-flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={published}
                onChange={(e) => setPublished(e.target.checked)}
                className="w-4 h-4 rounded border-border text-orange-600 focus:ring-orange-500"
              />
              <span className="text-sm font-semibold text-foreground">Published</span>
            </label>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="pt-4 flex items-center justify-between gap-3 border-t border-border mt-6">
          <div>
            {!isNew && post?.id && onDeleted && (
              <button
                type="button"
                onClick={handleDelete}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 text-xs sm:text-sm font-medium transition"
              >
                <Trash2 className="w-4 h-4" />
                Delete Post
              </button>
            )}
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
              className="px-4 py-2.5 rounded-xl border border-border text-sm font-medium text-muted-foreground hover:bg-slate-100 dark:hover:bg-neutral-800 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-red-600 text-white text-sm font-semibold shadow-sm hover:shadow transition disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Saving...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" /> Done
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </AdminOverlay>
  )
}
