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
  return { title: t('title'), description: t('description') }
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
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{
          fontSize: 'clamp(22px, 4vw, 32px)',
          fontWeight: 800,
          fontStyle: 'italic',
          color: 'var(--text-primary)',
          marginBottom: '6px',
        }}>
          {t('title')}
        </h1>
        <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
          {t('description')}
        </p>
      </div>

      {/* Genre filter pills */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '2rem' }}>
        <Link href={`/${locale}/top`} className={`filter-pill${!genre ? ' active' : ''}`}>
          {t('allGenres')}
        </Link>
        {genres.map((g) => (
          <Link
            key={g.slug}
            href={`/${locale}/top?genre=${g.slug}`}
            className={`filter-pill${genre === g.slug ? ' active' : ''}`}
          >
            {locale === 'fr' ? g.name_fr : g.name_en}
          </Link>
        ))}
      </div>

      {/* Ranking rows */}
      {manhwas.length === 0 ? (
        <p style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--text-muted)' }}>
          {t('noRanked')}
        </p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          {manhwas.map((manhwa) => (
            <Link key={manhwa.slug} href={`/${locale}/manhwa/${manhwa.slug}`} className="rank-row">
              {/* Rank number */}
              <span style={{
                width: '36px',
                flexShrink: 0,
                textAlign: 'right',
                fontSize: '18px',
                fontWeight: 800,
                fontStyle: 'italic',
                color: manhwa.rank === 1
                  ? '#D97706'
                  : manhwa.rank === 2
                  ? 'var(--text-muted)'
                  : manhwa.rank === 3
                  ? '#B45309'
                  : manhwa.rank <= 10
                  ? 'var(--accent)'
                  : 'var(--text-muted)',
              }}>
                #{manhwa.rank}
              </span>

              {/* Cover */}
              <div style={{
                width: '44px',
                height: '62px',
                flexShrink: 0,
                borderRadius: '5px',
                overflow: 'hidden',
                background: 'var(--bg-elevated)',
              }}>
                {manhwa.cover_url ? (
                  <Image
                    src={manhwa.cover_url}
                    alt={manhwa.title}
                    width={44}
                    height={62}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  <div style={{
                    width: '100%', height: '100%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '9px', color: 'var(--text-muted)',
                  }}>N/A</div>
                )}
              </div>

              {/* Title + genres */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <p className="rank-title" style={{
                  fontSize: '14px',
                  fontWeight: 600,
                  color: 'var(--text-primary)',
                  margin: '0 0 3px',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}>
                  {manhwa.title}
                </p>
                <p style={{
                  fontSize: '12px',
                  color: 'var(--text-muted)',
                  margin: 0,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}>
                  {manhwa.genres.slice(0, 3).join(', ')}
                </p>
              </div>

              {/* Score */}
              {manhwa.score != null && (
                <span style={{ flexShrink: 0, fontSize: '14px', fontWeight: 700, color: 'var(--star)' }}>
                  ★ {manhwa.score.toFixed(1)}
                </span>
              )}

              {/* Readers */}
              <span style={{
                flexShrink: 0,
                fontSize: '12px',
                color: 'var(--text-muted)',
                minWidth: '80px',
                textAlign: 'right',
                display: 'none',
              }} className="md:block">
                {formatCount(manhwa.reader_count)} {t('readers')}
              </span>
            </Link>
          ))}
        </div>
      )}
    </PageContainer>
  )
}
