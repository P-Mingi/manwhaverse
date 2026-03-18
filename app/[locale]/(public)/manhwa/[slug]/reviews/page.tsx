import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getManhwaBySlug } from '@/lib/db/manhwa'
import { getReviewsForManhwa } from '@/lib/db/review'
import { getUser } from '@/lib/auth/session'
import { ReviewCard } from '@/components/features/reviews/ReviewCard'
import { ReviewForm } from '@/components/features/reviews/ReviewForm'

export const revalidate = 300

interface ReviewsPageProps {
  params: Promise<{ locale: string; slug: string }>
  searchParams: Promise<{ sort?: string; page?: string }>
}

export async function generateMetadata({ params }: ReviewsPageProps): Promise<Metadata> {
  const { locale, slug } = await params
  const manhwa = await getManhwaBySlug(slug)
  if (!manhwa) return { title: 'Not Found' }
  const title = locale === 'fr' ? (manhwa.title_fr ?? manhwa.title_en) : manhwa.title_en
  return { title: `${title} — ${locale === 'fr' ? 'Avis' : 'Reviews'}` }
}

export default async function ReviewsPage({ params, searchParams }: ReviewsPageProps) {
  const { locale, slug } = await params
  const { sort = 'popular', page = '1' } = await searchParams
  const manhwa = await getManhwaBySlug(slug)
  if (!manhwa) notFound()

  const user = await getUser()
  const sortBy = sort === 'recent' ? 'recent' : 'popular'
  const currentPage = Math.max(1, parseInt(page, 10) || 1)
  const { reviews, total } = await getReviewsForManhwa(manhwa.id, sortBy, currentPage, 20)

  const longReviews = reviews.filter((r) => !r.is_micro)
  const microReviews = reviews.filter((r) => r.is_micro)

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <h2 className="font-display" style={{ margin: 0, fontSize: '1rem', color: 'var(--text-primary)' }}>
          {locale === 'fr' ? `Avis (${total})` : `Reviews (${total})`}
        </h2>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {(['popular', 'recent'] as const).map((s) => (
            <a
              key={s}
              href={`/${locale}/manhwa/${slug}/reviews?sort=${s}`}
              style={{
                padding: '0.25rem 0.75rem',
                borderRadius: 6,
                fontSize: '12px',
                textDecoration: 'none',
                background: sortBy === s ? 'var(--accent)' : 'var(--bg-elevated)',
                color: sortBy === s ? 'var(--accent-text)' : 'var(--text-muted)',
                fontWeight: sortBy === s ? 700 : 500,
              }}
            >
              {s === 'popular' ? (locale === 'fr' ? 'Populaires' : 'Popular') : (locale === 'fr' ? 'Récents' : 'Recent')}
            </a>
          ))}
        </div>
      </div>

      {user && (
        <div style={{ marginBottom: '1.5rem' }}>
          <ReviewForm manhwaId={manhwa.id} />
        </div>
      )}

      {reviews.length === 0 && (
        <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
          {locale === 'fr' ? 'Aucun avis. Soyez le premier !' : 'No reviews yet. Be the first!'}
        </p>
      )}

      {longReviews.length > 0 && (
        <div style={{ marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {microReviews.length > 0 && (
            <p style={{ margin: 0, fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
              {locale === 'fr' ? 'Avis détaillés' : 'Detailed Reviews'}
            </p>
          )}
          {longReviews.map((review) => (
            <ReviewCard key={review.id} review={review} locale={locale} />
          ))}
        </div>
      )}

      {microReviews.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {longReviews.length > 0 && (
            <p style={{ margin: 0, fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
              {locale === 'fr' ? 'Avis rapides' : 'Quick Reviews'}
            </p>
          )}
          {microReviews.map((review) => (
            <ReviewCard key={review.id} review={review} locale={locale} />
          ))}
        </div>
      )}

      {total > 20 && (
        <div style={{ marginTop: '1.5rem', display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
          {currentPage > 1 && (
            <a href={`/${locale}/manhwa/${slug}/reviews?sort=${sortBy}&page=${currentPage - 1}`} className="btn-secondary" style={{ textDecoration: 'none' }}>
              ‹ {locale === 'fr' ? 'Précédent' : 'Previous'}
            </a>
          )}
          {currentPage * 20 < total && (
            <a href={`/${locale}/manhwa/${slug}/reviews?sort=${sortBy}&page=${currentPage + 1}`} className="btn-secondary" style={{ textDecoration: 'none' }}>
              {locale === 'fr' ? 'Suivant' : 'Next'} ›
            </a>
          )}
        </div>
      )}
    </div>
  )
}
