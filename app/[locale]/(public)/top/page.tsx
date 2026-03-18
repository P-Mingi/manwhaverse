import Image from 'next/image'
import Link from 'next/link'
import { getTranslations } from 'next-intl/server'
import { getTopRankedManhwas, getTopRankedByGenre } from '@/lib/db/ranking'
import { getAllGenres } from '@/lib/db/genre'
import { formatCount } from '@/lib/utils/formatCount'
import { PageContainer } from '@/components/layouts/PageContainer'

export const revalidate = 3600

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
              ? 'bg-[rgba(0,255,255,0.08)] border border-[rgba(0,255,255,0.3)] text-[#00ffff]'
              : 'border border-white/10 bg-white/[0.03] text-[#9999b8] hover:bg-[rgba(0,255,255,0.08)] hover:border-[rgba(0,255,255,0.3)] hover:text-[#00ffff]'
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
                ? 'bg-[rgba(0,255,255,0.08)] border border-[rgba(0,255,255,0.3)] text-[#00ffff]'
                : 'border border-white/10 bg-white/[0.03] text-[#9999b8] hover:bg-[rgba(0,255,255,0.08)] hover:border-[rgba(0,255,255,0.3)] hover:text-[#00ffff]'
            }`}
          >
            {locale === 'fr' ? g.name_fr : g.name_en}
          </Link>
        ))}
      </div>

      {/* Ranking table */}
      {manhwas.length === 0 ? (
        <p className="py-12 text-center text-[#6b6b88]">{t('noRanked')}</p>
      ) : (
        <div className="space-y-1">
          {manhwas.map((manhwa) => (
            <Link
              key={manhwa.slug}
              href={`/${locale}/manhwa/${manhwa.slug}`}
              className="group flex items-center gap-4 rounded-lg p-3 transition-all hover:bg-[rgba(0,255,255,0.03)] hover:border-l-2 hover:border-[#00ffff] hover:pl-2"
            >
              {/* Rank */}
              <span className={`w-10 shrink-0 text-right font-display text-2xl ${
                manhwa.rank === 1
                  ? 'text-[#ffd700] drop-shadow-[0_0_12px_rgba(255,215,0,0.4)]'
                  : manhwa.rank === 2
                  ? 'text-[#c0c0c0]'
                  : manhwa.rank === 3
                  ? 'text-[#cd7f32]'
                  : manhwa.rank <= 10
                  ? 'text-[#00ffff]'
                  : 'text-[#6b6b88]'
              }`}>
                #{manhwa.rank}
              </span>

              {/* Cover */}
              <div className="relative h-16 w-12 shrink-0 overflow-hidden rounded-md bg-[#111120]">
                {manhwa.cover_url ? (
                  <Image
                    src={manhwa.cover_url}
                    alt={manhwa.title}
                    width={48}
                    height={64}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-[8px] text-[#6b6b88]">
                    N/A
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-[#e8e8f0] transition-colors group-hover:text-[#00ffff]">
                  {manhwa.title}
                </p>
                <p className="truncate text-xs text-[#6b6b88]">
                  {manhwa.genres.slice(0, 3).join(', ')}
                </p>
              </div>

              {/* Score */}
              {manhwa.score != null && (
                <span className="shrink-0 font-mono text-sm font-bold text-[#00ffff]">
                  ★ {manhwa.score.toFixed(1)}
                </span>
              )}

              {/* Readers */}
              <span className="hidden shrink-0 text-xs text-[#6b6b88] md:block">
                {formatCount(manhwa.reader_count)} {t('readers')}
              </span>
            </Link>
          ))}
        </div>
      )}
    </PageContainer>
  )
}
