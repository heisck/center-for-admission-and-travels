'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { FileText, Plus, Pencil, Trash2, Eye, Loader2 } from 'lucide-react'

interface BlogPost {
  id: string
  slug: string
  title: string
  excerpt: string
  published: boolean
  publishedAt: string | null
  package: { id: string; name: string } | null
}

export default function AdminBlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)

  const fetchPosts = async () => {
    try {
      const res = await fetch('/api/admin/blog', { credentials: 'include' })
      const data = await res.json()
      if (data.success) {
        setPosts(data.data)
      }
    } catch {
      setPosts([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPosts()
  }, [])

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return
    try {
      const res = await fetch(`/api/admin/blog/${id}`, { method: 'DELETE', credentials: 'include' })
      const data = await res.json()
      if (data.success) {
        setPosts((prev) => prev.filter((p) => p.id !== id))
      } else {
        alert(data.error || 'Failed to delete')
      }
    } catch {
      alert('Failed to delete post')
    }
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Blog Management</h1>
            <p className="text-muted-foreground mt-2">
              Create posts to explain packages and help visitors find what they need. Link posts to packages for better discoverability.
            </p>
          </div>
          <Link
            href="/admin/blog/new"
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition"
          >
            <Plus size={18} /> New Post
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-10 h-10 animate-spin text-primary" />
          </div>
        ) : posts.length === 0 ? (
          <div className="bg-white rounded-xl border border-border p-12 text-center">
            <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <p className="text-lg text-foreground font-medium mb-2">No blog posts yet</p>
            <p className="text-muted-foreground max-w-md mx-auto mb-6">
              Create posts to explain your packages, share tips, and help visitors discover what you offer. Posts can be linked to specific packages.
            </p>
            <Link
              href="/admin/blog/new"
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary/90 transition"
            >
              <Plus size={18} /> Create your first post
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-border">
                  <tr>
                    <th className="text-left px-6 py-4 font-semibold text-foreground">Title</th>
                    <th className="text-left px-6 py-4 font-semibold text-foreground">Status</th>
                    <th className="text-left px-6 py-4 font-semibold text-foreground">Package</th>
                    <th className="text-right px-6 py-4 font-semibold text-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {posts.map((post) => (
                    <tr key={post.id} className="border-b border-border last:border-0 hover:bg-slate-50/50">
                      <td className="px-6 py-4">
                        <span className="font-medium text-foreground">{post.title}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                            post.published ? 'bg-green-100 text-green-800' : 'bg-slate-200 text-slate-700'
                          }`}
                        >
                          {post.published ? 'Published' : 'Draft'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-muted-foreground text-sm">
                        {post.package?.name || '—'}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <a
                            href={`/blog/${post.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 hover:bg-slate-100 rounded-lg transition"
                            title="View"
                          >
                            <Eye size={18} />
                          </a>
                          <Link
                            href={`/admin/blog/${post.id}`}
                            className="p-2 hover:bg-slate-100 rounded-lg transition"
                            title="Edit"
                          >
                            <Pencil size={18} />
                          </Link>
                          <button
                            onClick={() => handleDelete(post.id, post.title)}
                            className="p-2 hover:bg-red-50 rounded-lg transition text-red-600"
                            title="Delete"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
