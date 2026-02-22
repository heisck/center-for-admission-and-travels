import { getLegalPage } from '@/lib/legal'
import { plainTextToHtml, looksLikeHtml } from '@/lib/plain-text-to-html'
import Navbar from '@/components/navbar'
import Footer from '@/components/footer'

interface LegalPageContentProps {
  slug: string
  defaultTitle: string
  defaultDescription: string
}

export default async function LegalPageContent({
  slug,
  defaultTitle,
  defaultDescription,
}: LegalPageContentProps) {
  const page = await getLegalPage(slug)
  const htmlContent =
    page?.content && looksLikeHtml(page.content)
      ? page.content
      : page?.content
        ? plainTextToHtml(page.content)
        : null

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 sm:p-12">
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-2">
              {page?.title || defaultTitle}
            </h1>
            <p className="text-sm text-muted-foreground mb-10">
              Last updated: {page?.updatedAt ? new Date(page.updatedAt).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' }) : 'February 2026'}
            </p>

            {htmlContent ? (
              <div
                className="space-y-8 text-muted-foreground leading-relaxed prose prose-slate max-w-none prose-headings:text-foreground prose-a:text-primary prose-a:no-underline hover:prose-a:underline"
                dangerouslySetInnerHTML={{ __html: htmlContent }}
              />
            ) : (
              <p className="text-muted-foreground">
                Content is being updated. Please check back later.
              </p>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
