import { notFound } from 'next/navigation'
import Link from 'next/link'
import { isAdmin } from '@/lib/auth/session'
import { getDraftNewsArticles } from '@/lib/db/article'
import { publishArticle, archiveArticle, deleteArticle } from '@/lib/actions/admin-article'

export const dynamic = 'force-dynamic'

interface AdminNewsPageProps {
  params: Promise<{ locale: string }>
}

export default async function AdminNewsPage({ params }: AdminNewsPageProps) {
  const { locale } = await params

  if (!(await isAdmin())) notFound()

  const drafts = await getDraftNewsArticles()

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold">News Admin</h1>
          <p className="mt-1 text-sm text-text-muted">
            {drafts.length} draft{drafts.length !== 1 ? 's' : ''} awaiting review
          </p>
        </div>
        <Link
          href={`/${locale}/news`}
          className="rounded-lg bg-elevated px-4 py-2 text-sm text-text-secondary hover:bg-border"
        >
          View Published →
        </Link>
      </div>

      {drafts.length === 0 ? (
        <div className="rounded-xl bg-elevated px-6 py-16 text-center">
          <p className="text-text-muted">No drafts to review.</p>
          <p className="mt-2 text-sm text-text-muted">
            Run the news pipeline to generate new articles:
          </p>
          <code className="mt-2 block text-xs text-crystal-blue">
            npx tsx lib/ingestion/run-news-pipeline.ts
          </code>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {drafts.map((article) => (
            <div
              key={article.id}
              className="rounded-xl border border-border bg-elevated p-5"
            >
              {/* Header */}
              <div className="mb-2 flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <h2 className="truncate text-base font-semibold text-text-primary">
                    {article.title_en}
                  </h2>
                  <p className="truncate text-sm text-text-muted">{article.title_fr}</p>
                </div>
                <span className="shrink-0 rounded-full bg-amber-500/20 px-2 py-0.5 text-xs font-medium text-amber-400">
                  DRAFT
                </span>
              </div>

              {/* Excerpt */}
              {article.excerpt_en && (
                <p className="mb-3 line-clamp-2 text-sm text-text-secondary">
                  {article.excerpt_en}
                </p>
              )}

              {/* Linked manhwas */}
              {article.manhwa_links.length > 0 && (
                <div className="mb-3 flex flex-wrap gap-1">
                  {article.manhwa_links.map((ml) => (
                    <span
                      key={ml.manhwa.slug}
                      className="rounded-md bg-crystal-blue/10 px-2 py-0.5 text-xs text-crystal-blue"
                    >
                      {ml.manhwa.title_en}
                    </span>
                  ))}
                </div>
              )}

              {/* Source */}
              {article.source_url && (
                <a
                  href={article.source_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mb-4 block truncate text-xs text-text-muted underline underline-offset-2 hover:text-text-secondary"
                >
                  {article.source_url}
                </a>
              )}

              {/* Actions */}
              <div className="flex gap-2">
                <form action={publishArticle.bind(null, article.id)}>
                  <button
                    type="submit"
                    className="rounded-lg bg-green-600/20 px-4 py-2 text-sm font-medium text-green-400 transition-colors hover:bg-green-600/30"
                  >
                    Publish
                  </button>
                </form>
                <form action={archiveArticle.bind(null, article.id)}>
                  <button
                    type="submit"
                    className="rounded-lg bg-elevated px-4 py-2 text-sm font-medium text-text-muted transition-colors hover:bg-border"
                  >
                    Archive
                  </button>
                </form>
                <form action={deleteArticle.bind(null, article.id)}>
                  <button
                    type="submit"
                    className="ml-auto rounded-lg px-4 py-2 text-sm font-medium text-red-400 transition-colors hover:bg-red-500/10"
                  >
                    Delete
                  </button>
                </form>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
