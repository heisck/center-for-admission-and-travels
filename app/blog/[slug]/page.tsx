import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound, permanentRedirect } from 'next/navigation'

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

export const revalidate = 60
export const dynamicParams = true

interface PageProps {
  params: Promise<{ slug: string }>
}

/** Prebuild known published posts so /blog/{slug} always resolves. */
export async function generateStaticParams() {
  const slugs = await listPublishedBlogSlugs()
  return slugs.map((slug) => ({ slug }))
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
  const { slug: param } = await params

  const post = await findBlogPostByParam(param)

  if (!post) {
    // True unknown URL
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

  const publishedIso =
    post.publishedAt?.toISOString?.() || post.createdAt?.toISOString?.() || null
  const modifiedIso = post.updatedAt?.toISOString?.() || publishedIso
  const safeHtml = contentToSafeHtml(post.content)
  const publishedLabel = publishedIso ? formatPublishedDate(publishedIso) : ''
  const imageUrl = post.imageUrl || null
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
                  className="absolute inset-0 w-full h-full object-cover"
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
            className="prose prose-lg max-w-none prose-headings:text-foreground prose-p:text-muted-foreground prose-a:text-primary prose-strong:text-foreground"
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
