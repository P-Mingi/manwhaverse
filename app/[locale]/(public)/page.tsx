import { Suspense } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { getTranslations } from 'next-intl/server'
import {
  getTrendingManhwas,
  getTopRated,
  getRecentManhwas,
  getPopularManhwas,
  getHiddenGems,
  getStats,
} from '@/lib/db/home'
import { getAllGenres } from '@/lib/db/genre'
import { getAllTropes } from '@/lib/db/trope'
import { getTopLists } from '@/lib/db/list'
import { getTopRankedManhwas } from '@/lib/db/ranking'
import { getCurrentContentFilter } from '@/lib/nsfw'
import type { ContentFilter } from '@prisma/client'
import { ManhwaCard } from '@/components/features/ManhwaCard'
import { ManhwaCardSkeleton } from '@/components/features/ManhwaCardSkeleton'
import { HomeSection } from '@/components/features/HomeSection'
import { HomeFilterBar } from '@/components/features/HomeFilterBar'
import { PageContainer } from '@/components/layouts/PageContainer'
import { HomeRanking } from '@/components/features/home/HomeRanking'
import { ScrollableRow } from '@/components/features/ScrollableRow'
import type { ManhwaCardPopupData } from '@/lib/db/manhwa'
import { formatCount } from '@/lib/utils/formatCount'
import { getTopFanArtsThisWeek } from '@/lib/db/fan-art'

export const revalidate = 300

interface HomeProps {
  params: Promise<{ locale: string }>
}

export default async function HomePage({ params }: HomeProps) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'home' })

  return (
    <>
      {/* Featured Hero */}
      <Suspense fallback={<div className="h-[420px] bg-[#060609]" />}>
        <FeaturedHeroSection locale={locale} />
      </Suspense>

      {/* Live Ticker */}
      <Suspense fallback={null}>
        <TickerSection locale={locale} />
      </Suspense>

      <PageContainer>
        {/* Trending */}
        <Suspense fallback={<SectionSkeleton />}>
          <TrendingSection locale={locale} />
        </Suspense>

        {/* Best Rated AniList */}
        <Suspense fallback={<SectionSkeleton />}>
          <BestRatedAnilistSection locale={locale} />
        </Suspense>

        {/* Recently Added */}
        <Suspense fallback={<SectionSkeleton />}>
          <RecentSection locale={locale} />
        </Suspense>

        {/* Ranking */}
        <Suspense fallback={<SectionSkeleton />}>
          <HomeRanking locale={locale} />
        </Suspense>

        {/* Community Lists */}
        <Suspense fallback={<SectionSkeleton />}>
          <TopListsSection locale={locale} />
        </Suspense>

        {/* Fan Art of the Week */}
        <Suspense fallback={null}>
          <FanArtSection locale={locale} />
        </Suspense>

        {/* All-Time Popular */}
        <Suspense fallback={<SectionSkeleton />}>
          <AllTimePopularSection locale={locale} />
        </Suspense>

        {/* Hidden Gems */}
        <Suspense fallback={<SectionSkeleton />}>
          <HiddenGemsSection locale={locale} />
        </Suspense>
      </PageContainer>
    </>
  )
}

async function FeaturedHeroSection({ locale }: { locale: string }) {
  const [featured, stats] = await Promise.all([
    getTopRankedManhwas(1, locale),
    getStats(),
  ])
  const manhwa = featured[0]

  if (!manhwa) {
    // Fallback: simple hero without featured manhwa
    return (
      <section className="relative overflow-hidden bg-[#060609] px-4 py-16 text-center">
        <h1 className="font-display text-6xl tracking-widest text-[#00ffff] electric-glow md:text-8xl">
          ManhwaVerse
        </h1>
        <p className="mx-auto mt-4 max-w-md text-[#9999b8]">
          The ultimate manhwa database
        </p>
      </section>
    )
  }

  return (
    <section className="relative overflow-hidden bg-[#060609]">
      {/* Animated blob background */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="absolute -left-40 -top-40 h-[500px] w-[500px] rounded-full opacity-10"
          style={{
            background: 'radial-gradient(circle, #00ffff 0%, transparent 70%)',
            animation: 'blob-float 12s ease-in-out infinite',
          }}
        />
        <div
          className="absolute -bottom-40 -right-40 h-[400px] w-[400px] rounded-full opacity-8"
          style={{
            background: 'radial-gradient(circle, #00bfff 0%, transparent 70%)',
            animation: 'blob-float 15s ease-in-out infinite reverse',
          }}
        />
      </div>

      <div className="relative mx-auto flex max-w-5xl flex-col items-center gap-8 px-4 py-10 md:flex-row md:items-center md:gap-12 md:py-14">
        {/* Left — Text */}
        <div className="flex flex-1 flex-col gap-4">
          {/* Pulsing tag */}
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 animate-pulse rounded-full bg-[#00ffff]" />
            <span className="text-xs uppercase tracking-widest text-[#00ffff]">
              {locale === 'fr' ? 'Manhwa en vedette' : 'Featured Manhwa'}
            </span>
          </div>

          {/* Title */}
          <h1 className="font-display text-5xl leading-none tracking-wide text-white md:text-6xl">
            {manhwa.title}
          </h1>

          {/* Genre badges */}
          {manhwa.genres.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {manhwa.genres.slice(0, 3).map((g) => (
                <span
                  key={g}
                  className="rounded border border-[rgba(0,255,255,0.2)] bg-[rgba(0,255,255,0.06)] px-2 py-0.5 text-[10px] uppercase tracking-widest text-[#00bfff]"
                >
                  {g}
                </span>
              ))}
            </div>
          )}

          {/* CTA */}
          <div className="mt-2 flex items-center gap-4">
            <Link
              href={`/${locale}/manhwa/${manhwa.slug}`}
              className="rounded-md bg-[#00ffff] px-6 py-3 text-xs font-bold uppercase tracking-widest text-black transition-all duration-150 hover:shadow-[0_8px_24px_rgba(0,255,255,0.35)] hover:-translate-y-px"
            >
              {locale === 'fr' ? 'Lire maintenant' : 'Read now'}
            </Link>
          </div>

          {/* Stats */}
          <div className="flex gap-6 border-t border-white/5 pt-4">
            <div>
              <div className="font-mono text-lg font-bold text-[#00ffff]">{formatCount(manhwa.reader_count)}</div>
              <div className="text-[10px] uppercase tracking-widest text-[#6b6b88]">{locale === 'fr' ? 'Lecteurs' : 'Readers'}</div>
            </div>
            {manhwa.score != null && (
              <div>
                <div className="font-mono text-lg font-bold text-[#ffd700]">★ {manhwa.score.toFixed(1)}</div>
                <div className="text-[10px] uppercase tracking-widest text-[#6b6b88]">Score</div>
              </div>
            )}
            <div>
              <div className="font-mono text-lg font-bold text-[#e8e8f0]">{stats.manhwaCount.toLocaleString()}</div>
              <div className="text-[10px] uppercase tracking-widest text-[#6b6b88]">Titles</div>
            </div>
          </div>
        </div>

        {/* Right — Cover */}
        {manhwa.cover_url && (
          <div className="relative flex-shrink-0">
            <div className="relative h-[280px] w-[200px] overflow-hidden rounded-lg ring-1 ring-[rgba(0,255,255,0.15)] shadow-[0_0_60px_rgba(0,0,0,0.7)]">
              <Image
                src={manhwa.cover_url}
                alt={manhwa.title}
                fill
                sizes="200px"
                className="object-cover"
                priority
              />
            </div>
            {/* #1 badge */}
            <div className="absolute -left-3 -top-3 flex h-10 w-10 items-center justify-center rounded-full bg-[#ffd700] font-display text-xl text-black shadow-[0_0_12px_rgba(255,215,0,0.4)]">
              #1
            </div>
          </div>
        )}
      </div>
    </section>
  )
}

async function TickerSection({ locale }: { locale: string }) {
  const recent = await getRecentManhwas(10)
  if (recent.length === 0) return null

  const items = recent.map((m) =>
    locale === 'fr' ? (m.title_fr ?? m.title_en) : m.title_en
  )
  // Duplicate for seamless loop
  const doubled = [...items, ...items]

  return (
    <div className="overflow-hidden border-y border-[rgba(0,255,255,0.08)] bg-[rgba(0,255,255,0.04)] py-2.5">
      <div
        className="flex gap-8 whitespace-nowrap"
        style={{ animation: 'ticker 30s linear infinite' }}
      >
        {doubled.map((title, i) => (
          <span key={i} className="text-xs text-[#6b6b88]">
            <span className="mr-3 text-[#00ffff]">→</span>
            {title}
          </span>
        ))}
      </div>
    </div>
  )
}

async function FilterBarSection({ locale }: { locale: string }) {
  const [genres, tropes] = await Promise.all([getAllGenres(), getAllTropes()])
  return (
    <HomeFilterBar
      locale={locale}
      genres={genres.map((g) => ({
        slug: g.slug,
        name: locale === 'fr' ? g.name_fr : g.name_en,
      }))}
      tropes={tropes.map((tr) => ({
        slug: tr.slug,
        name: tr.name,
      }))}
    />
  )
}

async function TrendingSection({ locale }: { locale: string }) {
  const [contentFilter, manhwas, t] = await Promise.all([
    getCurrentContentFilter(),
    getTrendingManhwas(locale, 10),
    getTranslations({ locale, namespace: 'home' }),
  ])
  if (manhwas.length === 0) return null
  return (
    <HomeSection title={t('trending')} viewAllHref={`/${locale}/search?sort=popularity`} locale={locale}>
      <CardGrid manhwas={manhwas} locale={locale} contentFilter={contentFilter} />
    </HomeSection>
  )
}

async function BestRatedAnilistSection({ locale }: { locale: string }) {
  const [contentFilter, manhwas, t] = await Promise.all([
    getCurrentContentFilter(),
    getTopRated(10),
    getTranslations({ locale, namespace: 'home' }),
  ])
  if (manhwas.length === 0) return null
  return (
    <HomeSection title={t('bestRatedAnilist')} viewAllHref={`/${locale}/search?sort=score`} locale={locale}>
      <CardGrid manhwas={manhwas} locale={locale} contentFilter={contentFilter} />
    </HomeSection>
  )
}

async function RecentSection({ locale }: { locale: string }) {
  const [contentFilter, manhwas, t] = await Promise.all([
    getCurrentContentFilter(),
    getRecentManhwas(10),
    getTranslations({ locale, namespace: 'home' }),
  ])
  if (manhwas.length === 0) return null
  return (
    <HomeSection title={t('recentlyAdded')} viewAllHref={`/${locale}/search?sort=recent`} locale={locale}>
      <CardGrid manhwas={manhwas} locale={locale} contentFilter={contentFilter} />
    </HomeSection>
  )
}

async function AllTimePopularSection({ locale }: { locale: string }) {
  const [contentFilter, manhwas, t] = await Promise.all([
    getCurrentContentFilter(),
    getPopularManhwas(10),
    getTranslations({ locale, namespace: 'home' }),
  ])
  if (manhwas.length === 0) return null
  return (
    <HomeSection title={t('allTimePopular')} viewAllHref={`/${locale}/search?sort=popularity`} locale={locale}>
      <CardGrid manhwas={manhwas} locale={locale} contentFilter={contentFilter} />
    </HomeSection>
  )
}

async function HiddenGemsSection({ locale }: { locale: string }) {
  const [contentFilter, manhwas, t] = await Promise.all([
    getCurrentContentFilter(),
    getHiddenGems(10),
    getTranslations({ locale, namespace: 'home' }),
  ])
  if (manhwas.length === 0) return null
  return (
    <HomeSection title={t('hiddenGems')} viewAllHref={`/${locale}/search?sort=score`} locale={locale}>
      <CardGrid manhwas={manhwas} locale={locale} contentFilter={contentFilter} />
    </HomeSection>
  )
}

function CardGrid({
  manhwas,
  locale,
  contentFilter,
}: {
  manhwas: ManhwaCardPopupData[]
  locale: string
  contentFilter: ContentFilter
}) {
  return (
    <ScrollableRow>
      {manhwas.map((m) => (
        <div key={m.id} className="w-36 flex-none sm:w-40 md:w-44">
          <ManhwaCard
            manhwa={m}
            locale={locale}
            userContentFilter={contentFilter}
          />
        </div>
      ))}
    </ScrollableRow>
  )
}

async function TopListsSection({ locale }: { locale: string }) {
  const [lists, t] = await Promise.all([
    getTopLists(6),
    getTranslations({ locale, namespace: 'home' }),
  ])
  if (lists.length === 0) return null
  return (
    <HomeSection title={t('topLists')} viewAllHref={`/${locale}/lists`} locale={locale}>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {lists.map((list) => (
          <Link
            key={list.id}
            href={`/${locale}/lists/${list.slug}`}
            className="group flex gap-3 rounded-xl border border-white/5 bg-[#0d0d16] p-3 transition-colors hover:border-[rgba(0,255,255,0.3)]"
          >
            {/* Mini cover strip */}
            <div className="flex h-16 w-28 flex-shrink-0 overflow-hidden rounded-lg">
              {list.preview_covers.length > 0 ? (
                list.preview_covers.slice(0, 3).map((cover, i) => (
                  <div key={i} className="relative flex-1 overflow-hidden">
                    <Image src={cover} alt="" fill sizes="40px" className="object-cover" />
                  </div>
                ))
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-[#111120] text-[#6b6b88] text-xs">
                  —
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex min-w-0 flex-1 flex-col justify-center gap-1">
              <p className="line-clamp-2 text-sm font-semibold leading-snug text-[#e8e8f0] group-hover:text-[#00ffff]">
                {list.title}
              </p>
              <p className="text-xs text-[#6b6b88]">
                {list.item_count} titles · ♥ {list.likes_count}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </HomeSection>
  )
}

async function FanArtSection({ locale }: { locale: string }) {
  const [posts, t] = await Promise.all([
    getTopFanArtsThisWeek(6),
    getTranslations({ locale, namespace: 'home' }),
  ])
  if (posts.length === 0) return null
  return (
    <HomeSection title={t('featuredFanArt')} viewAllHref={`/${locale}/artwork`} locale={locale}>
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
        {posts.map((post) => {
          const img = post.images[0]
          if (!img) return null
          return (
            <Link
              key={post.id}
              href={`/${locale}/artwork/${post.id}`}
              className="group relative aspect-square overflow-hidden rounded-lg bg-[#0d0d16]"
              title={post.title}
            >
              <img
                src={img.thumb_url || img.image_url}
                alt={img.alt_text ?? post.title}
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/30" />
              {post.manhwa && (
                <div className="absolute bottom-0 left-0 right-0 translate-y-full bg-gradient-to-t from-black/80 to-transparent px-2 py-1.5 transition-transform duration-200 group-hover:translate-y-0">
                  <p className="line-clamp-1 text-[10px] text-white">{post.manhwa.title_en}</p>
                </div>
              )}
            </Link>
          )
        })}
      </div>
    </HomeSection>
  )
}

function SectionSkeleton() {
  return (
    <section className="mt-10">
      <div className="mb-4 h-7 w-40 animate-pulse rounded bg-elevated" />
      <div className="-mx-4 flex gap-4 overflow-x-auto px-4 pb-2 snap-x snap-mandatory scroll-pl-4">
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="w-36 flex-none snap-start sm:w-40 md:w-44">
            <ManhwaCardSkeleton />
          </div>
        ))}
      </div>
    </section>
  )
}
