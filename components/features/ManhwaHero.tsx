import Image from 'next/image'
import { useTranslations } from 'next-intl'
import type { ManhwaWithRelations } from '@/lib/db/manhwa'
import { getDisplayScore } from '@/lib/scoring/engine'
import { getRankFromScore } from '@/lib/scores/ranks'
import { ScoreCard } from '@/components/features/manhwa/ScoreCard'
import { formatCount } from '@/lib/utils/formatCount'

interface ManhwaHeroProps {
  manhwa: ManhwaWithRelations
  locale: string
  hasBanner?: boolean
  children?: React.ReactNode
}

export function ManhwaHero({ manhwa, locale, hasBanner = false, children }: ManhwaHeroProps) {
  const t = useTranslations('manhwa')
  const title = locale === 'fr' ? (manhwa.title_fr ?? manhwa.title_en) : manhwa.title_en
  const scoreInfo = getDisplayScore(manhwa)
  const rank = getRankFromScore(scoreInfo.value, manhwa.score_count)

  return (
    <section className="relative overflow-visible">
      {/* Blurred background (only when no banner) */}
      {!hasBanner && manhwa.cover_url && (
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

      <div className={`relative mx-auto max-w-5xl px-4 ${hasBanner ? 'pb-8' : 'pt-10 pb-6'}`}>
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:gap-8">
          {/* Cover — only the cover pulls up into the banner */}
          <div className={`flex-shrink-0 self-center ${hasBanner ? '-mt-[140px]' : 'md:self-start'}`}>
            {manhwa.cover_url ? (
              <Image
                src={manhwa.cover_url}
                alt={title}
                width={200}
                height={280}
                className="rounded-lg shadow-2xl ring-1 ring-[rgba(0,255,255,0.15)] shadow-[0_0_60px_rgba(0,0,0,0.7)]"
                priority
              />
            ) : (
              <div className="flex h-[280px] w-[200px] items-center justify-center rounded-lg bg-elevated text-text-muted">
                No Cover
              </div>
            )}
          </div>

          {/* Info — stays below the banner, never overlaps it */}
          <div className="flex flex-1 flex-col gap-4 pt-2">
            <div>
              <h1 className="font-display text-4xl tracking-wide text-white md:text-5xl">
                {title}
              </h1>
              {manhwa.title_kr && (
                <p className="mt-1 text-sm text-text-secondary">{manhwa.title_kr}</p>
              )}
            </div>

            {/* Score zone — aggregator style */}
            <div className="flex flex-wrap items-stretch gap-3">
              {/* Primary score — click to reveal detail */}
              {scoreInfo.value && (
                <ScoreCard
                  score={scoreInfo.value}
                  source={scoreInfo.source}
                  rank={rank}
                  detail={
                    scoreInfo.phase === 'GROWING'
                      ? t('score.blended', { count: manhwa.score_count })
                      : scoreInfo.phase === 'BOOTSTRAP'
                        ? t('score.bootstrap')
                        : manhwa.score_count > 0
                          ? t('score.basedOnVotes', { count: manhwa.score_count })
                          : null
                  }
                />
              )}

              {/* AniList score — informational only, no outbound link */}
              {manhwa.ext_score_anilist && (
                <div className="flex items-center gap-2.5 rounded-xl bg-white/[0.04] border border-white/[0.06] px-4 py-2.5">
                  <span className="font-mono text-2xl font-bold text-[#02A9FF] leading-none">
                    {manhwa.ext_score_anilist.toFixed(1)}
                  </span>
                  <div className="flex flex-col">
                    <span className="text-[10px] uppercase tracking-wider text-text-muted">AniList</span>
                    {manhwa.ext_score_anilist_count != null && manhwa.ext_score_anilist_count > 0 && (
                      <span className="text-[10px] text-text-muted">
                        {formatCount(manhwa.ext_score_anilist_count)} votes
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* MAL score — informational only, no outbound link */}
              {manhwa.ext_score_mal && (
                <div className="flex items-center gap-2.5 rounded-xl bg-white/[0.04] border border-white/[0.06] px-4 py-2.5">
                  <span className="font-mono text-2xl font-bold text-[#2E51A2] leading-none">
                    {manhwa.ext_score_mal.toFixed(1)}
                  </span>
                  <div className="flex flex-col">
                    <span className="text-[10px] uppercase tracking-wider text-text-muted">MAL</span>
                    {manhwa.ext_score_mal_count != null && manhwa.ext_score_mal_count > 0 && (
                      <span className="text-[10px] text-text-muted">
                        {formatCount(manhwa.ext_score_mal_count)} votes
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Genres */}
            <div className="flex flex-wrap gap-2">
              {manhwa.genre_links.map((gl) => (
                <a
                  key={gl.genre.id}
                  href={`/${locale}/genre/${gl.genre.slug}`}
                  className="rounded border border-[rgba(0,255,255,0.2)] bg-[rgba(0,255,255,0.06)] px-2 py-1 text-xs uppercase tracking-widest text-[#00bfff] transition-colors hover:border-[rgba(0,255,255,0.4)] hover:bg-[rgba(0,255,255,0.12)]"
                >
                  {locale === 'fr' ? gl.genre.name_fr : gl.genre.name_en}
                </a>
              ))}
            </div>

          </div>
        </div>

        {/* Library actions slot — rendered inside the section so they share the blurred bg */}
        {children && (
          <div className="mt-5">
            {children}
          </div>
        )}
      </div>
    </section>
  )
}
