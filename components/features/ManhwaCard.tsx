import Image from 'next/image'
import Link from 'next/link'
import type { ManhwaCardData, ManhwaCardPopupData } from '@/lib/db/manhwa'
import type { ContentFilter } from '@prisma/client'
import { shouldBlurCover } from '@/lib/nsfw'
import { getRankFromScore } from '@/lib/scores/ranks'
import { RankBadge } from '@/components/features/RankBadge'
import { formatScore } from '@/lib/utils/formatScore'
import { ManhwaCardPopup } from '@/components/features/ManhwaCardPopup'
interface ManhwaCardProps {
  manhwa: ManhwaCardData | ManhwaCardPopupData
  locale: string
  userContentFilter?: ContentFilter
  rankBadgeTop?: boolean
  userScore?: number | null
  // passed by some pages for future library-status overlay — not yet rendered
  libraryStatus?: string | null
  isFavorite?: boolean
  isLoggedIn?: boolean
}

function isPopupData(manhwa: ManhwaCardData | ManhwaCardPopupData): manhwa is ManhwaCardPopupData {
  return 'trope_links' in manhwa
}

export function ManhwaCard({ manhwa, locale, userContentFilter = 'SAFE', rankBadgeTop = false, userScore }: ManhwaCardProps) {
  const title = locale === 'fr' ? (manhwa.title_fr ?? manhwa.title_en) : manhwa.title_en
  const displayScore = manhwa.display_score
  const rank = getRankFromScore(displayScore, manhwa.score_count)
  const blurCover = shouldBlurCover(manhwa, userContentFilter)

  const card = (
    <Link
      href={`/${locale}/manhwa/${manhwa.slug}`}
      className="group flex flex-col overflow-hidden rounded-lg border border-electric-border bg-card card-hover"
    >
      {/* Cover */}
      <div className="relative aspect-[5/7] w-full overflow-hidden bg-elevated">
        {manhwa.cover_url ? (
          <Image
            src={manhwa.cover_url}
            alt={title}
            fill
            sizes="(max-width: 640px) 45vw, (max-width: 1024px) 30vw, 180px"
            className={`object-cover transition-transform duration-300 group-hover:scale-105 ${blurCover ? 'blur-xl' : ''}`}
          />
        ) : (
          <div className="flex h-full items-center justify-center text-xs text-text-muted">
            No Cover
          </div>
        )}

        {/* NSFW badge */}
        {blurCover && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="rounded-md bg-red/80 px-2 py-1 text-xs font-bold text-white">
              18+
            </span>
          </div>
        )}

        {/* Rank badge — top right (only when rankBadgeTop) */}
        {rankBadgeTop && rank && (
          <div className="absolute right-2 top-2 backdrop-blur-sm">
            <RankBadge rank={rank} compact />
          </div>
        )}

        {/* Score + rank badge — bottom left */}
        {displayScore && (
          <div className="absolute bottom-2 left-2 flex items-center gap-1 rounded-md bg-void/80 px-1.5 py-0.5 backdrop-blur-sm">
            <span className="text-xs text-yellow-400">★</span>
            <span className={`font-mono text-xs font-bold ${displayScore >= 8 ? 'text-electric' : 'text-text-primary'}`}>
              {formatScore(displayScore)}
            </span>
            {!rankBadgeTop && rank && <RankBadge rank={rank} compact />}
          </div>
        )}

      </div>

      {/* Footer */}
      <div className="p-2.5">
        {/* Title */}
        <h3 className="truncate text-sm font-semibold text-text-primary transition-colors group-hover:text-electric">
          {title}
        </h3>

        {/* User personal score */}
        {userScore != null && (
          <p className="mt-0.5 text-[11px] text-text-muted">
            {locale === 'fr' ? 'Noté' : 'Rated'}{' '}
            <span className="font-mono font-semibold text-electric">{formatScore(userScore)}</span>
          </p>
        )}

        {/* Genres */}
        {manhwa.genre_links.length > 0 && (
          <div className="mt-1 flex flex-wrap gap-1">
            {manhwa.genre_links.slice(0, 2).map((gl) => (
              <span
                key={gl.genre.name_en}
                className="rounded bg-elevated px-1.5 py-0.5 text-[10px] text-text-muted"
              >
                {locale === 'fr' ? gl.genre.name_fr : gl.genre.name_en}
              </span>
            ))}
          </div>
        )}
      </div>
    </Link>
  )

  if (isPopupData(manhwa)) {
    return (
      <ManhwaCardPopup manhwa={manhwa} locale={locale}>
        {card}
      </ManhwaCardPopup>
    )
  }

  return card
}
