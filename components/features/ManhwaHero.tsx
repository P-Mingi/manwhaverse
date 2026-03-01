import Image from 'next/image'
import { useTranslations } from 'next-intl'
import type { ManhwaWithRelations } from '@/lib/db/manhwa'
import { getDisplayScore } from '@/lib/scores/display'
import { formatScore, getCrystalColor, getCrystalLabel } from '@/lib/utils/formatScore'
import { formatCount } from '@/lib/utils/formatCount'

interface ManhwaHeroProps {
  manhwa: ManhwaWithRelations
  locale: string
}

export function ManhwaHero({ manhwa, locale }: ManhwaHeroProps) {
  const t = useTranslations('manhwa')
  const title = locale === 'fr' ? (manhwa.title_fr ?? manhwa.title_en) : manhwa.title_en
  const { primaryScore, primaryLabel, mode } = getDisplayScore(manhwa)
  const crystalColor = getCrystalColor(primaryScore)
  const crystalLabel = getCrystalLabel(primaryScore)

  return (
    <section className="relative overflow-hidden">
      {/* Blurred background */}
      {manhwa.cover_url && (
        <div className="absolute inset-0 -z-10">
          <Image
            src={manhwa.cover_url}
            alt=""
            fill
            className="object-cover blur-2xl opacity-20 scale-110"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-base/60 to-base" />
        </div>
      )}

      <div className="mx-auto max-w-5xl px-4 pb-8 pt-8 md:pt-12">
        <div className="flex flex-col gap-6 md:flex-row md:gap-8">
          {/* Cover */}
          <div className="flex-shrink-0 self-center md:self-start">
            {manhwa.cover_url ? (
              <Image
                src={manhwa.cover_url}
                alt={title}
                width={200}
                height={280}
                className="rounded-lg shadow-2xl"
                priority
              />
            ) : (
              <div className="flex h-[280px] w-[200px] items-center justify-center rounded-lg bg-elevated text-text-muted">
                No Cover
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex flex-1 flex-col gap-4">
            <div>
              <h1 className="font-display text-2xl font-bold tracking-tight md:text-4xl">
                {title}
              </h1>
              {manhwa.title_kr && (
                <p className="mt-1 text-sm text-text-secondary">{manhwa.title_kr}</p>
              )}
            </div>

            {/* Score */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className={`font-mono text-3xl font-bold ${crystalColor}`}>
                  {formatScore(primaryScore)}
                </span>
                <span className={`font-mono text-lg ${crystalColor}`}>
                  {crystalLabel}
                </span>
              </div>
              <span className="text-sm text-text-muted">
                {t(`score.${primaryLabel}`)}
                {manhwa.score_count > 0 && (
                  <> · {t('score.basedOnVotes', { count: manhwa.score_count })}</>
                )}
              </span>
            </div>

            {/* Metadata row */}
            <div className="flex flex-wrap gap-3 text-sm text-text-secondary">
              <span className="rounded-md bg-elevated px-2 py-1">
                {t(`status.${manhwa.status}`)}
              </span>
              {manhwa.chapter_count && (
                <span className="rounded-md bg-elevated px-2 py-1">
                  {t('chapters', { count: manhwa.chapter_count })}
                </span>
              )}
              {manhwa.release_year && (
                <span className="rounded-md bg-elevated px-2 py-1">
                  {manhwa.release_year}
                  {manhwa.end_year ? `–${manhwa.end_year}` : ''}
                </span>
              )}
              {manhwa.reader_count > 0 && (
                <span className="rounded-md bg-elevated px-2 py-1">
                  {formatCount(manhwa.reader_count)} readers
                </span>
              )}
            </div>

            {/* Genres */}
            <div className="flex flex-wrap gap-2">
              {manhwa.genre_links.map((gl) => (
                <a
                  key={gl.genre.id}
                  href={`/${locale}/genre/${gl.genre.slug}`}
                  className="rounded-full bg-elevated px-3 py-1 text-xs font-medium text-text-primary transition-colors hover:bg-border"
                >
                  {locale === 'fr' ? gl.genre.name_fr : gl.genre.name_en}
                </a>
              ))}
            </div>

            {/* Creators */}
            {manhwa.creator_links.length > 0 && (
              <div className="text-sm text-text-secondary">
                {manhwa.creator_links.map((cl, i) => (
                  <span key={`${cl.creator_id}-${cl.role}`}>
                    {i > 0 && ' · '}
                    <span className="text-text-primary">{cl.creator.name}</span>
                    <span className="text-text-muted"> ({cl.role.toLowerCase()})</span>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
