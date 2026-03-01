import Image from 'next/image'
import Link from 'next/link'
import type { ManhwaCardData } from '@/lib/db/manhwa'
import { getDisplayScore } from '@/lib/scores/display'
import { formatScore, getCrystalColor } from '@/lib/utils/formatScore'

interface ManhwaCardProps {
  manhwa: ManhwaCardData
  locale: string
}

export function ManhwaCard({ manhwa, locale }: ManhwaCardProps) {
  const title = locale === 'fr' ? (manhwa.title_fr ?? manhwa.title_en) : manhwa.title_en
  const { primaryScore } = getDisplayScore(manhwa)
  const crystalColor = primaryScore ? getCrystalColor(primaryScore) : ''

  return (
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
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-xs text-text-muted">
            No Cover
          </div>
        )}

        {/* Score badge */}
        {primaryScore && (
          <div className="absolute bottom-2 left-2 rounded-md bg-base/80 px-1.5 py-0.5 backdrop-blur-sm">
            <span className={`font-mono text-xs font-bold ${crystalColor}`}>
              {formatScore(primaryScore)}
            </span>
          </div>
        )}
      </div>

      {/* Title */}
      <h3 className="line-clamp-2 text-sm font-medium leading-tight text-text-primary transition-colors group-hover:text-crystal-blue">
        {title}
      </h3>

      {/* Genres */}
      {manhwa.genre_links.length > 0 && (
        <p className="line-clamp-1 text-xs text-text-muted">
          {manhwa.genre_links
            .map((gl) => (locale === 'fr' ? gl.genre.name_fr : gl.genre.name_en))
            .join(', ')}
        </p>
      )}
    </Link>
  )
}
