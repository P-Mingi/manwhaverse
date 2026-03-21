import Link from 'next/link'
import Image from 'next/image'
import { notFound, redirect } from 'next/navigation'
import { getAdminReview } from '@/lib/db/admin'
import {
  updateReviewAction,
  softDeleteReviewAction,
  restoreReviewAction,
  hardDeleteReviewAction,
} from '@/lib/actions/admin'

interface ReviewEditPageProps {
  params: Promise<{ locale: string; id: string }>
}

export const metadata = { title: 'Admin — Edit Review' }

export default async function AdminReviewEditPage({ params }: ReviewEditPageProps) {
  const { locale, id } = await params
  const review = await getAdminReview(id)
  if (!review) notFound()

  const update = updateReviewAction.bind(null, id)

  return (
    <div className="max-w-2xl">
      <div className="mb-4 flex items-center gap-2 text-sm text-text-muted">
        <Link href={`/${locale}/admin/reviews`} className="hover:text-text-primary">
          ← Reviews
        </Link>
      </div>

      {/* Review meta */}
      <div className="mb-6 rounded-lg border border-border bg-elevated p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            {review.user.avatar_url ? (
              <Image
                src={review.user.avatar_url}
                alt=""
                width={36}
                height={36}
                className="rounded-full object-cover"
              />
            ) : (
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-border text-sm font-bold text-text-muted">
                {(review.user.username ?? '?')[0]?.toUpperCase()}
              </div>
            )}
            <div>
              <p className="text-sm font-medium">
                {review.user.display_name ?? review.user.username}
              </p>
              <p className="text-xs text-text-muted">@{review.user.username}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {review.is_micro && (
              <span className="rounded bg-border px-1.5 py-0.5 text-[10px] text-text-muted">
                quick
              </span>
            )}
            {review.deleted_at && (
              <span className="rounded bg-red-500/10 px-1.5 py-0.5 text-[10px] text-red-500">
                deleted {new Date(review.deleted_at).toLocaleDateString()}
              </span>
            )}
          </div>
        </div>

        <div className="mt-3 flex items-center gap-3 text-xs text-text-muted">
          <div className="flex items-center gap-1.5">
            {review.manhwa.cover_url && (
              <Image
                src={review.manhwa.cover_url}
                alt=""
                width={14}
                height={20}
                className="rounded object-cover"
              />
            )}
            <Link
              href={`/${locale}/manhwa/${review.manhwa.slug}`}
              target="_blank"
              className="text-crystal-blue hover:underline"
            >
              {review.manhwa.title_en} ↗
            </Link>
          </div>
          <span>·</span>
          <span>{new Date(review.created_at).toLocaleDateString()}</span>
          <span>·</span>
          <span>👍 {review.likes_count} · 👎 {review.dislikes_count}</span>
        </div>
      </div>

      {/* Edit form */}
      <form action={update} className="flex flex-col gap-4">
        <div>
          <label className="mb-1 block text-xs font-medium text-text-secondary">
            Title <span className="text-text-muted">(optional)</span>
          </label>
          <input
            type="text"
            name="title"
            defaultValue={review.title ?? ''}
            maxLength={200}
            disabled={review.is_micro}
            className="w-full rounded-md border border-border bg-elevated px-3 py-2 text-sm outline-none focus:border-crystal-blue disabled:cursor-not-allowed disabled:opacity-50"
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-text-secondary">Content</label>
          <textarea
            name="content"
            defaultValue={review.content}
            maxLength={review.is_micro ? 280 : 10000}
            rows={review.is_micro ? 3 : 10}
            required
            className="w-full rounded-md border border-border bg-elevated px-3 py-2 text-sm outline-none focus:border-crystal-blue"
          />
          <p className="mt-0.5 text-xs text-text-muted">
            Max {review.is_micro ? 280 : 10000} characters
          </p>
        </div>

        <div className="flex items-center gap-6">
          <div>
            <label className="mb-1 block text-xs font-medium text-text-secondary">
              Score <span className="text-text-muted">(0–10)</span>
            </label>
            <input
              type="number"
              name="score"
              defaultValue={review.score ?? ''}
              min={0}
              max={10}
              step={0.1}
              className="w-24 rounded-md border border-border bg-elevated px-3 py-2 text-sm outline-none focus:border-crystal-blue"
            />
          </div>

          <div className="flex items-center gap-2 pt-5">
            <input
              type="checkbox"
              name="has_spoilers"
              id="has_spoilers"
              defaultChecked={review.has_spoilers}
              className="h-4 w-4"
            />
            <label htmlFor="has_spoilers" className="text-sm">
              Contains spoilers
            </label>
          </div>
        </div>

        {!review.is_micro && (review.score_story != null || review.score_art != null) && (
          <div className="rounded-md border border-border bg-elevated p-3">
            <p className="mb-2 text-xs font-medium text-text-muted">Sub-scores (read-only)</p>
            <div className="grid grid-cols-4 gap-2 text-xs text-text-muted">
              {review.score_story != null && <span>Story: {review.score_story}</span>}
              {review.score_art != null && <span>Art: {review.score_art}</span>}
              {review.score_characters != null && <span>Chars: {review.score_characters}</span>}
              {review.score_world != null && <span>World: {review.score_world}</span>}
            </div>
          </div>
        )}

        <div>
          <button
            type="submit"
            className="rounded-md bg-crystal-blue px-4 py-2 text-sm font-medium text-white hover:opacity-90"
          >
            Save Changes
          </button>
        </div>
      </form>

      {/* Moderation */}
      <div className="mt-8 border-t border-border pt-6">
        <h3 className="mb-3 text-sm font-semibold text-text-secondary">Moderation</h3>
        <div className="flex flex-wrap gap-3">
          {review.deleted_at ? (
            <form
              action={async () => {
                'use server'
                await restoreReviewAction(id)
              }}
            >
              <button
                type="submit"
                className="rounded-md bg-green-500/10 px-4 py-2 text-sm font-medium text-green-600 hover:bg-green-500/20"
              >
                Restore review
              </button>
            </form>
          ) : (
            <form
              action={async () => {
                'use server'
                await softDeleteReviewAction(id)
              }}
            >
              <button
                type="submit"
                className="rounded-md bg-red-500/10 px-4 py-2 text-sm font-medium text-red-500 hover:bg-red-500/20"
              >
                Soft delete
              </button>
            </form>
          )}

          <form
            action={async () => {
              'use server'
              await hardDeleteReviewAction(id)
              redirect(`/en/admin/reviews`)
            }}
          >
            <button
              type="submit"
              className="rounded-md border border-red-500/30 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-500/10"
            >
              Hard delete (permanent)
            </button>
          </form>
        </div>
        <p className="mt-2 text-xs text-text-muted">
          Soft delete hides the review from users but keeps it in the database. Hard delete is
          permanent and cannot be undone.
        </p>
      </div>
    </div>
  )
}
