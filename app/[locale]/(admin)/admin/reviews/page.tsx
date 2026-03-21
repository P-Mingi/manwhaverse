import Link from 'next/link'
import Image from 'next/image'
import { getAdminReviews } from '@/lib/db/admin'
import { softDeleteReviewAction, restoreReviewAction } from '@/lib/actions/admin'

export const metadata = { title: 'Admin — Reviews' }

interface ReviewsPageProps {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ page?: string; search?: string; filter?: string }>
}

const FILTERS = [
  { value: 'all', label: 'Active' },
  { value: 'micro', label: 'Quick' },
  { value: 'long', label: 'Long' },
  { value: 'deleted', label: 'Deleted' },
] as const

type FilterValue = (typeof FILTERS)[number]['value']

export default async function AdminReviewsPage({ params, searchParams }: ReviewsPageProps) {
  const { locale } = await params
  const { page, search, filter } = await searchParams

  const currentPage = Math.max(1, parseInt(page ?? '1', 10))
  const currentFilter = (FILTERS.find((f) => f.value === filter)?.value ?? 'all') as FilterValue

  const { reviews, total, pages } = await getAdminReviews({
    page: currentPage,
    search: search || undefined,
    filter: currentFilter,
  })

  function buildHref(overrides: { page?: number; search?: string; filter?: string }) {
    const p = new URLSearchParams()
    const s = overrides.search ?? search ?? ''
    const f = overrides.filter ?? currentFilter
    const pg = overrides.page ?? currentPage
    if (s) p.set('search', s)
    if (f !== 'all') p.set('filter', f)
    if (pg > 1) p.set('page', String(pg))
    const qs = p.toString()
    return `/${locale}/admin/reviews${qs ? `?${qs}` : ''}`
  }

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-semibold">
          Reviews{' '}
          <span className="text-sm font-normal text-text-muted">({total.toLocaleString()})</span>
        </h2>

        {/* Search */}
        <form method="GET" action={`/${locale}/admin/reviews`} className="flex gap-2">
          {currentFilter !== 'all' && (
            <input type="hidden" name="filter" value={currentFilter} />
          )}
          <input
            type="search"
            name="search"
            defaultValue={search ?? ''}
            placeholder="Search content, user, manhwa…"
            className="rounded-md border border-border bg-elevated px-3 py-1.5 text-sm outline-none focus:border-crystal-blue"
          />
          <button
            type="submit"
            className="rounded-md bg-crystal-blue px-3 py-1.5 text-sm text-white hover:opacity-90"
          >
            Search
          </button>
        </form>
      </div>

      {/* Filter tabs */}
      <div className="mb-4 flex gap-2">
        {FILTERS.map((f) => (
          <Link
            key={f.value}
            href={buildHref({ filter: f.value, page: 1 })}
            className={`rounded-md px-3 py-1.5 text-xs font-medium ${
              currentFilter === f.value
                ? 'bg-crystal-blue text-white'
                : 'bg-elevated text-text-secondary hover:bg-border'
            }`}
          >
            {f.label}
          </Link>
        ))}
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-elevated text-left text-xs text-text-muted">
              <th className="px-3 py-2">Review</th>
              <th className="px-3 py-2">User</th>
              <th className="px-3 py-2">Manhwa</th>
              <th className="px-3 py-2">Score</th>
              <th className="px-3 py-2">Stats</th>
              <th className="px-3 py-2">Date</th>
              <th className="px-3 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {reviews.map((review) => (
              <tr
                key={review.id}
                className={`border-b border-border last:border-0 hover:bg-elevated ${
                  review.deleted_at ? 'opacity-50' : ''
                }`}
              >
                {/* Review content */}
                <td className="max-w-xs px-3 py-2">
                  <div className="flex items-start gap-1.5">
                    <div>
                      {review.is_micro && (
                        <span className="mr-1 inline-block rounded bg-elevated px-1 py-0.5 text-[10px] text-text-muted">
                          quick
                        </span>
                      )}
                      {review.has_spoilers && (
                        <span className="mr-1 inline-block rounded bg-yellow-500/10 px-1 py-0.5 text-[10px] text-yellow-600">
                          spoiler
                        </span>
                      )}
                      {review.deleted_at && (
                        <span className="mr-1 inline-block rounded bg-red-500/10 px-1 py-0.5 text-[10px] text-red-500">
                          deleted
                        </span>
                      )}
                      {review.title && (
                        <p className="truncate text-xs font-medium">{review.title}</p>
                      )}
                      <p className="line-clamp-2 text-xs text-text-muted">{review.content}</p>
                    </div>
                  </div>
                </td>

                {/* User */}
                <td className="px-3 py-2">
                  <div className="flex items-center gap-1.5">
                    {review.user.avatar_url ? (
                      <Image
                        src={review.user.avatar_url}
                        alt=""
                        width={20}
                        height={20}
                        className="rounded-full object-cover"
                      />
                    ) : (
                      <div className="flex h-5 w-5 items-center justify-center rounded-full bg-elevated text-[10px] text-text-muted">
                        {(review.user.username ?? '?')[0]?.toUpperCase()}
                      </div>
                    )}
                    <span className="text-xs">@{review.user.username ?? '—'}</span>
                  </div>
                </td>

                {/* Manhwa */}
                <td className="px-3 py-2">
                  <div className="flex items-center gap-1.5">
                    {review.manhwa.cover_url && (
                      <Image
                        src={review.manhwa.cover_url}
                        alt=""
                        width={16}
                        height={22}
                        className="rounded object-cover"
                      />
                    )}
                    <Link
                      href={`/${locale}/manhwa/${review.manhwa.slug}`}
                      target="_blank"
                      className="max-w-[100px] truncate text-xs text-crystal-blue hover:underline"
                    >
                      {review.manhwa.title_en}
                    </Link>
                  </div>
                </td>

                {/* Score */}
                <td className="px-3 py-2 text-xs">
                  {review.score != null ? (
                    <span className="font-medium">{review.score}/10</span>
                  ) : (
                    <span className="text-text-muted">—</span>
                  )}
                </td>

                {/* Stats */}
                <td className="px-3 py-2 text-xs text-text-muted">
                  👍 {review.likes_count} · 👎 {review.dislikes_count}
                </td>

                {/* Date */}
                <td className="px-3 py-2 text-xs text-text-muted">
                  {new Date(review.created_at).toLocaleDateString()}
                </td>

                {/* Actions */}
                <td className="px-3 py-2">
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/${locale}/admin/reviews/${review.id}`}
                      className="text-xs text-crystal-blue hover:underline"
                    >
                      Edit
                    </Link>
                    {review.deleted_at ? (
                      <form
                        action={async () => {
                          'use server'
                          await restoreReviewAction(review.id)
                        }}
                      >
                        <button type="submit" className="text-xs text-green-500 hover:underline">
                          Restore
                        </button>
                      </form>
                    ) : (
                      <form
                        action={async () => {
                          'use server'
                          await softDeleteReviewAction(review.id)
                        }}
                      >
                        <button type="submit" className="text-xs text-red-400 hover:underline">
                          Delete
                        </button>
                      </form>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {reviews.length === 0 && (
          <p className="py-8 text-center text-sm text-text-muted">No reviews found.</p>
        )}
      </div>

      {/* Pagination */}
      {pages > 1 && (
        <div className="mt-4 flex items-center justify-center gap-2">
          {currentPage > 1 && (
            <Link
              href={buildHref({ page: currentPage - 1 })}
              className="rounded-md bg-elevated px-3 py-1.5 text-xs hover:bg-border"
            >
              ← Prev
            </Link>
          )}
          <span className="text-xs text-text-muted">
            Page {currentPage} / {pages}
          </span>
          {currentPage < pages && (
            <Link
              href={buildHref({ page: currentPage + 1 })}
              className="rounded-md bg-elevated px-3 py-1.5 text-xs hover:bg-border"
            >
              Next →
            </Link>
          )}
        </div>
      )}
    </div>
  )
}
