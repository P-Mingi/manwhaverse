import Link from 'next/link'
import { CoverImage } from '@/components/ui/CoverImage'
import { Badge } from '@/components/ui/Badge'
import { StarRating } from '@/components/ui/StarRating'
import type { ManhwaCardData } from '@/lib/db/manhwa'

interface Props {
  manhwa: ManhwaCardData
  locale: string
  priority?: boolean
}

export function ManhwaCard({ manhwa, locale, priority }: Props) {
  const title = locale === 'fr' && manhwa.title_fr ? manhwa.title_fr : manhwa.title_en

  return (
    <Link
      href={`/${locale}/manhwa/${manhwa.slug}`}
      style={{ textDecoration: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}
    >
      <div style={{ position: 'relative', borderRadius: 8, overflow: 'hidden' }}>
        <CoverImage src={manhwa.cover_url} alt={title} size="card" priority={priority} />
        {manhwa.display_score && (
          <div
            style={{
              position: 'absolute',
              bottom: 6,
              right: 6,
              background: 'rgba(0,0,0,0.8)',
              color: 'var(--star)',
              fontSize: '11px',
              fontWeight: 700,
              padding: '2px 6px',
              borderRadius: 4,
            }}
          >
            ★ {manhwa.display_score.toFixed(1)}
          </div>
        )}
      </div>
      <div style={{ height: 64, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <p
          style={{
            margin: 0,
            fontSize: '12px',
            fontWeight: 600,
            color: 'var(--text-primary)',
            lineHeight: 1.3,
            overflow: 'hidden',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            minHeight: '34px',
          }}
        >
          {title}
        </p>
        <div style={{ display: 'flex', flexWrap: 'nowrap', overflow: 'hidden', gap: 4, height: 20, alignItems: 'center' }}>
          {manhwa.genre_links.slice(0, 2).map((gl) => (
            <Badge key={gl.genre.slug} variant="genre">
              {locale === 'fr' ? gl.genre.name_fr : gl.genre.name_en}
            </Badge>
          ))}
        </div>
      </div>
    </Link>
  )
}
