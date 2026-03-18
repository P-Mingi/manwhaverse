import Link from 'next/link'
import { CoverImage } from '@/components/ui/CoverImage'
import { Badge } from '@/components/ui/Badge'
import type { ManhwaCardPopupData } from '@/lib/db/manhwa'

interface Props {
  manhwas: ManhwaCardPopupData[]
  locale: string
}

export function TrendingSection({ manhwas, locale }: Props) {
  if (manhwas.length === 0) return null
  const [featured, ...rest] = manhwas

  if (!featured) return null

  const featuredTitle = locale === 'fr' && featured.title_fr ? featured.title_fr : featured.title_en
  const featuredSynopsis = locale === 'fr' && featured.synopsis_fr ? featured.synopsis_fr : featured.synopsis_en

  return (
    <div style={{ background: 'var(--bg-surface)', borderBottom: '1px solid var(--border)', padding: '2rem 1rem' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto' }}>
        <h2 style={{ margin: '0 0 1rem', fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
          {locale === 'fr' ? 'Tendances' : 'Trending'}
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
          {/* Featured */}
          <Link href={`/${locale}/manhwa/${featured.slug}`} style={{ textDecoration: 'none', display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
            <CoverImage src={featured.cover_url} alt={featuredTitle} size="hero" priority />
            <div>
              <h3 style={{ margin: '0 0 0.5rem', fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.2 }}>
                {featuredTitle}
              </h3>
              {featuredSynopsis && (
                <p style={{ margin: '0 0 0.75rem', fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 4, WebkitBoxOrient: 'vertical' }}>
                  {featuredSynopsis}
                </p>
              )}
              <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                {featured.genre_links.slice(0, 3).map((gl) => (
                  <Badge key={gl.genre.slug} variant="genre">{locale === 'fr' ? gl.genre.name_fr : gl.genre.name_en}</Badge>
                ))}
              </div>
              {featured.display_score && (
                <p style={{ margin: '0.5rem 0 0', fontSize: '12px', color: 'var(--star)', fontWeight: 600 }}>
                  ★ {featured.display_score.toFixed(1)}
                </p>
              )}
            </div>
          </Link>

          {/* Rest */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            {rest.slice(0, 4).map((m, i) => {
              const title = locale === 'fr' && m.title_fr ? m.title_fr : m.title_en
              return (
                <Link key={m.id} href={`/${locale}/manhwa/${m.slug}`} style={{ textDecoration: 'none', display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
                  <CoverImage src={m.cover_url} alt={title} size="thumb" priority={i < 2} />
                  <div style={{ minWidth: 0 }}>
                    <p style={{ margin: '0 0 4px', fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                      {title}
                    </p>
                    {m.display_score && (
                      <p style={{ margin: 0, fontSize: '11px', color: 'var(--star)' }}>★ {m.display_score.toFixed(1)}</p>
                    )}
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
