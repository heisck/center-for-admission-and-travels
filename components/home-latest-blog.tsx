import Link from 'next/link'
import Image from 'next/image'

import type { BlogPostSummary } from '@/lib/public-content'

interface HomeLatestBlogProps {
  posts: BlogPostSummary[]
}

export default function HomeLatestBlog({ posts }: HomeLatestBlogProps) {
  if (posts.length === 0) return null

  return (
    <section className="py-16 md:py-24 bg-transparent">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="text-foreground">Latest from </span>
            <span className="bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
              Our Blog
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Tips, guides, and stories to help you plan your study abroad, work, or travel journey.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {posts.map((post) => (
            <Link
              key={post.id}
              href={`/blog/${post.slug}`}
              className="group block bg-white rounded-2xl border border-border overflow-hidden hover:border-primary hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2"
            >
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
              </div>
              <div className="p-6">
                <h3 className="text-lg font-bold text-foreground mb-2 group-hover:text-primary transition line-clamp-2">
                  {post.title}
                </h3>
                <p className="text-muted-foreground text-sm line-clamp-2">{post.excerpt}</p>
                <span className="inline-block mt-3 text-primary font-semibold text-sm group-hover:translate-x-1 transition-transform">
                  Read more →
                </span>
              </div>
            </Link>
          ))}
        </div>

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
