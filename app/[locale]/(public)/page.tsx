import { Suspense } from 'react'
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
import { getCurrentContentFilter } from '@/lib/nsfw'
import { getUser } from '@/lib/auth/session'
import { getUserLibraryMap, type LibraryMapEntry } from '@/lib/db/library-map'
import type { ContentFilter } from '@prisma/client'
import { ManhwaCard } from '@/components/features/ManhwaCard'
import { ManhwaCardSkeleton } from '@/components/features/ManhwaCardSkeleton'
import { HomeSection } from '@/components/features/HomeSection'
import { HomeFilterBar } from '@/components/features/HomeFilterBar'
import { PageContainer } from '@/components/layouts/PageContainer'
import { HomeRanking } from '@/components/features/home/HomeRanking'
import { ScrollableRow } from '@/components/features/ScrollableRow'
import type { ManhwaCardPopupData } from '@/lib/db/manhwa'

export const revalidate = 300

interface HomeProps {
  params: Promise<{ locale: string }>
}

export default async function HomePage({ params }: HomeProps) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'home' })

  return (
    <>
      {/* Compact Hero */}
      <section className="flex flex-col items-center gap-3 px-4 py-8 text-center md:py-12">
        <h1 className="font-display text-3xl font-bold tracking-tight md:text-4xl">
          ManhwaVerse
        </h1>
        <p className="max-w-md text-text-secondary">
          {t('hero.tagline')}
        </p>
        <Suspense fallback={null}>
          <StatsInline />
        </Suspense>
      </section>

      <PageContainer>
        {/* Filter Bar */}
        <Suspense fallback={null}>
          <FilterBarSection locale={locale} />
        </Suspense>

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

async function StatsInline() {
  const stats = await getStats()
  return (
    <div className="flex gap-6 text-center">
      <div>
        <span className="font-mono text-lg font-bold text-crystal-gold">{stats.manhwaCount.toLocaleString()}</span>
        <span className="ml-1 text-xs text-text-muted">Titles</span>
      </div>
      <div>
        <span className="font-mono text-lg font-bold text-crystal-blue">{stats.genreCount}</span>
        <span className="ml-1 text-xs text-text-muted">Genres</span>
      </div>
      <div>
        <span className="font-mono text-lg font-bold text-crystal-red">{stats.tropeCount}</span>
        <span className="ml-1 text-xs text-text-muted">Tropes</span>
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
  const [contentFilter, user] = await Promise.all([getCurrentContentFilter(), getUser()])
  const [manhwas, libraryMap] = await Promise.all([
    getTrendingManhwas(locale, 10),
    user ? getUserLibraryMap(user.id) : new Map<string, LibraryMapEntry>(),
  ])
  const t = await getTranslations({ locale, namespace: 'home' })
  if (manhwas.length === 0) return null
  return (
    <HomeSection title={t('trending')} viewAllHref={`/${locale}/search?sort=popularity`} locale={locale}>
      <CardGrid manhwas={manhwas} locale={locale} contentFilter={contentFilter} libraryMap={libraryMap} isLoggedIn={!!user} />
    </HomeSection>
  )
}

async function BestRatedAnilistSection({ locale }: { locale: string }) {
  const [contentFilter, user] = await Promise.all([getCurrentContentFilter(), getUser()])
  const [manhwas, libraryMap] = await Promise.all([
    getTopRated(10),
    user ? getUserLibraryMap(user.id) : new Map<string, LibraryMapEntry>(),
  ])
  const t = await getTranslations({ locale, namespace: 'home' })
  if (manhwas.length === 0) return null
  return (
    <HomeSection title={t('bestRatedAnilist')} viewAllHref={`/${locale}/search?sort=score`} locale={locale}>
      <CardGrid manhwas={manhwas} locale={locale} contentFilter={contentFilter} libraryMap={libraryMap} isLoggedIn={!!user} />
    </HomeSection>
  )
}

async function RecentSection({ locale }: { locale: string }) {
  const [contentFilter, user] = await Promise.all([getCurrentContentFilter(), getUser()])
  const [manhwas, libraryMap] = await Promise.all([
    getRecentManhwas(10),
    user ? getUserLibraryMap(user.id) : new Map<string, LibraryMapEntry>(),
  ])
  const t = await getTranslations({ locale, namespace: 'home' })
  if (manhwas.length === 0) return null
  return (
    <HomeSection title={t('recentlyAdded')} viewAllHref={`/${locale}/search?sort=recent`} locale={locale}>
      <CardGrid manhwas={manhwas} locale={locale} contentFilter={contentFilter} libraryMap={libraryMap} isLoggedIn={!!user} />
    </HomeSection>
  )
}

async function AllTimePopularSection({ locale }: { locale: string }) {
  const [contentFilter, user] = await Promise.all([getCurrentContentFilter(), getUser()])
  const [manhwas, libraryMap] = await Promise.all([
    getPopularManhwas(10),
    user ? getUserLibraryMap(user.id) : new Map<string, LibraryMapEntry>(),
  ])
  const t = await getTranslations({ locale, namespace: 'home' })
  if (manhwas.length === 0) return null
  return (
    <HomeSection title={t('allTimePopular')} viewAllHref={`/${locale}/search?sort=popularity`} locale={locale}>
      <CardGrid manhwas={manhwas} locale={locale} contentFilter={contentFilter} libraryMap={libraryMap} isLoggedIn={!!user} />
    </HomeSection>
  )
}

async function HiddenGemsSection({ locale }: { locale: string }) {
  const [contentFilter, user] = await Promise.all([getCurrentContentFilter(), getUser()])
  const [manhwas, libraryMap] = await Promise.all([
    getHiddenGems(10),
    user ? getUserLibraryMap(user.id) : new Map<string, LibraryMapEntry>(),
  ])
  const t = await getTranslations({ locale, namespace: 'home' })
  if (manhwas.length === 0) return null
  return (
    <HomeSection title={t('hiddenGems')} viewAllHref={`/${locale}/search?sort=score`} locale={locale}>
      <CardGrid manhwas={manhwas} locale={locale} contentFilter={contentFilter} libraryMap={libraryMap} isLoggedIn={!!user} />
    </HomeSection>
  )
}

function CardGrid({
  manhwas,
  locale,
  contentFilter,
  libraryMap,
  isLoggedIn,
}: {
  manhwas: ManhwaCardPopupData[]
  locale: string
  contentFilter: ContentFilter
  libraryMap: Map<string, LibraryMapEntry>
  isLoggedIn: boolean
}) {
  return (
    <ScrollableRow>
      {manhwas.map((m) => {
        const entry = libraryMap.get(m.id)
        return (
          <div key={m.id} className="w-36 flex-none sm:w-40 md:w-44">
            <ManhwaCard
              manhwa={m}
              locale={locale}
              userContentFilter={contentFilter}
              libraryStatus={entry?.status ?? null}
              isFavorite={entry?.is_favorite ?? false}
              isLoggedIn={isLoggedIn}
            />
          </div>
        )
      })}
    </ScrollableRow>
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
