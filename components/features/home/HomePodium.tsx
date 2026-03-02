import Image from 'next/image'
import Link from 'next/link'
import { formatCount } from '@/lib/utils/formatCount'
import type { RankedManhwa } from '@/lib/db/ranking'

interface HomePodiumProps {
  top3: RankedManhwa[]
  locale: string
  readersLabel: string
}

const MEDALS = ['🥈', '🥇', '🥉']
const HEIGHTS = ['h-[220px]', 'h-[260px]', 'h-[220px]']

export function HomePodium({ top3, locale, readersLabel }: HomePodiumProps) {
  // Reorder: #2, #1, #3 so #1 is centered and tallest
  const ordered = [top3[1], top3[0], top3[2]].filter(Boolean) as NonNullable<(typeof top3)[number]>[]

  return (
    <div className="flex items-end justify-center gap-3 md:gap-6">
      {ordered.map((manhwa, i) => (
        <Link
          key={manhwa.slug}
          href={`/${locale}/manhwa/${manhwa.slug}`}
          className={`group relative ${i === 1 ? 'w-[160px] md:w-[200px]' : 'w-[130px] md:w-[170px]'}`}
        >
          <div className={`relative ${HEIGHTS[i]} overflow-hidden rounded-xl shadow-lg`}>
            {manhwa.cover_url ? (
              <Image
                src={manhwa.cover_url}
                alt={manhwa.title}
                fill
                sizes="200px"
                className="object-cover transition-transform duration-300 group-hover:scale-105"
              />
            ) : (
              <div className="flex h-full items-center justify-center bg-elevated text-xs text-text-muted">
                No Cover
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

            {/* Medal */}
            <div className="absolute left-2 top-2 text-2xl drop-shadow-lg">{MEDALS[i]}</div>

            {/* Info overlay */}
            <div className="absolute bottom-0 left-0 right-0 p-3">
              <p className="line-clamp-2 text-sm font-bold leading-tight text-white">
                {manhwa.title}
              </p>
              <div className="mt-1 flex items-center gap-2">
                {manhwa.score != null && (
                  <span className="text-xs font-bold text-yellow-400">
                    ★ {manhwa.score.toFixed(1)}
                  </span>
                )}
                <span className="text-[10px] text-gray-400">
                  {formatCount(manhwa.reader_count)} {readersLabel}
                </span>
              </div>
            </div>
          </div>
        </Link>
      ))}
    </div>
  )
}
