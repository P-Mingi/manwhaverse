import Image from 'next/image'
import Link from 'next/link'
import type { ManhwaCardPopupData } from '@/lib/db/manhwa'
import { getAnilistCover } from '@/lib/utils/anilist-image'

interface GemCardProps {
  manhwa: ManhwaCardPopupData
  locale: string
}

export function GemCard({ manhwa, locale }: GemCardProps) {
  const title = locale === 'fr'
    ? manhwa.title_fr ?? manhwa.title_en
    : manhwa.title_en

  return (
    <Link href={`/${locale}/manhwa/${manhwa.slug}`} className="gem-card">
      <div className="gem-cover">
        {manhwa.cover_url && (
          <Image
            src={getAnilistCover(manhwa.cover_url, 'card')}
            alt={title}
            fill
            sizes="(max-width: 768px) 33vw, 16vw"
            loading="lazy"
            className="object-cover"
          />
        )}
        <span className="gem-badge">💎</span>
        <div className="gem-info">
          <div className="gem-title">{title}</div>
          <div className="gem-score">
            <span>★ {manhwa.display_score?.toFixed(1) ?? '—'}</span>
            <span className="gem-readers">
              {manhwa.reader_count != null ? `${manhwa.reader_count.toLocaleString()} readers` : ''}
            </span>
          </div>
        </div>
      </div>
    </Link>
  )
}
