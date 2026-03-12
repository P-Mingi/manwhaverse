import { getRecentReviews } from '@/lib/db/review'
import { HomeReviewCard } from './HomeReviewCard'

interface HomeReviewsProps {
  locale: string
}

export async function HomeReviews({ locale }: HomeReviewsProps) {
  let reviews: Awaited<ReturnType<typeof getRecentReviews>> = []
  try {
    reviews = await getRecentReviews(4)
  } catch {
    return null
  }
  if (reviews.length === 0) return null

  return (
    <div className="reviews-grid">
      {reviews.map((review) => (
        <HomeReviewCard key={review.id} review={review} locale={locale} />
      ))}
    </div>
  )
}
