import Link from 'next/link'
import { CoverImage } from '@/components/ui/CoverImage'
import { Badge } from '@/components/ui/Badge'
import type { RelationWithManhwa } from '@/lib/db/relation'

interface Props {
  relations: RelationWithManhwa[]
  locale: string
}

const RELATION_LABELS: Record<string, { fr: string; en: string }> = {
  SEQUEL: { fr: 'Suite', en: 'Sequel' },
  PREQUEL: { fr: 'Préquelle', en: 'Prequel' },
  SIDE_STORY: { fr: 'Histoire parallèle', en: 'Side Story' },
  ADAPTATION: { fr: 'Adaptation', en: 'Adaptation' },
  ALTERNATIVE: { fr: 'Version alternative', en: 'Alternative' },
  SPIN_OFF: { fr: 'Spin-off', en: 'Spin-off' },
}

export function ManhwaRelations({ relations, locale }: Props) {
  if (relations.length === 0) return null

  return (
    <div>
      <h2 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        {locale === 'fr' ? 'Relations' : 'Related'}
      </h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {relations.map((r) => {
          const m = r.manhwa
          const title = locale === 'fr' && m.title_fr ? m.title_fr : m.title_en
          const label = RELATION_LABELS[r.relation_type]?.[locale as 'fr' | 'en'] ?? r.relation_type
          return (
            <Link
              key={m.id}
              href={`/${locale}/manhwa/${m.slug}`}
              style={{
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.5rem',
                background: 'var(--bg-elevated)',
                borderRadius: 8,
              }}
            >
              <CoverImage src={m.cover_url} alt={title} size="thumb" />
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ margin: '0 0 4px', fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {title}
                </p>
                <Badge variant="type">{label}</Badge>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
