'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { BlogImageUpload } from '@/components/admin/blog-image-upload'
import { RichTextEditor } from '@/components/admin/rich-text-editor'

interface Package {
  id: string
  name: string
}

export default function AdminBlogEditPage() {
  const params = useParams()
  const router = useRouter()
  const id = params?.id as string
  const [packages, setPackages] = useState<Package[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    title: '',
    excerpt: '',
    content: '',
    imageUrl: '',
    packageId: '',
    published: false,
    slug: '',
  })
  const [regenerateSlug, setRegenerateSlug] = useState(false)

  useEffect(() => {
    if (!id) return
    Promise.all([
      fetch('/api/admin/blog', { credentials: 'include' }).then((r) => r.json()),
      fetch('/api/admin/content/packages', { credentials: 'include' }).then((r) => r.json()),
    ]).then(([blogRes, packagesRes]) => {
      if (packagesRes.success) setPackages(packagesRes.data)
      if (blogRes.success) {
        const post = blogRes.data.find((p: { id: string }) => p.id === id)
        if (post) {
          setForm({
            title: post.title,
            excerpt: post.excerpt || '',
            content: post.content || '',
            imageUrl: post.imageUrl || '',
            packageId: post.packageId || '',
            published: post.published,
            slug: post.slug || '',
          })
        }
      }
      setLoading(false)
    })
  }, [id])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.title.trim()) {
      alert('Title is required')
      return
    }
    setSaving(true)
    try {
      const res = await fetch(`/api/admin/blog/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          title: form.title.trim(),
          excerpt: form.excerpt.trim(),
          content: form.content.trim(),
          imageUrl: form.imageUrl.trim() || undefined,
          packageId: form.packageId || undefined,
          published: form.published,
          regenerateSlug,
        }),
      })
      const data = await res.json()
      if (data.success) {
        if (data.data?.slug) {
          setForm((prev) => ({ ...prev, slug: data.data.slug }))
        }
        router.push('/admin/blog')
      } else {
        alert(data.error || 'Failed to update post')
      }
    } catch {
      alert('Failed to update post')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link href="/admin/blog" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8">
          <ArrowLeft size={18} /> Back to Blog
        </Link>

        <h1 className="text-2xl font-bold text-foreground mb-8">Edit Blog Post</h1>

        <form onSubmit={handleSubmit} className="space-y-6 bg-white rounded-xl border border-border p-8">
          <div>
            <label className="block text-sm font-semibold text-foreground mb-2">Title *</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              required
            />
            {form.slug ? (
              <p className="text-xs text-muted-foreground mt-2">
                Public URL:{' '}
                <a
                  href={`/blog/${encodeURIComponent(form.slug)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono text-primary hover:underline"
                >
                  /blog/{form.slug}
                </a>
                <span className="block mt-1">
                  The title can change freely; the URL stays stable unless you regenerate the slug.
                </span>
              </p>
            ) : null}
            <label className="mt-3 flex items-center gap-2 cursor-pointer text-sm">
              <input
                type="checkbox"
                checked={regenerateSlug}
                onChange={(e) => setRegenerateSlug(e.target.checked)}
                className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
              />
              <span className="text-muted-foreground">
                Regenerate URL slug from title on save (only if you need a new public link)
              </span>
            </label>
          </div>

          <div>
            <label className="block text-sm font-semibold text-foreground mb-2">Excerpt</label>
            <textarea
              value={form.excerpt}
              onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
              className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              rows={2}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-foreground mb-2">Content</label>
            <RichTextEditor
              value={form.content}
              onChange={(content) => setForm((current) => ({ ...current, content }))}
              ariaLabel="Blog post content"
            />
            <p className="mt-2 text-xs text-muted-foreground">
              Existing plain-text posts are formatted automatically when opened. Saving stores the formatted version.
            </p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-foreground mb-2">Featured Image</label>
            <BlogImageUpload value={form.imageUrl} onChange={(url) => setForm({ ...form, imageUrl: url })} />
          </div>

          <div>
            <label className="block text-sm font-semibold text-foreground mb-2">Link to Package</label>
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
          </div>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={form.published}
              onChange={(e) => setForm({ ...form, published: e.target.checked })}
              className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
            />
            <span className="font-medium">Published</span>
          </label>

          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 px-4 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
              Save Changes
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
