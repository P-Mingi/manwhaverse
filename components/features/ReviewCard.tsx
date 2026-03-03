'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import type { ReviewWithUser } from '@/lib/db/review'
import type { KoreanReaction } from '@prisma/client'
import { toggleLikeAction, toggleDislikeAction, toggleReactionAction, adminDeleteReviewAction } from '@/lib/actions/review'
import { formatScore, getCrystalColor } from '@/lib/utils/formatScore'

interface ReviewCardProps {
  review: ReviewWithUser
  currentUserId?: string
  isAdmin?: boolean
  locale?: string
  manhwaSlug?: string
  preview?: boolean  // truncate long reviews with "read more" link
}

const REACTIONS: { key: KoreanReaction; emoji: string; kr: string }[] = [
  { key: 'HEOL', emoji: '🫠', kr: '헐' },
  { key: 'DAEBAK', emoji: '😤', kr: '대박' },
  { key: 'GAMDONG', emoji: '😭', kr: '감동' },
  { key: 'KINGBAT', emoji: '😤', kr: '킹받' },
  { key: 'MICHYEO', emoji: '🤯', kr: '미쳤' },
  { key: 'JUKGET', emoji: '💀', kr: '죽겠' },
]

const PREVIEW_LENGTH = 180

export function ReviewCard({ review, currentUserId, isAdmin = false, locale, manhwaSlug, preview = false }: ReviewCardProps) {
  const t = useTranslations('review')
  const [isPending, startTransition] = useTransition()
  const [deleted, setDeleted] = useState(false)
  const [likesCount, setLikesCount] = useState(review.likes_count)
  const [dislikesCount, setDislikesCount] = useState(review.dislikes_count)

  const initialCounts: Record<KoreanReaction, number> = {
    HEOL: 0, DAEBAK: 0, GAMDONG: 0, KINGBAT: 0, MICHYEO: 0, JUKGET: 0,
  }
  const initialUserReactions = new Set<KoreanReaction>()
  for (const r of review.reactions) {
    initialCounts[r.reaction]++
    if (r.user_id === currentUserId) {
      initialUserReactions.add(r.reaction)
    }
  }

  const [reactionCounts, setReactionCounts] = useState(initialCounts)
  const [userReactions, setUserReactions] = useState(initialUserReactions)

  function handleLike() {
    startTransition(async () => {
      const result = await toggleLikeAction(review.id)
      if (result.success) {
        setLikesCount(prev => result.liked ? prev + 1 : prev - 1)
      }
    })
  }

  function handleDislike() {
    startTransition(async () => {
      const result = await toggleDislikeAction(review.id)
      if (result.success) {
        setDislikesCount(prev => result.disliked ? prev + 1 : prev - 1)
      }
    })
  }

  function handleReaction(reaction: KoreanReaction) {
    const wasActive = userReactions.has(reaction)
    setUserReactions(prev => {
      const next = new Set(prev)
      if (wasActive) next.delete(reaction)
      else next.add(reaction)
      return next
    })
    setReactionCounts(prev => ({
      ...prev,
      [reaction]: prev[reaction] + (wasActive ? -1 : 1),
    }))
    startTransition(async () => {
      await toggleReactionAction(review.id, reaction)
    })
  }

  function handleAdminDelete() {
    if (!confirm('Delete this review?')) return
    startTransition(async () => {
      await adminDeleteReviewAction(review.id)
      setDeleted(true)
    })
  }

  const date = new Date(review.created_at).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })

  const isLong = !review.is_micro
  const shouldTruncate = preview && isLong && review.content.length > PREVIEW_LENGTH
  const displayContent = shouldTruncate
    ? review.content.slice(0, PREVIEW_LENGTH).trimEnd() + '…'
    : review.content

  const reviewHref = locale && manhwaSlug
    ? `/${locale}/manhwa/${manhwaSlug}/review/${review.id}`
    : null

  const totalVotes = likesCount + dislikesCount

  if (deleted) return null

  return (
    <div className="rounded-lg border border-white/5 bg-[#0d0d16] p-4 transition-colors hover:border-[rgba(0,255,255,0.15)]">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          {locale && review.user.username ? (
            <Link href={`/${locale}/profile/${review.user.username}`} className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-elevated text-xs font-medium text-text-muted overflow-hidden hover:opacity-80">
              {review.user.avatar_url ? (
                <img src={review.user.avatar_url} alt={review.user.username} className="h-full w-full rounded-full object-cover" />
              ) : (
                review.user.username.charAt(0).toUpperCase()
              )}
            </Link>
          ) : (
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-elevated text-xs font-medium text-text-muted overflow-hidden">
              {review.user.avatar_url ? (
                <img src={review.user.avatar_url} alt={review.user.username ?? ''} className="h-full w-full rounded-full object-cover" />
              ) : (
                (review.user.username ?? '?').charAt(0).toUpperCase()
              )}
            </div>
          )}
          <div>
            {locale && review.user.username ? (
              <Link href={`/${locale}/profile/${review.user.username}`} className="text-sm font-medium text-[#e8e8f0] hover:text-[#00ffff]">
                {review.user.display_name ?? review.user.username}
              </Link>
            ) : (
              <span className="text-sm font-medium text-text-primary">
                {review.user.display_name ?? review.user.username}
              </span>
            )}
            <span className="ml-2 text-xs text-text-muted">{date}</span>
          </div>
        </div>

        {review.score && (
          <span className="font-mono text-sm font-bold text-[#00ffff]">
            {formatScore(review.score)}
          </span>
        )}
      </div>

      {/* Title — long reviews */}
      {isLong && review.title && (
        <p className="mt-2 text-sm font-semibold text-text-primary">{review.title}</p>
      )}

      {/* Spoiler warning */}
      {review.has_spoilers && (
        <div className="mt-2 rounded-md bg-warning/10 px-3 py-1 text-xs text-warning">
          {t('spoilerWarning')}
        </div>
      )}

      {/* Content */}
      <p className={`mt-2 text-sm leading-relaxed text-text-secondary ${isLong ? 'whitespace-pre-line' : ''}`}>
        {displayContent}
      </p>

      {/* Read full review link */}
      {shouldTruncate && reviewHref && (
        <Link
          href={reviewHref}
          className="mt-1 inline-block text-xs text-[#00ffff] hover:underline"
        >
          {t('readFull')}
        </Link>
      )}

      {/* Korean reactions */}
      <div className="mt-3 flex flex-wrap items-center gap-1.5">
        {REACTIONS.map(({ key, emoji, kr }) => {
          const count = reactionCounts[key]
          const isActive = userReactions.has(key)
          return (
            <button
              key={key}
              onClick={() => handleReaction(key)}
              disabled={isPending || !currentUserId}
              className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] transition-colors disabled:opacity-50 ${
                isActive
                  ? 'bg-[rgba(0,255,255,0.15)] text-[#00ffff]'
                  : 'bg-[#111120] text-[#6b6b88] hover:bg-[rgba(0,255,255,0.06)]'
              }`}
            >
              <span>{emoji}</span>
              <span>{kr}</span>
              {count > 0 && <span className="font-mono">{count}</span>}
            </button>
          )
        })}
      </div>

      {/* Like / Dislike */}
      <div className="mt-2 flex items-center gap-4">
        <button
          onClick={handleLike}
          disabled={isPending || !currentUserId}
          className="flex items-center gap-1 text-xs text-[#6b6b88] transition-colors hover:text-[#00ffff] disabled:opacity-50"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 9V5a3 3 0 00-3-3l-4 9v11h11.28a2 2 0 002-1.7l1.38-9a2 2 0 00-2-2.3H14z" />
            <path d="M7 22H4a2 2 0 01-2-2v-7a2 2 0 012-2h3" />
          </svg>
          {likesCount > 0 && likesCount}
        </button>

        <button
          onClick={handleDislike}
          disabled={isPending || !currentUserId}
          className="flex items-center gap-1 text-xs text-text-muted transition-colors hover:text-error disabled:opacity-50"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10 15v4a3 3 0 003 3l4-9V2H5.72a2 2 0 00-2 1.7l-1.38 9a2 2 0 002 2.3H10z" />
            <path d="M17 2h2.67A2.31 2.31 0 0122 4v7a2.31 2.31 0 01-2.33 2H17" />
          </svg>
          {dislikesCount > 0 && dislikesCount}
        </button>

        {totalVotes > 0 && (
          <span className="text-xs text-text-muted">
            {t('helpfulCount', { likes: likesCount, total: totalVotes })}
          </span>
        )}

        {/* Link to full review */}
        {isLong && reviewHref && !shouldTruncate && (
          <Link
            href={reviewHref}
            className="ml-auto text-xs text-[#6b6b88] transition-colors hover:text-[#00ffff]"
          >
            {t('readFull')}
          </Link>
        )}

        {/* Admin delete */}
        {isAdmin && (
          <button
            onClick={handleAdminDelete}
            disabled={isPending}
            className="ml-auto text-xs text-error/60 transition-colors hover:text-error disabled:opacity-50"
          >
            Delete
          </button>
        )}
      </div>
    </div>
  )
}
