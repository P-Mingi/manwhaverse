import type { ReactNode } from 'react'
import { CoverImage } from '@/components/ui/CoverImage'
import { Badge } from '@/components/ui/Badge'
import { ScoreDisplay } from '@/components/ui/ScoreDisplay'
import type { ManhwaWithRelations } from '@/lib/db/manhwa'

interface Props {
  manhwa: ManhwaWithRelations
  locale: string
  children?: ReactNode
}

export function ManhwaHero({ manhwa, locale, children }: Props) {
  const title = locale === 'fr' && manhwa.title_fr ? manhwa.title_fr : manhwa.title_en
  const altTitle = manhwa.title_en !== title ? manhwa.title_en : null

  return (
    <div
      style={{
        background: 'var(--bg-surface)',
        borderBottom: '1px solid var(--border)',
        padding: '2rem 1rem',
      }}
    >
      <div
        style={{
          maxWidth: 1024,
          margin: '0 auto',
          display: 'flex',
          gap: '1.5rem',
          alignItems: 'flex-start',
        }}
      >
        <div style={{ flexShrink: 0 }}>
          <CoverImage src={manhwa.cover_url} alt={title} size="hero" priority />
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <h1
            style={{
              margin: '0 0 0.25rem',
              fontSize: 'clamp(1.25rem, 3vw, 1.75rem)',
              fontWeight: 800,
              color: 'var(--text-primary)',
              lineHeight: 1.2,
            }}
          >
            {title}
          </h1>
          {altTitle && (
            <p style={{ margin: '0 0 0.75rem', fontSize: '13px', color: 'var(--text-muted)' }}>{altTitle}</p>
          )}

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: '0.75rem' }}>
            {manhwa.type && <Badge variant="type">{manhwa.type}</Badge>}
            {manhwa.status && <Badge variant="status">{manhwa.status}</Badge>}
            {manhwa.genre_links.map((gl) => (
              <Badge key={gl.genre.slug} variant="genre">
                {locale === 'fr' ? gl.genre.name_fr : gl.genre.name_en}
              </Badge>
            ))}
          </div>

          <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', flexWrap: 'wrap', marginBottom: '1rem' }}>
            {manhwa.display_score && (
              <ScoreDisplay
                score={manhwa.display_score}
                phase={manhwa.display_score_phase}
                count={manhwa.score_count}
                size="md"
              />
            )}
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              {manhwa.reader_count.toLocaleString()} {locale === 'fr' ? 'lecteurs' : 'readers'}
            </div>
            {manhwa.chapter_count && (
              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                {manhwa.chapter_count} ch.
              </div>
            )}
          </div>

          {children}
        </div>
      </div>
    </div>
  )
}
