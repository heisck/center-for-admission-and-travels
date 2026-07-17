import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import DOMPurify from 'isomorphic-dompurify'

import PublicNavbar from '@/components/public-navbar'
import Footer from '@/components/footer-server'
import {
  ArticleStructuredData,
  BreadcrumbStructuredData,
} from '@/components/structured-data'
import { createMetadata } from '@/lib/metadata'
import { prisma } from '@/lib/prisma'
import { getSiteChromeContent } from '@/lib/public-content'

export const revalidate = 120

interface PageProps {
  params: Promise<{ slug: string }>
}

async function getPublishedPost(slug: string) {
  try {
    return await prisma.blogPost.findFirst({
      where: { slug, published: true },
      include: {
        package: {
          select: { id: true, name: true },
        },
      },
    })
  } catch {
    return null
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const post = await getPublishedPost(slug)
  if (!post) {
    return createMetadata({
      title: 'Blog post not found',
      path: `/blog/${slug}`,
      noIndex: true,
    })
  }

  return createMetadata({
    title: post.title,
    description:
      post.excerpt ||
      `${post.title} — insights from CA Travels (CFAAT) on study abroad, work abroad, and travel from Ghana.`,
    path: `/blog/${post.slug}`,
    image: post.imageUrl || '/images/ca-20logo.png',
    type: 'article',
    keywords: [
      post.title,
      'CA Travels blog',
      'CFAAT',
      'study abroad Ghana',
      'travel abroad',
      'visa tips Ghana',
    ],
  })
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params
  const [post, chrome] = await Promise.all([getPublishedPost(slug), getSiteChromeContent()])

  if (!post) notFound()

  const publishedIso = post.publishedAt?.toISOString?.() || post.createdAt?.toISOString?.() || null
  const modifiedIso = post.updatedAt?.toISOString?.() || publishedIso
  const safeHtml = DOMPurify.sanitize(post.content.replace(/\n/g, '<br />'), {
    USE_PROFILES: { html: true },
  })

  return (
    <main className="min-h-screen bg-background">
      <ArticleStructuredData
        title={post.title}
        description={post.excerpt || post.title}
        path={`/blog/${post.slug}`}
        image={post.imageUrl}
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

      <article className="py-12 md:py-20" itemScope itemType="https://schema.org/Article">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link href="/blog" className="inline-block text-primary font-semibold hover:underline mb-8">
            ← Back to Blog
          </Link>

          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4" itemProp="headline">
            {post.title}
          </h1>
          {publishedIso ? (
            <p className="text-sm text-muted-foreground mb-6">
              <time dateTime={publishedIso} itemProp="datePublished">
                {new Date(publishedIso).toLocaleDateString('en-GH', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </time>
              <span className="mx-2">·</span>
              <span itemProp="author">CA Travels (CFAAT)</span>
            </p>
          ) : null}

          {post.imageUrl ? (
            <div className="relative aspect-video rounded-2xl overflow-hidden mb-10">
              <Image
                src={post.imageUrl}
                alt={post.title}
                fill
                className="object-cover"
                priority
                sizes="(max-width: 768px) 100vw, 672px"
                itemProp="image"
              />
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
            itemProp="articleBody"
            dangerouslySetInnerHTML={{ __html: safeHtml }}
          />

          <aside className="mt-12 p-6 rounded-xl border border-border bg-orange-50/60">
            <h2 className="text-lg font-bold text-foreground mb-2">Plan with CA Travels</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Center for Admission and Travels (CFAAT) helps with study abroad, work abroad, and
              international travel packages from Ghana.
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
                className="px-4 py-2 rounded-lg border border-border bg-white text-sm font-semibold"
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
