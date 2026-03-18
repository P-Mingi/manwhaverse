import Link from 'next/link'
import {
  getTrendingManhwas,
  getHiddenGems,
  getRecentManhwas,
  getStats,
} from '@/lib/db/home'
import { getTopRankedManhwas } from '@/lib/db/ranking'
import { getPublicFeed } from '@/lib/db/activity'
import { getRecentReviews } from '@/lib/db/review'
import { getTopLists } from '@/lib/db/list'
import { TrendingSection } from '@/components/features/home/TrendingSection'
import { RankingsSidebar } from '@/components/features/home/RankingsSidebar'
import { ActivityFeed } from '@/components/features/home/ActivityFeed'
import { RecentReviews } from '@/components/features/home/RecentReviews'
import { ManhwaCard } from '@/components/features/manhwa/ManhwaCard'
import { SectionHeader } from '@/components/ui/SectionHeader'

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
  let topLists = [] as Awaited<ReturnType<typeof getTopLists>>
  let recentManhwas = [] as Awaited<ReturnType<typeof getRecentManhwas>>

  try {
    const [s, tr, hg, r, feed, rev, lists, recent] = await Promise.all([
      getStats(),
      getTrendingManhwas(locale, 5),
      getHiddenGems(6),
      getTopRankedManhwas(10, locale),
      getPublicFeed(1, 5),
      getRecentReviews(2),
      getTopLists(3),
      getRecentManhwas(6),
    ])
    stats = s
    trending = tr
    hiddenGems = hg
    ranked = r
    activities = feed.activities
    reviews = rev
    topLists = lists
    recentManhwas = recent
  } catch {
    // DB unavailable — render with empty data
  }

  const formatCount = (n: number) =>
    n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n)

  return (
    <>
      {/* ── HERO ── cinematic full-bleed strip */}
      <section style={{ position: 'relative', background: '#0a080e', overflow: 'hidden', marginBottom: 0 }}>
        {/* Background: up to 5 covers tiled, darkened */}
        {trending.length > 0 && (
          <div style={{
            position: 'absolute',
            inset: 0,
            display: 'grid',
            gridTemplateColumns: `repeat(${Math.min(trending.length, 5)}, 1fr)`,
            opacity: 0.35,
          }}>
            {trending.slice(0, 5).map((m) => (
              <div key={m.slug} style={{ position: 'relative', overflow: 'hidden' }}>
                {m.cover_url && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={m.cover_url}
                    alt=""
                    aria-hidden="true"
                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                  />
                )}
              </div>
            ))}
          </div>
        )}

        {/* Gradient overlay — readable left, covers visible right */}
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(90deg, rgba(10,8,14,0.97) 0%, rgba(10,8,14,0.75) 45%, rgba(10,8,14,0.15) 100%)',
        }} />

        {/* Content */}
        <div style={{
          position: 'relative',
          zIndex: 1,
          maxWidth: '1024px',
          margin: '0 auto',
          padding: '64px 24px',
        }}>
          <p style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--accent)', marginBottom: '12px', margin: '0 0 12px' }}>
            {locale === 'fr' ? 'La référence manhwa' : 'The manhwa reference'}
          </p>
          <h1
            className="font-display"
            style={{ fontSize: 'clamp(32px, 5vw, 52px)', fontWeight: 800, fontStyle: 'italic', color: '#fff', lineHeight: 1.1, margin: '0 0 12px' }}
          >
            {locale === 'fr' ? 'Découvrez les meilleurs manhwas' : 'Discover the best manhwas'}
          </h1>
          <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.5)', margin: '0 0 24px', maxWidth: '480px', lineHeight: 1.6 }}>
            {locale === 'fr'
              ? 'Suivez votre lecture, découvrez de nouvelles séries, partagez vos avis.'
              : 'Track your reading, discover new series, share your reviews.'}
          </p>

          {/* Stats row */}
          <div style={{ display: 'flex', gap: '28px', marginBottom: '28px', flexWrap: 'wrap' }}>
            {[
              { val: formatCount(stats.manhwaCount), lbl: locale === 'fr' ? 'titres' : 'titles' },
              { val: formatCount(stats.userCount), lbl: locale === 'fr' ? 'lecteurs' : 'readers' },
              { val: formatCount(stats.reviewCount), lbl: locale === 'fr' ? 'avis' : 'reviews' },
            ].map(({ val, lbl }) => (
              <div key={lbl}>
                <span style={{ display: 'block', fontSize: '20px', fontWeight: 800, color: '#fff' }}>{val}</span>
                <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.35)' }}>{lbl}</span>
              </div>
            ))}
          </div>

          {/* CTAs */}
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <Link href={`/${locale}/explore`} className="btn-primary" style={{ padding: '10px 22px', fontSize: '12px', textDecoration: 'none' }}>
              {locale === 'fr' ? 'Explorer →' : 'Explore →'}
            </Link>
            <Link href={`/${locale}/top`} style={{
              background: 'rgba(255,255,255,0.1)',
              color: 'rgba(255,255,255,0.8)',
              border: '1px solid rgba(255,255,255,0.15)',
              padding: '10px 22px',
              borderRadius: '6px',
              fontSize: '12px',
              fontWeight: 600,
              textDecoration: 'none',
            }}>
              {locale === 'fr' ? 'Classement' : 'Rankings'}
            </Link>
          </div>
        </div>
      </section>

      {/* ── TRENDING ── */}
      {trending.length > 0 && <TrendingSection manhwas={trending} locale={locale} />}

      {/* ── MAIN CONTENT — 2-col grid ── */}
      <div
        className="homepage-two-col"
        style={{
          maxWidth: '1024px',
          margin: '0 auto',
          padding: '24px 24px',
          display: 'grid',
          gridTemplateColumns: '1fr 280px',
          gap: '20px',
          alignItems: 'start',
        }}
      >
        {/* LEFT — reviews + activity + lists */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {reviews.length > 0 && <RecentReviews reviews={reviews} locale={locale} />}
          <ActivityFeed activities={activities} locale={locale} />
          {topLists.length > 0 && (
            <div>
              <SectionHeader
                title={locale === 'fr' ? 'Top Listes' : 'Top Lists'}
                href={`/${locale}/lists`}
                seeAllLabel={locale === 'fr' ? 'Voir tout →' : 'See all →'}
              />
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {topLists.map((list) => (
                  <Link key={list.slug} href={`/${locale}/lists/${list.slug}`} style={{ textDecoration: 'none' }}>
                    <div style={{
                      background: 'var(--bg-card)',
                      border: '1px solid var(--border)',
                      borderRadius: '10px',
                      padding: '10px 12px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                    }}>
                      <div style={{ display: 'flex', gap: '3px', flexShrink: 0 }}>
                        {list.preview_covers.slice(0, 3).map((url, i) => (
                          <div key={i} style={{ width: '28px', height: '40px', borderRadius: '3px', overflow: 'hidden', background: 'var(--bg-elevated)' }}>
                            {url && (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={url} alt="" loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                            )}
                          </div>
                        ))}
                        {Array.from({ length: Math.max(0, 3 - list.preview_covers.length) }).map((_, i) => (
                          <div key={`empty-${i}`} style={{ width: '28px', height: '40px', borderRadius: '3px', background: 'var(--bg-elevated)' }} />
                        ))}
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {list.title}
                        </div>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                          {list.item_count} {locale === 'fr' ? 'titres' : 'titles'} · {locale === 'fr' ? 'par' : 'by'} {list.user.display_name ?? list.user.username}
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* RIGHT SIDEBAR — rankings */}
        <div>
          <RankingsSidebar manhwas={ranked} locale={locale} />
        </div>
      </div>

      {/* ── HIDDEN GEMS ── tinted section */}
      {hiddenGems.length > 0 && (
        <section style={{
          background: 'var(--bg-surface)',
          borderTop: '1px solid var(--border)',
          padding: '28px 0',
          marginTop: '8px',
        }}>
          <div style={{ maxWidth: '1024px', margin: '0 auto', padding: '0 24px' }}>
            <SectionHeader
              title={locale === 'fr' ? 'Pépites cachées' : 'Hidden Gems'}
              href={`/${locale}/explore?sort=score`}
              seeAllLabel={locale === 'fr' ? 'Voir tout →' : 'See all →'}
            />
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(6, 1fr)',
              gap: '12px',
            }}>
              {hiddenGems.map((m, i) => (
                <ManhwaCard key={m.id} manhwa={m} locale={locale} priority={i < 3} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── RECENTLY ADDED ── */}
      {recentManhwas.length > 0 && (
        <section style={{ maxWidth: '1024px', margin: '0 auto', padding: '28px 24px 0' }}>
          <SectionHeader
            title={locale === 'fr' ? 'Ajouts récents' : 'Recently Added'}
            href={`/${locale}/explore?sort=recent`}
            seeAllLabel={locale === 'fr' ? 'Voir tout →' : 'See all →'}
          />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '12px' }}>
            {recentManhwas.map((m) => (
              <ManhwaCard key={m.id} manhwa={m} locale={locale} />
            ))}
          </div>
        </section>
      )}

      {/* ── PAGE CLOSER ── prevents abrupt end */}
      <div style={{
        borderTop: '1px solid var(--border)',
        padding: '32px 24px',
        textAlign: 'center',
        color: 'var(--text-muted)',
        fontSize: '12px',
      }}>
        <Link href={`/${locale}/explore`} style={{ color: 'var(--accent)', fontWeight: 600, textDecoration: 'none' }}>
          {locale === 'fr'
            ? `Explorer les ${formatCount(stats.manhwaCount)} titres →`
            : `Explore all ${formatCount(stats.manhwaCount)} titles →`}
        </Link>
      </div>
    </>
  )
}
