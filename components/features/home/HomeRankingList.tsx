import Image from 'next/image'
import Link from 'next/link'
import { formatCount } from '@/lib/utils/formatCount'
import type { RankedManhwa } from '@/lib/db/ranking'

interface HomeRankingListProps {
  manhwas: RankedManhwa[]
  locale: string
  readersLabel: string
}

export function HomeRankingList({ manhwas, locale, readersLabel }: HomeRankingListProps) {
  return (
    <div className="mt-6 space-y-1">
      {manhwas.map((manhwa) => (
        <Link
          key={manhwa.slug}
          href={`/${locale}/manhwa/${manhwa.slug}`}
          className="group flex items-center gap-4 rounded-lg p-3 transition-colors hover:bg-elevated"
        >
          {/* Rank */}
          <span className="w-10 text-right text-2xl font-bold text-text-muted shrink-0">
            #{manhwa.rank}
          </span>

          {/* Cover mini */}
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

          {/* Title + genres */}
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-text-primary transition-colors group-hover:text-electric">
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
            {formatCount(manhwa.reader_count)} {readersLabel}
          </span>
        </Link>
      ))}
    </div>
  )
}
