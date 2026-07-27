import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound, permanentRedirect } from 'next/navigation'
import { connection } from 'next/server'

import PublicNavbar from '@/components/public-navbar'
import Footer from '@/components/footer-server'
import {
  ArticleStructuredData,
  BreadcrumbStructuredData,
} from '@/components/structured-data'
import { createMetadata } from '@/lib/metadata'
import { findBlogPostByParam, listPublishedBlogSlugs } from '@/lib/blog-posts'
import { getSiteChromeContent } from '@/lib/public-content'
import { contentToSafeHtml } from '@/lib/safe-html'

/**
 * Always resolve posts from the live DB (same path as /api/blog/[slug]).
 * Static ISR previously cached notFound() shells when build/revalidate
 * briefly failed, leaving permanent 404s while the API still worked.
 */
export const dynamic = 'force-dynamic'
export const dynamicParams = true
export const revalidate = 0

interface PageProps {
  params: Promise<{ slug: string }>
}

/** Still used by some hosts for path discovery; empty is fine with dynamicParams. */
export async function generateStaticParams() {
  try {
    const slugs = await listPublishedBlogSlugs()
    return slugs.map((slug) => ({ slug }))
  } catch {
    return []
  }
}

function formatPublishedDate(iso: string): string {
  try {
    const d = new Date(iso)
    if (Number.isNaN(d.getTime())) return ''
    return new Intl.DateTimeFormat('en-GB', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      timeZone: 'UTC',
    }).format(d)
  } catch {
    return ''
  }
}

function toIso(value: unknown): string | null {
  if (!value) return null
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value.toISOString()
  }
  if (typeof value === 'string' || typeof value === 'number') {
    const d = new Date(value)
    return Number.isNaN(d.getTime()) ? null : d.toISOString()
  }
  // Prisma-like object with toISOString
  if (typeof value === 'object' && value !== null && 'toISOString' in value) {
    try {
      const iso = (value as { toISOString: () => string }).toISOString()
      return typeof iso === 'string' ? iso : null
    } catch {
      return null
    }
  }
  return null
}

function isAllowedNextImageHost(src: string): boolean {
  if (!src) return false
  if (src.startsWith('/')) return true
  try {
    const host = new URL(src).hostname.toLowerCase()
    return (
      host === 'res.cloudinary.com' ||
      host.endsWith('.cloudinary.com') ||
      host === 'images.unsplash.com'
    )
  } catch {
    return false
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  try {
    await connection()
    const { slug } = await params
    const post = await findBlogPostByParam(slug)

    if (!post || !post.published) {
      return createMetadata({
        title: post && !post.published ? 'Draft post' : 'Blog post not found',
        path: `/blog/${slug}`,
        noIndex: true,
      })
    }

    return createMetadata({
      title: post.title,
      description:
        post.excerpt ||
        `${post.title} — insights from Center for Admission and Travels.`,
      path: `/blog/${post.slug}`,
      image: post.imageUrl || '/images/ca-20logo.png',
      type: 'article',
    })
  } catch (error) {
    console.error('[blog/[slug]] generateMetadata failed:', error)
    return createMetadata({ title: 'Blog', path: '/blog', noIndex: true })
  }
}

export default async function BlogPostPage({ params }: PageProps) {
  // Opt into request-time rendering so we never serve a stale static 404 shell.
  await connection()

  const { slug: param } = await params
  const post = await findBlogPostByParam(param)

  if (!post) {
    notFound()
  }

  // Always land on the real stored slug URL
  let decoded = param
  try {
    decoded = decodeURIComponent(param)
  } catch {
    decoded = param
  }
  decoded = decoded.replace(/^\/+|\/+$/g, '').trim()

  if (decoded !== post.slug) {
    permanentRedirect(`/blog/${post.slug}`)
  }

  const chrome = await getSiteChromeContent()

  // Draft: not public
  if (!post.published) {
    return (
      <main className="min-h-screen bg-background">
        <PublicNavbar currentPath="/blog" />
        <section className="relative overflow-hidden py-20 md:py-28 bg-gradient-to-br from-orange-50 to-red-50">
          <div className="max-w-2xl mx-auto px-4 text-center">
            <p className="text-sm font-semibold uppercase tracking-wide text-orange-600 mb-3">Draft</p>
            <h1 className="text-3xl sm:text-4xl font-bold mb-4">
              <span className="bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                This post is not published yet
              </span>
            </h1>
            <p className="text-muted-foreground mb-2">
              <span className="font-medium text-foreground">{post.title}</span>
            </p>
            <p className="text-muted-foreground mb-8">
              Publish it from Admin → Blog to make it live at{' '}
              <code className="text-xs bg-white/80 px-1.5 py-0.5 rounded">/blog/{post.slug}</code>
            </p>
            <Link
              href="/blog"
              className="inline-flex px-6 py-3 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-xl font-semibold hover:shadow-lg transition"
            >
              Browse blog
            </Link>
          </div>
        </section>
        <Footer contact={chrome.contact} footer={chrome.footer} />
      </main>
    )
  }

  const publishedIso = toIso(post.publishedAt) || toIso(post.createdAt)
  const modifiedIso = toIso(post.updatedAt) || publishedIso
  let safeHtml = ''
  try {
    safeHtml = contentToSafeHtml(post.content)
  } catch (error) {
    console.error('[blog/[slug]] contentToSafeHtml failed:', error)
    safeHtml = `<p>${String(post.excerpt || post.title || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')}</p>`
  }
  const publishedLabel = publishedIso ? formatPublishedDate(publishedIso) : ''
  const imageUrl = post.imageUrl || null
  // Prefer plain <img> when host is unknown so Image config never 500s the page
  const useNextImage = imageUrl ? isAllowedNextImageHost(imageUrl) : false

  return (
    <main className="min-h-screen bg-background">
      <ArticleStructuredData
        title={post.title}
        description={post.excerpt || post.title}
        path={`/blog/${post.slug}`}
        image={imageUrl}
        datePublished={publishedIso}
        dateModified={modifiedIso}
      />
      <BreadcrumbStructuredData
        items={[
          { name: 'Home', path: '/' },
          { name: 'Blog', path: '/blog' },
          { name: post.title, path: `/blog/${post.slug}` },
        ]}
      />

      <PublicNavbar currentPath="/blog" />

      <article className="py-12 md:py-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link href="/blog" className="inline-block text-primary font-semibold hover:underline mb-8">
            ← Back to Blog
          </Link>

          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">{post.title}</h1>
          {publishedLabel ? (
            <p className="text-sm text-muted-foreground mb-6">
              <time dateTime={publishedIso || undefined}>{publishedLabel}</time>
              <span className="mx-2">·</span>
              <span>Center for Admission and Travels</span>
            </p>
          ) : null}

          {imageUrl ? (
            <div className="relative aspect-video rounded-2xl overflow-hidden mb-10 bg-slate-100">
              {useNextImage ? (
                <Image
                  src={imageUrl}
                  alt={post.title}
                  fill
                  className="object-cover"
                  priority
                  sizes="(max-width: 768px) 100vw, 672px"
                />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={imageUrl}
                  alt={post.title}
                  className="absolute inset-0 h-full w-full object-cover"
                />
              )}
            </div>
          ) : null}

          {post.package ? (
            <Link
              href={`/packages?q=${encodeURIComponent(post.package.name)}`}
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-lg font-medium hover:bg-primary/20 transition mb-6"
            >
              Related package: {post.package.name} →
            </Link>
          ) : null}

          <div
            className="blog-post-content"
            // suppressHydrationWarning: browser may normalize rare HTML entities in prose
            suppressHydrationWarning
            dangerouslySetInnerHTML={{ __html: safeHtml }}
          />

          <aside className="mt-12 p-6 rounded-xl border border-orange-100 bg-gradient-to-br from-orange-50 to-red-50">
            <h2 className="text-lg font-bold text-foreground mb-2">Plan with us</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Center for Admission and Travels helps with study abroad, work abroad, and travel packages.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/packages"
                className="px-4 py-2 rounded-lg bg-gradient-to-r from-orange-600 to-red-600 text-white text-sm font-semibold"
              >
                View packages
              </Link>
              <Link
                href="/contact"
                className="px-4 py-2 rounded-lg border border-orange-200 bg-white text-sm font-semibold text-orange-900"
              >
                Contact us
              </Link>
            </div>
          </aside>
        </div>
      </article>

      <Footer contact={chrome.contact} footer={chrome.footer} />
    </main>
  )
}
