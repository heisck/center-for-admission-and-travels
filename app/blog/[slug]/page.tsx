'use client'

import { useScrollToTop } from '@/hooks/use-scroll-to-top'
import Navbar from '@/components/navbar'
import Footer from '@/components/footer'
import Link from 'next/link'
import Image from 'next/image'
import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'

interface BlogPost {
  id: string
  slug: string
  title: string
  excerpt: string
  content: string
  imageUrl: string | null
  packageId: string | null
  package: { id: string; name: string } | null
  publishedAt: string | null
}

export default function BlogPostPage() {
  useScrollToTop()
  const params = useParams()
  const slug = params?.slug as string
  const [post, setPost] = useState<BlogPost | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!slug) return
    fetch(`/api/blog/${slug}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setPost(data.data)
        } else {
          setError(data.error || 'Post not found')
        }
      })
      .catch(() => setError('Failed to load post'))
      .finally(() => setLoading(false))
  }, [slug])

  if (loading) {
    return (
      <main className="min-h-screen bg-background">
        <Navbar />
        <section className="py-20">
          <div className="max-w-3xl mx-auto px-4 animate-pulse">
            <div className="h-12 bg-slate-200 rounded w-3/4 mb-4" />
            <div className="h-64 bg-slate-200 rounded mb-8" />
            <div className="space-y-2">
              <div className="h-4 bg-slate-200 rounded w-full" />
              <div className="h-4 bg-slate-200 rounded w-full" />
              <div className="h-4 bg-slate-200 rounded w-2/3" />
            </div>
          </div>
        </section>
        <Footer />
      </main>
    )
  }

  if (error || !post) {
    return (
      <main className="min-h-screen bg-background">
        <Navbar />
        <section className="py-20">
          <div className="max-w-3xl mx-auto px-4 text-center">
            <h1 className="text-2xl font-bold text-foreground mb-4">Post not found</h1>
            <p className="text-muted-foreground mb-6">{error || 'This post may have been removed.'}</p>
            <Link href="/blog" className="text-primary font-semibold hover:underline">
              ← Back to Blog
            </Link>
          </div>
        </section>
        <Footer />
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-background">
      <Navbar />

      <article className="py-12 md:py-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link href="/blog" className="inline-block text-primary font-semibold hover:underline mb-8">
            ← Back to Blog
          </Link>

          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">{post.title}</h1>

          {post.imageUrl && (
            <div className="relative aspect-video rounded-2xl overflow-hidden mb-10">
              <Image
                src={post.imageUrl}
                alt={post.title}
                fill
                className="object-cover"
                priority
                sizes="(max-width: 768px) 100vw, 672px"
              />
            </div>
          )}

          {post.package && (
            <Link
              href={`/packages?highlight=${post.package.id}`}
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-lg font-medium hover:bg-primary/20 transition mb-6"
            >
              Related package: {post.package.name} →
            </Link>
          )}

          <div
            className="prose prose-lg max-w-none prose-headings:text-foreground prose-p:text-muted-foreground prose-a:text-primary prose-strong:text-foreground"
            dangerouslySetInnerHTML={{ __html: post.content.replace(/\n/g, '<br />') }}
          />
        </div>
      </article>

      <Footer />
    </main>
  )
}
