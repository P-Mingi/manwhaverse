'use client'

import { useTransition } from 'react'
import { useTranslations } from 'next-intl'
import type { ReviewWithUser } from '@/lib/db/review'
import { toggleLikeAction } from '@/lib/actions/review'
import { formatScore, getCrystalColor } from '@/lib/utils/formatScore'

interface ReviewCardProps {
  review: ReviewWithUser
  currentUserId?: string
}

export function ReviewCard({ review, currentUserId }: ReviewCardProps) {
  const t = useTranslations('review')
  const [isPending, startTransition] = useTransition()

  function handleLike() {
    startTransition(async () => {
      await toggleLikeAction(review.id)
    })
  }

  const date = new Date(review.created_at).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })

  return (
    <div className="rounded-lg border border-border bg-surface p-4">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-elevated text-xs font-medium text-text-muted">
            {review.user.avatar_url ? (
              <img
                src={review.user.avatar_url}
                alt={review.user.username ?? ''}
                className="h-full w-full rounded-full object-cover"
              />
            ) : (
              (review.user.username ?? '?').charAt(0).toUpperCase()
            )}
          </div>
          <div>
            <span className="text-sm font-medium text-text-primary">
              {review.user.display_name ?? review.user.username}
            </span>
            <span className="ml-2 text-xs text-text-muted">{date}</span>
          </div>
        </div>

        {review.score && (
          <span className={`font-mono text-sm font-bold ${getCrystalColor(review.score)}`}>
            {formatScore(review.score)}
          </span>
        )}
      </div>

      {/* Spoiler warning */}
      {review.has_spoilers && (
        <div className="mt-2 rounded-md bg-warning/10 px-3 py-1 text-xs text-warning">
          {t('spoilerWarning')}
        </div>
      )}

      {/* Content */}
      <p className={`mt-3 text-sm leading-relaxed text-text-secondary ${review.is_micro ? '' : 'whitespace-pre-line'}`}>
        {review.content}
      </p>

      {/* Actions */}
      <div className="mt-3 flex items-center gap-4">
        <button
          onClick={handleLike}
          disabled={isPending || !currentUserId}
          className="flex items-center gap-1 text-xs text-text-muted transition-colors hover:text-crystal-red disabled:opacity-50"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
          </svg>
          {review.likes_count > 0 && review.likes_count}
        </button>
      </div>
    </div>
  )
}
