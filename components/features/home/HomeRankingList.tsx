import Image from 'next/image'
import Link from 'next/link'
import type { RankedManhwa } from '@/lib/db/ranking'
import { getAnilistCover } from '@/lib/utils/anilist-image'

interface HomeRankingListProps {
  manhwas: RankedManhwa[]
  locale: string
}

export function HomeRankingList({ manhwas, locale }: HomeRankingListProps) {
  return (
    <div>
      {manhwas.map((manhwa) => (
        <Link
          key={manhwa.slug}
          href={`/${locale}/manhwa/${manhwa.slug}`}
          className="podium-item"
        >
          <span className="podium-rank">{manhwa.rank}</span>

          <div className="podium-thumb">
            {manhwa.cover_url ? (
              <Image
                src={getAnilistCover(manhwa.cover_url, 'thumb')}
                alt={manhwa.title}
                width={52}
                height={70}
                sizes="52px"
                loading="lazy"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-[8px] text-text-muted">N/A</div>
            )}
          </div>

          <div className="podium-info">
            <div className="podium-title">{manhwa.title}</div>
            <div className="podium-meta">{manhwa.genres.slice(0, 2).join(' · ')}</div>
          </div>

          {manhwa.score != null && (
            <div className="podium-score">
              <span>★</span>
              <span>{manhwa.score.toFixed(1)}</span>
            </div>
          )}
        </Link>
      ))}
    </div>
  )
}
