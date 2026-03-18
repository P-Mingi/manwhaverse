import Link from 'next/link'
import {
  getTrendingManhwas,
  getHiddenGems,
  getStats,
} from '@/lib/db/home'
import { getTopRankedManhwas } from '@/lib/db/ranking'
import { getPublicFeed } from '@/lib/db/activity'
import { getRecentReviews } from '@/lib/db/review'
import { TrendingSection } from '@/components/features/home/TrendingSection'
import { RankingsSidebar } from '@/components/features/home/RankingsSidebar'
import { ActivityFeed } from '@/components/features/home/ActivityFeed'
import { RecentReviews } from '@/components/features/home/RecentReviews'
import { ManhwaCard } from '@/components/features/manhwa/ManhwaCard'

export const revalidate = 300

interface HomeProps {
  params: Promise<{ locale: string }>
}

export default async function HomePage({ params }: HomeProps) {
  const { locale } = await params

  let stats = { manhwaCount: 0, genreCount: 0, tropeCount: 0, userCount: 0, reviewCount: 0 }
  let trending = [] as Awaited<ReturnType<typeof getTrendingManhwas>>
  let hiddenGems = [] as Awaited<ReturnType<typeof getHiddenGems>>
  let ranked = [] as Awaited<ReturnType<typeof getTopRankedManhwas>>
  let activities = [] as Awaited<ReturnType<typeof getPublicFeed>>['activities']
  let reviews = [] as Awaited<ReturnType<typeof getRecentReviews>>

  try {
    const [s, tr, hg, r, feed, rev] = await Promise.all([
      getStats(),
      getTrendingManhwas(locale, 5),
      getHiddenGems(6),
      getTopRankedManhwas(10, locale),
      getPublicFeed(1, 8),
      getRecentReviews(4),
    ])
    stats = s
    trending = tr
    hiddenGems = hg
    ranked = r
    activities = feed.activities
    reviews = rev
  } catch {
    // DB unavailable — render with empty data
  }

  const formatCount = (n: number) =>
    n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n)

  return (
    <>
      {/* Hero */}
      <section
        style={{
          background: 'var(--bg-surface)',
          borderBottom: '1px solid var(--border)',
          padding: '3rem 1rem',
        }}
      >
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <div style={{ maxWidth: 600 }}>
            <p style={{ margin: '0 0 0.75rem', fontSize: '11px', fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              {locale === 'fr' ? 'La référence manhwa' : 'The manhwa reference'}
            </p>
            <h1
              className="font-display"
              style={{ margin: '0 0 1rem', fontSize: 'clamp(2rem, 5vw, 3.5rem)', color: 'var(--text-primary)', lineHeight: 1.1 }}
            >
              {locale === 'fr' ? 'Découvrez les meilleurs manhwas' : 'Discover the best manhwas'}
            </h1>
            <p style={{ margin: '0 0 1.5rem', fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              {locale === 'fr'
                ? `${formatCount(stats.manhwaCount)} titres · ${formatCount(stats.userCount)} lecteurs · ${formatCount(stats.reviewCount)} avis`
                : `${formatCount(stats.manhwaCount)} titles · ${formatCount(stats.userCount)} readers · ${formatCount(stats.reviewCount)} reviews`}
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <Link href={`/${locale}/explore`} className="btn-primary" style={{ textDecoration: 'none' }}>
                {locale === 'fr' ? 'Explorer →' : 'Explore →'}
              </Link>
              <Link href={`/${locale}/top`} className="btn-secondary" style={{ textDecoration: 'none' }}>
                {locale === 'fr' ? 'Classement' : 'Rankings'}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Trending */}
      {trending.length > 0 && <TrendingSection manhwas={trending} locale={locale} />}

      {/* Main content */}
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '2rem 1rem' }}>
        {/* Two-column: Rankings + Activity */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 1fr)',
            gap: '2rem',
            alignItems: 'start',
          }}
        >
          <RankingsSidebar manhwas={ranked} locale={locale} />
          <ActivityFeed activities={activities} locale={locale} />
        </div>

        {/* Recent Reviews */}
        {reviews.length > 0 && (
          <div style={{ marginTop: '2rem' }}>
            <RecentReviews reviews={reviews} locale={locale} />
          </div>
        )}

        {/* Hidden Gems */}
        {hiddenGems.length > 0 && (
          <div style={{ marginTop: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <h2 style={{ margin: 0, fontSize: '13px', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {locale === 'fr' ? 'Pépites cachées' : 'Hidden Gems'}
              </h2>
              <Link
                href={`/${locale}/explore?sort=score`}
                style={{ fontSize: '11px', color: 'var(--accent)', textDecoration: 'none', fontWeight: 600 }}
              >
                {locale === 'fr' ? 'Voir tout →' : 'See all →'}
              </Link>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '1rem' }}>
              {hiddenGems.map((m, i) => (
                <ManhwaCard key={m.id} manhwa={m} locale={locale} priority={i < 3} />
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  )
}
