'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { BlogImageUpload } from '@/components/admin/blog-image-upload'

interface Package {
  id: string
  name: string
}

export default function AdminBlogNewPage() {
  const router = useRouter()
  const [packages, setPackages] = useState<Package[]>([])
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    title: '',
    excerpt: '',
    content: '',
    imageUrl: '',
    packageId: '',
    published: false,
  })

  useEffect(() => {
    fetch('/api/admin/content/packages', { credentials: 'include' })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setPackages(data.data)
      })
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.title.trim()) {
      alert('Title is required')
      return
    }
    setSaving(true)
    try {
      const res = await fetch('/api/admin/blog', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          title: form.title.trim(),
          excerpt: form.excerpt.trim(),
          content: form.content.trim(),
          imageUrl: form.imageUrl.trim() || undefined,
          packageId: form.packageId || undefined,
          published: form.published,
        }),
      })
      const data = await res.json()
      if (data.success) {
        // Land on edit page so admin sees the real public URL (/blog/{slug})
        const newId = data.data?.id
        if (newId) {
          router.push(`/admin/blog/${newId}`)
        } else {
          router.push('/admin/blog')
        }
      } else {
        alert(data.error || 'Failed to create post')
      }
    } catch {
      alert('Failed to create post')
    } finally {
      setSaving(false)
    }
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link href="/admin/blog" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8">
          <ArrowLeft size={18} /> Back to Blog
        </Link>

        <h1 className="text-2xl font-bold text-foreground mb-8">Create Blog Post</h1>

        <form onSubmit={handleSubmit} className="space-y-6 bg-white rounded-xl border border-border p-8">
          <div>
            <label className="block text-sm font-semibold text-foreground mb-2">Title *</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="e.g. Dubai Travel Guide: What to Expect"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-foreground mb-2">Excerpt (short summary)</label>
            <textarea
              value={form.excerpt}
              onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
              className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              rows={2}
              placeholder="Brief summary shown in listings"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-foreground mb-2">Content</label>
            <textarea
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              rows={12}
              placeholder="Write your post content here. Use line breaks for paragraphs."
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-foreground mb-2">Featured Image</label>
            <BlogImageUpload value={form.imageUrl} onChange={(url) => setForm({ ...form, imageUrl: url })} />
          </div>

          <div>
            <label className="block text-sm font-semibold text-foreground mb-2">Link to Package (optional)</label>
            <select
              value={form.packageId}
              onChange={(e) => setForm({ ...form, packageId: e.target.value })}
              className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-white"
            >
              <option value="">No package</option>
              {packages.map((pkg) => (
                <option key={pkg.id} value={pkg.id}>
                  {pkg.name}
                </option>
              ))}
            </select>
            <p className="text-xs text-muted-foreground mt-1">Link this post to a package so visitors can find both</p>
          </div>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={form.published}
              onChange={(e) => setForm({ ...form, published: e.target.checked })}
              className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
            />
            <span className="font-medium">Publish immediately</span>
          </label>

          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 px-4 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
              Create Post
            </button>
            <Link
              href="/admin/blog"
              className="px-4 py-2 border border-border rounded-lg font-medium hover:bg-slate-50"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </main>
  )
}
