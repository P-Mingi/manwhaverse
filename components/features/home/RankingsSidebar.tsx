import Link from 'next/link'
import { CoverImage } from '@/components/ui/CoverImage'
import type { RankedManhwa } from '@/lib/db/ranking'

interface Props {
  manhwas: RankedManhwa[]
  locale: string
}

export function RankingsSidebar({ manhwas, locale }: Props) {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
        <h2 style={{ margin: 0, fontSize: '13px', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          {locale === 'fr' ? 'Top Rankings' : 'Top Rankings'}
        </h2>
        <Link href={`/${locale}/top`} style={{ fontSize: '11px', color: 'var(--accent)', textDecoration: 'none', fontWeight: 600 }}>
          {locale === 'fr' ? 'Voir tout →' : 'See all →'}
        </Link>
      </div>

      <div className="card" style={{ padding: '0.5rem' }}>
        {manhwas.map((m) => (
          <Link
            key={m.slug}
            href={`/${locale}/manhwa/${m.slug}`}
            style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.5rem', borderRadius: 8 }}
          >
            <span style={{ width: 20, textAlign: 'center', fontSize: '12px', fontWeight: 700, color: m.rank <= 3 ? 'var(--star)' : 'var(--text-muted)', flexShrink: 0 }}>
              #{m.rank}
            </span>
            <CoverImage src={m.cover_url} alt={m.title} size="thumb" />
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ margin: '0 0 2px', fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {m.title}
              </p>
              {m.score && (
                <p style={{ margin: 0, fontSize: '11px', color: 'var(--star)' }}>★ {m.score.toFixed(1)}</p>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
