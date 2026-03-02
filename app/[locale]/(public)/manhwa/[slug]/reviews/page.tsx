import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { getManhwaBySlug } from '@/lib/db/manhwa'
import { getReviewsForManhwa } from '@/lib/db/review'
import { getUser } from '@/lib/auth/session'
import { ReviewCard } from '@/components/features/ReviewCard'
import { ReviewForm } from '@/components/features/ReviewForm'

interface ReviewsPageProps {
  params: Promise<{ locale: string; slug: string }>
  searchParams: Promise<{ sort?: string; page?: string }>
}

export async function generateMetadata({
  params,
}: ReviewsPageProps): Promise<Metadata> {
  const { locale, slug } = await params
  const manhwa = await getManhwaBySlug(slug)
  if (!manhwa) return { title: 'Not Found' }
  const title = locale === 'fr' ? (manhwa.title_fr ?? manhwa.title_en) : manhwa.title_en
  return {
    title: `${title} Reviews — ManhwaVerse`,
  }
}

export default async function ReviewsPage({ params, searchParams }: ReviewsPageProps) {
  const { locale, slug } = await params
  const { sort = 'popular', page = '1' } = await searchParams
  const manhwa = await getManhwaBySlug(slug)
  if (!manhwa) notFound()

  const t = await getTranslations({ locale, namespace: 'manhwa' })
  const tReview = await getTranslations({ locale, namespace: 'review' })
  const user = await getUser()

  const sortBy = sort === 'recent' ? 'recent' : 'popular'
  const currentPage = Math.max(1, parseInt(page, 10) || 1)
  const { reviews, total } = await getReviewsForManhwa(manhwa.id, sortBy, currentPage, 20)

  const longReviews = reviews.filter((r) => !r.is_micro)
  const microReviews = reviews.filter((r) => r.is_micro)

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-display text-lg font-semibold">
          {t('reviews')} ({total})
        </h2>
        <div className="flex gap-2">
          <a
            href={`/${locale}/manhwa/${slug}/reviews?sort=popular`}
            className={`rounded-md px-3 py-1 text-sm ${
              sortBy === 'popular'
                ? 'bg-accent text-white'
                : 'bg-elevated text-text-muted hover:text-text-primary'
            }`}
          >
            {tReview('popular')}
          </a>
          <a
            href={`/${locale}/manhwa/${slug}/reviews?sort=recent`}
            className={`rounded-md px-3 py-1 text-sm ${
              sortBy === 'recent'
                ? 'bg-accent text-white'
                : 'bg-elevated text-text-muted hover:text-text-primary'
            }`}
          >
            {tReview('recent')}
          </a>
        </div>
      </div>

      {user && (
        <div className="mb-6">
          <ReviewForm manhwaId={manhwa.id} hasExistingReviews={total > 0} />
        </div>
      )}

      {reviews.length === 0 && (
        <p className="text-sm text-text-muted">No reviews yet. Be the first!</p>
      )}

      {/* Long reviews */}
      {longReviews.length > 0 && (
        <div className="mb-8 space-y-4">
          {microReviews.length > 0 && (
            <h3 className="text-sm font-semibold text-text-primary">{tReview('longReviews')}</h3>
          )}
          {longReviews.map((review) => (
            <ReviewCard
              key={review.id}
              review={review}
              currentUserId={user?.id}
              locale={locale}
              manhwaSlug={slug}
              preview={true}
            />
          ))}
        </div>
      )}

      {/* Micro reviews */}
      {microReviews.length > 0 && (
        <div>
          {longReviews.length > 0 && (
            <h3 className="mb-3 text-sm font-semibold text-text-primary">{tReview('quickReviews')}</h3>
          )}
          <div className="space-y-3">
            {microReviews.map((review) => (
              <ReviewCard
                key={review.id}
                review={review}
                currentUserId={user?.id}
              />
            ))}
          </div>
        </div>
      )}

      {/* Pagination */}
      {total > 20 && (
        <div className="mt-6 flex justify-center gap-2">
          {currentPage > 1 && (
            <a
              href={`/${locale}/manhwa/${slug}/reviews?sort=${sortBy}&page=${currentPage - 1}`}
              className="rounded-md bg-elevated px-4 py-2 text-sm text-text-primary hover:bg-border"
            >
              Previous
            </a>
          )}
          {currentPage * 20 < total && (
            <a
              href={`/${locale}/manhwa/${slug}/reviews?sort=${sortBy}&page=${currentPage + 1}`}
              className="rounded-md bg-elevated px-4 py-2 text-sm text-text-primary hover:bg-border"
            >
              Next
            </a>
          )}
        </div>
      )}
    </div>
  )
}
