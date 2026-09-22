'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Pencil, Plus } from 'lucide-react'

import type { BlogPostSummary } from '@/lib/public-content'

interface HomeLatestBlogProps {
  posts: BlogPostSummary[]
  onEditPost?: (post: BlogPostSummary) => void
  onAddPost?: () => void
  isEditable?: boolean
}

export default function HomeLatestBlog({
  posts,
  onEditPost,
  onAddPost,
  isEditable = false,
}: HomeLatestBlogProps) {
  if (posts.length === 0 && !isEditable) return null

  return (
    <section className="py-16 md:py-24 bg-transparent relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="flex items-center justify-center gap-3 mb-4">
            <h2 className="text-4xl md:text-5xl font-bold">
              <span className="text-foreground">Latest from </span>
              <span className="bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                Our Blog
              </span>
            </h2>
            {isEditable && onAddPost && (
              <button
                type="button"
                onClick={onAddPost}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-orange-600 hover:bg-orange-700 text-white text-xs font-semibold shadow hover:scale-105 active:scale-95 transition-all"
              >
                <Plus className="w-3.5 h-3.5" /> Add Post
              </button>
            )}
          </div>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Tips, guides, and stories to help you plan your study abroad, work, or travel journey.
          </p>
        </div>

        {posts.length === 0 ? (
          <div className="p-8 text-center rounded-2xl border border-dashed border-border bg-slate-50/50">
            <p className="text-muted-foreground text-sm">No blog posts published yet.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-8">
            {posts.map((post) => {
              const CardContent = (
                <>
                  <div className="relative aspect-video overflow-hidden bg-slate-100">
                    {post.imageUrl ? (
                      <Image
                        src={post.imageUrl}
                        alt={post.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                        sizes="(max-width: 768px) 100vw, 33vw"
                      />
                    ) : null}
                    {isEditable && onEditPost && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          onEditPost(post)
                        }}
                        className="absolute top-3 right-3 z-10 inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-orange-600 text-white text-xs font-semibold shadow hover:bg-orange-700 hover:scale-105 transition"
                        title="Edit post"
                      >
                        <Pencil className="w-3 h-3" /> Edit
                      </button>
                    )}
                  </div>
                  <div className="p-6">
                    <h3 className="text-lg font-bold text-foreground mb-2 group-hover:text-primary transition line-clamp-2">
                      {post.title}
                    </h3>
                    <p className="text-muted-foreground text-sm line-clamp-2">{post.excerpt}</p>
                    <span className="inline-block mt-3 text-primary font-semibold text-sm group-hover:translate-x-1 transition-transform">
                      {isEditable ? 'Click to edit →' : 'Read more →'}
                    </span>
                  </div>
                </>
              )

              if (isEditable && onEditPost) {
                return (
                  <div
                    key={post.id}
                    onClick={() => onEditPost(post)}
                    className="group block bg-white rounded-2xl border border-border overflow-hidden hover:border-primary hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer text-left"
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') onEditPost(post)
                    }}
                  >
                    {CardContent}
                  </div>
                )
              }

              return (
                <Link
                  key={post.id}
                  href={`/blog/${post.slug}`}
                  className="group block bg-white rounded-2xl border border-border overflow-hidden hover:border-primary hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2"
                >
                  {CardContent}
                </Link>
              )
            })}
          </div>
        )}

        <div className="text-center mt-12">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-lg font-semibold hover:shadow-xl transition"
          >
            View all posts
          </Link>
        </div>
      </div>
    </section>
  )
}
