import Image from 'next/image'
import Link from 'next/link'
import { getTranslations } from 'next-intl/server'
import {
  getTrendingManhwas,
  getHiddenGems,
  getRecentManhwas,
  getStats,
} from '@/lib/db/home'
import { getTopLists } from '@/lib/db/list'
import { getTopRankedManhwas, type RankedManhwa } from '@/lib/db/ranking'
import { getPublicFeed, type ActivityWithContext } from '@/lib/db/activity'
import { getRecentReviews, type ReviewWithManhwa } from '@/lib/db/review'
import type { ManhwaCardPopupData } from '@/lib/db/manhwa'
import { HomeGenreBar } from '@/components/features/home/HomeGenreBar'
import { HomeActivityFeed } from '@/components/features/home/HomeActivityFeed'
import { HomeReviews } from '@/components/features/home/HomeReviews'
import { HomeRankingList } from '@/components/features/home/HomeRankingList'
import { GemCard } from '@/components/features/home/GemCard'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { formatCount } from '@/lib/utils/formatCount'
import { getAnilistCover } from '@/lib/utils/anilist-image'

export const revalidate = 300

interface HomeProps {
  params: Promise<{ locale: string }>
}

type Stats = Awaited<ReturnType<typeof getStats>>
type TopLists = Awaited<ReturnType<typeof getTopLists>>

export default async function HomePage({ params }: HomeProps) {
  const { locale } = await params

  // Fetch all data in a single parallel burst — eliminates Suspense waterfall
  let covers: RankedManhwa[] = []
  let stats: Stats = { manhwaCount: 0, genreCount: 0, tropeCount: 0, userCount: 0, reviewCount: 0 }
  let trending: ManhwaCardPopupData[] = []
  let hiddenGems: ManhwaCardPopupData[] = []
  let recent: ManhwaCardPopupData[] = []
  let lists: TopLists = []
  let activities: ActivityWithContext[] = []
  let reviews: ReviewWithManhwa[] = []

  try {
    const [c, s, tr, hg, rc, ls, feed, rev] = await Promise.all([
      getTopRankedManhwas(6, locale),
      getStats(),
      getTrendingManhwas(locale, 10),
      getHiddenGems(6),
      getRecentManhwas(10),
      getTopLists(3),
      getPublicFeed(1, 5),
      getRecentReviews(4),
    ])
    covers = c
    stats = s
    trending = tr
    hiddenGems = hg
    recent = rc
    lists = ls
    activities = feed.activities
    reviews = rev
  } catch {
    // DB unavailable — render with empty data
  }

  return (
    <>
      {/* Hero */}
      <HeroSection locale={locale} covers={covers} stats={stats} />

      {/* Live Ticker */}
      <TickerSection locale={locale} recent={recent} />

      {/* Genre pill bar */}
      <HomeGenreBar locale={locale} />

      <div className="page-main">
        {/* Trending */}
        <TrendingSection locale={locale} manhwas={trending} />

        {/* Two-col: Rankings + Activity Feed */}
        <RankingAndFeedSection locale={locale} ranked={covers.slice(0, 5)} activities={activities} />

        {/* Recent Reviews */}
        <ReviewsSection locale={locale} reviews={reviews} />

        {/* Hidden Gems */}
        <HiddenGemsSection locale={locale} manhwas={hiddenGems} />

        {/* Community Lists */}
        <TopListsSection locale={locale} lists={lists} />
      </div>
    </>
  )
}

/* ──────────────────────────────────────────────────────────────
   HERO SECTION — editorial left + 3×3 collage right
   ────────────────────────────────────────────────────────────── */
async function HeroSection({ locale, covers, stats }: { locale: string; covers: RankedManhwa[]; stats: Stats }) {
  const t = await getTranslations({ locale, namespace: 'home' })

  return (
    <section className="hero">
      {/* Left: editorial */}
      <div className="hero-editorial">
        <div className="hero-eyebrow">{t('hero.eyebrow')}</div>

        <h1 className="hero-title">
          {t('hero.title_line1')}
          <span className="hero-title-accent">{t('hero.title_accent')}</span>
          {t('hero.title_line3')}
        </h1>

        <p className="hero-tagline">{t('hero.tagline')}</p>

        <div className="hero-stats">
          <div>
            <div className="hero-stat-num">{formatCount(stats.manhwaCount)}</div>
            <div className="hero-stat-label">{t('hero.stat_titles')}</div>
          </div>
          <div>
            <div className="hero-stat-num">{formatCount(stats.userCount)}</div>
            <div className="hero-stat-label">{t('hero.stat_readers')}</div>
          </div>
          <div>
            <div className="hero-stat-num">{formatCount(stats.reviewCount)}</div>
            <div className="hero-stat-label">{t('hero.stat_reviews')}</div>
          </div>
        </div>

        <div className="hero-cta-row">
          <Link href={`/${locale}/sign-in`} className="btn-primary">
            {t('hero.cta_primary')} →
          </Link>
          <Link href={`/${locale}/top`} className="btn-secondary">
            {t('hero.cta_secondary')}
          </Link>
        </div>
      </div>

      {/* Right: 3×3 collage */}
      <div className="hero-visual">
        {covers.length > 0 && (
          <div className="hero-collage">
            {/* Featured (2×2) — only image with priority */}
            <Link href={`/${locale}/manhwa/${covers[0]?.slug}`} className="collage-item featured">
              {covers[0]?.cover_url && (
                <Image
                  src={getAnilistCover(covers[0].cover_url, 'hero')}
                  alt={covers[0].title}
                  fill
                  sizes="(max-width: 768px) 100vw, 30vw"
                  className="collage-cover"
                  priority
                  quality={85}
                />
              )}
              {covers[0]?.score != null && (
                <div className="collage-score">★ {covers[0].score.toFixed(1)}</div>
              )}
            </Link>

            {/* 5 smaller cells — hidden on mobile, all lazy */}
            {covers.slice(1, 6).map((m) => (
              <Link key={m.slug} href={`/${locale}/manhwa/${m.slug}`} className="collage-item hidden md:block">
                {m.cover_url && (
                  <Image
                    src={getAnilistCover(m.cover_url, 'card')}
                    alt={m.title}
                    fill
                    sizes="15vw"
                    className="collage-cover"
                    loading="lazy"
                    quality={75}
                  />
                )}
                {m.score != null && (
                  <div className="collage-score">★ {m.score.toFixed(1)}</div>
                )}
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

/* ──────────────────────────────────────────────────────────────
   TICKER
   ────────────────────────────────────────────────────────────── */
function TickerSection({ locale, recent }: { locale: string; recent: ManhwaCardPopupData[] }) {
  if (recent.length === 0) return null

  const items = recent.map((m) =>
    locale === 'fr' ? (m.title_fr ?? m.title_en) : m.title_en
  )
  const doubled = [...items, ...items]

  return (
    <div className="ticker-wrap">
      <div
        className="flex gap-8 whitespace-nowrap"
        style={{ animation: 'ticker 30s linear infinite' }}
      >
        {doubled.map((title, i) => (
          <span key={i} className="ticker-item">{title}</span>
        ))}
      </div>
    </div>
  )
}

/* ──────────────────────────────────────────────────────────────
   TRENDING — horizontal scroll with rank overlays
   ────────────────────────────────────────────────────────────── */
async function TrendingSection({ locale, manhwas }: { locale: string; manhwas: ManhwaCardPopupData[] }) {
  if (manhwas.length === 0) return null
  const t = await getTranslations({ locale, namespace: 'home' })

  return (
    <div className="section">
      <SectionHeader
        title={t('trending')}
        href={`/${locale}/search?sort=popularity`}
        seeAllLabel="See all →"
      />
      <div className="trending-scroll">
        {manhwas.map((m, i) => (
          <div key={m.id} className="trending-scroll-item relative">
            <span className="card-rank">{i + 1}</span>
            <GemCard manhwa={m} locale={locale} />
          </div>
        ))}
      </div>
    </div>
  )
}

/* ──────────────────────────────────────────────────────────────
   TWO-COLUMN: Rankings + Activity Feed
   ────────────────────────────────────────────────────────────── */
async function RankingAndFeedSection({ locale, ranked, activities }: { locale: string; ranked: RankedManhwa[]; activities: ActivityWithContext[] }) {
  const t = await getTranslations({ locale, namespace: 'home' })

  return (
    <div className="section">
      <div className="rankings-layout">
        <div>
          <SectionHeader
            title={t('ranking_title')}
            href={`/${locale}/top`}
            seeAllLabel={t('ranking.viewAll')}
          />
          <HomeRankingList manhwas={ranked} locale={locale} />
        </div>
        <div>
          <SectionHeader
            title={t('activity_title')}
            href={`/${locale}/feed`}
            seeAllLabel="See all →"
          />
          <HomeActivityFeed locale={locale} activities={activities} />
        </div>
      </div>
    </div>
  )
}

/* ──────────────────────────────────────────────────────────────
   RECENT REVIEWS — 3-col grid
   ────────────────────────────────────────────────────────────── */
async function ReviewsSection({ locale, reviews }: { locale: string; reviews: ReviewWithManhwa[] }) {
  if (reviews.length === 0) return null
  const t = await getTranslations({ locale, namespace: 'home' })

  return (
    <div className="section">
      <SectionHeader
        title={t('recentReviews')}
        href={`/${locale}/explore`}
        seeAllLabel="See all →"
      />
      <HomeReviews locale={locale} reviews={reviews} />
    </div>
  )
}

/* ──────────────────────────────────────────────────────────────
   HIDDEN GEMS — 6-col grid with overlay
   ────────────────────────────────────────────────────────────── */
async function HiddenGemsSection({ locale, manhwas }: { locale: string; manhwas: ManhwaCardPopupData[] }) {
  if (manhwas.length === 0) return null
  const t = await getTranslations({ locale, namespace: 'home' })

  return (
    <div className="section">
      <SectionHeader
        title={t('hiddenGems')}
        href={`/${locale}/search?sort=score`}
        seeAllLabel="See all →"
      />
      <div className="gems-grid">
        {manhwas.map((m) => (
          <GemCard key={m.id} manhwa={m} locale={locale} />
        ))}
      </div>
    </div>
  )
}

/* ──────────────────────────────────────────────────────────────
   TOP LISTS — 3-col grid with cover mosaic
   ────────────────────────────────────────────────────────────── */
async function TopListsSection({ locale, lists }: { locale: string; lists: TopLists }) {
  if (lists.length === 0) return null
  const t = await getTranslations({ locale, namespace: 'home' })

  return (
    <div className="section">
      <SectionHeader
        title={t('topLists')}
        href={`/${locale}/lists`}
        seeAllLabel="See all →"
      />
      <div className="lists-grid">
        {lists.map((list) => (
          <Link
            key={list.id}
            href={`/${locale}/lists/${list.slug}`}
            className="list-card"
          >
            <div className="list-card-covers">
              {list.preview_covers.slice(0, 4).map((cover, i) => (
                <div key={i} className="list-cover-mini">
                  <Image src={getAnilistCover(cover, 'thumb')} alt="" fill sizes="40px" className="object-cover" loading="lazy" />
                </div>
              ))}
              {list.preview_covers.length === 0 && (
                <div className="flex h-full w-full items-center justify-center bg-elevated text-xs text-text-muted">—</div>
              )}
            </div>
            <div className="list-title">{list.title}</div>
            <div className="list-meta">
              <span>{list.item_count} titles</span>
              <span className="list-meta-heart">♥ {list.likes_count}</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
