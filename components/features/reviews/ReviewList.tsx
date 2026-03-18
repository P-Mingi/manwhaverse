import Link from 'next/link'
import { ReviewCard } from './ReviewCard'
import type { ReviewWithUser } from '@/lib/db/review'

interface Props {
  reviews: ReviewWithUser[]
  manhwaSlug: string
  locale: string
  showMore?: boolean
  title?: string
}

export function ReviewList({ reviews, manhwaSlug, locale, showMore, title }: Props) {
  if (reviews.length === 0) {
    return (
      <div>
        {title && <h2 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{title}</h2>}
        <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
          {locale === 'fr' ? 'Pas encore d\'avis.' : 'No reviews yet.'}
        </p>
      </div>
    )
  }

  return (
    <div>
      {title && (
        <h2 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          {title}
        </h2>
      )}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {reviews.map((review) => (
          <ReviewCard key={review.id} review={review} locale={locale} />
        ))}
      </div>
      {showMore && (
        <Link
          href={`/${locale}/manhwa/${manhwaSlug}/reviews`}
          style={{
            display: 'block',
            marginTop: '0.75rem',
            fontSize: '13px',
            color: 'var(--accent)',
            textDecoration: 'none',
            fontWeight: 600,
          }}
        >
          {locale === 'fr' ? 'Voir tous les avis →' : 'See all reviews →'}
        </Link>
      )}
    </div>
  )
}
