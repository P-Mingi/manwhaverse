import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getTranslations } from 'next-intl/server'
import { getReviewById } from '@/lib/db/review'
import { getManhwaBySlug } from '@/lib/db/manhwa'
import { getUser } from '@/lib/auth/session'
import { formatScore, getCrystalColor } from '@/lib/utils/formatScore'
import { ReviewCard } from '@/components/features/ReviewCard'

interface Props {
  params: Promise<{ locale: string; slug: string; reviewId: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { reviewId, slug } = await params
  const review = await getReviewById(reviewId)
  if (!review) return { title: 'Not Found' }

  const manhwa = await getManhwaBySlug(slug)
  const manhwaTitle = manhwa?.title_en ?? slug

  const title = review.title
    ? `${review.title} — ${manhwaTitle}`
    : `${manhwaTitle} review by ${review.user.username ?? 'anonymous'}`

  return {
    title: `${title} — ManhwaVerse`,
    description: review.content.slice(0, 155) + (review.content.length > 155 ? '…' : ''),
    openGraph: {
      title,
      description: review.content.slice(0, 155) + (review.content.length > 155 ? '…' : ''),
      images: manhwa?.banner_url ? [manhwa.banner_url] : manhwa?.cover_url ? [manhwa.cover_url] : [],
    },
  }
}

export default async function ReviewPage({ params }: Props) {
  const { locale, slug, reviewId } = await params
  const [review, manhwa, user, t] = await Promise.all([
    getReviewById(reviewId),
    getManhwaBySlug(slug),
    getUser(),
    getTranslations({ locale, namespace: 'review' }),
  ])

  if (!review || !manhwa) notFound()

  const manhwaTitle = locale === 'fr' ? (manhwa.title_fr ?? manhwa.title_en) : manhwa.title_en

  const dimensions = [
    { label: t('scoreStory'), value: review.score_story },
    { label: t('scoreArt'), value: review.score_art },
    { label: t('scoreCharacters'), value: review.score_characters },
    { label: t('scoreWorld'), value: review.score_world },
  ].filter((d) => d.value !== null)

  return (
    <div className="min-h-screen">
      {/* Hero banner */}
      <div className="relative h-48 overflow-hidden md:h-64">
        {manhwa.banner_url ? (
          <img
            src={manhwa.banner_url}
            alt=""
            className="h-full w-full object-cover opacity-40"
          />
        ) : manhwa.cover_url ? (
          <img
            src={manhwa.cover_url}
            alt=""
            className="h-full w-full object-cover opacity-20 blur-md scale-110"
          />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-crystal-blue/20 to-elevated" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-base via-base/60 to-transparent" />

        {/* Overlay text */}
        <div className="absolute bottom-0 left-0 right-0 px-4 pb-4">
          <div className="mx-auto max-w-3xl">
            <Link
              href={`/${locale}/manhwa/${slug}`}
              className="text-xs font-medium uppercase tracking-wider text-text-muted transition-colors hover:text-crystal-blue"
            >
              {manhwaTitle}
            </Link>
            <p className="text-sm text-text-muted">
              {t('reviewBy', { username: review.user.display_name ?? review.user.username ?? 'anonymous' })}
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-3xl px-4 py-8">
        {/* Back link */}
        <Link
          href={`/${locale}/manhwa/${slug}/reviews`}
          className="mb-6 inline-flex items-center gap-1 text-sm text-text-muted transition-colors hover:text-text-primary"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          {t('allReviews')}
        </Link>

        {/* Full review card */}
        <ReviewCard
          review={review}
          currentUserId={user?.id}
          locale={locale}
          manhwaSlug={slug}
          preview={false}
        />

        {/* Score breakdown */}
        {(review.score || dimensions.length > 0) && (
          <div className="mt-6 rounded-lg border border-border bg-surface p-4">
            {review.score && (
              <div className="mb-4 text-center">
                <span className={`font-display text-4xl font-bold ${getCrystalColor(review.score)}`}>
                  {formatScore(review.score)}
                </span>
                <span className="ml-1 text-sm text-text-muted">/10</span>
              </div>
            )}

            {dimensions.length > 0 && (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {dimensions.map(({ label, value }) => (
                  <div key={label} className="text-center">
                    <div className={`text-lg font-bold ${getCrystalColor(value!)}`}>
                      {formatScore(value!)}
                    </div>
                    <div className="text-xs text-text-muted">{label}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
