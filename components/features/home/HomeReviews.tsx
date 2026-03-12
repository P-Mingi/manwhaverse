import type { ReviewWithManhwa } from '@/lib/db/review'
import { HomeReviewCard } from './HomeReviewCard'

interface HomeReviewsProps {
  locale: string
  reviews: ReviewWithManhwa[]
}

export function HomeReviews({ locale, reviews }: HomeReviewsProps) {
  if (reviews.length === 0) return null

  return (
    <div className="reviews-grid">
      {reviews.map((review) => (
        <HomeReviewCard key={review.id} review={review} locale={locale} />
      ))}
    </div>
  )
}
