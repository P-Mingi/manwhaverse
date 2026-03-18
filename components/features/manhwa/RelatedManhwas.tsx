import Link from 'next/link'
import { CoverImage } from '@/components/ui/CoverImage'
import type { ManhwaCardData } from '@/lib/db/manhwa'

interface Props {
  manhwas: ManhwaCardData[]
  locale: string
}

export function RelatedManhwas({ manhwas, locale }: Props) {
  if (manhwas.length === 0) return null

  return (
    <div>
      <h2 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        {locale === 'fr' ? 'Dans le même style' : 'More like this'}
      </h2>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))',
          gap: '0.75rem',
        }}
      >
        {manhwas.map((m) => {
          const title = locale === 'fr' && m.title_fr ? m.title_fr : m.title_en
          return (
            <Link
              key={m.id}
              href={`/${locale}/manhwa/${m.slug}`}
              style={{ textDecoration: 'none', display: 'flex', flexDirection: 'column', gap: 4 }}
            >
              <CoverImage src={m.cover_url} alt={title} size="card" />
              <p style={{ margin: 0, fontSize: '11px', color: 'var(--text-secondary)', lineHeight: 1.3, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                {title}
              </p>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
