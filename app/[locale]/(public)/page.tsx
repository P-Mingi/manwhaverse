import { Suspense } from 'react'
import Link from 'next/link'
import { getTranslations } from 'next-intl/server'
import { getTopManhwas, getHighRatedManhwas, getPopularTropes, getStats } from '@/lib/db/home'
import { ManhwaCard } from '@/components/features/ManhwaCard'
import { ManhwaCardSkeleton } from '@/components/features/ManhwaCardSkeleton'
import { PageContainer } from '@/components/layouts/PageContainer'

export const revalidate = 300

interface HomeProps {
  params: Promise<{ locale: string }>
}

export default async function HomePage({ params }: HomeProps) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'home' })

  return (
    <>
      {/* Hero */}
      <section className="flex flex-col items-center gap-6 px-4 pb-12 pt-16 text-center md:pt-24">
        <h1 className="font-display text-4xl font-bold tracking-tight md:text-6xl">
          ManhwaVerse
        </h1>
        <p className="max-w-md text-lg text-text-secondary">
          {t('hero.tagline')}
        </p>
        <div className="flex gap-4">
          <Link
            href={`/${locale}/sign-up`}
            className="rounded-lg bg-crystal-gold px-6 py-3 font-semibold text-base transition-colors hover:bg-crystal-gold/90"
          >
            {t('hero.cta')}
          </Link>
          <Link
            href={`/${locale}/search`}
            className="rounded-lg border border-border px-6 py-3 font-semibold text-text-primary transition-colors hover:bg-elevated"
          >
            {t('hero.ctaSecondary')}
          </Link>
        </div>
      </section>

      <PageContainer>
        {/* Stats */}
        <Suspense fallback={null}>
          <StatsSection locale={locale} />
        </Suspense>

        {/* Top This Week */}
        <section className="mt-10">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-xl font-bold">{t('topThisWeek')}</h2>
            <Link href={`/${locale}/search?sort=popularity`} className="text-sm text-crystal-blue hover:underline">
              {await getTranslation(locale, 'common', 'seeAll')}
            </Link>
          </div>
          <Suspense fallback={<CardGridSkeleton />}>
            <TopManhwasSection locale={locale} />
          </Suspense>
        </section>

        {/* High Rated */}
        <section className="mt-10">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-xl font-bold">{t('hiddenGems')}</h2>
          </div>
          <Suspense fallback={<CardGridSkeleton />}>
            <HighRatedSection locale={locale} />
          </Suspense>
        </section>

        {/* Discover by Trope */}
        <section className="mt-10 mb-10">
          <h2 className="mb-4 font-display text-xl font-bold">{t('discoverByTrope')}</h2>
          <Suspense fallback={<div className="h-20 animate-pulse rounded-lg bg-elevated" />}>
            <TropeDiscoverySection locale={locale} />
          </Suspense>
        </section>
      </PageContainer>
    </>
  )
}

async function getTranslation(locale: string, ns: string, key: string) {
  const t = await getTranslations({ locale, namespace: ns })
  return t(key)
}

async function StatsSection({ locale }: { locale: string }) {
  const stats = await getStats()
  return (
    <div className="flex justify-center gap-8 text-center">
      <div>
        <div className="font-mono text-2xl font-bold text-crystal-gold">{stats.manhwaCount.toLocaleString()}</div>
        <div className="text-xs text-text-muted">Titles</div>
      </div>
      <div>
        <div className="font-mono text-2xl font-bold text-crystal-blue">{stats.genreCount}</div>
        <div className="text-xs text-text-muted">Genres</div>
      </div>
      <div>
        <div className="font-mono text-2xl font-bold text-crystal-red">{stats.tropeCount}</div>
        <div className="text-xs text-text-muted">Tropes</div>
      </div>
    </div>
  )
}

async function TopManhwasSection({ locale }: { locale: string }) {
  const manhwas = await getTopManhwas(10)
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5">
      {manhwas.map((m) => (
        <ManhwaCard key={m.id} manhwa={m} locale={locale} />
      ))}
    </div>
  )
}

async function HighRatedSection({ locale }: { locale: string }) {
  const manhwas = await getHighRatedManhwas(10)
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5">
      {manhwas.map((m) => (
        <ManhwaCard key={m.id} manhwa={m} locale={locale} />
      ))}
    </div>
  )
}

async function TropeDiscoverySection({ locale }: { locale: string }) {
  const tropes = await getPopularTropes(8)
  return (
    <div className="flex flex-wrap gap-2">
      {tropes.map((trope) => (
        <Link
          key={trope.id}
          href={`/${locale}/trope/${trope.slug}`}
          className="rounded-full bg-elevated px-4 py-2 text-sm font-medium text-text-primary transition-colors hover:bg-border"
        >
          {trope.name}
          <span className="ml-2 text-text-muted">{trope._count.manhwa_links}</span>
        </Link>
      ))}
    </div>
  )
}

function CardGridSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5">
      {Array.from({ length: 5 }).map((_, i) => (
        <ManhwaCardSkeleton key={i} />
      ))}
    </div>
  )
}
