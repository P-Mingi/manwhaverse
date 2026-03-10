import Image from 'next/image'
import Link from 'next/link'
import { getRecentReviews } from '@/lib/db/review'
import { formatScore } from '@/lib/utils/formatScore'

interface HomeReviewsProps {
  locale: string
}

export async function HomeReviews({ locale }: HomeReviewsProps) {
  let reviews: Awaited<ReturnType<typeof getRecentReviews>> = []
  try {
    reviews = await getRecentReviews(6)
  } catch {
    return null
  }
  if (reviews.length === 0) return null

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {reviews.map((review) => {
        const username = review.user.display_name ?? review.user.username ?? '?'
        const manhwaTitle = review.manhwa
          ? (locale === 'fr' ? review.manhwa.title_fr ?? review.manhwa.title_en : review.manhwa.title_en)
          : null

        return (
          <article
            key={review.id}
            className="flex flex-col gap-3 rounded-lg border border-electric-border bg-card p-4"
          >
            {/* Manhwa ref */}
            {review.manhwa && (
              <Link
                href={`/${locale}/manhwa/${review.manhwa.slug}`}
                className="group flex items-center gap-3"
              >
                {review.manhwa.cover_url && (
                  <div className="relative h-12 w-8 flex-shrink-0 overflow-hidden rounded">
                    <Image
                      src={review.manhwa.cover_url}
                      alt={manhwaTitle ?? ''}
                      fill
                      sizes="32px"
                      className="object-cover"
                    />
                  </div>
                )}
                <p className="line-clamp-1 text-xs font-medium text-text-secondary transition-colors group-hover:text-electric">
                  {manhwaTitle}
                </p>
              </Link>
            )}

            {/* Review text */}
            <p className="line-clamp-4 flex-1 text-xs leading-relaxed text-text-secondary">
              {review.content}
            </p>

            {/* Footer */}
            <div className="flex items-center justify-between border-t border-electric-border pt-3">
              <Link
                href={`/${locale}/profile/${review.user.username}`}
                className="flex items-center gap-2 transition-colors hover:text-electric"
              >
                {review.user.avatar_url ? (
                  <Image
                    src={review.user.avatar_url}
                    alt={username}
                    width={20}
                    height={20}
                    className="rounded-full object-cover ring-1 ring-electric-border"
                  />
                ) : (
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-elevated text-[9px] font-bold uppercase text-electric">
                    {username[0]}
                  </div>
                )}
                <span className="text-xs text-text-muted">{username}</span>
              </Link>
              {review.score != null && (
                <span className="font-mono text-xs font-bold text-gold">
                  ★ {formatScore(review.score)}
                </span>
              )}
            </div>
          </article>
        )
      })}
    </div>
  )
}
