import Image from 'next/image'
import Link from 'next/link'
import type { ReviewWithManhwa } from '@/lib/db/review'

const REACTION_MAP: Record<string, { emoji: string; label: string }> = {
  HEOL:    { emoji: '😱', label: '헐' },
  DAEBAK:  { emoji: '🤩', label: '대박' },
  GAMDONG: { emoji: '😭', label: '감동' },
  KINGBAT: { emoji: '😤', label: '킹받' },
  MICHYEO: { emoji: '🤯', label: '미쳤' },
  JUKGET:  { emoji: '💀', label: '죽겠' },
}

function aggregateReactions(reactions: { reaction: string }[]) {
  const counts: Record<string, number> = {}
  for (const r of reactions) counts[r.reaction] = (counts[r.reaction] ?? 0) + 1
  return Object.entries(counts)
    .map(([type, count]) => ({ type, count, ...(REACTION_MAP[type] ?? { emoji: '', label: type }) }))
    .sort((a, b) => b.count - a.count)
}

function timeAgo(date: Date) {
  const secs = Math.floor((Date.now() - date.getTime()) / 1000)
  if (secs < 60) return `${secs}s`
  const mins = Math.floor(secs / 60)
  if (mins < 60) return `${mins}m`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h`
  return `${Math.floor(hours / 24)}d`
}

interface Props {
  review: ReviewWithManhwa
  locale: string
}

export function HomeReviewCard({ review, locale }: Props) {
  const username = review.user.display_name ?? review.user.username ?? '?'
  const reactionList = aggregateReactions(review.reactions ?? []).slice(0, 3)
  const manhwaTitle = review.manhwa
    ? (locale === 'fr' ? review.manhwa.title_fr ?? review.manhwa.title_en : review.manhwa.title_en)
    : null

  return (
    <article className="review-card">
      {/* Row 1: header */}
      <div className="review-header">
        <div className="review-avatar">
          {review.user.avatar_url ? (
            <Image
              src={review.user.avatar_url}
              width={32}
              height={32}
              alt={username}
              className="w-full h-full object-cover"
            />
          ) : (
            <span>{username[0]?.toUpperCase()}</span>
          )}
        </div>
        <div>
          <div className="review-user">{username}</div>
          <div className="review-time">{timeAgo(review.created_at)}</div>
        </div>
        {review.score != null && (
          <div className="review-score-inline">★ {review.score.toFixed(1)}</div>
        )}
      </div>

      {/* Row 2: manhwa reference */}
      {review.manhwa && (
        <Link href={`/${locale}/manhwa/${review.manhwa.slug}`} className="review-manhwa">
          <div className="review-manhwa-thumb">
            {review.manhwa.cover_url && (
              <Image
                src={review.manhwa.cover_url}
                width={32}
                height={44}
                alt=""
                className="w-full h-full object-cover"
              />
            )}
          </div>
          <div className="review-manhwa-title">{manhwaTitle}</div>
        </Link>
      )}

      {/* Row 3: text */}
      <p className="review-text">{review.content}</p>

      {/* Row 4: reactions */}
      {reactionList.length > 0 && (
        <div className="review-reactions">
          {reactionList.map((r) => (
            <span key={r.type} className="reaction-chip">
              {r.emoji} {r.label} {r.count}
            </span>
          ))}
        </div>
      )}
    </article>
  )
}
