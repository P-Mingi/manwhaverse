import Link from 'next/link'
import { CoverImage } from '@/components/ui/CoverImage'
import { LibraryStatusBadge } from './LibraryStatusBadge'
import { StarRating } from '@/components/ui/StarRating'
import type { Prisma } from '@prisma/client'

type LibraryWithManhwa = Prisma.UserLibraryGetPayload<{
  include: {
    manhwa: {
      select: {
        slug: true
        title_en: true
        title_fr: true
        cover_url: true
        chapter_count: true
        display_score: true
        score_count: true
        genre_links: { include: { genre: { select: { name_en: true; name_fr: true } } }; take: 3 }
      }
    }
  }
}>

interface Props {
  entry: LibraryWithManhwa
  locale: string
}

export function LibraryEntry({ entry, locale }: Props) {
  const m = entry.manhwa
  const title = locale === 'fr' && m.title_fr ? m.title_fr : m.title_en

  return (
    <div
      className="card"
      style={{ display: 'flex', gap: '0.75rem', padding: '0.75rem', alignItems: 'flex-start' }}
    >
      <Link href={`/${locale}/manhwa/${m.slug}`} style={{ flexShrink: 0 }}>
        <CoverImage src={m.cover_url} alt={title} size="thumb" />
      </Link>
      <div style={{ flex: 1, minWidth: 0 }}>
        <Link
          href={`/${locale}/manhwa/${m.slug}`}
          style={{ textDecoration: 'none', color: 'var(--text-primary)', fontSize: '13px', fontWeight: 600, display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
        >
          {title}
        </Link>
        <div style={{ display: 'flex', gap: 6, marginTop: 4, flexWrap: 'wrap', alignItems: 'center' }}>
          <LibraryStatusBadge status={entry.status} locale={locale} />
          {entry.score && <StarRating score={entry.score} size="sm" />}
        </div>
      </div>
    </div>
  )
}
