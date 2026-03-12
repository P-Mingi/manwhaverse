import { Suspense } from 'react'
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
import { getTopRankedManhwas } from '@/lib/db/ranking'
import { getCurrentContentFilter } from '@/lib/nsfw'
import { ManhwaCard } from '@/components/features/ManhwaCard'
import { ManhwaCardSkeleton } from '@/components/features/ManhwaCardSkeleton'
import { HomeGenreBar } from '@/components/features/home/HomeGenreBar'
import { HomeActivityFeed } from '@/components/features/home/HomeActivityFeed'
import { HomeReviews } from '@/components/features/home/HomeReviews'
import { HomeRankingList } from '@/components/features/home/HomeRankingList'
import { GemCard } from '@/components/features/home/GemCard'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { formatCount } from '@/lib/utils/formatCount'

export const revalidate = 300

interface HomeProps {
  params: Promise<{ locale: string }>
}

export default async function HomePage({ params }: HomeProps) {
  const { locale } = await params

  return (
    <>
      {/* Hero */}
      <Suspense fallback={<div className="h-[90vh] bg-void" />}>
        <HeroSection locale={locale} />
      </Suspense>

      {/* Live Ticker */}
      <Suspense fallback={null}>
        <TickerSection locale={locale} />
      </Suspense>

      {/* Genre pill bar */}
      <HomeGenreBar locale={locale} />

      <div className="page-main">
        {/* Trending */}
        <Suspense fallback={<SectionSkeleton />}>
          <TrendingSection locale={locale} />
        </Suspense>

        {/* Two-col: Rankings + Activity Feed */}
        <Suspense fallback={<SectionSkeleton />}>
          <RankingAndFeedSection locale={locale} />
        </Suspense>

        {/* Recent Reviews */}
        <Suspense fallback={<SectionSkeleton />}>
          <ReviewsSection locale={locale} />
        </Suspense>

        {/* Hidden Gems */}
        <Suspense fallback={<SectionSkeleton />}>
          <HiddenGemsSection locale={locale} />
        </Suspense>

        {/* Community Lists */}
        <Suspense fallback={<SectionSkeleton />}>
          <TopListsSection locale={locale} />
        </Suspense>
      </div>
    </>
  )
}

/* ──────────────────────────────────────────────────────────────
   HERO SECTION — editorial left + 3×3 collage right
   ────────────────────────────────────────────────────────────── */
async function HeroSection({ locale }: { locale: string }) {
  let covers: Awaited<ReturnType<typeof getTopRankedManhwas>> = []
  let stats = { manhwaCount: 0, genreCount: 0, tropeCount: 0, userCount: 0, reviewCount: 0 }
  try {
    ;[covers, stats] = await Promise.all([
      getTopRankedManhwas(6, locale),
      getStats(),
    ])
  } catch {
    // DB unavailable — render hero without stats/collage
  }

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
            {/* Featured (2×2) */}
            <Link href={`/${locale}/manhwa/${covers[0]?.slug}`} className="collage-item featured">
              {covers[0]?.cover_url && (
                <Image
                  src={covers[0].cover_url}
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

            {/* 5 smaller cells — hidden on mobile to avoid loading 5 extra images */}
            {covers.slice(1, 6).map((m, i) => (
              <Link key={m.slug} href={`/${locale}/manhwa/${m.slug}`} className="collage-item hidden md:block">
                {m.cover_url && (
                  <Image
                    src={m.cover_url}
                    alt={m.title}
                    fill
                    sizes="(max-width: 768px) 50vw, 15vw"
                    className="collage-cover"
                    priority={i < 2}
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
async function TickerSection({ locale }: { locale: string }) {
  let recent: Awaited<ReturnType<typeof getRecentManhwas>> = []
  try {
    recent = await getRecentManhwas(10)
  } catch {
    return null
  }
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
   TRENDING — 5-col grid with rank overlays
   ────────────────────────────────────────────────────────────── */
async function TrendingSection({ locale }: { locale: string }) {
  let contentFilter: Awaited<ReturnType<typeof getCurrentContentFilter>> = 'SAFE'
  let manhwas: Awaited<ReturnType<typeof getTrendingManhwas>> = []
  const t = await getTranslations({ locale, namespace: 'home' })
  try {
    ;[contentFilter, manhwas] = await Promise.all([
      getCurrentContentFilter(),
      getTrendingManhwas(locale, 10),
    ])
  } catch {
    return null
  }
  if (manhwas.length === 0) return null

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
async function RankingAndFeedSection({ locale }: { locale: string }) {
  let ranked: Awaited<ReturnType<typeof getTopRankedManhwas>> = []
  const t = await getTranslations({ locale, namespace: 'home' })
  try {
    ranked = await getTopRankedManhwas(5, locale)
  } catch {
    // continue with empty list
  }

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
          <HomeActivityFeed locale={locale} />
        </div>
      </div>
    </div>
  )
}

/* ──────────────────────────────────────────────────────────────
   RECENT REVIEWS — 3-col grid
   ────────────────────────────────────────────────────────────── */
async function ReviewsSection({ locale }: { locale: string }) {
  const t = await getTranslations({ locale, namespace: 'home' })
  return (
    <div className="section">
      <SectionHeader
        title={t('recentReviews')}
        href={`/${locale}/explore`}
        seeAllLabel="See all →"
      />
      <HomeReviews locale={locale} />
    </div>
  )
}

/* ──────────────────────────────────────────────────────────────
   HIDDEN GEMS — 6-col grid with overlay
   ────────────────────────────────────────────────────────────── */
async function HiddenGemsSection({ locale }: { locale: string }) {
  let manhwas: Awaited<ReturnType<typeof getHiddenGems>> = []
  const t = await getTranslations({ locale, namespace: 'home' })
  try {
    manhwas = await getHiddenGems(6)
  } catch {
    return null
  }
  if (manhwas.length === 0) return null

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
async function TopListsSection({ locale }: { locale: string }) {
  let lists: Awaited<ReturnType<typeof getTopLists>> = []
  const t = await getTranslations({ locale, namespace: 'home' })
  try {
    lists = await getTopLists(6)
  } catch {
    return null
  }
  if (lists.length === 0) return null

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
                  <Image src={cover} alt="" fill sizes="40px" className="object-cover" loading="lazy" />
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

/* ──────────────────────────────────────────────────────────────
   SKELETONS
   ────────────────────────────────────────────────────────────── */
function SectionSkeleton() {
  return (
    <div className="section">
      <div className="mb-6 h-7 w-40 animate-pulse rounded bg-elevated" />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <ManhwaCardSkeleton key={i} />
        ))}
      </div>
    </div>
  )
}
