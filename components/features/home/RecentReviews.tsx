import Link from 'next/link'
import { Avatar } from '@/components/ui/Avatar'
import { StarRating } from '@/components/ui/StarRating'
import { SectionHeader } from '@/components/ui/SectionHeader'
import type { ReviewWithManhwa } from '@/lib/db/review'

interface Props {
  reviews: ReviewWithManhwa[]
  locale: string
}

export function RecentReviews({ reviews, locale }: Props) {
  if (reviews.length === 0) return null

  return (
    <div>
      <SectionHeader
        title={locale === 'fr' ? 'Avis récents' : 'Recent Reviews'}
        href={`/${locale}/explore`}
        seeAllLabel={locale === 'fr' ? 'Voir tout →' : 'See all →'}
      />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {reviews.map((review) => {
          const title = locale === 'fr' && review.manhwa.title_fr ? review.manhwa.title_fr : review.manhwa.title_en
          return (
            <div key={review.id} style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              borderRadius: '10px',
              padding: '14px',
              display: 'flex',
              gap: '12px',
            }}>
              {/* Left: avatar + meta + text */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', flexWrap: 'wrap' }}>
                  <Avatar src={review.user.avatar_url} username={review.user.username} size={28} />
                  <span style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                    <Link href={`/${locale}/profile/${review.user.username}`} style={{ color: 'var(--text-primary)', fontWeight: 700, textDecoration: 'none' }}>{review.user.display_name ?? review.user.username}</Link>
                    {' '}{locale === 'fr' ? 'a noté' : 'reviewed'}{' '}
                    <Link href={`/${locale}/manhwa/${review.manhwa.slug}`} style={{ color: 'var(--accent)', textDecoration: 'none', fontWeight: 600 }}>
                      {title}
                    </Link>
                  </span>
                  {review.score && <StarRating score={review.score} size="sm" />}
                </div>
                <p style={{
                  margin: 0, fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.6,
                  display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden',
                }}>
                  {review.content}
                </p>
              </div>

              {/* Right: manhwa cover thumbnail */}
              <div style={{ flexShrink: 0 }}>
                <Link href={`/${locale}/manhwa/${review.manhwa.slug}`} style={{ display: 'block' }}>
                  <div style={{ width: '44px', height: '62px', borderRadius: '6px', overflow: 'hidden', background: 'var(--bg-elevated)' }}>
                    {review.manhwa.cover_url && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={review.manhwa.cover_url}
                        alt={title}
                        loading="lazy"
                        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                      />
                    )}
                  </div>
                </Link>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
