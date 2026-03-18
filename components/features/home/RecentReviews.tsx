import Link from 'next/link'
import { Avatar } from '@/components/ui/Avatar'
import { StarRating } from '@/components/ui/StarRating'
import type { ReviewWithManhwa } from '@/lib/db/review'

interface Props {
  reviews: ReviewWithManhwa[]
  locale: string
}

export function RecentReviews({ reviews, locale }: Props) {
  if (reviews.length === 0) return null

  return (
    <div>
      <h2 style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        {locale === 'fr' ? 'Avis récents' : 'Recent Reviews'}
      </h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {reviews.map((review) => {
          const title = locale === 'fr' && review.manhwa.title_fr ? review.manhwa.title_fr : review.manhwa.title_en
          return (
            <div key={review.id} className="card" style={{ padding: '0.75rem' }}>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.5rem' }}>
                <Avatar src={review.user.avatar_url} username={review.user.username} size={28} />
                <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                  <strong style={{ color: 'var(--text-primary)' }}>{review.user.display_name ?? review.user.username}</strong>
                  {' '}{locale === 'fr' ? 'a noté' : 'reviewed'}{' '}
                  <Link href={`/${locale}/manhwa/${review.manhwa.slug}`} style={{ color: 'var(--accent)', textDecoration: 'none', fontWeight: 600 }}>
                    {title}
                  </Link>
                </span>
                {review.score && <StarRating score={review.score} size="sm" />}
              </div>
              <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical' }}>
                {review.content}
              </p>
            </div>
          )
        })}
      </div>
    </div>
  )
}
