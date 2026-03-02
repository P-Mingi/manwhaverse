import Image from 'next/image'
import Link from 'next/link'
import type { ManhwaCardData, ManhwaCardPopupData } from '@/lib/db/manhwa'
import type { ContentFilter } from '@prisma/client'
import { shouldBlurCover } from '@/lib/nsfw'
import { getRankFromScore } from '@/lib/scores/ranks'
import { RankBadge } from '@/components/features/RankBadge'
import { formatScore } from '@/lib/utils/formatScore'
import { ManhwaCardPopup } from '@/components/features/ManhwaCardPopup'
import { ManhwaCardOverlay } from '@/components/features/ManhwaCardOverlay'
import type { ReadingStatus } from '@prisma/client'

interface ManhwaCardProps {
  manhwa: ManhwaCardData | ManhwaCardPopupData
  locale: string
  userContentFilter?: ContentFilter
  libraryStatus?: ReadingStatus | null
  isFavorite?: boolean
  isLoggedIn?: boolean
}

function isPopupData(manhwa: ManhwaCardData | ManhwaCardPopupData): manhwa is ManhwaCardPopupData {
  return 'trope_links' in manhwa
}

export function ManhwaCard({ manhwa, locale, userContentFilter = 'SAFE', libraryStatus, isFavorite, isLoggedIn }: ManhwaCardProps) {
  const title = locale === 'fr' ? (manhwa.title_fr ?? manhwa.title_en) : manhwa.title_en
  const displayScore = manhwa.display_score
  const rank = getRankFromScore(displayScore, manhwa.score_count)
  const blurCover = shouldBlurCover(manhwa, userContentFilter)

  const card = (
    <Link
      href={`/${locale}/manhwa/${manhwa.slug}`}
      className="group flex flex-col gap-2"
    >
      {/* Cover */}
      <div className="relative aspect-[5/7] w-full overflow-hidden rounded-lg bg-elevated">
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
            <span className="rounded-md bg-error/80 px-2 py-1 text-xs font-bold text-white">
              18+
            </span>
          </div>
        )}

        {/* Score badge */}
        {displayScore && (
          <div className="absolute bottom-2 left-2 flex items-center gap-1 rounded-md bg-base/80 px-1.5 py-0.5 backdrop-blur-sm">
            <span className="text-xs text-yellow-400">★</span>
            <span className="font-mono text-xs font-bold text-text-primary">
              {formatScore(displayScore)}
            </span>
            {rank && <RankBadge rank={rank} compact />}
          </div>
        )}

        {/* Quick action overlay on hover */}
        {isLoggedIn && (
          <ManhwaCardOverlay
            manhwaId={manhwa.id}
            libraryStatus={libraryStatus ?? null}
            isFavorite={isFavorite ?? false}
            isLoggedIn={!!isLoggedIn}
          />
        )}
      </div>

      {/* Title */}
      <h3 className="line-clamp-2 text-sm font-medium leading-tight text-text-primary transition-colors group-hover:text-crystal-blue">
        {title}
      </h3>

      {/* Genres */}
      {manhwa.genre_links.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {manhwa.genre_links.slice(0, 2).map((gl) => (
            <span
              key={gl.genre.name_en}
              className="rounded bg-white/8 px-1.5 py-0.5 text-[10px] text-gray-300"
            >
              {locale === 'fr' ? gl.genre.name_fr : gl.genre.name_en}
            </span>
          ))}
        </div>
      )}
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
