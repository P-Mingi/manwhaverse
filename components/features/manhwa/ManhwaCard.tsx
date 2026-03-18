import Link from 'next/link'
import { CoverImage } from '@/components/ui/CoverImage'
import { Badge } from '@/components/ui/Badge'
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
      style={{ textDecoration: 'none', display: 'flex', flexDirection: 'column', width: '100%', height: '100%' }}
    >
      <div style={{ position: 'relative', borderRadius: 8, overflow: 'hidden', width: '100%' }}>
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
      <div style={{
        padding: '8px 2px 0',
        display: 'flex',
        flexDirection: 'column',
        gap: '6px',
        flexGrow: 1,
        justifyContent: 'flex-start',
      }}>
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
            minHeight: '32px',
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
