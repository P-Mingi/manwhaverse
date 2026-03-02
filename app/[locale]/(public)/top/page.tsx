import Image from 'next/image'
import Link from 'next/link'
import { getTranslations } from 'next-intl/server'
import { getTopRankedManhwas, getTopRankedByGenre } from '@/lib/db/ranking'
import { getAllGenres } from '@/lib/db/genre'
import { formatCount } from '@/lib/utils/formatCount'
import { PageContainer } from '@/components/layouts/PageContainer'

interface TopPageProps {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ genre?: string }>
}

export async function generateMetadata({ params }: TopPageProps) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'top' })
  return {
    title: t('title'),
    description: t('description'),
  }
}

export default async function TopPage({ params, searchParams }: TopPageProps) {
  const { locale } = await params
  const { genre } = await searchParams
  const t = await getTranslations({ locale, namespace: 'top' })

  const [manhwas, genres] = await Promise.all([
    genre
      ? getTopRankedByGenre(genre, 100, locale)
      : getTopRankedManhwas(100, locale),
    getAllGenres(),
  ])

  return (
    <PageContainer>
      <div className="mb-8">
        <h1 className="flex items-center gap-3 font-display text-2xl font-bold md:text-3xl">
          🏆 {t('title')}
        </h1>
        <p className="mt-2 text-sm text-text-secondary">{t('description')}</p>
      </div>

      {/* Genre filter */}
      <div className="mb-8 flex flex-wrap gap-2">
        <Link
          href={`/${locale}/top`}
          className={`rounded-full px-3 py-1.5 text-sm transition-colors ${
            !genre
              ? 'bg-crystal-blue text-white'
              : 'bg-elevated text-text-secondary hover:text-text-primary'
          }`}
        >
          {t('allGenres')}
        </Link>
        {genres.map((g) => (
          <Link
            key={g.slug}
            href={`/${locale}/top?genre=${g.slug}`}
            className={`rounded-full px-3 py-1.5 text-sm transition-colors ${
              genre === g.slug
                ? 'bg-crystal-blue text-white'
                : 'bg-elevated text-text-secondary hover:text-text-primary'
            }`}
          >
            {locale === 'fr' ? g.name_fr : g.name_en}
          </Link>
        ))}
      </div>

      {/* Ranking table */}
      {manhwas.length === 0 ? (
        <p className="py-12 text-center text-text-muted">No ranked titles found.</p>
      ) : (
        <div className="space-y-1">
          {manhwas.map((manhwa) => (
            <Link
              key={manhwa.slug}
              href={`/${locale}/manhwa/${manhwa.slug}`}
              className="group flex items-center gap-4 rounded-lg p-3 transition-colors hover:bg-white/5"
            >
              {/* Rank */}
              <span className={`w-10 shrink-0 text-right text-2xl font-bold ${
                manhwa.rank <= 3 ? 'text-crystal-gold' : 'text-text-muted'
              }`}>
                #{manhwa.rank}
              </span>

              {/* Cover */}
              <div className="relative h-16 w-12 shrink-0 overflow-hidden rounded-md bg-elevated">
                {manhwa.cover_url ? (
                  <Image
                    src={manhwa.cover_url}
                    alt={manhwa.title}
                    width={48}
                    height={64}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-[8px] text-text-muted">
                    N/A
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-text-primary transition-colors group-hover:text-crystal-blue">
                  {manhwa.title}
                </p>
                <p className="truncate text-xs text-text-muted">
                  {manhwa.genres.slice(0, 3).join(', ')}
                </p>
              </div>

              {/* Score */}
              {manhwa.score != null && (
                <span className="shrink-0 text-sm font-bold text-yellow-400">
                  ★ {manhwa.score.toFixed(1)}
                </span>
              )}

              {/* Readers */}
              <span className="hidden shrink-0 text-xs text-text-muted md:block">
                {formatCount(manhwa.reader_count)} {t('readers')}
              </span>
            </Link>
          ))}
        </div>
      )}
    </PageContainer>
  )
}
