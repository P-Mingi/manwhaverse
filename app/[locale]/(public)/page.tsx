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
import { HomeSection } from '@/components/features/HomeSection'
import { HomeGenreBar } from '@/components/features/home/HomeGenreBar'
import { HomeActivityFeed } from '@/components/features/home/HomeActivityFeed'
import { HomeReviews } from '@/components/features/home/HomeReviews'
import { PageContainer } from '@/components/layouts/PageContainer'
import { HomeRankingList } from '@/components/features/home/HomeRankingList'
import { formatCount } from '@/lib/utils/formatCount'

export const revalidate = 300

interface HomeProps {
  params: Promise<{ locale: string }>
}

export default async function HomePage({ params }: HomeProps) {
  const { locale } = await params

  return (
    <>
      {/* Hero — 50/50 editorial split + cover collage */}
      <Suspense fallback={<div className="h-[420px] bg-void" />}>
        <HeroSection locale={locale} />
      </Suspense>

      {/* Live Ticker */}
      <Suspense fallback={null}>
        <TickerSection locale={locale} />
      </Suspense>

      {/* Genre pill bar */}
      <HomeGenreBar locale={locale} />

      <PageContainer>
        {/* Trending — 5-col grid with rank overlays */}
        <Suspense fallback={<SectionSkeleton />}>
          <TrendingSection locale={locale} />
        </Suspense>

        {/* Two-col: Rankings + Activity Feed */}
        <Suspense fallback={<SectionSkeleton />}>
          <RankingAndFeedSection locale={locale} />
        </Suspense>

        {/* Recent Reviews — 3-col grid */}
        <Suspense fallback={<SectionSkeleton />}>
          <ReviewsSection locale={locale} />
        </Suspense>

        {/* Hidden Gems — 6-col grid */}
        <Suspense fallback={<SectionSkeleton />}>
          <HiddenGemsSection locale={locale} />
        </Suspense>

        {/* Community Lists — 3-col */}
        <Suspense fallback={<SectionSkeleton />}>
          <TopListsSection locale={locale} />
        </Suspense>
      </PageContainer>
    </>
  )
}

/* ──────────────────────────────────────────────────────────────
   HERO SECTION — editorial left + cover collage right
   ────────────────────────────────────────────────────────────── */
async function HeroSection({ locale }: { locale: string }) {
  let covers: Awaited<ReturnType<typeof getTopRankedManhwas>> = []
  let stats = { manhwaCount: 0, genreCount: 0, tropeCount: 0, userCount: 0 }
  try {
    ;[covers, stats] = await Promise.all([
      getTopRankedManhwas(5, locale),
      getStats(),
    ])
  } catch {
    // DB unavailable — render hero without stats/collage
  }

  return (
    <section className="relative overflow-hidden bg-void">
      {/* Animated blob background */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="absolute -left-40 -top-40 h-[500px] w-[500px] rounded-full opacity-10"
          style={{
            background: 'radial-gradient(circle, var(--color-electric) 0%, transparent 70%)',
            animation: 'blob-float 12s ease-in-out infinite',
          }}
        />
        <div
          className="absolute -bottom-40 -right-40 h-[400px] w-[400px] rounded-full opacity-8"
          style={{
            background: 'radial-gradient(circle, var(--color-electric-dim) 0%, transparent 70%)',
            animation: 'blob-float 15s ease-in-out infinite reverse',
          }}
        />
      </div>

      <div className="relative mx-auto flex max-w-6xl flex-col items-center gap-8 px-4 py-10 md:flex-row md:items-center md:gap-16 md:py-16">
        {/* Left — Editorial */}
        <div className="flex flex-1 flex-col gap-5">
          {/* Label */}
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 animate-pulse rounded-full bg-electric" />
            <span className="text-xs uppercase tracking-widest text-electric">
              {locale === 'fr' ? 'La base de données manhwa' : 'The Manhwa Database'}
            </span>
          </div>

          {/* Title */}
          <h1 className="font-display text-6xl leading-none tracking-widest text-electric electric-glow md:text-8xl">
            MANHWA
            <br />
            VERSE
          </h1>

          {/* Description */}
          <p className="max-w-sm text-sm text-text-secondary">
            {locale === 'fr'
              ? 'Découvrez, notez et suivez vos manhwas préférés avec une communauté passionnée.'
              : 'Discover, rate, and track your favorite manhwas with a passionate community.'}
          </p>

          {/* Stats */}
          <div className="flex gap-6 border-t border-electric-border pt-4">
            <div>
              <div className="font-mono text-lg font-bold text-electric">
                {stats.manhwaCount.toLocaleString()}
              </div>
              <div className="text-[10px] uppercase tracking-widest text-text-muted">
                {locale === 'fr' ? 'Titres' : 'Titles'}
              </div>
            </div>
            <div>
              <div className="font-mono text-lg font-bold text-electric">
                {formatCount(stats.userCount)}
              </div>
              <div className="text-[10px] uppercase tracking-widest text-text-muted">
                {locale === 'fr' ? 'Membres' : 'Members'}
              </div>
            </div>
            <div>
              <div className="font-mono text-lg font-bold text-electric">
                {stats.genreCount}
              </div>
              <div className="text-[10px] uppercase tracking-widest text-text-muted">
                {locale === 'fr' ? 'Genres' : 'Genres'}
              </div>
            </div>
          </div>

          {/* CTAs */}
          <div className="flex flex-wrap items-center gap-3">
            <Link
              href={`/${locale}/explore`}
              className="rounded-md bg-electric px-6 py-3 text-xs font-bold uppercase tracking-widest text-black transition-all duration-150 hover:-translate-y-px"
            >
              {locale === 'fr' ? 'Explorer' : 'Browse Library'}
            </Link>
            <Link
              href={`/${locale}/search?sort=popularity`}
              className="rounded-md border border-electric-border bg-transparent px-6 py-3 text-xs font-bold uppercase tracking-widest text-electric transition-all duration-150 hover:bg-electric-glow"
            >
              {locale === 'fr' ? 'Tendances' : 'Trending Now'}
            </Link>
          </div>
        </div>

        {/* Right — Cover collage (desktop only) */}
        {covers.length > 0 && (
          <div className="relative hidden flex-shrink-0 md:flex gap-2">
            {/* Gradient fade on left edge */}
            <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-12 bg-gradient-to-r from-void to-transparent" />

            {/* Featured big cover */}
            <Link
              href={`/${locale}/manhwa/${covers[0]?.slug}`}
              className="relative h-[280px] w-[176px] flex-shrink-0 overflow-hidden rounded-lg ring-1 ring-electric-border"
            >
              {covers[0]?.cover_url && (
                <Image
                  src={covers[0].cover_url}
                  alt={covers[0].title}
                  fill
                  sizes="176px"
                  className="object-cover transition-transform duration-300 hover:scale-105"
                  priority
                />
              )}
            </Link>

            {/* 2×2 grid of smaller covers */}
            <div className="grid grid-cols-2 gap-2">
              {covers.slice(1, 5).map((m) => (
                m.cover_url ? (
                  <Link
                    key={m.slug}
                    href={`/${locale}/manhwa/${m.slug}`}
                    className="relative h-[136px] w-[86px] overflow-hidden rounded-md ring-1 ring-electric-border/50"
                  >
                    <Image
                      src={m.cover_url}
                      alt={m.title}
                      fill
                      sizes="86px"
                      className="object-cover transition-transform duration-300 hover:scale-105"
                    />
                  </Link>
                ) : (
                  <div key={m.slug} className="h-[136px] w-[86px] rounded-md bg-elevated ring-1 ring-electric-border/30" />
                )
              ))}
            </div>
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
    <div className="overflow-hidden border-y border-electric-border bg-electric-glow/30 py-2.5">
      <div
        className="flex gap-8 whitespace-nowrap"
        style={{ animation: 'ticker 30s linear infinite' }}
      >
        {doubled.map((title, i) => (
          <span key={i} className="text-xs text-text-muted">
            <span className="mr-3 text-electric">→</span>
            {title}
          </span>
        ))}
      </div>
    </div>
  )
}

/* ──────────────────────────────────────────────────────────────
   TRENDING — 5-col grid with rank number overlays
   ────────────────────────────────────────────────────────────── */
async function TrendingSection({ locale }: { locale: string }) {
  let contentFilter: Awaited<ReturnType<typeof getCurrentContentFilter>> = 'SAFE'
  let manhwas: Awaited<ReturnType<typeof getTrendingManhwas>> = []
  const t = await getTranslations({ locale, namespace: 'home' })
  try {
    ;[contentFilter, manhwas] = await Promise.all([
      getCurrentContentFilter(),
      getTrendingManhwas(locale, 5),
    ])
  } catch {
    return null
  }
  if (manhwas.length === 0) return null

  return (
    <HomeSection title={t('trending')} viewAllHref={`/${locale}/search?sort=popularity`} locale={locale}>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
        {manhwas.map((m, i) => (
          <div key={m.id} className="relative">
            {/* Rank overlay */}
            <span className="pointer-events-none absolute -bottom-1 -left-1 z-10 font-display text-[56px] leading-none text-text-primary/10 select-none">
              {i + 1}
            </span>
            <ManhwaCard
              manhwa={m}
              locale={locale}
              userContentFilter={contentFilter}
            />
          </div>
        ))}
      </div>
    </HomeSection>
  )
}

/* ──────────────────────────────────────────────────────────────
   TWO-COLUMN: Rankings + Activity Feed
   ────────────────────────────────────────────────────────────── */
async function RankingAndFeedSection({ locale }: { locale: string }) {
  let ranked: Awaited<ReturnType<typeof getTopRankedManhwas>> = []
  const t = await getTranslations({ locale, namespace: 'home' })
  try {
    ranked = await getTopRankedManhwas(10, locale)
  } catch {
    // continue with empty list
  }
  const readersLabel = locale === 'fr' ? 'lecteurs' : 'readers'

  return (
    <section className="mt-12">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Left: compact ranking list */}
        <div>
          <h2 className="section-title-bar mb-4 font-display text-xl uppercase tracking-wider text-text-primary">
            {t('ranking.title')}
          </h2>
          <HomeRankingList manhwas={ranked} locale={locale} readersLabel={readersLabel} />
        </div>
        {/* Right: activity feed */}
        <div>
          <h2 className="section-title-bar mb-4 font-display text-xl uppercase tracking-wider text-text-primary">
            {locale === 'fr' ? 'Activité récente' : 'Recent Activity'}
          </h2>
          <HomeActivityFeed locale={locale} />
        </div>
      </div>
    </section>
  )
}

/* ──────────────────────────────────────────────────────────────
   RECENT REVIEWS — 3-col grid
   ────────────────────────────────────────────────────────────── */
async function ReviewsSection({ locale }: { locale: string }) {
  const t = await getTranslations({ locale, namespace: 'home' })
  return (
    <HomeSection title={t('recentReviews')} viewAllHref={`/${locale}/explore`} locale={locale}>
      <HomeReviews locale={locale} />
    </HomeSection>
  )
}

/* ──────────────────────────────────────────────────────────────
   HIDDEN GEMS — 6-col grid with cover overlay
   ────────────────────────────────────────────────────────────── */
async function HiddenGemsSection({ locale }: { locale: string }) {
  let contentFilter: Awaited<ReturnType<typeof getCurrentContentFilter>> = 'SAFE'
  let manhwas: Awaited<ReturnType<typeof getHiddenGems>> = []
  const t = await getTranslations({ locale, namespace: 'home' })
  try {
    ;[contentFilter, manhwas] = await Promise.all([
      getCurrentContentFilter(),
      getHiddenGems(6),
    ])
  } catch {
    return null
  }
  if (manhwas.length === 0) return null

  return (
    <HomeSection title={t('hiddenGems')} viewAllHref={`/${locale}/search?sort=score`} locale={locale}>
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
        {manhwas.map((m) => (
          <ManhwaCard
            key={m.id}
            manhwa={m}
            locale={locale}
            userContentFilter={contentFilter}
          />
        ))}
      </div>
    </HomeSection>
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
    <HomeSection title={t('topLists')} viewAllHref={`/${locale}/lists`} locale={locale}>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {lists.map((list) => (
          <Link
            key={list.id}
            href={`/${locale}/lists/${list.slug}`}
            className="group flex gap-3 rounded-xl border border-electric-border bg-card p-3 transition-colors hover:border-electric-border-hover"
          >
            {/* Cover mosaic */}
            <div className="flex h-16 w-28 flex-shrink-0 overflow-hidden rounded-lg">
              {list.preview_covers.length > 0 ? (
                list.preview_covers.slice(0, 3).map((cover, i) => (
                  <div key={i} className="relative flex-1 overflow-hidden">
                    <Image src={cover} alt="" fill sizes="40px" className="object-cover" />
                  </div>
                ))
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-elevated text-xs text-text-muted">
                  —
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex min-w-0 flex-1 flex-col justify-center gap-1">
              <p className="line-clamp-2 text-sm font-semibold leading-snug text-text-primary transition-colors group-hover:text-electric">
                {list.title}
              </p>
              <p className="text-xs text-text-muted">
                {list.item_count} titles · ♥ {list.likes_count}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </HomeSection>
  )
}

/* ──────────────────────────────────────────────────────────────
   SKELETONS
   ────────────────────────────────────────────────────────────── */
function SectionSkeleton() {
  return (
    <section className="mt-10">
      <div className="mb-4 h-7 w-40 animate-pulse rounded bg-elevated" />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <ManhwaCardSkeleton key={i} />
        ))}
      </div>
    </section>
  )
}
