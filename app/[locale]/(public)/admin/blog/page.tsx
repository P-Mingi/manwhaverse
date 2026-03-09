import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { getUser, isAdmin } from '@/lib/auth/session'
import { getPendingUserArticles } from '@/lib/db/article'
import { publishUserArticle, rejectArticle, deleteUserArticle } from '@/lib/actions/admin-article'
import { MODERATOR_USERNAMES } from '@/lib/auth/moderators'

export const dynamic = 'force-dynamic'

const CATEGORY_COLORS: Record<string, string> = {
  GUIDE: 'bg-emerald-500/20 text-emerald-400',
  LIST: 'bg-yellow-500/20 text-yellow-400',
  OPINION: 'bg-purple-500/20 text-purple-400',
  ANALYSIS: 'bg-orange-500/20 text-orange-400',
}

interface AdminBlogPageProps {
  params: Promise<{ locale: string }>
}

export default async function AdminBlogPage({ params }: AdminBlogPageProps) {
  const { locale } = await params
  const user = await getUser()
  const adminOk = await isAdmin()
  const isModerator = user?.username && MODERATOR_USERNAMES.includes(user.username)
  if (!adminOk && !isModerator) notFound()

  const pending = await getPendingUserArticles()

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold">Blog Moderation</h1>
          <p className="mt-1 text-sm text-text-muted">
            {pending.length} user article{pending.length !== 1 ? 's' : ''} awaiting review
          </p>
        </div>
        {adminOk && (
          <Link href={`/${locale}/admin/news`} className="text-sm text-text-muted hover:text-text-primary">
            News admin →
          </Link>
        )}
      </div>

      {pending.length === 0 ? (
        <div className="rounded-xl bg-elevated px-6 py-16 text-center">
          <p className="text-text-muted">No submissions pending review.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {pending.map((article) => (
            <div key={article.id} className="rounded-xl border border-border bg-elevated p-5">
              {/* Author */}
              {article.user && (
                <div className="mb-3 flex items-center gap-2">
                  {article.user.avatar_url ? (
                    <Image src={article.user.avatar_url} alt="" width={24} height={24} className="rounded-full" />
                  ) : (
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-surface text-xs text-text-muted">
                      {article.user.display_name?.[0] ?? article.user.username?.[0] ?? '?'}
                    </div>
                  )}
                  <Link
                    href={`/${locale}/profile/${article.user.username}`}
                    className="text-sm text-text-secondary hover:text-crystal-blue"
                  >
                    {article.user.display_name ?? article.user.username}
                  </Link>
                  <span className={`ml-auto rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${CATEGORY_COLORS[article.category] ?? 'bg-elevated text-text-muted'}`}>
                    {article.category}
                  </span>
                </div>
              )}

              {/* Title */}
              <h2 className="mb-1 font-semibold text-text-primary">{article.title_en}</h2>
              {article.title_fr && <p className="mb-2 text-sm text-text-muted">{article.title_fr}</p>}

              {/* Excerpt */}
              {article.excerpt_en && (
                <p className="mb-3 line-clamp-2 text-sm text-text-secondary">{article.excerpt_en}</p>
              )}

              <p className="mb-4 text-xs text-text-muted">
                Submitted {new Date(article.created_at).toLocaleDateString()}
              </p>

              {/* Actions */}
              <div className="flex gap-2">
                <form action={publishUserArticle.bind(null, article.id)}>
                  <button type="submit" className="rounded-lg bg-green-600/20 px-4 py-2 text-sm font-medium text-green-400 hover:bg-green-600/30">
                    Publish
                  </button>
                </form>
                <form action={rejectArticle.bind(null, article.id)}>
                  <button type="submit" className="rounded-lg bg-elevated px-4 py-2 text-sm font-medium text-text-muted hover:bg-border">
                    Reject
                  </button>
                </form>
                <form action={deleteUserArticle.bind(null, article.id)}>
                  <button type="submit" className="ml-auto rounded-lg px-4 py-2 text-sm font-medium text-error hover:bg-error/10">
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
