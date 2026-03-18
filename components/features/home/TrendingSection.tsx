import Link from 'next/link'
import { Badge } from '@/components/ui/Badge'
import { SectionHeader } from '@/components/ui/SectionHeader'
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
    <div style={{ borderBottom: '1px solid var(--border)', padding: '28px 24px' }}>
      <div style={{ maxWidth: '1024px', margin: '0 auto' }}>
        <SectionHeader
          title={locale === 'fr' ? 'Tendances' : 'Trending'}
          href={`/${locale}/explore?sort=trending`}
          seeAllLabel={locale === 'fr' ? 'Voir tout →' : 'See all →'}
        />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>

          {/* Featured card — cover left, info right */}
          <Link href={`/${locale}/manhwa/${featured.slug}`} style={{ textDecoration: 'none' }}>
            <div style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              borderRadius: '10px',
              overflow: 'hidden',
              display: 'flex',
              height: '180px',
            }}>
              {/* Cover */}
              <div style={{ width: '120px', flexShrink: 0, position: 'relative', overflow: 'hidden' }}>
                {featured.cover_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={featured.cover_url}
                    alt={featuredTitle}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                  />
                ) : (
                  <div style={{ width: '100%', height: '100%', background: 'var(--bg-elevated)' }} />
                )}
                <div style={{
                  position: 'absolute', top: '8px', left: '8px',
                  background: 'var(--accent)', color: 'var(--accent-text)',
                  fontSize: '8px', fontWeight: 700, padding: '2px 6px', borderRadius: '4px',
                  letterSpacing: '0.06em', textTransform: 'uppercase',
                }}>
                  #1 {locale === 'fr' ? 'Cette semaine' : 'This week'}
                </div>
              </div>

              {/* Info */}
              <div style={{ padding: '16px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minWidth: 0 }}>
                <div>
                  <h3 style={{ margin: '0 0 6px', fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.2, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                    {featuredTitle}
                  </h3>
                  <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginBottom: '8px' }}>
                    {featured.genre_links.slice(0, 3).map((gl) => (
                      <Badge key={gl.genre.slug} variant="genre">
                        {locale === 'fr' ? gl.genre.name_fr : gl.genre.name_en}
                      </Badge>
                    ))}
                  </div>
                  {featuredSynopsis && (
                    <p style={{
                      fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0,
                      display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden',
                    }}>
                      {featuredSynopsis}
                    </p>
                  )}
                </div>
                {featured.display_score && (
                  <p style={{ margin: 0, fontSize: '12px', color: 'var(--star)', fontWeight: 600 }}>
                    ★ {featured.display_score.toFixed(1)}
                  </p>
                )}
              </div>
            </div>
          </Link>

          {/* Rest — 2×2 grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            {rest.slice(0, 4).map((m, i) => {
              const title = locale === 'fr' && m.title_fr ? m.title_fr : m.title_en
              return (
                <Link key={m.id} href={`/${locale}/manhwa/${m.slug}`} style={{ textDecoration: 'none' }}>
                  <div style={{
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border)',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    display: 'flex',
                    gap: '8px',
                    padding: '8px',
                    alignItems: 'flex-start',
                  }}>
                    <div style={{ width: '40px', height: '56px', flexShrink: 0, borderRadius: '4px', overflow: 'hidden' }}>
                      {m.cover_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={m.cover_url}
                          alt={title}
                          loading={i < 2 ? 'eager' : 'lazy'}
                          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                        />
                      ) : (
                        <div style={{ width: '100%', height: '100%', background: 'var(--bg-elevated)' }} />
                      )}
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <p style={{ margin: '0 0 3px', fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', lineHeight: 1.3 }}>
                        #{i + 2} {title}
                      </p>
                      {m.display_score && (
                        <p style={{ margin: 0, fontSize: '11px', color: 'var(--star)' }}>★ {m.display_score.toFixed(1)}</p>
                      )}
                    </div>
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
