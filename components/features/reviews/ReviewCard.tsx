import { Avatar } from '@/components/ui/Avatar'
import { Badge } from '@/components/ui/Badge'
import { StarRating } from '@/components/ui/StarRating'
import type { ReviewWithUser } from '@/lib/db/review'

interface Props {
  review: ReviewWithUser
  locale: string
}

export function ReviewCard({ review, locale }: Props) {
  const user = review.user
  const date = new Date(review.created_at).toLocaleDateString(locale === 'fr' ? 'fr-FR' : 'en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })

  return (
    <div
      className="card"
      style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <Avatar src={user.avatar_url} username={user.username} size={36} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ margin: 0, fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
            {user.display_name ?? user.username ?? 'User'}
          </p>
          <p style={{ margin: 0, fontSize: '11px', color: 'var(--text-muted)' }}>{date}</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
          {review.score && <StarRating score={review.score} size="sm" />}
          {review.is_micro && <Badge variant="type">Quick</Badge>}
          {review.has_spoilers && <Badge variant="danger">Spoilers</Badge>}
        </div>
      </div>

      {review.title && (
        <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)' }}>
          {review.title}
        </h3>
      )}

      <p style={{ margin: 0, fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.7 }}>
        {review.content}
      </p>

      {review.likes_count > 0 && (
        <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
          👍 {review.likes_count}
        </div>
      )}
    </div>
  )
}
