'use client'

import { useScrollToTop } from '@/hooks/use-scroll-to-top'
import Navbar from '@/components/navbar'
import Footer from '@/components/footer'
import Link from 'next/link'
import Image from 'next/image'
import { usePublicContent } from '@/context/public-content-context'
import { Skeleton } from '@/components/ui/skeleton'

export default function BlogPage() {
  useScrollToTop()
  const { content, loading } = usePublicContent()
  const posts = content?.blogPosts || []

  return (
    <main className="min-h-screen bg-background">
      <Navbar />

      <section className="py-16 md:py-24 bg-gradient-to-br from-orange-50 to-red-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-4">
            <span className="bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
              Blog & News
            </span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl">
            Tips, guides, and stories about study abroad, work opportunities, and travel. Learn about our packages and how we can help you.
          </p>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="aspect-video rounded-2xl" />
              ))}
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-16 bg-slate-50 rounded-2xl border border-border">
              <p className="text-lg text-muted-foreground mb-6">
                New posts coming soon. Stay tuned for travel tips, visa guides, and success stories.
              </p>
              <Link
                href="/newsletter"
                className="inline-block px-6 py-3 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-lg font-semibold hover:shadow-lg transition"
              >
                Subscribe to get notified
              </Link>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {posts.map((post) => (
                <Link
                  key={post.id}
                  href={`/blog/${post.slug}`}
                  className="group block bg-white rounded-2xl border border-border overflow-hidden hover:border-primary hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2"
                >
                  <div className="relative aspect-video overflow-hidden">
                    <Image
                      src={post.imageUrl || '/images/thisshouldbeintegrated2.jpg'}
                      alt={post.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                  </div>
                  <div className="p-6">
                    <h2 className="text-xl font-bold text-foreground mb-2 group-hover:text-primary transition line-clamp-2">
                      {post.title}
                    </h2>
                    <p className="text-muted-foreground text-sm line-clamp-2">{post.excerpt}</p>
                    <span className="inline-block mt-3 text-primary font-semibold text-sm group-hover:translate-x-1 transition-transform">
                      Read more →
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </main>
  )
}
